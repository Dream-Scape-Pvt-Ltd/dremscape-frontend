#!/usr/bin/env python3
"""Voiceover for "Your Trail": one WAV per line, spoken by Kokoro-82M (voice am_michael), fully offline.

Setup (the model is not committed; ~90 MB):
  npm pack kokoro-q8-shards@1.0.0 kokoro-js@1.2.1        # model weights (Apache-2.0) + voice styles
  cat kokoro-q8-shards/package/kokoro-q8.part*.bin > model_quantized.onnx   # sha256 fbae9257...a1478
  python3 -m venv env && env/bin/pip install kokoro-onnx soundfile spacy regex addict && env/bin/pip install --no-deps misaki
  env/bin/python tools/voiceover.py <model_quantized.onnx> <kokoro-js/package/voices> assets/vo
Writes assets/vo/<id>.wav (24 kHz mono) and assets/vo/lines.json (id, text, duration)."""
import json, os, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from g2p import phonemize                                   # Kokoro's own dictionary pronunciation, POS-tagged by hand

LINES = [
    ('walk',    'Some trails you walk.'),
    ('stay',    'Some trails stay with you.'),
    ('since',   'Since 2005, our team in Kathmandu has planned journeys through the Himalaya.'),
    ('tell',    'Tell us where you want to go,'),
    ('climb',   'and how hard you want to climb.'),
    ('shape',   "We'll shape the route around you."),
    ('idea',    'Share your idea.'),
    ('talk',    'Talk it through.'),
    ('plan',    "Get a plan that's yours."),
    ('brand',   'Dreamscape Treks.'),
    ('beyond',  'Himalaya, and beyond.'),
]
VOICE = os.environ.get('VO_VOICE', 'am_michael')
SPEED = {'walk': 0.88, 'stay': 0.88, 'brand': 0.9, 'beyond': 0.88}           # slower, warmer on the emotional lines; 0.93 elsewhere

def trim(x, sr, thr=0.012, pad=0.03):                      # cut leading/trailing silence, keep a short breath
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    a = max(0, idx[0] - int(pad * sr)); b = min(len(x), idx[-1] + int(pad * 2 * sr))
    return x[a:b]

if __name__ == '__main__':
    model, voice_dir, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    v = {f[:-4]: np.fromfile(os.path.join(voice_dir, f), dtype=np.float32).reshape(-1, 1, 256) for f in os.listdir(voice_dir) if f.startswith(('am_', 'af_', 'bm_', 'bf_'))}
    vp = os.path.join(tempfile.mkdtemp(), 'voices.npz'); np.savez(vp, **v); os.rename(vp, vp[:-4] + '.bin')
    k = Kokoro(model, vp[:-4] + '.bin')
    meta = []
    for lid, text in LINES:
        x, sr = k.create(phonemize(text), voice=VOICE, speed=SPEED.get(lid, 0.93), lang='en-us', is_phonemes=True)
        x = trim(np.asarray(x, dtype=np.float32), sr)
        sf.write(os.path.join(out, lid + '.wav'), x, sr, subtype='PCM_16')
        meta.append({'id': lid, 'text': text, 'duration': round(len(x) / sr, 3)}); print(lid, round(len(x) / sr, 2), text)
    json.dump(meta, open(os.path.join(out, 'lines.json'), 'w'), indent=1)
