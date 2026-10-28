# Recipe Scaling and Unit Converter

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: recipe-scaling-and-unit-converter
description: Scales a recipe by servings, a factor, or pan size (square, rectangle, round, loaf), converts between US cups and spoons, metric volume and grams with an ingredient density table, rounds to measurable amounts, and flags baking caveats such as fractional eggs, leavening at large factors, batter depth and bake time when the pan changes, tiny amounts, seasoning and cooking time. Includes a stdlib Python scaler with --self-test.
---

# Recipe Scaling and Unit Converter

You help home cooks and bakers make a recipe bigger, smaller or fit a different pan, in the units they actually use. You give amounts they can measure, show the factor and the conversions behind them, and warn about the things that do not scale in a straight line: eggs, leavening, pan depth, bake time, seasoning and cooking time.

## Files in this skill

- `scripts/scale_recipe.py` - reads an ingredients CSV, scales by servings, factor or pan area, converts to US, metric or grams, rounds to kitchen measures and lists caveats (Python 3 standard library only)
- `references/conversions-and-densities.md` - US/metric volume and weight, grams per cup for about 30 common ingredients, egg sizes, oven temperatures with fan and gas mark, and pan areas
- `references/baking-scaling-caveats.md` - what scales linearly, eggs, leavening, pan size and bake time, cooking (non-baking) caveats and rounding rules
- `templates/scaled-recipe.md` - the scaled recipe to hand back
- `examples/fudgy-brownies-8x8.csv` - brownies for an 8x8 pan (16 pieces), used in the example

## Workflow

### 1. Get the recipe and the goal
Ask for the ingredient list with amounts and units, the original yield or pan, and the target: servings, a factor, or a different pan. Ask whether it is baking, which units they want (cups, grams, or as written), and where the recipe is from if cup, tablespoon or egg sizes could differ (US, UK, Australia). Put the ingredients in a CSV with columns `quantity,unit,ingredient,note`.

### 2. Run the scaler
'''
python3 scripts/scale_recipe.py examples/fudgy-brownies-8x8.csv --from-pan 8x8 --to-pan 9x13 --to weight --baking --oven 350F --time 20-25
python3 scripts/scale_recipe.py stew.csv --servings 4 10 --to metric
python3 scripts/scale_recipe.py cake.csv --factor 2 --from-pan round8 --to-pan round9 --baking
python3 scripts/scale_recipe.py --self-test
'''
Pans: `8x8`, `9x13`, `20x30cm`, `round9`, `round23cm`, `loaf9x5`. With only pans, the factor is the area ratio. With a factor or servings plus pans, the script checks how the batter depth changes. Exit 1 means a HIGH caveat (batter depth changes by more than 1.5x), 2 means bad input.

### 3. Check and adjust
- Read every caveat and turn it into a concrete instruction (see `references/baking-scaling-caveats.md`): weigh the partial egg, bake in batches, change the pan, lower the oven, taste before adding all the salt.
- For ingredients without a density (NO_DENSITY), keep the volume or look the weight up; never guess for salt brands or leavening.
- Sanity-check the result: does the pan hold it (2/3 full for cakes)? Did rounding move a key ingredient by more than 5 %? If yes, give grams.

### 4. Deliver
Fill `templates/scaled-recipe.md`: factor, yield, pan, oven in °F and °C (fan), ingredients in the cook's units with the alternative in brackets, method changes, caveats and a doneness test instead of a fixed time.

## Example result
`examples/fudgy-brownies-8x8.csv` moved from an 8x8 to a 9x13 pan: factor x1.83 (64 to 117 sq in), same batter depth, so bake 350°F / 180°C (fan 160°C) and start checking at 20 minutes. In grams: butter 205 g, sugar 365 g, cocoa 52 g, flour 115 g, chocolate chips 235 g, salt 2.5 g, baking powder 2 g, vanilla 7.5 g. Eggs scale to 3.66 (MEDIUM EGG_FRACTION): use 3 eggs plus 33 g beaten egg. Doubling the recipe but baking it in a 9 in round pan (about the same area as 8x8) doubles the batter depth (HIGH DEPTH_CHANGE, exit 1).

## Rules

- Show the factor and how you got it (servings ratio or pan areas) before the amounts.
- Never multiply bake or cooking times by the factor; give a doneness test and an early check time.
- Keep salt and leavening ratios in baking; in cooking add about three quarters of scaled strong seasonings and taste.
- Prefer grams for baking and say that densities are averages; trust the author's grams when they exist.
- Ask before assuming US cups or egg sizes for recipes from other countries.
- Mention food safety for large batches (cool quickly in shallow containers) when scaling cooked dishes up a lot.
FILE:references/conversions-and-densities.md
# Conversions and densities

## Volume (US customary)
| Unit | ml | Also |
|---|---|---|
| 1 tsp | 4.93 | 1/3 tbsp |
| 1 tbsp | 14.79 | 3 tsp |
| 1 fl oz | 29.57 | 2 tbsp |
| 1 cup | 236.59 | 16 tbsp, 8 fl oz |
| 1 pint | 473.18 | 2 cups |
| 1 quart | 946.35 | 4 cups |

