# Dreamscape Treks — "Your Trail" (32.5 s, with voiceover)

A calm, voice-led brand film built from the site's own trek photographs, its real journey finder, and its own words. Every frame is drawn by `window.seek(t)` (no CSS animation, no timers); the soundtrack is written in code to the same timeline.

## Script and picture

An editorial page the camera travels along, built from the site's assets rather than copied from its screens: paper and forest spreads, the site's trek photographs and captions, the finder's options redrawn as chips, a trip card, a route and three steps. One object carries the story from start to end: a **gold trail line with a dot for a head**. It underlines the words, links the photographs, leads into the trip card, becomes the route on the photo, blooms into the gold ring that opens the steps page, runs under the steps, and walks into the *Plan my journey* button.

Motion follows the reference brief the client shared (`yihui-dev/awesome-opus5-5-videos`):
- One main movement leads, with smaller ones overlapping.
- Things land slowly and leave fast, through a Hermite camera with a continuous drift and glides that leave quickly and settle over 0.6 s.
- Every spring is critically damped.
- The next scene is already built while the camera is still arriving.
- Titles leave before another takes their place.
- The first frame is already a composition.

A fresh reviewer checked every render against that brief (contact sheets every 0.2 s, plus 0.05 s around each transition). The frame-diff audit (`qa.mjs`) shows no still stretch longer than 0.1 s and no frame-to-frame pops.

| Time | Picture | Voice |
|---|---|---|
| 0.0 | Paper: *01 — A little longer in the light*, **Some trails** already set beside the alpenglow photo; the trail starts under the words | *Some trails you walk.* |
| 2.5 | Glide on: three trekkers in a wide frame; the trail rises to underline "stay with you." | *Some trails stay with you.* |
| 5.0 | Kathmandu at night, full bleed, a slow push into the lights: **Since 2005**, *Our team · Thamel, Kathmandu* | *Since 2005, our team in Kathmandu has planned journeys through the Himalaya.* |
| 10.0 | *Journeys through the Himalaya.* Four trek photos with their site captions; the trail lights a marker under each, on the eighth notes | |
| 12.5 | **Where to?** Five region chips, **Langtang** picked on the beat; **How hard?** **Normal** | *Tell us where you want to go, and how hard you want to climb.* |
| 16.25 | The choices fly into a trip card that glides to the centre; *Find my trek* is pressed with a gold pulse | |
| 17.1 | The card's photo opens to full frame; the trail's head becomes the start of a gold route up the hillside. **Shaped around you.** | *We'll shape the route around you.* |
| 19.55 | The route's end pin blooms into a gold ring that opens *Make the trail your own.*; three cards, each icon drawing itself as its line is spoken, the trail running beneath | *Share your idea. Talk it through. Get a plan that's yours.* |
| 24.4 | A forest page rises with the mark; the wordmark assembles; a strip of the film's photographs drifts along the bottom; the trail walks in from the left | *Dreamscape Treks. Himalaya, and beyond.* |
| 29.4 | The trail's head becomes **Plan my journey →** · dreamscapetreks.com | |

All words on screen are the site's own: hero copy, region names, finder options, tailor-made steps, photo captions (`src/lib/trek-memories.ts`) and the address. Photos come from `public/images/trek-memories/`, graded by `tools/prep-photos.py`, with a fine paper grain over the whole film.

## Voice

Kokoro-82M, offline. Two reads are kept: `assets/vo` (`am_michael`, the default) and `assets/vo-heart` (`af_heart`, the model's best-trained voice). Compared with the first version:
- Full precision: `tools/kokoro_f32.py` turns the fp16 export into an fp32-compute graph. The q8 export was grainy, and the plain fp16 graph overflows on the male voices.
- Each paragraph is read in one take, so the intonation runs across sentences, then cut into lines at the pauses.
- A recorded-VO finish: 48 kHz, low cut, split-band de-esser, a little high-frequency air above the model's 12 kHz limit, and a tone match to the long-term spectrum of natural speech.

It is still a synthetic voice. A recorded read can replace the WAVs one line at a time.

## Music

The score is played on real instruments by `music.mjs` (`../music-kit`): the Salamander grand piano, plus GeneralUser GS strings, cello, double bass, harp, timpani and a light kit. It is in D major at 96 BPM, 13 bars of 2.5 s, with every scene change on a bar line:
- Bars 1-2: the piano alone over a soft string chord.
- Bars 3-5: broken chords join with cello and bass. The F#-A-E motif plays in full only over the photographs, between two voice lines.
- Bars 6-10: a pulse (piano ostinato, kick, shaker, then harp). Each choice in the finder and each step is a note of the chord.
- Bar 11: a timpani roll and a harp glissando resolve on D under the logo.
- Bars 12-13: the motif rings out.

`src/score.js` mixes the stems in a warm hall and ducks them 4-9 dB under every line. Measured voice-over-music in the speech band is 10-21 dB. There is one soft whoosh per scene change, shaped by the camera's actual speed. The mix is normalised to -14 LUFS.

## Build

```bash
cd marketing/film-your-trail
python3 tools/prep-photos.py assets/            # grade photos (already done; assets are committed)
# voiceover (already done; assets/vo is committed) — see tools/voiceover.py for the one-time model setup
node build.mjs [--4k]                           # -> dist/film[-4k].html
node music.mjs                                  # the score on real instruments -> out/stems/*.wav (needs ../music-kit set up)
node audio.mjs [--vo assets/vo-heart --out soundtrack-heart]   # mix -> out/soundtrack.wav (-14 LUFS); `music|vo|sfx <refPeak>` for stems
node render.mjs --scale 2 --html dist/film-4k.html --out out/dreamscape-your-trail-4k.mp4 --also-1080p --dur 32.5
node preview.mjs <dir> beats | <times...>       # stills
node qa.mjs <dir>                               # every 60 fps frame at 480x270, for pop / hold checks
```

- `src/engine.js` picture · `music.mjs` score · `src/score.js` mix, voice and ducking · `src/timeline.js` voice placement, camera glides, on-screen actions (shared by all three).
- Voice: Kokoro-82M (Apache-2.0) via `kokoro-onnx`, weights from the npm package `kokoro-fp16-shards`, voice styles from `kokoro-js`; the model is not committed.
- The alternate voice: `node audio.mjs --vo assets/vo-heart --out soundtrack-heart`, then swap the audio track of the rendered MP4 with ffmpeg (`-map 0:v -map 1:a -c:v copy`).
- Piano: Salamander Grand Piano V3 by Alexander Holm (CC BY 3.0); strings, harp, percussion: GeneralUser GS by S. Christian Collins.
