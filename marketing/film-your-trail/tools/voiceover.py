#!/usr/bin/env python3
"""Voiceover for "Your Trail": one WAV per line, spoken by Kokoro-82M, fully offline.

Why it sounds less synthetic than v1:
  - full-precision model (tools/kokoro_f32.py) instead of the grainy q8 export;
  - each paragraph is read in one pass, so the intonation runs across sentences like a real read,
    then cut into lines at the pauses (a line read on its own always sounds like a fresh announcement);
  - a recorded-VO finish: 48 kHz, low cut, split-band de-esser, even line levels, soft edges.

Setup (the model is not committed):
  npm pack kokoro-fp16-shards@1.0.4 kokoro-js@1.2.1            # weights (Apache-2.0) + voice styles
  cat package/kokoro-fp16.part*.bin > model_fp16.onnx && python3 tools/kokoro_f32.py model_fp16.onnx model_f32.onnx
  python3 -m venv env && env/bin/pip install kokoro-onnx soundfile scipy spacy regex addict onnx && env/bin/pip install --no-deps misaki
  VO_VOICE=am_michael env/bin/python tools/voiceover.py model_f32.onnx <kokoro-js/package/voices> assets/vo
  VO_VOICE=af_heart   env/bin/python tools/voiceover.py model_f32.onnx <kokoro-js/package/voices> assets/vo-heart
Writes <out>/<id>.wav (48 kHz mono) and <out>/lines.json (id, text, duration)."""
import json, os, sys, tempfile
import numpy as np, soundfile as sf
from scipy import signal
from kokoro_onnx import Kokoro
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from g2p import phonemize                                   # Kokoro's own dictionary pronunciation, POS-tagged by hand

PARAGRAPHS = [  # (speed, [(id, text), ...]) - each paragraph is one take
    (0.92, [('walk', 'Some trails you walk.'), ('stay', 'Some trails stay with you.'),
            ('since', 'Since 2005, our team in Kathmandu has planned journeys through the Himalaya.')]),
    (0.95, [('tell', 'Tell us where you want to go,'), ('climb', 'and how hard you want to climb.'),
            ('shape', "We'll shape the route around you.")]),
    (0.95, [('idea', 'Share your idea.'), ('talk', 'Talk it through.'), ('plan', "Get a plan that's yours.")]),
    (0.88, [('brand', 'Dreamscape Treks.'), ('beyond', 'Himalaya, and beyond.')]),
]
VOICE = os.environ.get('VO_VOICE', 'am_michael')
SR_IN, SR = 24000, 48000


def speak(k, style, text, speed):
    toks = k.tokenizer.tokenize(phonemize(text))
    a = k.sess.run(None, {k.sess.get_inputs()[0].name: np.array([[0, *toks, 0]], dtype=np.int64),
                          'style': np.asarray(style[len(toks)], dtype=np.float32), 'speed': np.array([speed], dtype=np.float32)})[0]
    return np.asarray(a, np.float32).ravel()


def env_db(x, sr, win=0.01):
    n = int(sr * win); f = len(x) // n
    r = np.sqrt((x[:f * n].reshape(f, n) ** 2).mean(1) + 1e-12)
    return 20 * np.log10(r / (np.abs(x).max() + 1e-9)), n


def active(x, sr, thr=-42):
    db, n = env_db(x, sr); idx = np.where(db > thr)[0]
    return (idx[0] * n, (idx[-1] + 1) * n) if len(idx) else (0, len(x))


def split(x, sr, expect, thr=-40, min_gap=0.07):
    """Cut a paragraph at the silent gaps nearest the expected line boundaries."""
    db, n = env_db(x, sr); quiet = db < thr
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * n >= min_gap * sr and i > 0 and j < len(quiet): gaps.append((i * n, j * n))
            i = j
        else: i += 1
    cuts = []
    for e in expect:
        g = min((g for g in gaps if g not in cuts), key=lambda g: abs((g[0] + g[1]) / 2 - e))
        cuts.append(g)
    cuts.sort()
    edges = [0] + [c for g in cuts for c in g] + [len(x)]
    return [x[edges[2 * k]:edges[2 * k + 1]] for k in range(len(cuts) + 1)]


def shelf_sos(f0, gain_db, q=0.6):
    """RBJ high shelf as one second-order section."""
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    b = [A * ((A + 1) + (A - 1) * c + 2 * np.sqrt(A) * al), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - 2 * np.sqrt(A) * al)]
    a = [(A + 1) - (A - 1) * c + 2 * np.sqrt(A) * al, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - 2 * np.sqrt(A) * al]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1.0, a[1] / a[0], a[2] / a[0]]])


def peak_sos(f0, gain_db, q=1.0):
    """RBJ peaking EQ as one second-order section."""
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1.0, a[1] / a[0], a[2] / a[0]]])