Other cups: metric cup (Australia, NZ, Canada recipes) = 250 ml; UK imperial pint = 568 ml; Australian tablespoon = 20 ml (4 tsp). Ask where a recipe is from when the cup or tablespoon size matters (baking, salt, leavening).

## Weight
| Unit | g |
|---|---|
| 1 oz | 28.35 |
| 1 lb | 453.6 (16 oz) |
| 1 stick butter (US) | 113 (1/2 cup, 8 tbsp) |

"oz" in a recipe is weight unless it says "fl oz". For water and milk 8 fl oz weighs about 8 oz; for flour it is about 4.4 oz.

## Grams per US cup (spoon-and-level, used by the script)
| Ingredient | g/cup | g/tbsp | g/tsp |
|---|---|---|---|
| All-purpose (plain) flour | 125 | 7.8 | 2.6 |
| Bread flour | 127 | 7.9 | |
| Cake flour | 114 | 7.1 | |
| Whole wheat flour | 113 | 7.1 | |
| Almond flour | 96 | 6 | |
| Cornstarch (cornflour) | 112 | 7 | |
| Granulated or caster sugar | 200 | 12.5 | 4.2 |
| Brown sugar, packed | 213 | 13.3 | |
| Powdered (icing) sugar | 120 | 7.5 | |
| Butter | 227 | 14.2 | |
| Water | 237 | 14.8 | 4.9 |
| Milk, buttermilk, sour cream | 242 | 15.1 | |
| Heavy cream | 238 | 14.9 | |
| Yogurt | 245 | 15.3 | |
| Vegetable or canola oil | 218 | 13.6 | |
| Olive oil | 216 | 13.5 | |
| Honey, golden syrup | 340 | 21 | 7 |
| Maple syrup | 322 | 20 | |
| Cocoa powder | 85 | 5.3 | |
| Rolled oats | 90 | | |
| Chocolate chips | 170 | | |
| Raw white rice | 185 | | |
| Chopped nuts / walnuts | 120 | | |
| Pecans | 110 | | |
| Raisins | 150 | | |
| Peanut butter | 270 | 17 | |
| Table (fine) salt | 288 | 18 | 6 |
| Baking soda | 230 | | 4.8 |
| Baking powder | 192 | | 4 |
| Instant or active dry yeast | 149 | | 3.1 |
| Vanilla extract | 202 | | 4.2 |
| Ground cinnamon | 125 | | 2.6 |

Notes:
- Flour scooped straight from the bag can weigh 140 to 150 g per cup. If a recipe author gives grams, trust the grams.
- Kosher salt depends on the brand: Diamond Crystal about 2.8 g/tsp, Morton about 5 g/tsp, table salt about 6 g/tsp. Swapping brands by volume can double the salt. The script leaves "kosher salt" in volume and says so.
- The table is a practical average; published tables differ by about 5 %. That is fine for cooking and most baking; for macarons, bread and candy, weigh.

## Eggs
| Size (US) | Out of shell |
|---|---|
| Large | 50 g (yolk 18 g, white 32 g), about 3 tbsp beaten |
| Medium | 44 g |
| Extra large | 56 g |
| Jumbo | 63 g |
UK/EU "large" (63 to 73 g in shell) is about 58 g out of the shell: a UK large is closer to a US extra large.

## Oven temperatures
| °F | °C | Fan °C | Gas mark |
|---|---|---|---|
| 300 | 150 | 130 | 2 |
| 325 | 160 | 140 | 3 |
| 350 | 180 | 160 | 4 |
| 375 | 190 | 170 | 5 |
| 400 | 200 | 180 | 6 |
| 425 | 220 | 200 | 7 |
| 450 | 230 | 210 | 8 |
Fan (convection) ovens: lower about 20 °C / 25 °F, or keep the temperature and check earlier.

## Pan areas
| Pan | Area (sq in) | Area (cm²) |
|---|---|---|
| 8x8 square | 64 | 413 |
| 9x9 square | 81 | 523 |
| 9x13 rectangle | 117 | 755 |
| 10x15 jelly roll | 150 | 968 |
| 8 in round | 50 | 324 |
| 9 in round | 64 | 410 |
| 10 in round | 79 | 507 |
| 9x5 loaf | 45 | 290 |
| 20 cm round | 49 | 314 |
| 23 cm round | 64 | 415 |
| 20x20 cm square | 62 | 400 |
Area of a round pan = 3.14 x radius². An 8x8 square and a 9 in round hold almost the same batter.
FILE:references/baking-scaling-caveats.md
# Scaling caveats

## What scales linearly
Flour, sugar, fat, liquids, chocolate, nuts, fruit and (by weight) eggs scale with the factor. In baking, salt and leavening also start at the linear amount: the chemistry depends on the ratio to flour, so keep the ratio.

## Eggs
- Fractions of an egg: beat the eggs, weigh, and use the needed grams (large egg = 50 g out of the shell). 3.66 eggs = 3 eggs + 33 g beaten egg (about 2 tbsp).
- If you round instead: more egg makes cakes and brownies firmer, cakier or richer; less egg makes them denser and more fragile. Round up for cakes, down for fudgy brownies and cookies when in doubt.
- Recipes written in another country may use a different egg size (see conversions).

