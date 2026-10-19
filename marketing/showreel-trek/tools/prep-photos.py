#!/usr/bin/env python3
"""Grade the site's real trek photos (public/images/trek-memories) into the film palette:
a luminance gradient map forest -> mist -> paper with a little of the original colour kept, so people, flags and peaks stay readable.
Writes assets/*.jpg (the poster also at 4K)."""
import numpy as np, sys
from PIL import Image, ImageFilter
SRC = '/home/user/dremscape-frontend/public/images/trek-memories/'
STOPS = [(0.00, (7, 26, 20)), (0.30, (21, 61, 47)), (0.58, (105, 148, 128)), (0.82, (205, 223, 212)), (1.00, (249, 250, 248))]
WARM = np.array([228, 201, 138], dtype=np.float32)       # the gold, only in the brightest highlights (alpenglow / sun)

def gmap(L):
    xs = [s[0] for s in STOPS]; out = np.zeros(L.shape + (3,), np.float32)
    for c in range(3): out[..., c] = np.interp(L, xs, [s[1][c] for s in STOPS])
    return out

def grade(im, keep=0.22, warm=0.18):
    a = np.asarray(im.convert('RGB'), dtype=np.float32) / 255
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    L = np.clip((L - 0.03) / 0.9, 0, 1) ** 0.68
    g = gmap(L)
    gray = (L * 255)[..., None]
    col = gray + (a * 255 - gray) * 0.55                  # original colour, desaturated
    out = g * (1 - keep) + col * keep
    hi = np.clip((L - 0.86) / 0.14, 0, 1)[..., None]        # warm the very brightest pixels
    out = out * (1 - warm * hi) + WARM * (warm * hi)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def cover(im, w, h, fx=0.5, fy=0.5):
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = round((im.width - w) * fx); y = round((im.height - h) * fy); return im.crop((x, y, x + w, y + h))

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'assets/'
    jobs = {                                                    # name: (source, w, h, fx, fy)
        'poster-2k': ('together-in-the-mountains', 1920, 1080, 0.5, 0.62),
        'poster-4k': ('together-in-the-mountains', 3840, 2160, 0.5, 0.62),
        'range':     ('a-pause-on-the-ridge', 1920, 1080, 0.5, 0.55),
        'flags':     ('prayer-flags-and-friends', 1536, 2048, 0.5, 0.5),
        'walkers':   ('ridge-walkers', 1536, 2048, 0.5, 0.5),
        'path':      ('mountain-path', 1536, 2048, 0.5, 0.5),
        'hill':      ('open-hillside-walkers', 1536, 2048, 0.5, 0.5),
        'sun':       ('home-slide-3', 1920, 1080, 0.5, 0.5),
    }
    for k, (n, w, h, fx, fy) in jobs.items():
        im = grade(cover(Image.open(SRC + n + '.jpg'), w, h, fx, fy))
        im.save(f'{out}{k}.jpg', quality=88, optimize=True, subsampling=0); print(k, im.size)
