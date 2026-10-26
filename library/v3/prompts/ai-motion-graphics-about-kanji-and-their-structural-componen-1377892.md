# AI motion graphics about kanji and their structural components

By @haiz_ai
Language: ? · Domains: music, gaming · Source: V04

Original post: https://x.com/haiz_ai/status/2107079113471377892

Source page: https://data.openchamber.dev/opus-5-5-videos/v/haiz_ai-2107079113471377892

Demo video: https://video.twimg.com/amplify_video/2107078973062852608/vid/avc1/1920x1080/BR7Fa7okV43AJFyx.mp4?tag=29

```
Use Claude Code to drive the After Effects project I have open. Write JSX, run it in AE (AfterFX.exe -r on Windows, osascript on Mac), render with aerender, then pull key frames with ffmpeg and check them yourself before moving on.
First check that AE, Python, ffmpeg and a heavy Japanese gothic + mincho font are available. If anything is missing, tell me how to install it (free Google Fonts like Dela Gothic One are fine).
</setup>

<rules>
- 144 BPM (1 beat = 10 frames at 24 fps). Every cut lands on a beat.
- One strong colour pair per screen: 群青 #1F4BFF / 濃紺 #0B1F4D & 山吹 #FFC627 / 生成 #F3F1EC & 墨 #1C1A1A / 臙脂 #7A0E2E & 桃 #FFB3A8 / 深緑 #1F4F2A & 萌黄 #C6E23A / 朱 #FF6A1F
- Motion comes in fast and holds briefly.
- No explanatory text in the video.
</rules>

<idea>
Treat kanji as architecture: things built from parts that can be taken apart and rebuilt.
Let one shot's last shape become the next shot's first shape, so the whole piece feels like one continuous thought.
Give it an arc: an opening, a build-up, a peak, one quiet moment, and an ending that loops back to the start.
</idea>

<ingredients>
Pick a few of these and decide the order yourself. You don't have to use them all, and you can add your own.
- Kanji built from plain bars, changing into other kanji
- Kanji large enough to touch the frame edges, cropped like a poster, but keep about two-thirds of each character on screen so it still reads
- Traditional Japanese patterns (立涌, 青海波, 麻の葉 …)
- Calligraphy: stroke counts, stroke order
- Genkō yōshi (manuscript paper), vertical writing
- Split-flap departure boards, the twelve zodiac signs
</ingredients>

<sound>
Synthesise everything (no audio files) in the Japanese in scale: hyoshigi, taiko, bells, whooshes. Place sounds at the same frame numbers as the cuts. Leave one stretch where the beat drops out.
</sound>

<constraints>
- Patterns from shape-layer properties and repeaters, never drawn by hand. Animate on normal keyframes so I can retime things.
- Put all colours on one controller, and give me controls for the main movements.
- Use matchName, not display names (works in Japanese or English AE). Render with aerender's default template. Wrap scripts in try/catch.
- Shape layers start at comp centre; set anchor/position to [0,0] when plotting in comp coordinates. Text caps at ~1296 px, so scale up beyond that. Check every character exists in the chosen font.
```

Creator's prompt, collected for private study. Ask before republishing.