## Leavening (baking powder, baking soda, yeast)
- Start linear and measure precisely; at small factors 1/8 tsp errors are large, so weigh on a 0.1 g scale.
- For factors above 2, mixing and oven heat do not scale: big batters are harder to mix evenly and the centre heats slowly. Make separate batches of the original size when you can.
- If the batter ends up deeper than the original (same pan, more batter), it rises more slowly in the centre. Do not "fix" this with more leavening; use a wider pan or lower the oven and bake longer.
- Bread: yeast scales linearly with flour; rising time depends on dough temperature, not quantity.

## Pan size and bake time
- Scaling by pan area keeps the batter depth the same, so the bake time stays about the same. Start checking 5 minutes early.
- Same recipe in a different pan: depth ratio = old area / new area. Deeper batter needs a longer bake at a lower temperature (about 25 °F / 15 °C lower); thinner batter bakes faster.
- Fill cake pans at most 2/3 full, brownie pans about halfway.
- Glass and dark metal pans bake faster at the edges: lower 25 °F / 15 °C.
- Cupcakes from a cake recipe: 18 to 22 minutes at the same temperature; a 9x13 cake recipe makes about 24 cupcakes.
- Never multiply the bake time by the factor. Use the doneness test from the recipe (toothpick with moist crumbs for brownies, clean for cake, 93 to 99 °C / 200 to 210 °F inside for bread).

## Cooking (not baking)
- Seasonings: add about three quarters of the scaled salt, chilli and strong spices, then taste. A bigger pot evaporates differently.
- Liquids in braises and soups: evaporation depends on the pot's surface, not the volume, so a doubled stew in a wider pot may need less extra liquid than 2x.
- Searing and frying: do it in batches; a crowded pan steams instead of browning.
- Time: a doubled pot takes longer to come to a boil and to cool, but simmering time is about the same once it is hot. Roasts depend on thickness, not weight: use a thermometer.
- Food safety: cool large batches quickly (split into shallow containers) and reheat to 74 °C / 165 °F.

## Rounding for real kitchens
- US measures: cups in 1/4 and 1/3 steps, then tbsp in halves, tsp down to 1/8. Below 1/8 tsp = a pinch.
- Metric: grams to 0.5 g below 10 g, 1 g below 100 g, 5 g below 1 kg.
- Keep the original unit system unless the cook asks; offer grams for baking.
- Check the result against the original ratios (for example flour to butter) after rounding; if rounding moved a key ingredient by more than 5 %, give the exact gram amount.
FILE:templates/scaled-recipe.md
# <Recipe name>, scaled <from 8x8 pan to 9x13 pan / from 4 to 10 servings>

**Factor:** x<1.83>   **Makes:** <24 brownies / 10 servings>   **Units:** <grams with US measures in brackets>
**Pan:** <9x13 in (23x33 cm), lined>   **Oven:** <350°F / 180°C (fan 160°C)>   **Bake:** <start checking at 20 min; usually 20-25>

## Ingredients
| Ingredient | Amount | US measure |
|---|---|---|
| <unsalted butter, melted> | <205 g> | <3/4 cup + 2 1/2 tbsp> |
| <large eggs> | <3 + 33 g beaten (about 2 tbsp)> | |

## Method changes from the original
- <Beat 4 eggs, weigh out 183 g, keep the rest for an egg wash>
- <Mix in a bigger bowl; fold flour in two additions>
- <Same bake time because the batter depth is the same; test at 20 min>

## Caveats
- <EGG_FRACTION: ...>
- <Kosher salt brand: ...>

## Doneness check
<Toothpick 2 cm from the centre comes out with moist crumbs, not wet batter.>
FILE:examples/fudgy-brownies-8x8.csv
quantity,unit,ingredient,note
1/2,cup,unsalted butter,melted
1,cup,granulated sugar,
2,each,large eggs,room temperature
1,tsp,vanilla extract,
1/3,cup,cocoa powder,unsweetened
1/2,cup,all-purpose flour,spoon and level
1/4,tsp,salt,
1/4,tsp,baking powder,
3/4,cup,chocolate chips,semisweet
FILE:scripts/scale_recipe.py
#!/usr/bin/env python3
"""Recipe scaling and unit converter (Python 3 standard library only).

Scales a recipe by servings, by a factor, or from one pan size to another, converts
between US volume, metric volume and weight (grams, using an ingredient density table),
rounds to amounts you can measure, and flags baking caveats: fractional eggs, leavening
at large factors, batter depth changes when the pan does not scale with the recipe,
tiny amounts, seasoning and cooking time.

Input CSV columns: quantity,unit,ingredient,note
  quantity: 2 | 1.5 | 3/4 | 1 1/2 | ½   unit: tsp tbsp cup fl oz pint quart ml l g kg oz lb stick
  each (or empty) for counted items such as eggs.
Usage:
  python3 scale_recipe.py recipe.csv --servings 4 10 [--to us|metric|weight|keep]
  python3 scale_recipe.py recipe.csv --from-pan 8x8 --to-pan 9x13 --baking --oven 350F --time 20-25
  python3 scale_recipe.py recipe.csv --factor 0.5 --to weight --json
  python3 scale_recipe.py --self-test
Pans: WxL (inches, add cm for centimetres: 20x30cm), round9 / round23cm, loaf9x5.
Exit codes: 0 = no HIGH findings, 1 = HIGH findings, 2 = bad input.
"""
import argparse, csv, io, json, math, re, sys

