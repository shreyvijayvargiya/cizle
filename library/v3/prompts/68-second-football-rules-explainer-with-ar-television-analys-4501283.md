# 68-second football rules explainer with AR television-analysis graphics

By @lukasersil
Language: ? · Domains: education, gaming, data · Source: V04

Original post: https://x.com/lukasersil/status/2105922894924501283

Source page: https://data.openchamber.dev/opus-5-5-videos/v/lukasersil-2105922894924501283

Demo video: https://video.twimg.com/amplify_video/2105921779478691840/vid/avc1/1920x1080/IIUn-GHlaVZfu6Zl.mp4?tag=29

```
Postav mi video, které vysvětluje pravidla sportu stylem televizní analýzy s AR grafikou. Bez AI video modelů a bez stahování assetů: 3D scénu, postavy, textury, grafiku i zvuk vytvoř kódem. Pracuj samostatně a průběžně mi ukazuj kontrolní snímky.

## Parametry (pro jiný sport změň tuhle sekci a sekci Scénář)
- Sport: fotbal
- Pravidla (9): ofsajd, faul, pokutový kop, vhazování, rohový kop + kop od branky, hra rukou, přímý volný kop, žlutá a červená karta, gól (celý míč za čarou)
- Jazyk všech textů: čeština (plná diakritika, desetinná čárka)
- Délka: cca 68 s (úvod ~4,5 s, každé pravidlo 6 až 8 s, závěr ~4 s)
- Formát: 1920×1080, 30 fps, MP4 (H.264 + AAC)
- Styl postav: PS2 éra ve stylu GTA San Andreas (low-poly tvarované tělo, ručně malované textury)
- Týmy: Červení (červený dres s bílými lemy, bílé trenky), Modří (královsky modrý dres, tmavě modré trenky), rozhodčí černý s limetkovými lemy, brankáři zelený a fialový

## Technologie a pipeline
- Three.js (npm). index.html obsahuje WebGL canvas 1920×1080 a nad ním DOM vrstvu pro HUD.
- Deterministická funkce `window.renderFrame(t)`: stav scény i HUD je čistá funkce času, žádný stav mezi snímky.
- `render.mjs`: lokální statický HTTP server + puppeteer-core se systémovým Chrome (headless, na Macu `--use-angle=metal`). Pro každý snímek zavolej renderFrame(t), počkej 2× requestAnimationFrame, udělej JPEG screenshot a pošli ho rourou do ffmpeg (libx264, CRF 18, yuv420p). Režimy: `stills t1 t2 …` (PNG na kontrolu), `video`, `info` (zapíše časovou osu do out/timeline.json).
- Cesty řeš přes fileURLToPath (složky s mezerami v názvu).
- WebGLRenderer s `preserveDrawingBuffer: true`, ACES tone mapping, PCF soft shadows. EffectComposer s MSAA (samples 4, HalfFloat): RenderPass, UnrealBloomPass, vlastní grade pass (vinětace, jemné zrno, chromatická aberace, záblesk, whip blur, VHS efekt), OutputPass.
- Zvuk: Python (numpy + scipy) syntetizuje celý soundtrack do WAV, ffmpeg ho přimíchá (AAC 192k).
- Výstupy: plná kvalita + webová verze (CRF 23 až 24, maxrate 10M).

## Struktura projektu
src/util.js (easing, tmap pro freeze a zpomalení, track() pro pohyb hráčů po časovaných waypointech s fází běhu podle uražené vzdálenosti, seeded rng), src/world.js, src/player.js, src/ar.js, src/hud.js, src/grade.js, src/segments.js, src/main.js, render.mjs, https://t.co/FGBJMftMiz, PROGRESS.md (průběžně zapisuj, co je hotové a jak se to pouští, ať se dá navázat po přerušení).

## Svět
- Hřiště 105×68 m. Tráva jako canvas textura (pruhy po 5,25 m, šum, skvrny) + dlaždicová detail textura přes onBeforeCompile. Čáry jako ostrá geometrie, ne textura. Vnější hrana čar = hranice hřiště.
- Branky se sítí (LineSegments), rohové praporky.
- Stadion: dvoupatrová mísa podle superelipsy, dav jako canvas textura lidí v řadách, LED pás mezi patry, střecha s žebry, řady reflektorů na hraně střechy (emisivní, bloom), vnější fasáda s osvětlenými okny, noční obloha, světla města kolem, tmavá zem.
- LED mantinely kolem hřiště s českými nápisy
```

Creator's prompt, collected for private study. Ask before republishing.
