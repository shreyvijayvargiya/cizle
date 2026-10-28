---
name: dip-pen-sketch-animation
description: Turn a photo into a rough dip-pen sketch DRAWING-PROCESS VIDEO — outputs three files; the black-ink outline, the marker-colored version (same matched linework as dip-pen-sketch-combo), AND an MP4 animation of the process; pen strokes draw the ink first, then marker strokes sweep the color in. Use when the user says "dip-pen-sketch-animation", "dip pen animation", "animate the sketch", "drawing process video", "sketch timelapse", "philly sketch video", "sketch reveal video", or asks for a video/animation of a photo being drawn, inked, or colored in. By Reblis.com.
---

# dip-pen-sketch-animation

One photo in → **three deliverables out**:
1. **Outline** — rough dip-pen black-ink line sketch (`<name>_anim_outline.jpg`).
2. **Color** — the *same* sketch with loose marker color (`<name>_anim_color.jpg`).
3. **Animation** — an MP4 of the drawing process (`<name>_dippen_animation.mp4`): the ink appears stroke by stroke like a pen drawing it, then the marker color fills in with diagonal sweeps, ending on the finished colored sketch.

The stills follow the **dip-pen-sketch-combo** rules exactly (stroke-for-stroke identical linework, identical pure-white background). The animation is built **programmatically from those two finished images** — frames progressively reveal their actual pixels — so it is deterministic, costs nothing beyond the two image generations, and its final frame IS the color deliverable. Never generate the animation with a video model: it would redraw strokes that don't match the stills (the same drift problem the combo method exists to kill).

> ⚠️ **Matched-pair rule (same as combo — never deviate).** `fal-ai/nano-banana-2/edit` redraws its linework on every pass, so the outline deliverable must be **derived from the colored image** (Step 5), never generated separately and never "fixed" by compositing. This is settled; do not re-litigate it.

For stills only, use **dip-pen-sketch-combo** (pair), **dip-pen-sketch-outline** (ink only), or **dip-pen-sketch-color** (color only).

## Requirements