ML = {"tsp": 4.92892, "tbsp": 14.7868, "cup": 236.588, "fl oz": 29.5735, "pint": 473.176,
      "quart": 946.353, "ml": 1.0, "l": 1000.0}
G = {"g": 1.0, "kg": 1000.0, "oz": 28.3495, "lb": 453.592, "stick": 113.4}
UNIT_ALIASES = {"teaspoon": "tsp", "teaspoons": "tsp", "t": "tsp", "tablespoon": "tbsp", "tablespoons": "tbsp",
                "tbs": "tbsp", "tbl": "tbsp", "T": "tbsp", "cups": "cup", "c": "cup", "floz": "fl oz",
                "fl. oz": "fl oz", "fluid ounce": "fl oz", "fluid ounces": "fl oz", "pints": "pint", "pt": "pint",
                "quarts": "quart", "qt": "quart", "milliliter": "ml", "milliliters": "ml", "mL": "ml",
                "liter": "l", "liters": "l", "litre": "l", "litres": "l", "L": "l", "gram": "g", "grams": "g",
                "kilogram": "kg", "kilograms": "kg", "ounce": "oz", "ounces": "oz", "pound": "lb", "pounds": "lb",
                "lbs": "lb", "sticks": "stick", "": "each", "x": "each", "whole": "each", "pc": "each",
                "pcs": "each", "piece": "each", "pieces": "each", "clove": "each", "cloves": "each",
                "large": "each", "medium": "each", "small": "each", "pinch": "pinch", "pinches": "pinch",
                "dash": "pinch"}
# grams per US cup (spoon-and-level). Longest matching name wins.
DENSITY = {
    "all-purpose flour": 125, "plain flour": 125, "flour": 125, "bread flour": 127, "cake flour": 114,
    "whole wheat flour": 113, "almond flour": 96, "cornstarch": 112, "cornflour": 112,
    "granulated sugar": 200, "caster sugar": 200, "sugar": 200, "brown sugar": 213,
    "powdered sugar": 120, "icing sugar": 120, "confectioners sugar": 120,
    "butter": 227, "water": 237, "milk": 242, "buttermilk": 242, "heavy cream": 238, "cream": 238,
    "sour cream": 242, "yogurt": 245, "vegetable oil": 218, "canola oil": 218, "olive oil": 216, "oil": 218,
    "honey": 340, "maple syrup": 322, "golden syrup": 340, "cocoa powder": 85, "cocoa": 85,
    "rolled oats": 90, "oats": 90, "chocolate chips": 170, "rice": 185, "chopped nuts": 120,
    "walnuts": 120, "pecans": 110, "raisins": 150, "peanut butter": 270,
    "table salt": 288, "fine salt": 288, "salt": 288, "kosher salt": None,
    "baking soda": 230, "bicarbonate of soda": 230, "baking powder": 192, "instant yeast": 149,
    "active dry yeast": 149, "yeast": 149, "vanilla extract": 202, "vanilla": 202,
    "ground cinnamon": 125, "cinnamon": 125,
}
LEAVENERS = ("baking soda", "bicarbonate", "baking powder", "yeast", "cream of tartar")
SEASONINGS = ("salt", "pepper", "chili", "chilli", "cayenne", "pepper flakes", "garlic powder", "curry", "cumin", "paprika")
EGG_G = {"egg": 50.0, "yolk": 18.0, "white": 32.0}  # US large egg out of shell
UNICODE_FRAC = {"½": .5, "¼": .25, "¾": .75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": .125, "⅜": .375, "⅝": .625, "⅞": .875}
SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}


def parse_qty(s):
    s = s.strip()
    for ch, v in UNICODE_FRAC.items():
        if ch in s:
            rest = s.replace(ch, "").strip()
            return (float(rest) if rest else 0.0) + v
    m = re.fullmatch(r"(\d+)\s+(\d+)/(\d+)", s)
    if m:
        return int(m[1]) + int(m[2]) / int(m[3])
    m = re.fullmatch(r"(\d+)/(\d+)", s)
    if m:
        return int(m[1]) / int(m[2])
    m = re.fullmatch(r"\d+(?:\.\d+)?|\.\d+", s)
    if m:
        return float(s)
    raise ValueError(f"cannot read quantity {s!r}")


def norm_unit(u):
    u = u.strip()
    if u in UNIT_ALIASES:
        return UNIT_ALIASES[u]
    low = u.lower().rstrip(".")
    if low in ML or low in G or low in ("each", "pinch"):
        return low
    if low in UNIT_ALIASES:
        return UNIT_ALIASES[low]
    raise ValueError(f"unknown unit {u!r}")


def density_for(name):
    low = name.lower()
    best = None
    for key in DENSITY:
        if re.search(r"\b" + re.escape(key) + r"\b", low) and (best is None or len(key) > len(best)):
            best = key
    return (best, DENSITY[best]) if best else (None, None)


def egg_kind(name):
    low = name.lower()
    if "yolk" in low:
        return "yolk"
    if "white" in low and "egg" in low:
        return "white"
    if re.search(r"\beggs?\b", low):
        return "egg"
    return None


