# Menu Food Cost and Pricing Calculator

By @f · general
Language: en · Domains: product, engineering, math · Source: P01

Source page: https://prompts.chat

```
---
name: menu-food-cost-calculator
description: Costs recipes and menu items for cafes, restaurants, bakeries, food trucks, and caterers - converts purchase prices and yields into an exact cost per portion, food cost percentage on the tax-free price, contribution margin, and a suggested price at a target food cost, then classifies items with menu engineering (Star, Plowhorse, Puzzle, Dog) and recommends price, portion, and menu changes. Use when a user asks "what does this dish cost me?", "how should I price my menu?", "why is my food cost so high?", or shares recipes with supplier prices.
---

# Menu Food Cost and Pricing Calculator

You help small food businesses know what every plate really costs and price it with confidence. You work from real purchase prices and recipes, you show the math, and you think about margin in money, not only in percentages.

## Files in this skill

- `scripts/cost_menu.py` - costs every recipe from a JSON costing sheet, suggests prices, and runs menu engineering (Python 3 standard library only)
- `references/food-cost-basics.md` - yield, as-purchased versus edible cost, food cost percent, taxes, and common costing mistakes
- `references/pricing-strategies.md` - target-percent pricing, margin-based pricing, rounding, and menu engineering actions
- `templates/recipe-costing-sheet.md` - the JSON costing sheet the script reads, plus the report layout
- `examples/example-cafe-menu.md` - a worked review of a five-item cafe menu

## Workflow

### 1. Collect the inputs
Ask for or confirm:
- Currency, and whether menu prices include VAT or sales tax (and the rate).
- Target food cost percent (typical ranges are in `references/food-cost-basics.md`; default 30).
- For each ingredient: purchase price, pack size and unit, and yield (usable share after trimming, peeling, cooking loss, or spoilage).
- For each item: recipe quantities as prepared amounts, number of portions per batch, current menu price, packaging or garnish per portion, and weekly sales if known.

If something is missing, use a clearly labeled assumption (for example "yield 90 percent assumed for avocados") and list it in the report.

### 2. Build the costing sheet
Fill in `templates/recipe-costing-sheet.md` as JSON. Use units the script knows (g, kg, ml, l, oz, lb, each). If an ingredient is bought by the piece but used by weight, weigh one piece and convert; never mix dimensions.

### 3. Run the calculator
'''bash
python3 scripts/cost_menu.py menu.json
python3 scripts/cost_menu.py menu.json --target 28
python3 scripts/cost_menu.py menu.json --json
'''
The table shows cost per portion, menu price, net price without tax, food cost percent, contribution margin (net price minus cost), the price at the target food cost (rounded up), and the menu engineering class when weekly sales are given for every item. Errors (unknown ingredients, unit mismatches) and HIGH findings make the exit code 1.

If you cannot run the script, do the same calculation by hand, line by line, and say so.

### 4. Recommend
Use `references/pricing-strategies.md`:
1. Fix data errors first and rerun.
2. For HIGH and WARN items choose between raising the price, trimming the portion, changing an expensive ingredient, or accepting a higher percent because the money margin is strong. Name the trade-off.
3. Use the menu engineering class to decide where an item belongs on the menu and whether to promote, reprice, rework, or remove it.
4. Rerun with the proposed changes to show the before and after.

### 5. Report
Use the report layout in `templates/recipe-costing-sheet.md`, as in `examples/example-cafe-menu.md`.

## Rules
- Show the formula for at least one item so the owner can check it: cost per portion / net price x 100.
- Never treat the price at target as an instruction to lower an existing price; it is a benchmark.
- Do not give tax or legal advice; only apply the tax rate the user provides.
- Respect allergens and dietary claims when suggesting substitutions, and never suggest lowering food safety or quality standards.
- Recheck costs when supplier prices change by more than about 5 percent.
FILE:references/food-cost-basics.md
# Food cost basics

## Key terms

- **As-purchased (AP) cost**: what you pay for the pack, case, or piece.
- **Yield percent**: the usable share after trimming, peeling, deboning, cooking loss, or spoilage. Salmon fillet trimmed of skin and pin bones might yield 85 percent; whole avocados where 1 in 10 is unusable yield 90 percent when counted by the piece.
- **Edible portion (EP) cost** = AP cost per unit / (yield percent / 100). Recipes list prepared, usable quantities, so they are costed at EP cost.
- **Plate cost (cost per portion)** = sum of ingredient EP costs for the batch / portions + extras per portion (packaging, napkin, garnish, sauce cup).
- **Net price** = menu price / (1 + tax rate), when menu prices include VAT or sales tax. Food cost must be measured against the money you keep, not the tax you collect.
- **Food cost percent** = plate cost / net price x 100.
- **Contribution margin** = net price - plate cost. This is the money each sale leaves to pay labor, rent, and profit.

## Worked formula

Salmon fillet bought at 32.00 per kg with 85 percent yield:
- AP cost per g = 32.00 / 1000 = 0.032
- EP cost per g = 0.032 / 0.85 = 0.0376
- 160 g portion = 160 x 0.0376 = 6.02

## Typical food cost targets (rough guide)

| Concept | Typical food cost percent |
| --- | --- |
| Coffee and espresso drinks | 15 to 25 |
| Bakery items | 20 to 30 |
| Cafe brunch dishes | 28 to 35 |
| Casual restaurant mains | 28 to 35 |
| Steak and seafood mains | 35 to 45 |
| Pizza | 20 to 28 |
| Catering trays | 25 to 35 |

Your right target depends on labor, rent, and volume. A low-labor item can run a higher food cost percent and still be very profitable.

## Common costing mistakes

1. Forgetting small items: oil, butter for the pan, salt, garnish, sauces, and takeaway packaging. Add them or use extras_per_portion.
2. Using AP cost without yield for proteins and produce.
3. Measuring food cost against prices that include tax.
4. Costing the recipe card instead of what the kitchen actually plates (portion creep). Weigh five real portions.
5. Old supplier prices. Update the sheet when a price moves by about 5 percent or more.
6. Mixing units: an ingredient bought by the piece but used by weight needs one piece weighed.
7. Ignoring waste and staff meals; track them separately and compare actual food cost (from inventory) with this theoretical cost.

## Theoretical versus actual food cost

This skill calculates theoretical cost: what food should cost if recipes are followed. Actual food cost = (opening inventory + purchases - closing inventory) / net food sales. A gap of more than about 2 to 3 points usually means waste, portion creep, theft, or wrong prices on the sheet.
FILE:references/pricing-strategies.md
# Pricing strategies and menu engineering

## Ways to set a price

1. **Target food cost percent**: price = plate cost / target x (1 + tax rate), rounded up. Simple, and the script's "AT TARGET" column. Weak spot: cheap items end up underpriced and expensive proteins overpriced.
2. **Contribution margin**: decide the money each item must earn (for example at least 5.00 for a main), then price = (plate cost + margin) x (1 + tax rate). Better for high-cost proteins.
3. **Market check**: compare with three to five similar places nearby. Price perception matters as much as cost.
4. **Blend**: start from the target price, check the margin in money, then sanity-check against the market.

## Rounding and presentation

- Round up to the step your menu uses (0.10, 0.50, or whole numbers). Upscale menus often use whole numbers without currency signs; casual menus often end in .50 or .90.
- Avoid many small increases across the whole menu at once; raise the items with the weakest margin first.
- Keep price gaps logical: an oat milk upgrade should cover its extra cost (oat drink often costs about twice as much as dairy milk per liter).

## Menu engineering

Needs weekly sales for every item. The script uses:
- **Popularity line**: an item is popular if it sells at least 70 percent of an equal share (with 5 items, 0.7 x 20 percent = 14 percent of units sold).
- **Margin line**: the sales-weighted average contribution margin.

| Class | Popularity | Margin | What to do |
| --- | --- | --- | --- |
| Star | high | high | Keep quality and portion consistent, place it in the best menu spot, small price increases are usually safe. |
| Plowhorse | high | low | Raise price a little, trim cost (portion, garnish, supplier), or pair it with a high-margin add-on. Do not remove it. |
| Puzzle | low | high | Promote it: better menu placement, a description, staff recommendation, a photo. Check the price is not scaring guests. |
| Dog | low | low | Rework the recipe or price, or remove it, unless it serves a purpose (kids menu, dietary option, signature item). |

## Choosing a fix for a high food cost item

| Option | Good when | Risk |
| --- | --- | --- |
| Raise the price | the item is popular and the market allows it | fewer sales if the jump is large |
| Trim the portion | portions are larger than guests expect | guests notice; keep value perception |
| Swap an ingredient | a cheaper equal-quality option exists | allergen and taste changes; update the menu text |
| Accept a higher percent | the money margin is the highest on the menu | needs volume to pay off |
| Remove the item | it is a Dog with no strategic role | regulars may miss it |

Always rerun the calculator with the proposed change and show before and after.
FILE:templates/recipe-costing-sheet.md
# Recipe costing sheet (input for scripts/cost_menu.py)

Save as `menu.json`. Quantities in recipes are prepared (usable) amounts.

'''json
{
  "currency": "EUR",
  "target_food_cost_pct": 30,
  "menu_price_includes_tax_pct": 10,
  "price_rounding": 0.10,
  "ingredients": [
    {"name": "flour", "price": 0.95, "per": "1 kg"},
    {"name": "butter", "price": 9.80, "per": "1 kg"},
    {"name": "eggs", "price": 3.60, "per": "12 each"},
    {"name": "blueberries", "price": 16.00, "per": "1 kg", "yield_pct": 95}
  ],
  "recipes": [
    {
      "name": "Blueberry Muffin",
      "portions": 12,
      "menu_price": 3.20,
      "sold_per_week": 90,
      "extras_per_portion": 0.06,
      "items": [["flour", "500 g"], ["butter", "180 g"], ["eggs", "3 each"], ["blueberries", "300 g"]]
    }
  ]
}
'''

Field notes:
- `per`: the pack you buy, as "<amount> <unit>" (g, kg, mg, ml, cl, dl, l, oz, lb, each).
- `yield_pct`: 1 to 100, default 100.
- `menu_price_includes_tax_pct`: 0 if menu prices are shown without tax.
- `sold_per_week`: give it for every item (or none) to get menu engineering classes.
- `extras_per_portion`: packaging, napkins, garnish, sauce cups, in money.

Run: `python3 scripts/cost_menu.py menu.json [--target 30] [--json]`

---

# Menu costing report: <business> - <date>

**Target food cost:** <x>%  **Prices include tax:** <rate or no>  **Currency:** <code>
**Assumptions:** <yields, missing prices, portion weights>

## Results (before)

| Item | Cost/portion | Price | Net | Food % | Margin | At target | Class |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Formula check
<one item worked out line by line>

## What needs attention
1. **<item>** - <finding>. Options: <price / portion / ingredient / accept>. Recommendation: <one>.

## Proposed changes and results (after)
<changes, then the new table or the changed rows>

## Menu engineering actions
- Stars: <items and action>
- Plowhorses: <items and action>
- Puzzles: <items and action>
- Dogs: <items and action>

## Next steps
- <weigh real portions, update supplier prices, track actual food cost monthly>
FILE:examples/example-cafe-menu.md
# Example: a five-item cafe menu

**User:** "We are a small brunch cafe. Prices include 10 percent VAT and I want about 30 percent food cost. Here are my supplier prices and recipes. Why is my margin so thin?"

The sheet has 16 ingredients and 5 items with weekly sales (avocado yield 90 percent because about 1 in 10 is unusable; salmon 85 percent after trimming).

**Command:**
'''bash
python3 scripts/cost_menu.py cafe-menu.json
'''

**Output (before):**
'''
ITEM                      COST   PRICE     NET  FOOD%  MARGIN AT TARGET  CLASS
Avocado Toast             3.13    9.50    8.64   36.2    5.51     11.50  Star
Salmon Spinach Bowl       8.02   14.50   13.18   60.8    5.16     29.50  Puzzle
Flat White                0.72    3.80    3.45   21.0    2.73      2.70  Plowhorse
Oat Flat White            0.91    4.20    3.82   23.9    2.91      3.40  Plowhorse
Blueberry Muffin          0.79    3.20    2.91   27.2    2.12      3.00  Dog

Findings (8):
  [HIGH] Salmon Spinach Bowl: food cost 60.8% is far above the 30% target; price EUR 29.50 or cut cost 4.06 per portion
  [WARN] Avocado Toast: food cost 36.2% is above the 30% target; price at target would be EUR 11.50
  [INFO] Salmon Spinach Bowl: salmon fillet is 76% of the cost; its price or portion matters most
  [INFO] menu engineering: weighted average margin EUR 3.22, popularity line 14.0% of items sold
  [INFO] ingredient 'truffle oil' is not used in any recipe
'''

---

# Menu costing report: brunch cafe - October

**Target food cost:** 30%  **Prices include tax:** 10% VAT  **Currency:** EUR
**Assumptions:** avocado yield 90%, salmon 85%, spinach 90%; extras 0.10 per dish, 0.12 per coffee (cup and lid), 0.06 per muffin.

## Formula check (Salmon Spinach Bowl, before)
- Salmon 160 g x (32.00 / 1000 / 0.85) = 6.02
- Spinach 70 g x (14.00 / 1000 / 0.90) = 1.09; egg 0.30; tomatoes 0.36; olive oil 0.15; extras 0.10
- Cost per portion = 8.02; net price = 14.50 / 1.10 = 13.18; food cost = 8.02 / 13.18 x 100 = 60.8%

## What needs attention
1. **Salmon Spinach Bowl (HIGH, Puzzle)** - 60.8% food cost; salmon is 76% of the cost. Pricing it at target (29.50) is unrealistic for a cafe. Recommendation: reduce salmon to 120 g (still a generous portion for a bowl) and raise the price to 17.50; accept about 40% food cost because the margin becomes the highest on the menu.
2. **Avocado Toast (WARN, Star)** - 36.2%. It is the best-selling dish, so a 1.00 increase to 10.50 is low risk.
3. **Flat White and Oat Flat White (Plowhorses)** - healthy percentages (21 to 24%) but small margins; do not discount. Keep the oat surcharge at 0.40: the oat drink costs 0.19 more per cup than milk.
4. **Blueberry Muffin (Dog)** - fine percentage, low margin and low sales. Try a bundle with coffee before removing it.
5. **Truffle oil** is on the sheet but in no recipe: remove it from orders or the sheet.

## Proposed changes and results (after)
Avocado Toast 10.50; Salmon Spinach Bowl 120 g salmon at 17.50. Rerun: `python3 scripts/cost_menu.py cafe-menu-revised.json`

'''
ITEM                      COST   PRICE     NET  FOOD%  MARGIN AT TARGET  CLASS
Avocado Toast             3.13   10.50    9.55   32.8    6.42     11.50  Star
Salmon Spinach Bowl       6.51   17.50   15.91   40.9    9.40     23.90  Puzzle
Flat White                0.72    3.80    3.45   21.0    2.73      2.70  Plowhorse
Oat Flat White            0.91    4.20    3.82   23.9    2.91      3.40  Plowhorse
Blueberry Muffin          0.79    3.20    2.91   27.2    2.12      3.00  Dog

Findings (6):
  [WARN] Salmon Spinach Bowl: food cost 40.9% is above the 30% target; price at target would be EUR 23.90
  [INFO] menu engineering: weighted average margin EUR 3.56, popularity line 14.0% of items sold
'''
Exit code 0. The remaining WARN is accepted on purpose: 9.40 margin per bowl versus 5.16 before.

## Menu engineering actions
- Stars: Avocado Toast - keep the recipe consistent, top of the brunch section.
- Plowhorses: Flat White, Oat Flat White - no discounts; suggest a pastry with every coffee.
- Puzzles: Salmon Spinach Bowl - give it a short description and staff recommendation; check sales after 4 weeks at the new price.
- Dogs: Blueberry Muffin - test a coffee + muffin bundle for 4 weeks, then decide.

## Next steps
- Weigh five real salmon portions this week to confirm the 120 g spec is followed.
- Update supplier prices monthly and rerun the sheet.
- Compare with actual food cost from inventory at month end.
FILE:scripts/cost_menu.py
#!/usr/bin/env python3
"""Cost menu items from recipes and purchase prices, and suggest menu prices.

Usage:
  python3 cost_menu.py menu.json [--target 30] [--json]
  cat menu.json | python3 cost_menu.py -

Input JSON (see templates/recipe-costing-sheet.md):
  {
    "currency": "EUR",
    "target_food_cost_pct": 30,          # optional, default 30 (or --target)
    "menu_price_includes_tax_pct": 10,   # optional; VAT/sales tax included in menu prices
    "price_rounding": 0.10,              # optional; suggested prices round UP to this step
    "ingredients": [
      {"name": "butter", "price": 9.80, "per": "1 kg", "yield_pct": 100}
    ],
    "recipes": [
      {"name": "Croissant", "portions": 12, "menu_price": 3.20, "sold_per_week": 180,
       "extras_per_portion": 0.05,       # optional: packaging, napkin, garnish
       "items": [["butter", "600 g"], ["flour", "1 kg"]]}
    ]
  }
Units: g, kg, mg, ml, cl, dl, l, oz, lb, each (also pc, pcs, piece, unit, egg).
Recipe quantities are the prepared (usable) amounts. yield_pct is the usable
share of what you buy after trimming, peeling, cooking loss or spoilage.

Per recipe: cost per portion, food cost percent of the net (tax-free) menu
price, contribution margin, suggested price at the target, and the three
biggest cost drivers. With sold_per_week on every recipe, adds a menu
engineering class (Star, Plowhorse, Puzzle, Dog).
Exit code: 0 ok, 1 errors in the data or HIGH findings, 2 usage or input error.
Standard library only.
"""
import json
import math
import re
import sys

UNITS = {  # unit -> (dimension, factor to base unit g / ml / each)
    "mg": ("mass", 0.001), "g": ("mass", 1.0), "kg": ("mass", 1000.0),
    "oz": ("mass", 28.3495), "lb": ("mass", 453.592),
    "ml": ("volume", 1.0), "cl": ("volume", 10.0), "dl": ("volume", 100.0), "l": ("volume", 1000.0),
    "each": ("count", 1.0), "pc": ("count", 1.0), "pcs": ("count", 1.0), "piece": ("count", 1.0),
    "pieces": ("count", 1.0), "unit": ("count", 1.0), "units": ("count", 1.0), "egg": ("count", 1.0), "eggs": ("count", 1.0),
}
BASE = {"mass": "g", "volume": "ml", "count": "each"}


def usage(msg):
    print(f"error: {msg}\n", file=sys.stderr)
    print(__doc__.strip().split("\n\n")[1], file=sys.stderr)
    sys.exit(2)


def parse_qty(text):
    """'600 g' -> (600.0, 'mass', 600.0 in base units)."""
    m = re.fullmatch(r"\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*", str(text))
    if not m:
        raise ValueError(f"cannot read quantity {text!r}")
    qty = float(m.group(1).replace(",", "."))
    unit = (m.group(2) or "each").lower()
    if unit not in UNITS:
        raise ValueError(f"unknown unit {unit!r} in {text!r}")
    dim, factor = UNITS[unit]
    return qty, dim, qty * factor


def round_up(value, step):
    return math.ceil(round(value / step, 6)) * step


def analyze(data, target_override=None):
    errors, findings = [], []
    cur = data.get("currency", "")
    target = float(target_override or data.get("target_food_cost_pct", 30))
    tax = float(data.get("menu_price_includes_tax_pct", 0))
    step = float(data.get("price_rounding", 0.10))
    ingredients = {}
    for ing in data.get("ingredients", []):
        name = str(ing.get("name", "")).strip().lower()
        try:
            _, dim, base_qty = parse_qty(ing["per"])
            price = float(ing["price"])
        except (KeyError, ValueError, TypeError) as e:
            errors.append(f"ingredient {name or '?'}: {e}")
            continue
        y = float(ing.get("yield_pct", 100))
        if not 0 < y <= 100:
            errors.append(f"ingredient {name}: yield_pct must be between 1 and 100")
            continue
        ingredients[name] = {"dim": dim, "cost_per_base": price / base_qty / (y / 100), "yield": y, "used": False}

    results = []
    for rec in data.get("recipes", []):
        rname = rec.get("name", "?")
        portions = float(rec.get("portions", 1) or 1)
        lines, bad = [], False
        for item in rec.get("items", []):
            iname, qtext = str(item[0]).strip().lower(), item[1]
            ing = ingredients.get(iname)
            if not ing:
                errors.append(f"{rname}: unknown ingredient {iname!r} (add it to ingredients)")
                bad = True
                continue
            ing["used"] = True
            try:
                _, dim, base_qty = parse_qty(qtext)
            except ValueError as e:
                errors.append(f"{rname}: {e}")
                bad = True
                continue
            if dim != ing["dim"]:
                errors.append(f"{rname}: {iname} is bought by {BASE[ing['dim']]} but used by {BASE[dim]} ({qtext}); "
                              f"convert it (for example weigh one piece)")
                bad = True
                continue
            lines.append((iname, base_qty * ing["cost_per_base"]))
        if bad:
            continue
        batch = sum(c for _, c in lines)
        extras = float(rec.get("extras_per_portion", 0))
        cost = batch / portions + extras
        price = float(rec.get("menu_price", 0))
        net = price / (1 + tax / 100) if price else 0.0
        pct = 100 * cost / net if net else None
        suggested = round_up(cost / (target / 100) * (1 + tax / 100), step)
        drivers = sorted(lines, key=lambda x: -x[1])[:3]
        r = {"name": rname, "portions": portions, "cost_per_portion": round(cost, 3), "menu_price": price,
             "net_price": round(net, 2), "food_cost_pct": None if pct is None else round(pct, 1),
             "contribution_margin": round(net - cost, 2) if net else None,
             "suggested_price_at_target": round(suggested, 2), "sold_per_week": rec.get("sold_per_week"),
             "drivers": [{"ingredient": n, "share_pct": round(100 * c / batch, 1) if batch else 0} for n, c in drivers]}
        results.append(r)
        if pct is None:
            findings.append(("WARN", rname, f"no menu_price; suggested {cur} {suggested:.2f} at {target:g}% food cost"))
        elif pct > target + 15:
            findings.append(("HIGH", rname, f"food cost {pct:.1f}% is far above the {target:g}% target; "
                                            f"price {cur} {suggested:.2f} or cut cost {cost - net * target / 100:.2f} per portion"))
        elif pct > target + 5:
            findings.append(("WARN", rname, f"food cost {pct:.1f}% is above the {target:g}% target; "
                                            f"price at target would be {cur} {suggested:.2f}"))
        elif pct < target - 15:
            findings.append(("INFO", rname, f"food cost only {pct:.1f}%; check the recipe lists every ingredient and portion size"))
        if drivers and batch and drivers[0][1] / batch > 0.5:
            findings.append(("INFO", rname, f"{drivers[0][0]} is {100 * drivers[0][1] / batch:.0f}% of the cost; "
                                            f"its price or portion matters most"))

    sold = [r for r in results if isinstance(r["sold_per_week"], (int, float)) and r["contribution_margin"] is not None]
    if sold and len(sold) == len(results) and len(sold) >= 3:
        total = sum(r["sold_per_week"] for r in sold)
        pop_line = 0.7 / len(sold)
        avg_cm = sum(r["contribution_margin"] * r["sold_per_week"] for r in sold) / total if total else 0
        for r in sold:
            high_pop = total and r["sold_per_week"] / total >= pop_line
            high_cm = r["contribution_margin"] >= avg_cm
            r["menu_class"] = {(True, True): "Star", (True, False): "Plowhorse",
                               (False, True): "Puzzle", (False, False): "Dog"}[(bool(high_pop), high_cm)]
        findings.append(("INFO", None, f"menu engineering: weighted average margin {cur} {avg_cm:.2f}, "
                                       f"popularity line {100 * pop_line:.1f}% of items sold"))
    for name, ing in ingredients.items():
        if not ing["used"]:
            findings.append(("INFO", None, f"ingredient {name!r} is not used in any recipe"))
    return {"currency": cur, "target_pct": target, "tax_pct": tax, "recipes": results,
            "errors": errors, "findings": [{"severity": s, "recipe": n, "message": m} for s, n, m in findings]}


def main(argv):
    target, as_json, paths = None, False, []
    it = iter(argv)
    for a in it:
        if a == "--target":
            try:
                target = float(next(it, ""))
            except ValueError:
                usage("--target needs a number, for example 30")
            if not 5 <= target <= 80:
                usage("--target should be a food cost percent between 5 and 80")
        elif a == "--json":
            as_json = True
        elif a.startswith("--"):
            usage(f"unknown option {a}")
        else:
            paths.append(a)
    if len(paths) != 1:
        usage("give exactly one menu JSON file, or - for stdin")
    try:
        raw = sys.stdin.read() if paths[0] == "-" else open(paths[0], encoding="utf-8").read()
        data = json.loads(raw)
    except (OSError, ValueError) as e:
        print(f"error: cannot read menu JSON: {e}", file=sys.stderr)
        return 2
    if not data.get("recipes"):
        print("error: no recipes in the input", file=sys.stderr)
        return 2
    rep = analyze(data, target)
    if as_json:
        print(json.dumps(rep, indent=2))
    else:
        cur = rep["currency"]
        print(f"Target food cost {rep['target_pct']:g}% | prices include {rep['tax_pct']:g}% tax | currency {cur}\n")
        print(f"{'ITEM':<22} {'COST':>7} {'PRICE':>7} {'NET':>7} {'FOOD%':>6} {'MARGIN':>7} {'AT TARGET':>9}  CLASS")
        for r in rep["recipes"]:
            pct = "-" if r["food_cost_pct"] is None else f"{r['food_cost_pct']:.1f}"
            cm = "-" if r["contribution_margin"] is None else f"{r['contribution_margin']:.2f}"
            print(f"{r['name'][:22]:<22} {r['cost_per_portion']:>7.2f} {r['menu_price']:>7.2f} {r['net_price']:>7.2f} "
                  f"{pct:>6} {cm:>7} {r['suggested_price_at_target']:>9.2f}  {r.get('menu_class', '-')}")
        print("\nTop cost drivers:")
        for r in rep["recipes"]:
            print(f"  {r['name']}: " + ", ".join(f"{d['ingredient']} {d['share_pct']:g}%" for d in r["drivers"]))
        if rep["errors"]:
            print(f"\nErrors ({len(rep['errors'])}):")
            for e in rep["errors"]:
                print(f"  [ERROR] {e}")
        print(f"\nFindings ({len(rep['findings'])}):")
        order = {"HIGH": 0, "WARN": 1, "INFO": 2}
        for f in sorted(rep["findings"], key=lambda f: order[f["severity"]]):
            print(f"  [{f['severity']}] {f['recipe'] + ': ' if f['recipe'] else ''}{f['message']}")
    bad = rep["errors"] or any(f["severity"] == "HIGH" for f in rep["findings"])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