- **[Claude Code](https://claude.com/claude-code)**
- **The fal.ai MCP server** connected, with credits. Runs **`fal-ai/nano-banana-2/edit`** twice — **~$0.06–0.08 per run** (the animation itself is free, rendered locally).
- `curl` + ImageMagick (`convert`) for fetching/resizing/whitening.
- **`python3` with `numpy`, `Pillow`, `scipy`, `scikit-image`, and `ffmpeg`** for the animation render (`pip install numpy pillow scipy scikit-image` · `apt install ffmpeg`).
- Optional free alternative for the generations: the **nanobanana / Gemini MCP** (`gemini_edit_image`), same model family — free tier often 429-exhausted, so fal is the reliable default.

## Inputs

Resolve in **Step 0** (same as the sibling skills):
- **Local path** (`/tmp/foo.jpg`).
- **Direct image URL** (`Content-Type: image/*`) — pass straight through.
- **Social / page link** (Instagram, Facebook, Pinterest) — HTML pages, not images; Meta CDN links are signed/expiring and block hotlinking. Download locally first.

## Procedure

Steps 0–6 are the combo flow; Step 7 renders the animation with the **bundled script** — do not rewrite it.

0. **Resolve the input to a usable image.**
   - Direct image URL fal can fetch (`curl -sIL "$URL"` → `200` + `image/*`)? Use it directly as the Step-3 image, skip resize/upload.
   - Otherwise download it (`curl -sL -A 'Mozilla/5.0' -o /tmp/_dippen_dl.jpg "$URL"`; browser if Meta blocks it) → that file is `$SRC`.
   - Local path → `$SRC` directly.
   - Set `NAME` = a short slug for the subject (used in output filenames).

1. **Downscale the source** (CMYK→sRGB; ~1024px). *(Skip for direct-URL passthrough.)*
   ```bash
   convert "$SRC" -colorspace sRGB -resize 1024x -quality 82 /tmp/_dippen_src.jpg && identify /tmp/_dippen_src.jpg
   ```
   `Read` `/tmp/_dippen_src.jpg` to note the subject(s), clothing, key features (for the "keep recognizable" clause) and garment colors (for the color step).

2. **Get a URL fal can fetch (`$IMG_URL`)** for the source. *(Skip for direct-URL passthrough.)*
   - **Upload to fal's CDN via REST (reliable default):** don't pass the image as base64 `data` through `mcp__fal-ai__upload_file` — a ~1024px JPEG encodes to ~190K base64 chars, which overflows a tool call and gets truncated. Use fal's REST upload with the same key the fal MCP server is configured with:
     ```bash
     resp=$(curl -s -X POST "https://rest.alpha.fal.ai/storage/upload/initiate" \
       -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
       -d '{"file_name":"_dippen_src.jpg","content_type":"image/jpeg"}')
     upload_url=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin)['upload_url'])")
     IMG_URL=$(echo "$resp" | python3 -c "import sys,json;print(json.load(sys.stdin)['file_url'])")
     curl -s -o /dev/null -w '%{http_code}' -X PUT "$upload_url" -H "Content-Type: image/jpeg" --data-binary @/tmp/_dippen_src.jpg   # expect 200
     ```
   - **Your own web server:** copy into its docroot and use that public URL (delete it after the run).

3. **Generate the BASE ink sketch.** `mcp__fal-ai__run_model`, `fal-ai/nano-banana-2/edit`:
   - `image_urls`: `[$IMG_URL]`; `resolution`: `"2K"`; `output_format`: `"jpeg"`; `aspect_ratio`: `"auto"`
   - `prompt`: the **OUTLINE prompt** below (adapt the "keep recognizable" clause).
   - Download → `/tmp/${NAME}_anim_base.jpg`. This is **only the base for the color pass** — NOT a deliverable.

4. **Generate the COLOR version ON TOP of the base (this IS the color deliverable).** Get a fal URL for the base (Step 2 method), run a second edit:
   - `image_urls`: `[<base URL>]`; same `resolution`/`format`/`aspect_ratio`
   - `prompt`: the **COLOR-ON-TOP prompt** below (adapt the garment-color clause).
   - Download → `/tmp/${NAME}_anim_color.jpg`, then whiten its background:
     ```bash
     cd /tmp
     bg=$(convert ${NAME}_anim_color.jpg -format '%[pixel:p{3,3}]' info:)
     convert ${NAME}_anim_color.jpg -fuzz 12% -fill white -opaque "$bg" ${NAME}_anim_color.jpg
     ```
   - **The marker in this file is final and must NOT be touched again.**

5. **DERIVE the OUTLINE from the color image** (divide-by-blur strips the flat marker, keeps the ink, then levels deepen it to confident black):
   ```bash
   cd /tmp
   convert ${NAME}_anim_color.jpg -colorspace Gray \
           \( +clone -blur 0x18 \) -compose Divide_Src -composite \
           -level 6%,86% -sigmoidal-contrast 5x50% -level 14%,92% \
           ${NAME}_anim_outline.jpg
   ```
   (Lines too light? Lower the last white point, e.g. `-level 16%,88%`. Too grainy? Raise the blur to `0x24` and/or the black point to `18%`.)

6. **Normalize BOTH backgrounds to identical pure white** (the animation depends on clean whites — off-white paper becomes visible noise in the marker mask):
   ```bash
   cd /tmp
   for f in ${NAME}_anim_outline ${NAME}_anim_color; do
     bg=$(convert "$f.jpg" -format '%[pixel:p{3,3}]' info:)
     convert "$f.jpg" -fuzz 12% -fill white -opaque "$bg" "$f.jpg"
   done
   for f in ${NAME}_anim_outline ${NAME}_anim_color; do echo "$f -> $(convert "$f.jpg" -format '%[pixel:p{3,3}]' info:)"; done   # both must read 255,255,255
   Then sweep the borders for paper-edge smudges the whiten can miss — generations sometimes leave faint gray bands/speckle hugging the corners, and left in they replay as stray marks in the animation. The bundled sweep whites out faint desaturated border junk while protecting ink and marker color that legitimately reach the edge:
   ```bash
   python3 "$SKILL_DIR/scripts/clean_paper_edges.py" /tmp/${NAME}_anim_outline.jpg /tmp/${NAME}_anim_color.jpg
   ```
   ⚠️ Two gotchas field-tested 2026-07: (a) if the sampled corner pixel isn't near-white (artwork reaches that corner), sample a pixel that IS blank paper (e.g. top-center) — flooding from a dark sample eats ink/marker; (b) the sweep script deliberately protects DARK components, so near-black paper-edge curls / desk slivers hugging the frame borders survive it. If corner crops show dark edge curves, shave BOTH stills identically before rendering: `for f in ${NAME}_anim_outline ${NAME}_anim_color; do convert "$f.jpg" -shave 45x45 "$f.jpg"; done`

7. **Render the animation with the bundled script** (`$SKILL_DIR` = this skill's directory):
   ```bash
   python3 "$SKILL_DIR/scripts/animate_sketch.py" \
     /tmp/${NAME}_anim_outline.jpg /tmp/${NAME}_anim_color.jpg \
     /tmp/${NAME}_dippen_animation.mp4
   ```
   Defaults: 30fps · 8s pen phase · 0.75s hold on the finished outline · 5s marker phase · 1.5s end hold · 1600px longest side · pen/marker cursor dot. Knobs: `--fps`, `--ink-seconds`, `--marker-seconds`, `--pause`, `--end-hold`, `--max-size`, `--no-cursor`. The script replays BOTH phases from the image's own marks — never synthetic geometry (bands/patches show their seams as straight edges). Ink: skeletonize the linework, trace it into individual pen strokes (continuing straight through crossings, so intersecting hatch lines replay as separate strokes), order by nearest-neighbor pen travel, move a tip along each path revealing the stroke's true width. Marker: recover the ACTUAL painted strokes — cluster marker pixels into tone layers, each tone's connected swaths are the strokes as painted; trace each along its own principal direction and replay light base tones first, darker shading passes visibly on top, traveling nearest-neighbor between swaths. Phase transitions crossfade so no pixels pop in a single frame.

8. **Deliver all three to the sketches folder** — finals never stay in `/tmp`; `/tmp` is for intermediates only. Default folder `/root/projects/dip-pen-sketches/sketches/` (create it if missing, adapt per install): `cp /tmp/${NAME}_anim_outline.jpg /tmp/${NAME}_anim_color.jpg /tmp/${NAME}_dippen_animation.mp4 /root/projects/dip-pen-sketches/sketches/`. `Read` the two stills to show the user, check the script's printed **self-check line** (it extracts the MP4's final frame and asserts it equals the color still — codec noise only; the run FAILS if not), confirm duration/size with `ffprobe -v error -show_entries format=duration,size -of default=nw=1 /tmp/${NAME}_dippen_animation.mp4`, report the three sketches-folder paths, and offer tweaks (pacing knobs, rougher ink via Step-5 levels, 4K stills, vertical crop for socials). Tweak re-renders are free — the generations are the only paid step.

## OUTLINE prompt (base generation)

> Transform this photo into a ROUGH, loose dip-pen and India-ink line sketch. CRITICAL: keep the subject(s) clearly recognizable with their exact same face(s), expression(s), hair, facial hair, pose, sunglasses/accessories, and clothing. Linework: thin black India-INK lines from an old-school DIP PEN / steel nib, drawn fast, ROUGH and SCRATCHY and messy — loose energetic scribbled strokes, overlapping built-up scratchy hatching, uneven wobbly lines, some lines doubled or left incomplete and overshooting, occasional ink splatter dots, a quick raw gesture-sketch feel. Thin nib lines but NOT clean, NOT refined, NOT a polished illustration — deliberately rough and sketchy like a fast unfinished pen doodle. PURE BLACK INK ONLY — absolutely NO color, monochrome black-and-white line art, use ink cross-hatching and stippling for ALL shading and tone. Plain blank white sketchbook paper background — remove the original background entirely, just the figure(s) on empty paper.

## COLOR-ON-TOP prompt (color deliverable — runs on the base ink sketch)

> This image is a finished rough black dip-pen ink line sketch. Add loose alcohol-MARKER coloring (Copic style) ON TOP of it. ABSOLUTELY CRITICAL: do NOT change, redraw, move, or clean up ANY of the existing black ink lines, hatching, stippling, or splatter — keep every single pen stroke exactly as it is, in the exact same positions. Only ADD color over the existing drawing: flat streaky marker fills that bleed slightly and messily outside the ink lines, visible marker strokes, patchy uneven coverage, a limited palette — natural skin tones [+ describe the key garment colors, e.g. "dark charcoal/black for the shirt"]. Leave the blank white paper background untouched and white. The result must look like the SAME drawing, just with marker color laid over the identical ink linework.

## Notes

- **Why a programmatic animation instead of a video model?** Determinism. The frames are the actual pixels of the two deliverables being revealed, so the video always ends exactly on the delivered color image, the linework never drifts, and re-rendering with different pacing is free. A video model would invent its own strokes and hands, mismatch the stills, and cost more per attempt.
- **Why derive the outline from the color (Step 5)?** `nano-banana-2` redraws linework on every pass — the base ink sketch and the colored image have *different* lines. Extracting the outline from the finished color image is the only way to get truly identical lines. Field-tested; alternatives (multiply, blur, morphology) all degrade the marker.
- **Why whiten both images (Steps 4 & 6)?** The animation's marker mask = "where color differs from outline". Off-white or mismatched paper tones pollute that mask with background speckle; pure 255-white on both makes it clean. The corner-sampled `-opaque` flood only touches near-paper pixels.
- **The marker overlaps the ink by design.** Ink lines are identical in both images, so the diff-based mask excludes them — naively, marker passes would butt against every stroke and leave white halos along the linework until the end crossfade. The renderer assigns that fringe to the nearest swath, so each pass visibly glazes ACROSS the ink as it travels; the line persists because the color image already contains it, tinted where the generator glazed. Don't "fix" halos by editing images — they mean the backgrounds weren't normalized (Step 6) or the stills aren't a matched pair.
- Adapt the "keep recognizable" clause and the garment-color clause to the actual photo — generic prompts drift.
- If the base ink sketch is too clean/refined, re-run Step 3 emphasizing "rougher, scratchier, wobbly, incomplete lines" before the color pass.
- Social-format variants: render the master at defaults, then crop/pad with ffmpeg (e.g. 9:16: `ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih" out.mp4`) rather than re-rendering.
