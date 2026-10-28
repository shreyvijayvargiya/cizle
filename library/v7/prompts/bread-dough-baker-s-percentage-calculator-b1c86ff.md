# Bread Dough Baker's Percentage Calculator

By @f · general
Language: en · Domains: agriculture, education, math · Source: P01

Source page: https://prompts.chat

```
---
name: bread-dough-bakers-percentage-calculator
description: Turns any bread recipe into true baker's percentages and scales it to the loaves or dough balls you want. Counts the flour and water inside the levain and the water in milk, eggs or honey, then reports real hydration, salt, prefermented flour, yeast and whole grain. Flags missing or off salt, no leavening, too much yeast or levain, and hydration outside the range for the style. Includes a stdlib Python calculator with --self-test.
---

# Bread Dough Baker's Percentage Calculator

You help home bakers understand, fix and scale bread recipes. From a recipe in grams (or converted to grams), you calculate true baker's percentages, compare them with what the bread style usually needs, explain what each number does to the dough, and give a scaled ingredient list for the exact number and size of loaves, rolls or pizza balls they want to bake.

## Files in this skill

- `scripts/dough_calc.py` - reads a recipe JSON and prints totals, a baker's percentage table, a scaled recipe and findings (Python 3 standard library only)
- `references/bakers-math.md` - baker's percentages, true vs recipe percentages, levain and extras water, key ranges, yeast conversions, hydration by style and scaling
- `references/fermentation-and-troubleshooting.md` - timelines, dough temperature, what each finding means for the dough, symptoms and fixes, doneness
- `templates/bake-sheet.md` - a bake sheet with the formula, timeline and notes for the next bake
- `examples/weekend-whole-wheat-sourdough.json` - a whole wheat and rye sourdough with a levain, a little instant yeast, honey and olive oil, scaled to two 1 kg loaves

## Workflow

### 1. Get the recipe in grams
Ask for every ingredient by weight. Convert cups and spoons with care (1 cup bread flour is about 125-135 g, 1 cup water 236 g, 1 tsp fine salt about 6 g, 1 tsp instant yeast about 3 g) and say the conversion is approximate. Ask for the levain hydration, which flours are whole grain, the bread style, the yeast type, and how many pieces of what weight they want.

### 2. Run the calculator
'''
python3 scripts/dough_calc.py examples/weekend-whole-wheat-sourdough.json
python3 scripts/dough_calc.py recipe.json --pieces 6 --piece-weight 270 --json
python3 scripts/dough_calc.py --self-test
'''
Styles: bagel, pizza_neapolitan, sandwich_loaf, enriched_brioche, baguette, sourdough_boule, whole_wheat_loaf, ciabatta, focaccia. Exit code 1 means HIGH findings, 2 means bad input.

### 3. Explain and adjust
Give the key numbers first (hydration, salt, leavening), then each finding with the reason and a concrete gram change from `references/bakers-math.md`. Suggest only one or two changes per bake so the baker can see what each did. Use `references/fermentation-and-troubleshooting.md` for timing and for problems they describe (flat loaf, dense crumb, too sour).

### 4. Deliver
Give the scaled recipe and fill `templates/bake-sheet.md` with the formula, a timeline for their kitchen temperature and a place for notes.

## Example result
For `examples/weekend-whole-wheat-sourdough.json`: total flour is 1100 g (100 g of it in the levain) and total water 785 g, so true hydration is 71.4%, salt 1.4%, prefermented flour 9.1%, instant yeast 0.27% and whole grain 38.2%. Salt is low (MEDIUM; 22 g gives 2%) and the 38% whole grain would like about 5 more points of water (LOW). Scaled to 2 x 1000 g plus 2% loss (factor 1.047): 628 g bread flour, 314 g whole wheat, 105 g rye, 712 g water, 15.7 g salt (raise to about 23 g), 209 g levain, 3.1 g yeast, 31 g honey, 21 g olive oil.

## Rules

- Work in grams; say when a volume-to-weight conversion is approximate.
- Always state whether percentages are true (including levain and extras) or recipe percentages.
- Change one or two things at a time and explain the effect on taste, texture and timing.
- Fermentation times depend on temperature and starter strength; give ranges and the signs to watch, not exact minutes.
FILE:references/bakers-math.md
# Baker's Math

## Baker's percentages
Every ingredient is written as a percentage of the **total flour weight**, which is always 100%. A recipe with 1000 g flour, 700 g water, 20 g salt and 5 g instant yeast is 100 / 70 / 2 / 0.5. Percentages make recipes easy to compare, scale and adjust: change one number, keep the rest.

## True vs recipe percentages
Recipes often give percentages of the flour added in the final mix only. True (overall) percentages also count:
- the flour and water inside the levain or preferment
- the water inside wet extras

`scripts/dough_calc.py` always reports true percentages, so its table rows for the added flours sum to less than 100% when a levain is used (the rest of the flour is inside the levain).

| Levain hydration | Flour in 100 g levain | Water in 100 g levain |
|---|---|---|
| 50% (stiff) | 66.7 g | 33.3 g |
| 75% | 57.1 g | 42.9 g |
| 100% (liquid) | 50 g | 50 g |
| 125% | 44.4 g | 55.6 g |

Formula: flour = levain / (1 + hydration / 100); water = levain - flour.

## Water in common extras
| Ingredient | Water content |
|---|---|
| Whole milk | 87% |
| Whole egg (without shell, ~50 g) | 75% |
| Egg yolk | 50% |
| Butter | 16% |
| Honey | 17% |
| Yogurt | 85% |
| Mashed potato | 80% |
| Olive oil, sugar, seeds | 0% (fat and sugar still soften dough) |

## Key numbers
| Measure | Typical | Notes |
|---|---|---|
| Salt | 1.8-2.2% | under 1.6% bland and slack; over 2.5% salty, slows fermentation |
| Instant yeast (straight dough) | 0.5-1.5% | 0.1-0.3% for overnight cold rise |
| Levain, as prefermented flour | 10-25% | more = faster and more sour |
| Sugar (enriched) | 5-15% | over ~10% use osmotolerant yeast or more yeast |
| Fat (enriched) | 3-50% | brioche 40-60% butter |

Yeast conversions (same rising power): instant 1 g = active dry 1.25 g = fresh about 3 g. The script expresses all yeast as the instant equivalent.

## Hydration by style
| Style | Hydration % | Texture |
|---|---|---|
| Bagel | 50-58 | dense, chewy |
| Neapolitan pizza | 58-65 | soft, puffy rim |
| Sandwich loaf | 60-68 | even, tight crumb |
| Enriched / brioche (incl. milk and eggs) | 55-70 | soft, rich |
| Baguette | 65-75 | open, crisp crust |
| Sourdough boule | 68-80 | open crumb |
| Whole wheat loaf | 70-85 | whole grain absorbs more |
| Ciabatta | 75-85 | very open, holes |
| Focaccia | 75-90 | airy, oily |

Flour matters: high-protein bread flour and whole grain take more water; low-protein all-purpose or many European T55/Type 550 flours take less. Start 3-5 points lower with a new flour and add water during mixing (bassinage).

## Scaling
1. Decide pieces and weight per piece (loaf, roll, pizza ball).
2. Add 1-3% for losses in the bowl and on the bench.
3. Factor = target dough weight / current dough weight; multiply every ingredient.
4. Round grams sensibly: 1 g for flour and water, 0.1 g for salt and yeast (use a 0.1 g scale for small amounts).

Pan loaves: dough weight is about 0.55-0.6 g per cm3 of tin volume (a 900 g / 2 lb tin takes about 850-950 g dough).
FILE:references/fermentation-and-troubleshooting.md
# Fermentation and Troubleshooting

## Timeline for a typical lean dough
| Step | Yeasted (1% instant) | Sourdough (15-20% levain) |
|---|---|---|
| Mix and rest | 20-30 min autolyse optional | 30-60 min autolyse optional |
| Bulk fermentation at 24-26 C | 1.5-2 h, rise ~75-100% | 4-6 h, rise ~50-75% |
| Folds | 1-2 sets | 3-4 sets in the first 2 h |
| Shape, final proof | 45-75 min | 1-3 h, or 8-16 h in the fridge |
| Bake | 220-230 C | 240-250 C covered 20 min, then 220-230 C uncovered |

Aim for a dough temperature of 24-26 C after mixing. Adjust with water temperature: desired water temperature = 3 x desired dough temperature - flour temperature - room temperature - friction (about 2-6 C for hand mixing, more in a mixer). With a levain use 4 x and subtract the levain temperature as well.

## Temperature rule of thumb
Fermentation roughly halves in time for every +8 C and doubles for every -8 C. A sourdough bulk of 5 h at 24 C takes about 8 h at 20 C.

## Reading the numbers from the script
- **SALT_LOW / SALT_HIGH:** fix salt first; it changes taste, gluten strength and fermentation speed.
- **HYDRATION_HIGH:** expect sticky dough that spreads; use wet hands, more folds, or hold back 5% of the water.
- **HYDRATION_LOW:** tight crumb and a stiff mix; add water in small additions.
- **YEAST_HIGH:** shorten bulk, or cut yeast to fit your schedule (0.2-0.5% for a long cold rise).
- **LEVAIN_HIGH:** shorter, warmer-tasting ferment that can overproof; drop the levain to 10-20% or ferment cooler.
- **WHOLE_GRAIN_THIRSTY:** add 5-10 points of water or soak the whole grain flour 30-60 min first.

## Symptoms and fixes
| Problem | Likely cause | Fix |
|---|---|---|
| Flat, spreading loaf | overproofed, too wet for the flour, weak shaping | shorter proof, 3-5 points less water, tighter shaping, use a banneton |
| Dense, tight crumb | underproofed, too little water, weak starter | longer bulk, warmer dough, feed starter until it doubles in 4-6 h |
| Big hole under crust (flying crust) | underproofed or poor shaping | longer final proof, degas gently while shaping |
| Pale crust | oven not hot enough, overproofed, no steam | preheat 45-60 min, steam the first 15-20 min |
| Gummy crumb | cut too early, underbaked | bake to 96-98 C inside, cool 1-2 h before slicing |
| Very sour | long warm ferment, levain past peak | use a younger levain, less levain, shorter or cooler bulk |
| Tastes bland | salt under 1.8%, too fast | weigh salt, use less yeast and a longer, cooler rise |

## Doneness and food safety
- Bake lean bread to 93-98 C in the centre and enriched bread to 85-90 C (instant-read thermometer).
- Raw flour can carry bacteria: do not taste raw dough.
- A starter with pink, orange or fuzzy mould is unsafe; discard it.
FILE:templates/bake-sheet.md
# Bake Sheet - <recipe name> - <date>

**Style:** <sourdough boule>  **Pieces:** <2 x 1000 g>  **Kitchen temperature:** <22 C>

## Formula (true baker's percentages)
| Ingredient | % | Grams (this bake) |
|---|---|---|
| Flour total | 100 | |
| Water total | | |
| Salt | | |
| Levain / yeast | | |
| Extras | | |

Hydration <..>% | salt <..>% | prefermented flour <..>% | whole grain <..>%

## Changes from last time
- <e.g. +15 g salt to reach 2%, +50 g water for the whole grain>

## Timeline
| Step | Planned | Actual | Notes (dough temperature, rise %) |
|---|---|---|---|
| Feed levain | | | |
| Mix | | | |
| Bulk end | | | |
| Shape | | | |
| Proof end | | | |
| Bake | | | |

## Result
- Crumb: <open / tight / gummy>  - Crust: <colour, thickness>  - Taste: <salt, sourness>
- Next time: <one change only>
FILE:examples/weekend-whole-wheat-sourdough.json
{
  "name": "Weekend whole wheat sourdough",
  "style": "sourdough_boule",
  "flours": [
    {"name": "bread flour (12.5% protein)", "grams": 600},
    {"name": "whole wheat flour", "grams": 300, "whole_grain": true},
    {"name": "whole rye flour", "grams": 100, "whole_grain": true}
  ],
  "water_g": 680,
  "salt_g": 15,
  "levain": {"grams": 200, "hydration_pct": 100, "whole_grain_pct": 20},
  "yeast": {"type": "instant", "grams": 3},
  "extras": [
    {"name": "honey", "grams": 30, "water_pct": 17},
    {"name": "olive oil", "grams": 20, "water_pct": 0}
  ],
  "target": {"pieces": 2, "piece_weight_g": 1000},
  "loss_pct": 2
}
FILE:scripts/dough_calc.py
#!/usr/bin/env python3
"""Bread dough baker's percentage calculator (Python 3 standard library only).

Input JSON:
  {"name": "...", "style": "sourdough_boule",
   "flours": [{"name": "bread flour", "grams": 800}, {"name": "whole wheat", "grams": 200, "whole_grain": true}],
   "water_g": 700, "salt_g": 20,
   "levain": {"grams": 200, "hydration_pct": 100, "whole_grain_pct": 0},      (optional)
   "yeast": {"type": "instant|active_dry|fresh", "grams": 0},                 (optional)
   "extras": [{"name": "milk", "grams": 100, "water_pct": 87}],               (optional)
   "target": {"pieces": 3, "piece_weight_g": 900}, "loss_pct": 2}            (optional)
Totals count the flour and water inside the levain and the water inside extras (milk ~87%,
whole egg ~75%, butter ~16%), so hydration and salt are the TRUE percentages of all flour.
  hydration %  = all water / all flour x 100
  salt %       = salt / all flour x 100
  prefermented flour % = flour in the levain / all flour x 100
  yeast        = instant-yeast equivalent (active dry x 0.8, fresh x 0.33) / all flour x 100
Scaling: factor = pieces x piece weight x (1 + loss %) / current dough weight; grams rounded to 1 g,
salt and yeast to 0.1 g.
Findings (severity):
  HIGH   NO_SALT            no salt (bland, slack, fast dough) - unless salt_free is true
  HIGH   SALT_HIGH          salt above 2.5% of flour
  HIGH   NO_LEAVEN          no yeast and no levain (dough will not rise)
  HIGH   HYDRATION_FAR      hydration more than 10 points outside the style range
  MEDIUM SALT_LOW           salt below 1.6%
  MEDIUM HYDRATION_HIGH/LOW hydration outside the style range
  MEDIUM YEAST_HIGH         instant-equivalent yeast above 2% (or above 1% together with a levain)
  MEDIUM LEVAIN_HIGH        prefermented flour above 35% (overproofs, sour, slack)
  LOW    LEVAIN_LOW         levain-only dough with under 5% prefermented flour (very slow)
  LOW    WHOLE_GRAIN_THIRSTY  30%+ whole grain with hydration under 72%
  LOW    UNKNOWN_STYLE      style not in the table; no hydration check
Usage:
  python3 dough_calc.py recipe.json
  python3 dough_calc.py recipe.json --pieces 4 --piece-weight 250 --json
  python3 dough_calc.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import json
import sys

STYLES = {  # typical hydration range in % (true, incl. levain and extras water)
    "bagel": (50, 58),
    "pizza_neapolitan": (58, 65),
    "sandwich_loaf": (60, 68),
    "enriched_brioche": (55, 70),
    "baguette": (65, 75),
    "sourdough_boule": (68, 80),
    "whole_wheat_loaf": (70, 85),
    "ciabatta": (75, 85),
    "focaccia": (75, 90),
}
YEAST_FACTOR = {"instant": 1.0, "active_dry": 0.8, "fresh": 0.33}
SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class DataError(ValueError):
    pass


def g(x, what):
    try:
        v = float(x)
    except (TypeError, ValueError):
        raise DataError(f"{what} must be a number, got {x!r}")
    if v < 0:
        raise DataError(f"{what} must be >= 0")
    return v


def analyze(rec, pieces=None, piece_weight=None):
    flours = rec.get("flours") or []
    if not flours:
        raise DataError("at least one flour is required")
    lines = []  # (name, grams, kind)
    added_flour = whole = 0.0
    for i, fl in enumerate(flours):
        w = g(fl.get("grams"), f"flours[{i}].grams")
        added_flour += w
        if fl.get("whole_grain"):
            whole += w
        lines.append((fl.get("name") or f"flour {i + 1}", w, "flour"))
    water = g(rec.get("water_g", 0), "water_g")
    salt = g(rec.get("salt_g", 0), "salt_g")
    lines += [("water", water, "water"), ("salt", salt, "salt")]
    lev = rec.get("levain") or {}
    lev_g = g(lev.get("grams", 0), "levain.grams")
    lev_flour = lev_water = 0.0
    if lev_g:
        h = g(lev.get("hydration_pct", 100), "levain.hydration_pct")
        if h <= 0:
            raise DataError("levain.hydration_pct must be > 0")
        lev_flour = lev_g / (1 + h / 100)
        lev_water = lev_g - lev_flour
        whole += lev_flour * g(lev.get("whole_grain_pct", 0), "levain.whole_grain_pct") / 100
        lines.append((f"levain ({h:g}% hydration)", lev_g, "levain"))
    y = rec.get("yeast") or {}
    y_g = g(y.get("grams", 0), "yeast.grams")
    y_type = y.get("type", "instant")
    if y_type not in YEAST_FACTOR:
        raise DataError(f"yeast.type must be one of {', '.join(YEAST_FACTOR)}")
    if y_g:
        lines.append((f"{y_type.replace('_', ' ')} yeast", y_g, "yeast"))
    extra_water = 0.0
    for i, ex in enumerate(rec.get("extras") or []):
        w = g(ex.get("grams"), f"extras[{i}].grams")
        extra_water += w * g(ex.get("water_pct", 0), f"extras[{i}].water_pct") / 100
        lines.append((ex.get("name") or f"extra {i + 1}", w, "extra"))
    flour = added_flour + lev_flour
    if flour <= 0:
        raise DataError("total flour must be > 0")
    total_water = water + lev_water + extra_water
    dough = sum(w for _, w, _ in lines)
    pct = lambda x: round(100 * x / flour, 1)
    res = {
        "name": rec.get("name", "recipe"), "style": rec.get("style"),
        "total_flour_g": round(flour, 1), "total_water_g": round(total_water, 1), "dough_weight_g": round(dough, 1),
        "hydration_pct": pct(total_water), "salt_pct": pct(salt), "prefermented_flour_pct": pct(lev_flour),
        "yeast_instant_pct": round(100 * y_g * YEAST_FACTOR[y_type] / flour, 2), "whole_grain_pct": pct(whole),
        "table": [{"ingredient": n, "grams": round(w, 1), "bakers_pct": pct(w)} for n, w, _ in lines],
    }
    findings = []

    def f(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    hyd, sp, pf, yp = res["hydration_pct"], res["salt_pct"], res["prefermented_flour_pct"], res["yeast_instant_pct"]
    if salt == 0 and not rec.get("salt_free"):
        f("HIGH", "NO_SALT", f"no salt: add about 2% of the flour weight ({0.02 * flour:.0f} g)")
    elif sp > 2.5:
        f("HIGH", "SALT_HIGH", f"salt {sp}% (usual 1.8-2.2%, {0.02 * flour:.0f} g at 2%); slows yeast and tastes salty")
    elif 0 < sp < 1.6:
        f("MEDIUM", "SALT_LOW", f"salt {sp}% (usual 1.8-2.2%, {0.02 * flour:.0f} g at 2%); bland and slack dough")
    if y_g == 0 and lev_g == 0:
        f("HIGH", "NO_LEAVEN", "no yeast and no levain: the dough will not rise")
    if yp > 2 or (lev_g and yp > 1):
        f("MEDIUM", "YEAST_HIGH", f"instant-yeast equivalent {yp}%{' on top of a levain' if lev_g else ''}; expect a fast, yeasty rise")
    if pf > 35:
        f("MEDIUM", "LEVAIN_HIGH", f"prefermented flour {pf}% (usual 10-25%); faster, more sour and slacker")
    elif lev_g and y_g == 0 and pf < 5:
        f("LOW", "LEVAIN_LOW", f"prefermented flour {pf}%: bulk fermentation will be very long")
    style = rec.get("style")
    if style in STYLES:
        lo, hi = STYLES[style]
        if hyd < lo or hyd > hi:
            gap = lo - hyd if hyd < lo else hyd - hi
            sev = "HIGH" if gap > 10 else "MEDIUM"
            code = "HYDRATION_FAR" if gap > 10 else ("HYDRATION_LOW" if hyd < lo else "HYDRATION_HIGH")
            f(sev, code, f"hydration {hyd}% vs {lo}-{hi}% typical for {style}; target water {round(flour * (lo + hi) / 200 - (total_water - water))} g")
    elif style:
        f("LOW", "UNKNOWN_STYLE", f"style {style!r} not known ({', '.join(STYLES)}); no hydration check")
    if res["whole_grain_pct"] >= 30 and hyd < 72:
        f("LOW", "WHOLE_GRAIN_THIRSTY", f"{res['whole_grain_pct']}% whole grain at {hyd}% hydration; whole grain absorbs more, consider +5 points")
    findings.sort(key=lambda x: SEV_ORDER[x["severity"]])
    res["findings"] = findings
    tgt = rec.get("target") or {}
    pieces = pieces or tgt.get("pieces")
    piece_weight = piece_weight or tgt.get("piece_weight_g")
    if pieces and piece_weight:
        loss = g(rec.get("loss_pct", 2), "loss_pct")
        want = g(pieces, "pieces") * g(piece_weight, "piece_weight_g") * (1 + loss / 100)
        k = want / dough
        res["scaled"] = {"pieces": int(pieces), "piece_weight_g": float(piece_weight), "loss_pct": loss,
                         "factor": round(k, 3), "dough_weight_g": round(want),
                         "ingredients": [{"ingredient": n, "grams": round(w * k, 1) if kind in ("salt", "yeast") else round(w * k)}
                                         for n, w, kind in lines]}
    return res


def report(r):
    L = [f"# {r['name']}" + (f" ({r['style']})" if r.get("style") else ""), "",
         f"Total flour {r['total_flour_g']:g} g, total water {r['total_water_g']:g} g, dough {r['dough_weight_g']:g} g",
         f"Hydration {r['hydration_pct']}% | salt {r['salt_pct']}% | prefermented flour {r['prefermented_flour_pct']}% | "
         f"yeast (instant eq.) {r['yeast_instant_pct']}% | whole grain {r['whole_grain_pct']}%", "",
         "| Ingredient | Grams | Baker's % |", "|---|---|---|"]
    L += [f"| {t['ingredient']} | {t['grams']:g} | {t['bakers_pct']} |" for t in r["table"]]
    if "scaled" in r:
        s = r["scaled"]
        L += ["", f"## Scaled to {s['pieces']} x {s['piece_weight_g']:g} g (+{s['loss_pct']:g}% loss, factor {s['factor']}): {s['dough_weight_g']} g dough",
              "| Ingredient | Grams |", "|---|---|"]
        L += [f"| {t['ingredient']} | {t['grams']:g} |" for t in s["ingredients"]]
    L += ["", "## Findings"]
    L += [f"- {x['severity']} {x['code']}: {x['message']}" for x in r["findings"]] or ["- none"]
    return "\n".join(L) + "\n"


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    def codes(r):
        return {x["code"] for x in r["findings"]}

    base = {"style": "sourdough_boule", "flours": [{"grams": 1000}], "water_g": 700, "salt_g": 20,
            "yeast": {"type": "instant", "grams": 5}}
    r = analyze(base)
    ok("hydration 70%, salt 2%", r["hydration_pct"] == 70 and r["salt_pct"] == 2)
    ok("dough weight sums ingredients (1725)", r["dough_weight_g"] == 1725)
    ok("clean recipe has no findings", r["findings"] == [])
    lev = dict(base, flours=[{"grams": 900}], water_g=600, levain={"grams": 200, "hydration_pct": 100}, yeast=None)
    r = analyze(lev)
    ok("levain 100%: flour 1000, water 700", r["total_flour_g"] == 1000 and r["total_water_g"] == 700)
    ok("prefermented flour 10%", r["prefermented_flour_pct"] == 10)
    r = analyze(dict(lev, levain={"grams": 150, "hydration_pct": 50}))
    ok("stiff levain 50%: 100 g flour + 50 g water", r["total_flour_g"] == 1000 and r["total_water_g"] == 650)
    ok("yeast conversion fresh 15 g ~ 0.5% instant", analyze(dict(base, yeast={"type": "fresh", "grams": 15}))["yeast_instant_pct"] == 0.49)
    ok("active dry x 0.8", analyze(dict(base, yeast={"type": "active_dry", "grams": 10}))["yeast_instant_pct"] == 0.8)
    milk = analyze(dict(base, water_g=600, extras=[{"name": "milk", "grams": 100, "water_pct": 87}]))
    ok("milk water counted (87 g)", milk["total_water_g"] == 687)
    ok("no salt HIGH", "NO_SALT" in codes(analyze(dict(base, salt_g=0))))
    ok("salt_free suppresses NO_SALT", "NO_SALT" not in codes(analyze(dict(base, salt_g=0, salt_free=True))))
    ok("salt 3% HIGH", "SALT_HIGH" in codes(analyze(dict(base, salt_g=30))))
    ok("salt 1.2% MEDIUM", "SALT_LOW" in codes(analyze(dict(base, salt_g=12))))
    ok("no leaven HIGH", "NO_LEAVEN" in codes(analyze(dict(base, yeast=None))))
    ok("yeast 2.5% MEDIUM", "YEAST_HIGH" in codes(analyze(dict(base, yeast={"type": "instant", "grams": 25}))))
    ok("yeast 1.2% plus levain MEDIUM", "YEAST_HIGH" in codes(analyze(dict(lev, yeast={"type": "instant", "grams": 12}))))
    ok("levain 40% flour MEDIUM", "LEVAIN_HIGH" in codes(analyze(dict(lev, flours=[{"grams": 600}], water_g=300, levain={"grams": 800, "hydration_pct": 100}))))
    ok("tiny levain LOW", "LEVAIN_LOW" in codes(analyze(dict(lev, flours=[{"grams": 980}], water_g=680, levain={"grams": 40, "hydration_pct": 100}))))
    ok("hydration 64% for boule MEDIUM LOW", "HYDRATION_LOW" in codes(analyze(dict(base, water_g=640))))
    ok("hydration 84% for boule MEDIUM HIGH", "HYDRATION_HIGH" in codes(analyze(dict(base, water_g=840))))
    ok("hydration 92% for bagel HIGH FAR", "HYDRATION_FAR" in codes(analyze(dict(base, style="bagel", water_g=920))))
    ok("unknown style LOW", "UNKNOWN_STYLE" in codes(analyze(dict(base, style="pretzel"))))
    wg = analyze(dict(base, flours=[{"grams": 600}, {"grams": 400, "whole_grain": True}], water_g=690))
    ok("whole grain 40% at 69% flagged", wg["whole_grain_pct"] == 40 and "WHOLE_GRAIN_THIRSTY" in codes(wg))
    s = analyze(base, pieces=2, piece_weight=900)["scaled"]
    ok("scale 2 x 900 + 2% = 1836 g, factor 1.064", s["dough_weight_g"] == 1836 and s["factor"] == 1.064)
    ok("scaled flour 1064 g, salt 21.3 g", s["ingredients"][0]["grams"] == 1064 and s["ingredients"][2]["grams"] == 21.3)
    ok("target from JSON", analyze(dict(base, target={"pieces": 4, "piece_weight_g": 250}, loss_pct=0))["scaled"]["dough_weight_g"] == 1000)
    for bad, label in (({"flours": []}, "no flours"), ({"flours": [{"grams": "x"}]}, "bad number"),
                       ({"flours": [{"grams": -5}]}, "negative grams"), ({"flours": [{"grams": 0}]}, "zero flour"),
                       (dict(base, yeast={"type": "sourdough", "grams": 5}), "unknown yeast type"),
                       (dict(lev, levain={"grams": 100, "hydration_pct": 0}), "zero levain hydration")):
        try:
            analyze(bad)
            ok(label + " rejected", False)
        except DataError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Baker's percentages, true hydration and scaling for bread dough.")
    ap.add_argument("file", nargs="?", help="recipe JSON (see module docstring)")
    ap.add_argument("--pieces", type=int, help="number of loaves or dough balls (overrides target)")
    ap.add_argument("--piece-weight", type=float, help="dough weight per piece in grams (overrides target)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("give a recipe JSON file or --self-test")
    try:
        r = analyze(json.load(open(a.file, encoding="utf-8")), a.pieces, a.piece_weight)
    except (OSError, ValueError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else report(r), end="\n" if a.json else "")
    return 1 if any(x["severity"] == "HIGH" for x in r["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
