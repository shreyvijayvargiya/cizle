# 12-style animated short about a robot trapped in an AI-generated world

By @pradeepXkapoor
Language: ? · Domains: scifi, entertainment, education · Source: V04

Original post: https://x.com/pradeepXkapoor/status/2103099194693271874

Source page: https://data.openchamber.dev/opus-5-5-videos/v/pradeepxkapoor-2103099194693271874

Demo video: https://video.twimg.com/amplify_video/2103099085012209664/vid/avc1/3840x2160/UqNwOhVudU_cN-bp.mp4?tag=29

```
ou are the director, animator, rigger, compositor, sound designer and render engineer for a 45–50 second animated short made entirely in code. The bar is "this looks like a real studio short and goes viral on X." Treat this as a multi-session production. Do not rush to a final render. Work in milestones, render stills constantly, look at them, criticize them honestly, and fix them.

0. The film in one line

Pip, a tiny, curious scrap-built robot, is happily rolling through his world when it starts regenerating around him. He slowly realizes someone is prompting his reality. The prompts get more absurd, he finally climbs onto the floating prompt box and types "let me out", and the camera pulls back to reveal his whole universe is a video playing on a phone propped up on a cluttered workbench, being watched by another Pip, who is about to get prompted too. Perfect loop.

The joke must land with zero dialogue. Pip communicates only through his eyes, antenna, body language and little robot chirps. Every 3–5 seconds there must be a new visual payoff.

1. The character (non-negotiable)

Study ./reference/pip_sheet.png carefully before writing any code. Open it, describe it back to yourself in detail, and write your findings into docs/character_bible.md:

Size: about 28 cm tall. He is small. The whole film should feel his scale.
Head: a wide, rounded-rectangle helmet in cream with a soft-yellow rim band framing a black glossy visor screen. His eyes live on that screen: two large glowing warm-cream eyes with dark pupils and a bright highlight. Small graphite ear-caps on each side. Wear, scratches and dusty-brown dirt around the edges.
Antenna: a thin graphite stalk on the top-right of the head with a small muted-orange signal flag. It is his "tail": it perks, droops, wiggles and vibrates with emotion.
Body: a boxy cream torso with yellow trim, warning-triangle decals, rivets and grime. A small chest compartment with a hatch that opens to show a tiny green sprout glowing softly. Back: panels, a vent grille, an orange panel, a small leaf decal.
Side decal: "PIP" lettering with orange diagonal stripes.
Arms: thin segmented graphite arms with yellow joint sleeves and three-finger claw grips. Very expressive.
Wheels: four chunky rubber wheels with yellow hubs and independent suspension, rugged and compact.
Personality: curious, kind, scrappy, expressive, always exploring. "Small bot, big feelings." He is never mean, even when furious; his anger is cute and determined.
Extract the exact palette from the sheet's swatches (sample the image with Python/PIL) into src/theme/palette.ts: Cream (body), Soft Yellow (primary), Muted Orange (accents), Graphite (metal/tech), Dusty Brown (wear & dirt), Mint Blue (lights/UI).

Identity lock rule: in every world, his helmet-and-visor silhouette, antenna flag, yellow trim, claw arms and four wheels must stay instantly recognizable. Worlds change his rendering style, never his design. The only intentional de
```

Creator's prompt, collected for private study. Ask before republishing.