def finish(x):
    """24 kHz model output -> 48 kHz line with a recorded-VO finish."""
    x = signal.resample_poly(x, 2, 1).astype(np.float64)
    x = signal.sosfilt(signal.butter(2, 70, 'highpass', fs=SR, output='sos'), x)
    # split-band de-esser: linear-phase split at 4.8 kHz, gain on the top band only
    h = signal.firwin(255, 4800, fs=SR, pass_zero=False); hi = np.convolve(x, h, 'same'); lo = x - hi
    e = np.abs(hi); a, r = np.exp(-1 / (SR * 0.0015)), np.exp(-1 / (SR * 0.045)); env = np.empty_like(e); v = 0.0
    for i, s in enumerate(e):
        v = a * v + (1 - a) * s if s > v else r * v + (1 - r) * s; env[i] = v
    thr = np.percentile(env[env > env.max() * 0.02], 80)
    g = np.where(env > thr, (thr / np.maximum(env, 1e-9)) ** (1 - 1 / 4.0), 1.0)
    x = lo + hi * g
    # air: the model stops at 12 kHz, a microphone does not. Saturate the 5-11 kHz band and keep only the new
    # harmonics above 11.5 kHz, mixed far below the voice
    band = signal.sosfiltfilt(signal.butter(4, [5000, 11000], 'bandpass', fs=SR, output='sos'), x)
    peak = np.abs(band).max() + 1e-9
    air = signal.sosfiltfilt(signal.butter(6, 11500, 'highpass', fs=SR, output='sos'), np.tanh(3 * band / peak) * peak)
    x = x + air * 10 ** (-9 / 20)
    a0, b0 = active(x, SR); x = x[max(0, a0 - int(0.04 * SR)): b0 + int(0.09 * SR)]
    db, n = env_db(x, SR); rms = np.sqrt(np.mean(x[np.repeat(db > -30, n)[:len(x)]] ** 2))
    x = x * (10 ** (-20 / 20) / rms)                        # every line at the same speech level (-20 dBFS RMS)
    fi, fo = int(0.008 * SR), int(0.04 * SR); x[:fi] *= np.linspace(0, 1, fi); x[-fo:] *= np.linspace(1, 0, fo) ** 2
    return np.clip(x, -0.99, 0.99).astype(np.float32)


if __name__ == '__main__':
    model, voice_dir, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    v = {f[:-4]: np.fromfile(os.path.join(voice_dir, f), dtype=np.float32).reshape(-1, 1, 256) for f in os.listdir(voice_dir) if f.startswith(('am_', 'af_', 'bm_', 'bf_'))}
    vp = os.path.join(tempfile.mkdtemp(), 'voices.npz'); np.savez(vp, **v); os.rename(vp, vp[:-4] + '.bin')
    k = Kokoro(model, vp[:-4] + '.bin'); style = k.get_voice_style(VOICE)
    takes = []
    for speed, lines in PARAGRAPHS:
        take = speak(k, style, ' '.join(t for _, t in lines), speed)
        a0, b0 = active(take, SR_IN); take = take[a0:b0]
        solo = [(lambda y: np.subtract(*active(y, SR_IN)[::-1]))(speak(k, style, t, speed)) for _, t in lines]   # each line's length read on its own
        tot = sum(solo); expect = [len(take) * sum(solo[:i + 1]) / tot for i in range(len(lines) - 1)]
        takes += [(lid, text, finish(seg)) for (lid, text), seg in zip(lines, split(take, SR_IN, expect))]
    # tone: the model's fricatives are brighter than a recorded voice. Tilt the whole read toward the long-term
    # average of natural speech (per-Hz long-term speech spectrum: 4-8 kHz about 10 dB and 8-11 kHz about 14 dB under 1-4 kHz), same EQ on every line
    X = np.concatenate([x for _, _, x in takes]); g1 = g2 = 0.0
    def band(Y, a, b, F=None, fr=None):
        F = np.abs(np.fft.rfft(Y)) ** 2; fr = np.fft.rfftfreq(len(Y), 1 / SR)
        return 10 * np.log10(F[(fr > a) & (fr < b)].mean() / F[(fr > 1000) & (fr < 4000)].mean())
    for _ in range(4):
        shelf = np.vstack([peak_sos(5800, g1, 0.9), shelf_sos(8500, g2)]); Y = signal.sosfilt(shelf, X)
        g1 = min(0.0, g1 + 1.3 * (-10 - band(Y, 4000, 8000))); g2 = min(0.0, g2 + (-14 - band(Y, 8000, 11000)) * 0.8)
    shelf = np.vstack([peak_sos(5800, g1, 0.9), shelf_sos(8500, g2)])
    meta = []
    for lid, text, x in takes:
        y = signal.sosfilt(shelf, x); y = y * (np.sqrt(np.mean(x ** 2)) / np.sqrt(np.mean(y ** 2)))
        sf.write(os.path.join(out, lid + '.wav'), np.clip(y, -0.99, 0.99).astype(np.float32), SR, subtype='PCM_16')
        meta.append({'id': lid, 'text': text, 'duration': round(len(y) / SR, 3)}); print(lid, round(len(y) / SR, 2), text)
    print('tone: %.1f dB bell @5.8 kHz, %.1f dB shelf @8.5 kHz' % (g1, g2))
    json.dump(meta, open(os.path.join(out, 'lines.json'), 'w'), indent=1)