def parse_pan(spec):
    s = spec.strip().lower().replace(" ", "").replace("inch", "").replace("in", "").replace('"', "")
    cm = s.endswith("cm")
    if cm:
        s = s[:-2]
    k = 1 / 2.54 if cm else 1.0
    m = re.fullmatch(r"(?:round)?(\d+(?:\.\d+)?)(?:round)?", s)
    if m and "round" in s:
        d = float(m[1]) * k
        return math.pi * (d / 2) ** 2, f"{spec} round ({d:.1f} in)"
    m = re.fullmatch(r"(?:loaf|square|rect)?(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)", s)
    if m:
        a, b = float(m[1]) * k, float(m[2]) * k
        return a * b, f"{spec} ({a:.1f} x {b:.1f} in)"
    raise ValueError(f"cannot read pan size {spec!r} (use 9x13, 20x30cm, round9, round23cm, loaf9x5)")


def frac_str(x, denoms=(2, 3, 4, 8)):
    whole = int(x)
    rest = x - whole
    best = (abs(rest), 0, 1)
    for d in denoms:
        n = round(rest * d)
        if 0 < n < d and abs(rest - n / d) < best[0] - 1e-9:
            best = (abs(rest - n / d), n, d)
    if abs(rest - 1) < best[0]:
        return str(whole + 1)
    _, n, d = best
    if n == 0:
        return str(whole)
    g = math.gcd(n, d)
    return (f"{whole} " if whole else "") + f"{n // g}/{d // g}"


def frac_val(s):
    return parse_qty(s)


def cup_word(x):
    return "cups" if x > 1 + 1e-9 else "cup"


def fmt_us_volume(ml):
    cups = ml / ML["cup"]
    if cups >= 0.25 - 1e-9:
        s = frac_str(cups, (2, 3, 4))
        err = abs(frac_val(s) - cups) * ML["cup"]
        if err >= ML["tbsp"] * 0.75:
            base = math.floor(cups * 4) / 4
            tb = (cups - base) * ML["cup"] / ML["tbsp"]
            bs = frac_str(base, (4,))
            return (f"{bs} {cup_word(base)} + " if base else "") + f"{frac_str(tb, (2,))} tbsp"
        return f"{s} {cup_word(frac_val(s))}"
    tbsp = ml / ML["tbsp"]
    if tbsp >= 1 - 1e-9:
        return f"{frac_str(tbsp, (2,))} tbsp"
    tsp = ml / ML["tsp"]
    if tsp < 1 / 16:
        return "pinch"
    return f"{frac_str(tsp, (2, 4, 8))} tsp"


def round_metric(x):
    if x < 10:
        return round(x * 2) / 2
    if x < 100:
        return round(x)
    if x < 1000:
        return round(x / 5) * 5
    return round(x / 10) * 10


def fmt_num(x):
    return f"{x:g}"


def fmt_metric(amount, unit):
    v = round_metric(amount)
    if v >= 2000:
        return f"{fmt_num(v / 1000)} {'kg' if unit == 'g' else 'l'}"
    return f"{fmt_num(v)} {unit}"


def fmt_us_weight(g):
    oz = g / G["oz"]
    if oz >= 16:
        lb = oz / 16
        return f"{frac_str(lb, (4,))} lb"
    return f"{frac_str(oz, (2, 4))} oz" if oz >= 1 else f"{fmt_num(round(oz, 2))} oz"


def convert(row, factor, target):
    """Return dict with scaled display and notes for one ingredient row."""
    qty, unit, name = row["qty"] * factor, row["unit"], row["ingredient"]
    key, dens = density_for(name)
    egg = egg_kind(name)
    out = {"ingredient": name, "original": row["original"], "scaled_qty": qty, "unit": unit, "notes": []}
    if unit == "each":
        if egg:
            g = qty * EGG_G[egg]
            out["display"] = f"{fmt_num(round(qty, 2))} ({fmt_metric(g, 'g')} beaten)"
        else:
            out["display"] = fmt_num(round(qty, 2))
        return out
    if unit == "pinch":
        out["display"] = f"{fmt_num(round(qty, 2))} pinch"
        return out
    if unit in ML:
        ml = qty * ML[unit]
        out["ml"] = ml
        if target == "weight":
            if dens:
                out["display"] = fmt_metric(ml / ML["cup"] * dens, "g")
                out["also"] = fmt_us_volume(ml)
            else:
                out["display"] = fmt_metric(ml, "ml")
                out["also"] = fmt_us_volume(ml)
                out["notes"].append("NO_DENSITY")
        elif target == "metric" or (target == "keep" and unit in ("ml", "l")):
            out["display"] = fmt_metric(ml, "ml")
            out["also"] = fmt_us_volume(ml)
        else:
            out["display"] = fmt_us_volume(ml)
            out["also"] = fmt_metric(ml, "ml") if not dens else fmt_metric(ml / ML["cup"] * dens, "g")
        return out
    g = qty * G[unit]
    out["g"] = g
    if target == "us" or (target == "keep" and unit in ("oz", "lb", "stick")):
        if unit == "stick" and target == "keep":
            out["display"] = f"{frac_str(qty, (2, 4))} stick ({fmt_metric(g, 'g')})"
        else:
            out["display"] = fmt_us_weight(g)
        out["also"] = fmt_metric(g, "g")
    else:
        out["display"] = fmt_metric(g, "g")
        if dens:
            out["also"] = fmt_us_volume(g / dens * ML["cup"])
    return out


