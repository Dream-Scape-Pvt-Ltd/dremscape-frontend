#!/usr/bin/env bash
# Gathers every finished film into one folder, "Dreamscape marketing video", ready to copy to a desktop or a drive.
#   bash marketing/collect.sh
set -euo pipefail
cd "$(dirname "$0")"
D="Dreamscape marketing video"
rm -rf "$D"; mkdir -p "$D/01 Website showreel" "$D/02 One Trail" "$D/03 Step by Step" "$D/04 Your Trail"
cp showreel/out/dreamscape-showreel-4k.mp4            "$D/01 Website showreel/Dreamscape - Website showreel - 16x9 4K.mp4"
cp showreel/out/dreamscape-showreel-1080p.mp4         "$D/01 Website showreel/Dreamscape - Website showreel - 16x9 1080p.mp4"
cp showreel/out/dreamscape-showreel-9x16.mp4          "$D/01 Website showreel/Dreamscape - Website showreel - 9x16.mp4"
cp showreel/out/dreamscape-showreel-soundtrack.mp3    "$D/01 Website showreel/Dreamscape - Website showreel - soundtrack.mp3"
cp showreel-motion/out/dreamscape-one-trail-4k.mp4    "$D/02 One Trail/Dreamscape - One Trail - 16x9 4K.mp4"
cp showreel-motion/out/dreamscape-one-trail-1080p.mp4 "$D/02 One Trail/Dreamscape - One Trail - 16x9 1080p.mp4"
cp showreel-motion/out/dreamscape-one-trail-9x16.mp4  "$D/02 One Trail/Dreamscape - One Trail - 9x16.mp4"
cp showreel-motion/out/dreamscape-one-trail-soundtrack.mp3 "$D/02 One Trail/Dreamscape - One Trail - soundtrack.mp3"
cp showreel-trek/out/dreamscape-step-by-step-4k.mp4    "$D/03 Step by Step/Dreamscape - Step by Step - 16x9 4K.mp4"
cp showreel-trek/out/dreamscape-step-by-step-1080p.mp4 "$D/03 Step by Step/Dreamscape - Step by Step - 16x9 1080p.mp4"
cp showreel-trek/out/dreamscape-step-by-step-9x16.mp4  "$D/03 Step by Step/Dreamscape - Step by Step - 9x16.mp4"
cp showreel-trek/out/dreamscape-step-by-step-soundtrack.mp3 "$D/03 Step by Step/Dreamscape - Step by Step - soundtrack.mp3"
for v in "" "-heart"; do                                   # the male voice (Michael) is the main cut, Heart the alternate
  V=$([ -z "$v" ] && echo "male voice" || echo "female voice")
  cp film-your-trail/out/dreamscape-your-trail$v-4k.mp4    "$D/04 Your Trail/Dreamscape - Your Trail ($V) - 16x9 4K.mp4"
  cp film-your-trail/out/dreamscape-your-trail$v-1080p.mp4 "$D/04 Your Trail/Dreamscape - Your Trail ($V) - 16x9 1080p.mp4"
  cp film-your-trail/out/dreamscape-your-trail$v-9x16.mp4  "$D/04 Your Trail/Dreamscape - Your Trail ($V) - 9x16.mp4"
done
cp film-your-trail/out/dreamscape-your-trail-music.mp3 "$D/04 Your Trail/Dreamscape - Your Trail - music only.mp3"
cat > "$D/README.txt" <<'EOF'
Dreamscape Treks - marketing films

01 Website showreel   25.5 s   the real site: finder, Treks menu, tailor-made steps, the inquiry typed and sent
02 One Trail          24 s     one gold trail line carries the story from the hook to the logo
03 Step by Step       24 s     for trekkers: where to, how hard, your own trip
04 Your Trail         32.5 s   voice-led brand film (male and female voice versions)

Each film comes as 16x9 4K (3840x2160) and 1080p for YouTube, the website and presentations, and as 9x16
(1080x1920) for Instagram Reels, TikTok and YouTube Shorts. 60 fps, H.264, AAC, loudness -14 LUFS.
Music: the Dreamscape theme on real instruments (Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0;
GeneralUser GS by S. Christian Collins). Source and build steps: marketing/ in the dremscape-frontend repo.
EOF
du -sh "$D"; find "$D" -type f | sort
