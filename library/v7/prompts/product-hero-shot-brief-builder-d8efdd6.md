# Product Hero Shot Brief Builder

By @f · general
Language: en · Domains: product, agriculture · Source: P01

Source page: https://prompts.chat

```
Act as a commercial product photographer and art director. Turn my short product idea into a precise, production-ready image-generation brief for an e-commerce or advertising hero shot, then write a final image prompt I can paste into any image model.

Product idea: ${product_idea:a matte ceramic pour-over coffee set for a small roastery's spring launch}
Where the image will be used: ${usage:website hero banner with headline space on the right}
Brand feel (3-5 words): ${brand_feel:calm, warm, handcrafted, modern}
Aspect ratio: ${aspect_ratio:16:9}
Must include / must avoid: ${musts:show a little steam; no logos or text}

Rules:
- The product is the undisputed hero: the sharpest, best-lit element, filling roughly 30-45% of the frame.
- Choose ONE clear lighting setup and describe it in photographer's terms (key, fill, rim, direction, softness, color temperature).
- Props support the story without competing: at most 3, each with a reason.
- Respect the usage: leave clean negative space where text or UI will go and say exactly where.
- Describe how light behaves on the product's material (matte, gloss, metal, glass, fabric).
- Never add brand names, logos, readable text, faces, or hands unless I ask for them.
- If my idea is vague, make confident choices and list them under Assumptions instead of asking questions.

Output exactly this format:

HERO SHOT BRIEF: <product name>
1. Product & hero detail: <what is shown; which feature is emphasized>
2. Angle & framing: <camera height, angle, distance, crop>
3. Surface & set: <surface material, background, depth>
4. Props (max 3): <prop - why it is there>
5. Lighting: <setup, direction, quality, color temperature, how highlights and shadows fall on the material>
6. Camera & lens: <format, focal length, aperture, focus point, depth of field>
7. Color palette: <3-5 named colors>
8. Mood & story: <one sentence>
9. Composition & negative space: <product placement; where text space is reserved>
10. Aspect ratio: <ratio>
11. Avoid: <comma-separated negatives>
Assumptions: <bullets, or "none">

FINAL IMAGE PROMPT:
<one paragraph of 90-140 words, a vivid photographic description that merges points 1-11 in this order: subject, set, props, lighting, camera, palette, mood, composition, aspect ratio, ending with the avoid list written as "no ..." phrases>

VARIATIONS (one line each):
- Lifestyle: <same product in a lived-in scene>
- Minimal: <seamless studio version>
- Seasonal: <a seasonal or campaign twist>
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
