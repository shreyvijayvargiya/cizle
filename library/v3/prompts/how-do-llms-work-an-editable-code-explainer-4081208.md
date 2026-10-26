# How do LLMs work: an editable code explainer

By @ItsDarcy_AI · Opus 5.5 · 知识讲解
Language: ? · Domains: education, edtech, gaming · Source: V01

Original post: https://x.com/ItsDarcy_AI/status/2106208810604081208

```
GPT-6 Astra made this entire video end to end in 24 minutes.

The topic? How LLMs work.

I gave it a reference video, the topic, and a preference for English narration. It handled the script, illustrations, animation, voiceover integration, captions, music, and final export.

The stack: Codex + Hyperframes, with ElevenLabs for narration.

The wildest part is that Astra didn't generate raw video pixels. It wrote the HTML, SVG, and JavaScript that draw and animate every scene.

The entire video is editable code:
↳ Change the explanation
↳ Adjust the timing
↳ Swap the colors
↳ Render again

Here are the actual production numbers:
↳ 1280 × 720 at 30 fps
↳ 7 illustrated scenes and 16 caption segments
↳ About 24 minutes from request to delivery, including checks and revisions
↳ 2 minutes, 4 seconds for the final HD render

The token receipt:
↳ 8.24 million tokens processed across the workflow
↳ 8.02 million cached input tokens
↳ Roughly 26,000 output tokens
↳ Estimated model-token cost at standard API rates: $11.30

A coding agent building an animated explanation of how language models work feels appropriately recursive.

Imagine turning your technical documentation, onboarding guides, or complex product features into explainers like this.

♻️ Repost this to share the breakdown with your network!
```

Creator's prompt, collected for private study. Ask before republishing.