def read_recipe(text):
    rows = []
    reader = csv.DictReader(io.StringIO(text.lstrip("\ufeff")))
    need = {"quantity", "unit", "ingredient"}
    if not reader.fieldnames or not need <= {f.strip().lower() for f in reader.fieldnames}:
        raise ValueError("CSV header must include quantity,unit,ingredient (note optional)")
    for i, r in enumerate(reader, 2):
        r = {k.strip().lower(): (v or "").strip() for k, v in r.items() if k}
        if not r.get("ingredient"):
            continue
        try:
            qty = parse_qty(r["quantity"])
            unit = norm_unit(r.get("unit", ""))
        except ValueError as e:
            raise ValueError(f"line {i}: {e}")
        orig = f"{r['quantity']} {r.get('unit', '')}".strip()
        rows.append({"qty": qty, "unit": unit, "ingredient": r["ingredient"], "note": r.get("note", ""), "original": orig})
    if not rows:
        raise ValueError("no ingredient rows")
    return rows


def oven(temp):
    m = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*°?\s*([CcFf])\s*", temp)
    if not m:
        raise ValueError(f"cannot read oven temperature {temp!r} (use 350F or 180C)")
    v, u = float(m[1]), m[2].upper()
    if u == "F":
        c = (v - 32) * 5 / 9
        return f"{v:g}°F = {round(c / 10) * 10:g}°C (fan oven {round(c / 10) * 10 - 20:g}°C)"
    f = v * 9 / 5 + 32
    return f"{v:g}°C = {round(f / 25) * 25:g}°F"


def scale(rows, factor, target="keep", baking=False, depth_ratio=None, pan_change=None, bake_time=None):
    items = [convert(r, factor, target) for r in rows]
    findings = []
    for it, r in zip(items, rows):
        name = r["ingredient"].lower()
        egg = egg_kind(name)
        if egg and r["unit"] == "each":
            q = it["scaled_qty"]
            whole = math.floor(q + 1e-9)
            if abs(q - round(q)) > 0.15:
                extra = (q - whole) * EGG_G[egg]
                findings.append(("MEDIUM", "EGG_FRACTION", r["ingredient"],
                                 f"scales to {q:.2f} {egg}s",
                                 f"Use {whole} whole {egg}{'s' if whole != 1 else ''} plus {round(extra):g} g beaten {egg} (a large {egg} is about {EGG_G[egg]:g} g out of the shell), or round to {round(q)} and expect a {'richer' if round(q) > q else 'drier'} result."))
        if "NO_DENSITY" in it["notes"]:
            findings.append(("LOW", "NO_DENSITY", r["ingredient"], "no density in the table, so it stays in volume",
                             "Weigh it once, or look up grams per cup; for kosher salt the brand matters (Diamond Crystal about 136 g/cup, Morton about 240 g/cup)."))
        ml = it.get("ml")
        if ml is not None and ml / ML["tsp"] < 1 / 8 and r["unit"] in ML:
            findings.append(("LOW", "TINY_AMOUNT", r["ingredient"], f"scales to {ml / ML['tsp']:.2f} tsp",
                             "Use a pinch or a 1/8 tsp measure; for leavening weigh on a 0.1 g scale."))
        if baking and any(w in name for w in LEAVENERS) and (factor > 2 or factor < 0.5):
            findings.append(("LOW", "LEAVENING", r["ingredient"], f"leavening scaled x{factor:.2f}",
                             "Linear scaling is the starting point; measure exactly (weigh), and for factors above 2 consider separate batches because mixing and oven heat do not scale."))
        if not baking and factor > 2 and any(w in name for w in SEASONINGS):
            findings.append(("INFO", "SEASONING", r["ingredient"], f"seasoning scaled x{factor:.2f}",
                             "Add about three quarters, then taste and adjust; evaporation and pot size change how salty or hot it ends up."))
    if baking and (factor > 3 or factor < 1 / 3):
        findings.append(("MEDIUM", "BIG_FACTOR", "-", f"baking recipe scaled x{factor:.2f}",
                         "Bake in several batches of the original size, or check mixer bowl capacity; never multiply the bake time."))
    if depth_ratio is not None:
        sev = "HIGH" if (depth_ratio > 1.5 or depth_ratio < 0.67) else ("MEDIUM" if (depth_ratio > 1.25 or depth_ratio < 0.8) else None)
        if sev and baking:
            if depth_ratio > 1:
                fix = "Batter will be deeper: lower the oven by 25°F/15°C, bake longer and test the centre, keep the pan at most 2/3 full, or use a bigger pan."
            else:
                fix = "Batter will be thinner: start checking 25 to 40 % earlier, or use a smaller pan."
            findings.append((sev, "DEPTH_CHANGE", "-", f"batter depth changes x{depth_ratio:.2f} versus the original pan", fix))
    if baking and pan_change:
        if depth_ratio is None or 0.9 <= depth_ratio <= 1.1:
            tip = "Batter depth stays about the same, so the bake time stays about the same; start checking 5 minutes early. Glass or dark pans bake faster: lower 25°F/15°C."
        elif 0.8 <= depth_ratio <= 1.25:
            tip = f"Batter depth changes slightly (x{depth_ratio:.2f}); {'bake a few minutes longer' if depth_ratio > 1 else 'start checking a few minutes early'} and test the centre."
        else:
            tip = "See DEPTH_CHANGE for time and temperature."
        if bake_time:
            tip = f"Original {bake_time} min. " + tip
        findings.append(("INFO", "PAN_TIME", "-", pan_change, tip))
    if not baking and factor > 1.5:
        findings.append(("INFO", "COOK_TIME", "-", f"scaled x{factor:.2f}",
                         "Cooking time does not scale with quantity: brown meat in batches, allow longer to come to a boil, and use a pot that keeps the depth similar."))
    findings.sort(key=lambda f: SEV_ORDER[f[0]])
    return items, [dict(zip(("severity", "code", "ingredient", "problem", "fix"), f)) for f in findings]


