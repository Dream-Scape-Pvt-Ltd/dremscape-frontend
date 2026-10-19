# SFX bank

Interface sound effects used by the showreels.

- **Source:** [uisfx](https://github.com/romainsimon/uisfx) v0.4.0 (npm `uisfx`), packs `studio`, `cinematic`, `glass`, `minimal`, `soft`.
- **Licence:** audio is CC0 1.0 (see `LICENSE-AUDIO`); no attribution required. The files are the package's own MP3s, unmodified.
- **Layout:** `<pack>/<cue>.mp3` (cue names are the package's semantic names: `press`, `swipe`, `drop`, ...).
- **Use:** `load.mjs` decodes the files with ffmpeg and hands them to the OfflineAudioContext in `src/audio.js` of each showreel. Gain, pan, pitch and a low-pass are set per cue in the cue sheet (`src/timeline.js`).
- To swap in a different sample pack, drop files into a new `<pack>/` folder and reference them as `pack/cue` in the cue sheets.
