# Music kit

Real instruments for the films' scores, rendered offline in Node at 48 kHz. Each film's `music.mjs` writes the notes and this kit plays them.

```bash
cd marketing/music-kit
npm install          # spessasynth_core (SoundFont synth, Apache-2.0), pinned in package-lock.json
node fetch.mjs       # samples -> ./samples (not committed, ~63 MB), pinned npm versions
```

- **`kit.mjs`**
  - `loadPiano` / `pianoNote` play the Salamander Grand Piano. Samples are every minor third across six velocity layers, played with cubic interpolation, plus a damper, sustain pedal and key-release noises.
  - `sf2Render` plays GeneralUser GS through spessasynth: strings, cello, double bass, harp, timpani, reverse cymbal and drum kits. It returns one dry stereo stem per MIDI channel, and the film's `src/score.js` does the rooms and the mix.
- **`upbeat.mjs`** is the Dreamscape theme every film now uses. It is bright and driving, stays on major chords (I, IV, V with sus/add9 colour), and plays eighth-note piano stabs high in the range, a strummed steel guitar, pizzicato, glockenspiel, finger bass, kick, claps, shaker and tambourine in a small, bright room.
  - It is arranged from each film's bars (`chord`, `energy` 0-3), with hook windows kept clear of the voice and big moments that land with a crash, a tom fill and a reversed cymbal.
  - The earlier scores read as sad because of a slow pulse, a soft low piano, B minor on key moments, long string swells and a big reverb.
- **`keys.mjs`**: keystrokes and mouse clicks, synthesised from how a key sounds. Each one has the switch tick, the keycap bottoming out through the plate's resonances, the case's low knock, and a softer, brighter knock on release. Every key gets its own resonances, level and timing.

## Sources and licences

| Samples | Author | Licence | npm package |
|---|---|---|---|
| Salamander Grand Piano V3 | Alexander Holm | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | `@audio-samples/piano-mp3-velocity{3,5,7,9,11,13}@1.0.5`, `@audio-samples/piano-mp3-release@1.0.5` |
| GeneralUser GS v1.471 | S. Christian Collins | Free for music creation, private or commercial (see `samples/generaluser/LICENSE.txt`) | `generaluser@1.47.1` |

The piano is CC BY 3.0, so credit it wherever credits are listed: *Piano: Salamander Grand Piano V3 by Alexander Holm (CC BY 3.0).*
