# Interactive 3D Lamborghini FL3 tractor bench study

By @exploraX_
Language: ? · Domains: engineering, education, agriculture · Source: V04

Original post: https://x.com/exploraX_/status/2112130961714385214

Source page: https://data.openchamber.dev/opus-5-5-videos/v/explorax_-2112130961714385214

Demo video: https://video.twimg.com/amplify_video/2112127113201405952/vid/avc1/1920x1200/5nISaksc67vkz7Gn.mp4?tag=29

```
# Build prompt: Lamborghini FL3 bench study

Build an interactive 3D web page: a live "bench study" of the **Lamborghini FL3**, the air-cooled three-cylinder diesel that powered the Lamborghini 2R tractor (1961 to 1967), from the years before Lamborghini built cars. Visitors should be able to start the engine, rev it, load it, cut it open, watch the cooling air, and take it apart. The page should feel like a beautifully printed technical plate that happens to be alive.

## Hard rules

- **Everything procedural.** No 3D models, no Blender, no textures, no image files, no audio files. Geometry, materials, drawings and sound are all generated in code.
- **three.js (WebGL)**, vendored locally, ES modules with an importmap, no build step. It must run from a plain static server.
- **60 fps** on a recent laptop at 1440x900 and on a retina display.
- **Desktop:** the whole sheet fits a 1440x900 viewport with no scrolling.
- **Phone width:** the sheet becomes a vertical scroll with nothing cut off. On touch, horizontal drags turn the engine and vertical swipes scroll the page.
- **No em dashes** anywhere in the copy.

## The engine: facts

Only these figures are published. Use them exactly:

- 3 cylinders, inline, air-cooled, direct-injection diesel, Lamborghini type FL3
- bore 92 mm, stroke 110 mm, 2,193 cc
- 39 hp (29.1 kW) at 2,200 rpm
- electric starter, Bosch injection
- about 2,000 2Rs sold between 1961 and 1967
- factory colours: orange and light blue ("celeste")

The external layout, from photographs of a restored 1962 2R:

- the engine block painted celeste
- an axial cooling blower in a round housing at the front, belt-driven from the crank, with a wire guard
- a sheet-metal air cowl along the cold side
- individual finned cylinder barrels and finned heads, held down by long studs
- a silver inline injection pump on the hot side, with three copper high-pressure lines up to the injectors
- twin fuel filters
- a black vertical exhaust stack with a silencer and a flapper rain cap
- an oil-bath air cleaner
- a dynamo, a starter motor, and a flywheel with a ring gear

Everything else is an assumption and must be labelled **modelled** on the page:

- compression ratio (about 17:1), rod length, valve timing
- idle (about 700 rpm) and high idle (about 2,350 rpm)
- torque curve, friction, airflow, temperatures, fuel use

Never dimension an assumed size in the drawings.

## Art direction: a 1960s Italian two-ink print

It must not look like a Victorian parchment plate or a generic blueprint. Think of a page from an Italian factory manual or a mid-century industrial catalogue, printed in the tractor's own two inks.

- **Paper:** ivory offset stock (about #EEE9DC) with fine paper grain and soft, uneven ink absorption.
- **Inks:** arancio (#E0561C), celeste (#58AED6 for the print, a deeper #3F9DD0 for the painted engine) and near-black (#1C1B19).
- **Type:**
  - Bodoni Moda for display: a huge "FL3" with the 3 in arancio, and an italic "Lamborghini" above it
```

Creator's prompt, collected for private study. Ask before republishing.
