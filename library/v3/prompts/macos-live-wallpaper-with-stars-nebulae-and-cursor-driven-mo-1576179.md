# MacOS live wallpaper with stars, nebulae, and cursor-driven motion

By @lukasersil
Language: ? · Domains: agriculture, gaming · Source: V04

Original post: https://x.com/lukasersil/status/2104124994741576179

Source page: https://data.openchamber.dev/opus-5-5-videos/v/lukasersil-2104124994741576179

Demo video: https://video.twimg.com/amplify_video/2104124332704210944/vid/avc1/2214x1440/clxqJ9Z4MBUYzwd4.mp4?tag=29

```
Podívej se na https://t.co/i8Q59bnXq1. Je to živá tapeta pro macOS: Swift agent položí na každý monitor okno s WKWebView pod ikony plochy a posílá do stránky polohu kurzoru. Naklonuj si ho do dočasné složky a prostuduj, hlavně `wallpaper/Wallpaper.swift` a instalační skripty.

Pak mi v aktuální prázdné složce postav vlastní tapetu „Moje tapeta“ se scénou „Vesmír“: noční obloha s Mléčnou dráhou, mlhovinou, hvězdami, kometami a padajícími hvězdami. Hvězdy i mlhovina před kurzorem uhýbají jako před antigravitačním polem a po jeho odjezdu se pružně vrátí na svá místa. Komety naopak kurzor přitahuje. Nativní část, `serve.mjs` a `scenes/shared/frame-loop.js` převezmi z repozitáře. Je pod licencí MIT, takže zachovej copyright a v LICENSE uveď, odkud kód je. Akvária ani Three.js nepotřebuju. Texty v aplikaci, komentáře v nastavení a README piš česky.

## Úpravy nativní části
- Scény hledej automaticky: každá podsložka `scenes/` s `index.html` a volitelným `scene.json` (`title`, `background`, `actions: [{id, title}]`). Akce se objeví v menu baru. Každý monitor dostane v adrese `?screen=N`, ať má jinou oblohu.
- Rozhraní pro stránku zobecni na `window.wallpaperHost.on('rate' | 'power' | 'action', handler)`. Hodnoty rate a power poslané dřív, než se scéna přihlásí, podrž a doruč. Kurzor dál chodí jako `pointermove` a `pointerleave`.
- Menu bar česky, s ikonou SF Symbol „sparkles“: stav, výběr scény, akce scény, Pozastavit/Pokračovat, Znovu načíst scénu, Ukončit.
- `kill -USR1` uloží snímek první obrazovky do /tmp/moje-tapeta.png, `kill -USR2` znovu načte scénu.
- Skripty v `host/`:
  - `https://t.co/gHG6shDVdx`: sestaví bundle.
  - `https://t.co/ty5WmX34LD`: dočasné spuštění přímo ze složky projektu, úpravy se projeví po „Znovu načíst“.
  - `https://t.co/lli0s4C224`: instalace do ~/Applications se spouštěním po přihlášení.
  - `https://t.co/SpaqH8sm6u`.
- Obrázek plochy neměň.
- Šetření energií (zakrytí okny, baterka, spánek obrazovky, úsporný režim, Omezení pohybu) nech, jak ho má originál.

## Scéna: čisté WebGL2, bez knihoven
- Nastavení je v `scenes/vesmir/src/config.js` s českými komentáři: seed, strop 30 fps, kontrast, hustota hvězd, antigravitace, gravitace komet, jak často létají komety a meteory, paralaxa.
- Obloha se namaluje jednou do float textury (R11F_G11F_B10F) v rozlišení obrazovky a každý snímek se jen vykreslí s ditheringem proti pruhování. Obsahuje:
  - Mléčnou dráhu šikmo zleva zdola doprava nahoru. Nejjasnější je vlevo od středu, protože vpravo nahoře jsou ikony a tam má zůstat tma. Má hvězdná mračna, tmavé prachové pruhy, teplé jádro a chladné okraje.
  - Emisní mlhovinu: fbm s dvojitým domain warpingem, ale mírným, žádné zakroucené „nudle“. Jemná světlá vlákna (ridged noise podél proudění), tmavé prachové globule, červenorůžová H-alfa a modrozelené kyslíkové jádro.
  - Modrou reflexní mlhovinu vlevo nahoře.
  - Tónovou křivku pro kontrast s hlubokou černou.
- Hvězdy jsou tisíce bodů. Jejich hustota sleduje Mléčnou dráhu (mapu přečti z
```

Creator's prompt, collected for private study. Ask before republishing.
