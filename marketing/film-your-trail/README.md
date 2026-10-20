# Dreamscape Treks — "Your Trail" (32.5 s, with voiceover)

A calm, voice-led brand film built from the site's own trek photographs, its real journey finder, and its own words. Every frame is drawn by `window.seek(t)` (no CSS animation, no timers); the soundtrack is written in code to the same timeline.

## Script and picture

An editorial page the camera travels along: paper and forest spreads, framed trek photographs with the site's own captions, the finder's options redrawn as chips, a trip card, a route and three steps. Built from the site's assets, not a copy of its screens.

| Time | Picture | Voice (Kokoro-82M `am_michael`, offline) |
|---|---|---|
| 0.0 | Paper spread: *01 — A little longer in the light*, a framed alpenglow photo; the headline rises word by word | *Some trails you walk.* |
| 2.5 | The camera glides on: a wide frame of three trekkers, *02 — The people beside you*; a gold rule draws under "stay with you." | *Some trails stay with you.* |
| 5.0 | Onto forest: **Since 2005**, *Our team · Thamel, Kathmandu*, Kathmandu at night in a portrait frame | *Since 2005, our team in Kathmandu has planned journeys through the Himalaya.* |
| 10.0 | *Journeys through the Himalaya.* Four real moments glide past, each with its site caption | |
| 12.5 | Back on paper: **Where to?** Five region chips; **Langtang** is picked on the beat. **How hard?** **Normal** | *Tell us where you want to go, and how hard you want to climb.* |
| 16.25 | The two choices fly into a trip card (Langtang Region · Valley walks & mountain villages); *Find my trek* is pressed | |
| 17.1 | The card's photo opens to full frame under the site's hero shade; a gold route draws up the hillside. **Shaped around you.** | *We'll shape the route around you.* |
| 20.0 | Whip pan to *Make the trail your own*: three cards, each icon drawing itself as the line is spoken | *Share your idea. Talk it through. Get a plan that's yours.* |
| 25.0 | A forest page rises; the lockup assembles; a strip of the film's photographs drifts along the bottom | *Dreamscape Treks. Himalaya, and beyond.* |
| 29.4 | **Plan my journey →** · dreamscapetreks.com | |

All words on screen are the site's own: hero copy, region names, finder options, Treks menu text, tailor-made steps, photo captions (`src/lib/trek-memories.ts`), address. Photos: `public/images/trek-memories/`, graded by `tools/prep-photos.py`; a fine paper grain sits over the whole film.

The voice uses Kokoro's own pronunciation dictionary (`tools/g2p.py`, misaki US lexicon with hand-checked part-of-speech tags) and slower pacing on the emotional lines. It is still a synthetic voice; a recorded read can replace `assets/vo/*.wav` one line at a time.

## Music

D major, 96 BPM, 13 bars of 2.5 s; every scene change sits on a bar line and every finder click on a beat. Felt piano motif over low strings (bars 1-5), a soft pulse under the website moment (6-10, kick on 1 and 3, shaker, muted plucks), a short build with toms and a reversed swell into the logo, which lands on D (bar 11), then the motif rings out. The music ducks about 7-10 dB under every voice line; measured voice-over-music in the speech band is 10-23 dB.

## Build

```bash
cd marketing/film-your-trail
python3 tools/prep-photos.py assets/            # grade photos (already done; assets are committed)
# voiceover (already done; assets/vo is committed) — see tools/voiceover.py for the one-time model setup
node build.mjs [--4k]                           # -> dist/film[-4k].html
node audio.mjs                                  # score + voice + sound design -> out/soundtrack.wav (-14 LUFS); `music|vo|sfx <refPeak>` for stems
node render.mjs --scale 2 --html dist/film-4k.html --out out/dreamscape-your-trail-4k.mp4 --also-1080p --dur 32.5
node preview.mjs <dir> beats | <times...>       # stills
node qa.mjs <dir>                               # every 60 fps frame at 480x270, for pop / hold checks
```

- `src/engine.js` picture · `src/score.js` music, voice mix and ducking · `src/timeline.js` voice placement, cuts, clicks, sound cues.
- Voice: Kokoro-82M (Apache-2.0) via `kokoro-onnx`, weights from the npm package `kokoro-q8-shards`, voice styles from `kokoro-js`; the model is not committed.
- Sound effects: CC0 samples from `../sfx-bank`.
