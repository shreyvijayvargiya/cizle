# 22-second square product launch film with typed captions and glass UI

By @twoclipping
Language: ? · Domains: product, music, entertainment · Source: V04

Original post: https://x.com/twoclipping/status/2106526359589675085

Source page: https://data.openchamber.dev/opus-5-5-videos/v/twoclipping-2106526359589675085

Demo video: https://video.twimg.com/amplify_video/2106523995885486080/vid/avc1/1080x1080/r2bovvJQ2tRlUQTg.mp4?tag=29

```
<inputs>
Ask me for: my product's name, a one-line pitch, my logo, 3-6 screenshots of my product, 40+ images of what it makes (or photos of it), my brand colours and font, an ElevenLabs API key and voice ID, and a royalty-free song with a clear drop (the file and the drop's timestamp). If I skip any, use the defaults: "Ora 2", "an image model made for taste", free Unsplash and Pixabay images, Geist, ink #111214, the voice Samara X (19STyYD15bswVz51nqLf) on eleven_v4, and Pixabay "Cascade Breathe" (129.83 BPM, drop at 75.39s).
</inputs>

<script>
Write a 9-line voiceover in this shape and map every line to my product:
"This is [name]. A [category]... made for [value]. [Verb] in ANY style. Show it a [input] — and it just... gets you. The more you use it, the BETTER it gets. Tune its [setting]. Its [setting]. Its [setting]. Every [output] — exactly how you see it. [Name]. Out now."
Light emotion tags only: [softly] on the quiet lines, [excited] on the [Verb] line. The opener gets no tag and a plain full stop.
</script>

<voice>
Call the ElevenLabs API directly with my key, no MCP. Generate 4 takes of the whole script in one read and let me pick. If one line is off, regenerate only that line 4 times and splice the best one into my take.
Cut every pause over 0.28s down to 0.2s, then level each phrase 85% of the way to the median level, changing gain only inside the pauses.
For word timings, cut the read at every pause of 100ms or more, transcribe each chunk on its own with Whisper and pin each chunk's first word to its measured onset. One Whisper pass puts words up to half a second late.
</voice>

<direction>
A 22 second square launch film, 1440x1440 at 60fps, in the style of an AI lab's launch: a white page, one typeface, black ink, real images, and every caption typed word by word at the exact moment it's spoken.
Every control (the prompt bar, the settings panel, the caption pill) is liquid glass: the scene behind it frosted, its edge bending that scene like thick glass, a top sheen, a bright rim and a soft lift shadow. Glass on plain white shows nothing, so put a slow pastel aura in my brand colours, or a blurred wash of the photo, behind it.
The one word she stresses types in a gradient of my brand colours with a faint glow behind it.
Motion rules: the camera always drifts (a 1.0 to 1.04 push per scene, and when one scene hands its content to the next, the next starts at the zoom the last one ended on), nothing pops in (fades of at least 0.3s, eased), images switch on 16th notes with a click each, scene changes land on phrase starts, and the music's drop lands on the [Verb] line. No full stops on screen.
Banned: selection-box highlights, beat-snapped slams, white flashes, 3D, templates.
</direction>

<structure>
Seven scenes, each hung on the voice:
1. "This is [name]": a collage of my images drifts out as the name types in big, then the category line replaces it.
2. "made for [value]": full-bleed flashes of my best images on 16th notes into the drop, with the line typed over them in white.
3. The drop: a glass prompt bar types a short prompt, then the result card switches style on every 16th, with a black style chip that rolls to each new name and a strip of thumbnails.
4. "Show it a moodboard": 9 images fly into a 3x3 grid, then ring around the result as "It gets you" types.
5. "The more you use it, the better it gets": two typed lines, the stressed word in the gradient.
6. The settings: a glass panel of 3 sliders, each moving as she names it. The picture shifts hue, rolls new seeds on 16ths, then turns poster, and a blurred wash of its own colours shifts with it behind the glass.
7. "Every [output], exactly how you see it": 120 of my images burst from the centre behind a glass caption pill, then collapse into my logo as the name types, with "Out now" underneath. Hold 2s.
Swap the prompt bar, the results and the sliders for my product's real input, outputs and settings.
</structure>

<sound>
Start the song so its drop lands on the [Verb] line, and anchor the beat grid there.
Duck the music under the voice with a 3-band sidechain (lows 30%, mids 85%, air 55%; 0.3s hold, 50ms look-ahead, 0.5s release), then move each phrase's mids until the voice sits about 9 dB over the music between 300 Hz and 4 kHz.
One downloaded Mixkit SFX per event, placed by its measured peak: a click on every image switch, a key on every typed letter, a soft landing on the stressed word, whooshes, and impacts on the drop and the logo, trimmed around their peak (many are 4 second risers). Fade the music on a dB curve under the end card. Loudnorm to -14 LUFS.
</sound>

<build>
1. One HTML canvas. Every frame is a pure function of time inside seek(t), and every caption and cut reads the word table.
2. The glass: snapshot the canvas behind the shape, blur it about 14px for the body, draw a lightly blurred copy magnified about 1.06x in a 12px band along the edge, then add the milk, sheen, rim and shadow.
3. Render with Playwright at 60fps with 8 motion-blur subframes, then encode with ffmpeg.
4. Before you show me anything: a contact sheet of stills, a frame-diff scan for single-frame pops (only the 16th-note runs may jump), and the voice-over-music ratio for every phrase.
</build>

<gotchas>
A [warmly] opener comes out whispered and [excited] sounds fake. A highlight box behind a word looks like a Windows text selection. If a scene's camera restarts at 1.0 mid-handoff, the zoom snaps. A 0.05s fade reads as a pop-in.
</gotchas>

<start>
Ask me for the inputs, write the script, send me 4 voice takes to pick, then show me 8 stills before the full render
```

Creator's prompt, collected for private study. Ask before republishing.
