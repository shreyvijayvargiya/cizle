---
name: Sketch Explainer
description: Turns a technical blog post or tutorial into a hand-drawn explainer video, plus a prompt pack for video models (narration, storyboard, per-scene prompts).
kind: type
engine: article
aspect: "9:16"
duration: 30
content_types: [programming_tutorial, technical_blog, developer_roadmap]
platforms: [instagram_reels, youtube_shorts]
visual_style: hand_drawn_minimal
style: sketch
for: [devtool, ai, solo]
---
# Sketch Explainer

**Goal:** convert a technical article into a clear, visually engaging explainer for developers. cizle renders a sketch-style video from the storyboard (paper background, hand-drawn boxes and arrows, narration, captions, music) and also returns the full prompt pack, so an AI video model or an agent can render each scene as a generated clip.

## Inputs
- `title`: the article title.
- `content`: the source article.
- `audience`: who the video is for. Infer it from the article if it is not given.
- `duration_seconds`: target length.
- `key_takeaway`: the one lesson. Infer it from the article if it is not given.

## Instructions
1. Extract one main idea from the source material.
2. Preserve technical accuracy. Never invent benchmarks, quotes, or facts.
3. Write a strong opening hook.
4. Create a sequence of visual scenes that explain the concept in order.
5. For each scene, specify narration, subject, action, camera movement, lighting, and transition.
6. Use simple hand-drawn objects, arrows, labels, and diagrams.
7. Keep visual continuity across scenes.
8. Do not ask the video model to render long, exact text. Put precise labels and subtitles in post-production.
9. Give every scene a short on-screen label (at most 6 words) and a 2-4 node diagram (1-3 words per node) that cizle draws as boxes joined by arrows.
10. Keep every clip within a short duration (4-8 seconds) so it fits common video model limits, and assemble the clips into the final video.

## Visual prompt template
Create a minimalist hand-drawn educational animation explaining {{key_takeaway}} to {{audience}}.
Visual style: loose ink outlines, simple geometric shapes, white or warm off-white background, restrained monochrome palette, subtle paper texture, clean compositions, friendly technical illustrations.
Scene subject: {{scene_subject}}.
Action: {{scene_action}}.
Camera: {{camera_movement}}.
Lighting: soft, even, low-contrast.
Motion: smooth, deliberate, easy to follow.
Composition: one main visual idea per shot.
Continuity: retain the same illustration style and visual language.
No photorealistic imagery, cluttered compositions, gibberish text, unnecessary decorative elements, or abrupt style changes.

## Required output sections
- Hook (scene 1's narration is the hook)
- Narration script
- Scene-by-scene storyboard
- Individual video-generation prompts (one per scene, using the visual prompt template)
- Suggested transitions
- Subtitle text
- Sound design notes
- Final assembly instructions
- Source-fact references (each narrated claim points to the passage of the article it comes from)