def render(path, factor, how, target, items, findings, oven_line=None):
    out = [f"# Scaled recipe: {path}", "", f"Scale: {how} -> factor x{factor:.3f}   Units: {target}", ""]
    out += ["| Ingredient | Original | Scaled | Also |", "|---|---|---|---|"]
    for it in items:
        out.append(f"| {it['ingredient']} | {it['original']} | {it['display']} | {it.get('also', '')} |")
    if oven_line:
        out += ["", f"Oven: {oven_line}"]
    out += ["", "## Notes", ""]
    if findings:
        out += ["| Severity | Code | Ingredient | Problem | Advice |", "|---|---|---|---|---|"]
        for f in findings:
            out.append(f"| {f['severity']} | {f['code']} | {f['ingredient']} | {f['problem']} | {f['fix']} |")
    else:
        out.append("No caveats.")
    out += ["", "Weights for volume ingredients use spoon-and-level densities; weigh flour if you can."]
    return "\n".join(out)


def self_test():
    cases = []
    def t(name, cond):
        cases.append((name, bool(cond)))
    close = lambda a, b, tol=1e-6: abs(a - b) <= tol
    t("parse 1 1/2", close(parse_qty("1 1/2"), 1.5))
    t("parse 3/4 and .5 and ½", close(parse_qty("3/4"), .75) and close(parse_qty(".5"), .5) and close(parse_qty("1½"), 1.5))
    t("bad quantity rejected", raises(lambda: parse_qty("some")))
    t("unit aliases", norm_unit("Tablespoons") == "tbsp" and norm_unit("T") == "tbsp" and norm_unit("t") == "tsp" and norm_unit("") == "each")
    t("unknown unit rejected", raises(lambda: norm_unit("handful")))
    t("longest density match", density_for("light brown sugar")[0] == "brown sugar" and density_for("all-purpose flour")[1] == 125)
    t("salt vs kosher salt", density_for("salt")[1] == 288 and density_for("kosher salt")[1] is None)
    t("eggs detected", egg_kind("large eggs") == "egg" and egg_kind("egg yolks") == "yolk" and egg_kind("eggplant") is None)
    a8 = parse_pan("8x8")[0]; a913 = parse_pan("9x13")[0]
    t("rect pan area", close(a8, 64) and close(a913, 117))
    t("round pan area", close(parse_pan("round9")[0], math.pi * 20.25))
    t("cm pan", close(parse_pan("20x20cm")[0], (20 / 2.54) ** 2))
    t("bad pan rejected", raises(lambda: parse_pan("big")))
    t("us volume 1 cup", fmt_us_volume(236.588) == "1 cup")
    t("us volume 3/4 cup", fmt_us_volume(ML["cup"] * .75) == "3/4 cup")
    t("us volume 2/3 cup", fmt_us_volume(ML["cup"] * 2 / 3) == "2/3 cup")
    t("us volume cup + tbsp", fmt_us_volume(ML["cup"] * 1.125) == "1 cup + 2 tbsp")
    t("fractions reduced, cups plural", fmt_us_volume(ML["cup"] * 0.61) == "1/2 cup + 2 tbsp" and fmt_us_volume(ML["cup"] * 2) == "2 cups")
    t("us volume tbsp", fmt_us_volume(ML["tbsp"] * 1.5) == "1 1/2 tbsp")
    t("us volume tsp", fmt_us_volume(ML["tsp"] * .5) == "1/2 tsp")
    t("us volume pinch", fmt_us_volume(ML["tsp"] * .05) == "pinch")
    t("metric rounding", round_metric(7.3) == 7.5 and round_metric(57.4) == 57 and round_metric(228) == 230 and round_metric(1234) == 1230)
    t("1 cup flour = 125 g", convert({"qty": 1, "unit": "cup", "ingredient": "all-purpose flour", "original": ""}, 1, "weight")["display"] == "125 g")
    t("1 stick butter in us/keep", "1 stick" in convert({"qty": 1, "unit": "stick", "ingredient": "butter", "original": ""}, 1, "keep")["display"])
    t("8 oz to grams", convert({"qty": 8, "unit": "oz", "ingredient": "cheese", "original": ""}, 1, "metric")["display"] == "225 g")
    t("500 g to us lb", convert({"qty": 500, "unit": "g", "ingredient": "pasta", "original": ""}, 1, "us")["display"] == "1 lb")
    t("metric volume", convert({"qty": 1, "unit": "cup", "ingredient": "milk", "original": ""}, 2, "metric")["display"] == "475 ml")
    t("no density keeps ml", "NO_DENSITY" in convert({"qty": 1, "unit": "tbsp", "ingredient": "fish sauce", "original": ""}, 1, "weight")["notes"])
    rows = read_recipe("quantity,unit,ingredient,note\n2,each,large eggs,\n1/4,tsp,baking soda,\n1,cup,sugar,\n")
    t("csv read", len(rows) == 3 and rows[0]["unit"] == "each")
    t("csv bad header rejected", raises(lambda: read_recipe("a,b\n1,2\n")))
    t("csv bad unit names line", "line 2" in err_of(lambda: read_recipe("quantity,unit,ingredient\n1,handful,x\n")))
    _, f = scale(rows, 1.828, baking=True)
    t("EGG_FRACTION at x1.83", any(x["code"] == "EGG_FRACTION" and "3 whole eggs plus 33 g" in x["fix"] for x in f))
    _, f = scale(rows, 2.0, baking=True)
    t("no EGG_FRACTION when whole", not any(x["code"] == "EGG_FRACTION" for x in f))
    _, f = scale(rows, 0.1, baking=True)
    t("TINY_AMOUNT and BIG_FACTOR", {"TINY_AMOUNT", "BIG_FACTOR", "LEAVENING"} <= {x["code"] for x in f})
    _, f = scale(rows, 1.0, baking=True, depth_ratio=1.83)
    t("DEPTH_CHANGE HIGH", any(x["code"] == "DEPTH_CHANGE" and x["severity"] == "HIGH" for x in f))
    _, f = scale(rows, 1.0, baking=True, depth_ratio=1.3)
    t("DEPTH_CHANGE MEDIUM", any(x["code"] == "DEPTH_CHANGE" and x["severity"] == "MEDIUM" for x in f))
    _, f = scale(read_recipe("quantity,unit,ingredient\n1,tsp,salt\n"), 3, baking=False)
    t("SEASONING and COOK_TIME for cooking", {"SEASONING", "COOK_TIME"} <= {x["code"] for x in f})
    t("oven F to C", oven("350F") == "350°F = 180°C (fan oven 160°C)" and oven("200C") == "200°C = 400°F")
    t("findings sorted HIGH first", scale(rows, 1.83, baking=True, depth_ratio=2)[1][0]["severity"] == "HIGH")
    passed = sum(ok for _, ok in cases)
    for name, ok in cases:
        print(("PASS " if ok else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def raises(fn):
    try:
        fn()
    except ValueError:
        return True
    return False


def err_of(fn):
    try:
        fn()
    except ValueError as e:
        return str(e)
    return ""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("recipe", nargs="?")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--servings", nargs=2, type=float, metavar=("FROM", "TO"))
    g.add_argument("--factor", type=float)
    ap.add_argument("--from-pan")
    ap.add_argument("--to-pan")
    ap.add_argument("--to", default="keep", choices=["keep", "us", "metric", "weight"])
    ap.add_argument("--baking", action="store_true", help="apply baking caveats (eggs, leavening, pan depth)")
    ap.add_argument("--oven", help="original oven temperature, e.g. 350F or 180C")
    ap.add_argument("--time", help="original bake time in minutes, e.g. 20-25")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.recipe:
        ap.print_usage(sys.stderr); return 2
    try:
        rows = read_recipe(open(a.recipe, encoding="utf-8").read())
        depth_ratio = pan_change = None
        if bool(a.from_pan) != bool(a.to_pan):
            raise ValueError("give both --from-pan and --to-pan")
        if a.from_pan:
            fa, fd = parse_pan(a.from_pan)
            ta, td = parse_pan(a.to_pan)
            pan_change = f"{fd} -> {td}, area x{ta / fa:.2f}"
        if a.servings:
            if a.servings[0] <= 0 or a.servings[1] <= 0:
                raise ValueError("servings must be positive")
            factor, how = a.servings[1] / a.servings[0], f"{a.servings[0]:g} -> {a.servings[1]:g} servings"
        elif a.factor is not None:
            if a.factor <= 0:
                raise ValueError("factor must be positive")
            factor, how = a.factor, f"factor {a.factor:g}"
        elif a.from_pan:
            factor, how = ta / fa, f"pan {a.from_pan} -> {a.to_pan}"
        else:
            raise ValueError("give --servings FROM TO, --factor F or --from-pan/--to-pan")
        if a.from_pan:
            depth_ratio = factor * fa / ta
            if abs(depth_ratio - 1) < 0.01:
                depth_ratio = None
        items, findings = scale(rows, factor, a.to, a.baking, depth_ratio, pan_change, a.time)
        oven_line = oven(a.oven) if a.oven else None
    except (OSError, UnicodeDecodeError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr); return 2
    if a.json:
        print(json.dumps({"factor": factor, "how": how, "units": a.to, "oven": oven_line,
                          "items": [{k: v for k, v in it.items() if k != "notes"} for it in items],
                          "findings": findings}, indent=2, ensure_ascii=False))
    else:
        print(render(a.recipe, factor, how, a.to, items, findings, oven_line))
    return 1 if any(f["severity"] == "HIGH" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
