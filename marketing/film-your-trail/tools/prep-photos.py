#!/usr/bin/env python3
"""Natural cinematic grade for the site's own trek photographs (public/images/trek-memories):
calmer phone-camera skies (less saturated, a touch toward teal), a soft S-curve, lifted blacks,
warm highlights and forest-tinted shadows. Writes assets/<name>-2k.jpg and -4k.jpg (16:9 with push-in headroom)."""
import numpy as np, sys, colorsys
from PIL import Image
SRC = '/home/user/dremscape-frontend/public/images/trek-memories/'

def rgb2hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0); return h, s, mx
def hsv2rgb(h, s, v):
    i = np.floor(h * 6).astype(int) % 6; f = h * 6 - np.floor(h * 6); p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    out = np.zeros(h.shape + (3,), np.float32)
    for k, (r, g, b) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i == k; out[..., 0][m] = r[m]; out[..., 1][m] = g[m]; out[..., 2][m] = b[m]
    return out

def grade(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32) / 255
    h, s, v = rgb2hsv(a)
    blue = np.clip(1 - np.abs(h - 0.6) / 0.09, 0, 1)                      # phone-blue skies
    s = s * (0.86 - 0.26 * blue); h = h - 0.018 * blue
    a = hsv2rgb(h % 1, np.clip(s, 0, 1), v)
    L = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    curve = lambda x: 0.03 + 0.94 * (x + 0.10 * np.sin(2 * np.pi * x) * (x * (1 - x)) * 4 * 0.5)   # soft S, lifted black
    L2 = np.clip(curve(np.clip(L, 0, 1)), 0, 1); a = a * (L2 / (L + 1e-6))[..., None]
    hi = np.clip((L2 - 0.55) / 0.45, 0, 1)[..., None]; lo = np.clip((0.45 - L2) / 0.45, 0, 1)[..., None]
    a = a + hi * np.array([0.035, 0.012, -0.03]) + lo * np.array([-0.01, 0.012, 0.006])
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

def cover(im, w, h, fx=0.5, fy=0.5):
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = round((im.width - w) * fx); y = round((im.height - h) * fy); return im.crop((x, y, x + w, y + h))

JOBS = {  # name: source, focus x, focus y (crop centre for the 16:9 frame), aspect
    'lastlight': ('last-light', 0.55, 0.45, 16 / 9),
    'together':  ('together-in-the-mountains', 0.5, 0.62, 16 / 9),
    'night':     ('nightfall-over-valley', 0.5, 0.42, 16 / 9),
    'golden':    ('home-slide-2', 0.5, 0.5, 16 / 9),
    'amphi':     ('mountain-amphitheatre', 0.5, 0.5, 16 / 9),
    'pause':     ('a-pause-on-the-ridge', 0.5, 0.55, 16 / 9),
    'flags':     ('prayer-flags-and-friends', 0.5, 0.5, 3 / 4),
}
if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'assets/'
    for k, (n, fx, fy, ar) in JOBS.items():
        src = grade(Image.open(SRC + n + '.jpg'))
        for tag, W in (('2k', 2304), ('4k', 4608)):
            w, h = (W, round(W / ar)) if ar >= 1 else (round(W * 0.6), round(W * 0.6 / ar))
            im = cover(src, w, h, fx, fy); im.save(f'{out}{k}-{tag}.jpg', quality=90, optimize=True, subsampling=0)
        print(k, im.size)
