#!/usr/bin/env python3
"""Split public/images/dreamscape-landscape-final.svg (the site's footer illustration, 197 vector paths) into depth layers and
recolour them into the film palette (forest / mist / white tints). Writes assets/landscape.json."""
import re, json, sys
SRC = '/home/user/dremscape-frontend/public/images/dreamscape-landscape-final.svg'
s = open(SRC).read()
paths = re.findall(r'<path [^>]*?/>', s, re.S)
assert len(paths) == 197

def attr(p, k):
    m = re.search(r'\b%s="([^"]*)"' % k, p); return m.group(1) if m else None
grads = {}
for m in re.finditer(r'<linearGradient id="([^"]+)"[^>]*>(.*?)</linearGradient>', s, re.S):
    cols = [a or b for a, b in re.findall(r'stop-color="([^"]+)"|stop-color:([^;"]+)', m.group(2))]
    grads[m.group(1)] = cols
def base_color(p):
    f = attr(p, 'fill')
    if f and f.startswith('url(#'): return grads[f[5:-1]][0]
    return f

# depth layers, back to front  (index ranges follow the painter's order of the source file)
LAYERS = [
    ('far',        [(128, 140)]),
    ('peak',       [(141, 196)]),
    ('massif',     [(97, 124)]),
    ('ridge',      [(125, 127)]),
    ('mist',       [(1, 2)]),
    ('hill',       [(3, 13)]),
    ('temple',     [(14, 54)]),
    ('foreground', [(55, 96)]),
]
def lum(hexc):
    h = hexc.lstrip('#'); r, g, b = [int(h[i:i+2], 16) for i in (0, 2, 4)]
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
# forest-hue ramp: deep forest -> forest -> sage -> mist -> paper
RAMP = [(0.00, '#0b2b20'), (0.20, '#153d2f'), (0.45, '#3f6e5b'), (0.62, '#7fa593'), (0.78, '#b9cfc5'), (0.92, '#e4eee8'), (1.00, '#f9faf8')]
def ramp(l):
    # source art spans luminance ~0.22 (foreground) .. 1.0 (white): stretch it over the ramp
    t = max(0, min(1, (l - 0.20) / 0.80))
    for (a, ca), (b, cb) in zip(RAMP, RAMP[1:]):
        if t <= b:
            k = (t - a) / (b - a); A = [int(ca[i:i+2], 16) for i in (1, 3, 5)]; B = [int(cb[i:i+2], 16) for i in (1, 3, 5)]
            return '#%02x%02x%02x' % tuple(round(A[j] + (B[j] - A[j]) * k) for j in range(3))
    return RAMP[-1][1]
def recolour(p):
    c = base_color(p)
    d = attr(p, 'd')
    return '<path fill="%s" d="%s"/>' % (ramp(lum(c)) if c else '#f9faf8', d)

out = {'viewBox': [4095, 1624], 'layers': []}
used = set()
for name, ranges in LAYERS:
    svg = ''
    for a, b in ranges:
        for i in range(a, b + 1):
            svg += recolour(paths[i]); used.add(i)
    out['layers'].append({'name': name, 'paths': svg})
missing = sorted(set(range(1, 197)) - used)
print('unassigned paths:', missing)
# anything unassigned (none expected) goes into the foreground
json.dump(out, open('/home/user/dremscape-frontend/marketing/showreel-motion/assets/landscape.json', 'w'))
# for the flat-fidelity check: also write the layered stack with ORIGINAL colours
def orig(p): return '<path fill="%s" d="%s"/>' % (base_color(p), attr(p, 'd'))
stack = ''.join(''.join(orig(paths[i]) for a, b in ranges for i in range(a, b + 1)) for name, ranges in LAYERS)
open('/tmp/claude-0/stack_orig.svg', 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4095 1624" width="1600" height="635"><rect width="4095" height="1624" fill="#FEFEFE"/>%s</svg>' % stack)
ref = ''.join(orig(paths[i]) for i in range(1, 197))
open('/tmp/claude-0/ref_orig.svg', 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4095 1624" width="1600" height="635"><rect width="4095" height="1624" fill="#FEFEFE"/>%s</svg>' % ref)
print('layers:', [(l['name'], len(l['paths'])) for l in out['layers']])
