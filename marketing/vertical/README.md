# 9:16 versions

`make.mjs` builds the vertical (1080x1920) cut of a film from its 16:9 render. It wraps the film in a designed frame rather than cropping it, so the type and camera moves stay intact:
- **Behind:** the film itself, blurred under a forest tint.
- **Top:** the traced Dreamscape Treks lockup and the site's eyebrow.
- **Middle:** the film as a rounded card.
- **Below:** the voiceover as captions (most social video plays muted).
- **Bottom:** *Plan my journey* and the address.

```bash
node make.mjs --in ../showreel/out/dreamscape-showreel-1080p.mp4 --out ../showreel/out/dreamscape-showreel-9x16.mp4
node make.mjs --in ../film-your-trail/out/dreamscape-your-trail-1080p.mp4 --out ../film-your-trail/out/dreamscape-your-trail-9x16.mp4 --captions ../film-your-trail/assets/captions.json
```

`../collect.sh` then gathers every film (16:9 4K and 1080p, 9:16 and soundtracks) into `Dreamscape marketing video/`.
