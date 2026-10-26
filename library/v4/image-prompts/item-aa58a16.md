# 霓虹女性

Community prompt · 9宫格
Language: en · Domains: science, entertainment, nature · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/twitter/55584_out.png

```
4:5 poster:
photoreal city street, strong one-point or deep alley perspective, natural light and grit;
ONE giant flat illustration creature dominating the frame (bold ink lines, paper grain, slightly collage-cut edges);
ONE small stylized human figure for scale, mid-task;
accent colors locked to blue + red + yellow only on the illustration layer;
a few sparse geometric symbols floating in the sky;
creature must feel printed ON the photo, not 3D-rendered into the scene.
No extra monsters. No heavy text titles.

Variables:
CITY STREET | GIANT CREATURE | SMALL HUMAN + TASK | ACCENT PROP | SKY MARKS

1) Lisbon tram street, blue azulejo tiles | huge black cat, blue face patch, red paws, yellow tail ribbon | three tiny brass band players on the cat's back | yellow bow | winged crescent symbol
2) wet traditional Japanese alley | giant geometric heron/crane, black-white-blue, red beak tip | dancer with yellow umbrella, blue top | yellow umbrella | black circle with blue/pink shards
3) Mediterranean hillside street to harbor | giant black octopus, blue eyelids, white suckers | laundry person on rooftop with basket | long yellow cloth tentacle-ribbon | target/orbit doodles
4) dense Middle-Eastern market, stone minaret | giant crocodile, blue face plates, red eye mark | vendor on bicycle holding fruit bowl | yellow parasol | red bullseye sun icon

{
"style_name": "Street Myth Collage",
"style_slug": "street-myth-collage",
"style_version": "1.0.0",
"style_summary": "Documentary photoreal street plates with one oversized flat print-illustration creature and one tiny human-scale figure, limited blue/red/yellow accents, sparse geometric sky marks, collage-on-photo feel.",
"canvas": {
"aspect_ratio": "4:5",
"finish": "editorial poster, photo base + 2D print layer"
},
"fixed_structure": {
"photo_layer": "real street, architecture, perspective, weather, grit",
"myth_layer": "one giant flat illustrated creature, ink/paper texture, collage edges",
"scale_layer": "one small human figure mid-task",
"palette_accents": "blue, red, yellow only on illustration accents",
"marks": "few sparse geometric symbols in sky/negative space",
"avoid": ["full 3D creature integration", "multiple giant beasts", "neon cyber city", "title typography covering the animal", "cute sticker pack clutter"]
},
"runs": [
{
"CITY": "Lisbon cobbled street with tram rails and azulejos",
"CREATURE": "monumental black cat, blue facial mask, red paws, yellow tail ribbon",
"HUMAN": "three tiny suited band musicians riding the tail/back",
"MARK": "winged staff/crescent icon"
},
{
"CITY": "narrow wet wooden Japanese street",
"CREATURE": "giant geometric heron, black white blue red beak",
"HUMAN": "stylized dancer with yellow umbrella",
"MARK": "circular abstract sky emblem"
},
{
"CITY": "Mediterranean alley opening to marina",
"CREATURE": "giant octopus head and tentacles, blue eyes, white suckers",
"HUMAN": "rooftop laundry figure with basket",
"MARK": "orbit/target doodles, yellow cloth swirl"
},
{
"CITY": "historic stone bazaar with minaret",
"CREATURE": "giant crocodile, blue facial plates, red-rimmed eye",
"HUMAN": "cyclist vendor with fruit bowl and yellow parasol",
"MARK": "radiating eye-sun icon"
}
]
}
```

Creator's prompt, collected for private study. Ask before republishing.
