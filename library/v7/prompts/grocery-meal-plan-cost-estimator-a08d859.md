# Grocery Meal Plan Cost Estimator

By @f · general
Language: en · Domains: data, finance, health · Source: P01

Source page: https://prompts.chat

```
---
name: grocery-meal-plan-cost-estimator
description: Builds a weekly meal plan with portion estimates and a grocery list rolled up by store section, then estimates total cost from unit prices you provide or simple defaults. Use when planning meals on a budget, batch cooking, or asking "what should I buy for 4 people this week?". Includes a stdlib Python cost estimator with --self-test.
---

# Grocery Meal Plan Cost Estimator

You help households plan a week of meals, scale portions to headcount, build a grocery list grouped by store section, and estimate cost from unit prices. You are practical about leftovers and pantry staples. You do not give medical diet therapy; you note allergies and preferences the user states.

## Files in this skill

- `scripts/estimate_cost.py` - sums a grocery list with unit prices and prints section totals (Python 3 standard library only)
- `references/portion-guide.md` - rough per-person amounts for common foods
- `references/store-section-map.md` - where items usually live in a supermarket
- `templates/meal-plan.md` - weekly plan + list structure
- `examples/sample-week.md` - worked example for 2 adults

## Workflow

### 1. Collect constraints
Ask for: headcount and ages, nights cooking at home, budget and currency, diet rules (veg, halal, allergies), appliances/time, and pantry items already owned.

### 2. Draft the week
Propose breakfast / lunch / dinner / snacks with leftover reuse. Keep variety without requiring 21 unique recipes.

### 3. Explode to groceries
Using `references/portion-guide.md`, convert meals to ingredients and quantities. Deduplicate (one bottle of oil, not seven).

### 4. Map to store sections
Group with `references/store-section-map.md` so the list is walkable.

### 5. Estimate cost
'''
python3 scripts/estimate_cost.py --list groceries.json
python3 scripts/estimate_cost.py --self-test
'''
If the user has no prices, use clearly labeled default unit prices and say they are placeholders.

### 6. Answer
Return: meal plan table, grocery list by section with qty, estimated total, cost per person-day, and 2 to 3 swap ideas if over budget.

## Rules

- Never invent that something is "healthy" as medical advice; stick to preferences and macros only if asked.
- Prefer grams and milliliters plus a household measure.
- Flag perishable items that should be bought mid-week.
FILE:references/portion-guide.md
# Rough per-person cooked portions (adjust for appetite)

| Food | Per adult | Per child (5–10) |
| --- | --- | --- |
| Cooked rice / grains | 150–180 g | 80–100 g |
| Dry pasta | 80–100 g | 50–70 g |
| Protein (raw meat/fish) | 120–150 g | 70–90 g |
| Beans/lentils (dry) | 50–70 g | 30–40 g |
| Vegetables (raw weight) | 150–200 g | 80–120 g |
| Fruit | 1 piece or 120 g | 1 small piece |
| Milk / alt milk | 200–250 ml | 150 ml |
| Bread | 2 slices | 1 slice |
| Oil for cooking | ~10 ml per saute | shared |
| Eggs | 2 | 1 |

## Scaling tips

- Soups/stews: scale liquid 90% when going from 2 to 4 (pot efficiency).
- Spices: do not scale linearly past 4 portions; taste and adjust.
- Leftovers lunch: cook +40% dinner on two weeknights instead of separate recipes.
FILE:references/store-section-map.md
# Typical supermarket section map

Use these buckets on the grocery list (adapt names to local stores):

1. **Produce** — fruit, vegetables, herbs, salad
2. **Bakery** — bread, tortillas, buns
3. **Meat & seafood** — fresh/cooled protein
4. **Dairy & eggs** — milk, yogurt, cheese, butter, eggs
5. **Deli / prepared** — if used
6. **Pantry dry** — rice, pasta, beans, flour, sugar, cereal
7. **Cans & jars** — tomatoes, tuna, sauces
8. **Oils & spices** — cooking oil, salt, spices, vinegar
9. **Frozen** — vegetables, frozen protein, ice cream
10. **Beverages** — coffee, tea, juice, sparkling water
11. **Household** — if buying soap/bags on the same trip

Walk order suggestion: produce → bakery → meat → dairy → center aisles → frozen → beverages.
FILE:templates/meal-plan.md
# Weekly meal plan

- **People**:
- **Budget / currency**:
- **Diet notes**:

## Meals

| Day | Breakfast | Lunch | Dinner | Notes |
| --- | --- | --- | --- | --- |
| Mon |  |  |  |  |
| Tue |  |  |  |  |
| Wed |  |  |  |  |
| Thu |  |  |  |  |
| Fri |  |  |  |  |
| Sat |  |  |  |  |
| Sun |  |  |  |  |

## Grocery list by section

### Produce
- [ ] item — qty — est. price

### Dairy & eggs
- [ ]

## Cost summary

- Estimated total:
- Per person-day:
- Mid-week top-up:
FILE:examples/sample-week.md
# Sample week — 2 adults, flexible omnivore, EUR

Budget target: €70

## Meals (short)

| Day | Dinner highlight | Lunch plan |
| --- | --- | --- |
| Mon | Chickpea curry + rice | Leftover curry |
| Tue | Pasta aglio e olio + salad | Egg sandwiches |
| Wed | Sheet-pan chicken + veg | Leftover chicken bowls |
| Thu | Lentil soup + bread | Soup + fruit |
| Fri | Fish tacos (frozen fish) | Rice fried with leftover veg |
| Sat | Veggie omelette feast | Eating out / skip |
| Sun | Batch chili for Mon lunch | Chili |

## Grocery excerpt (for estimate_cost.py)

See accompanying JSON shape:

'''json
{
  "currency": "EUR",
  "items": [
    {"name": "rice 1kg", "section": "Pantry dry", "qty": 1, "unit_price": 2.2},
    {"name": "chickpeas canned x4", "section": "Cans & jars", "qty": 4, "unit_price": 0.9},
    {"name": "pasta 500g", "section": "Pantry dry", "qty": 2, "unit_price": 1.1},
    {"name": "chicken thighs 1kg", "section": "Meat & seafood", "qty": 1, "unit_price": 6.5},
    {"name": "mixed veg 1kg", "section": "Produce", "qty": 1, "unit_price": 3.0},
    {"name": "eggs 12", "section": "Dairy & eggs", "qty": 1, "unit_price": 3.2},
    {"name": "milk 1L", "section": "Dairy & eggs", "qty": 2, "unit_price": 1.1},
    {"name": "frozen white fish 500g", "section": "Frozen", "qty": 1, "unit_price": 4.5}
  ]
}
'''
FILE:scripts/estimate_cost.py
#!/usr/bin/env python3
"""Estimate grocery cost from a JSON list.

Usage:
    python3 estimate_cost.py --list groceries.json
    python3 estimate_cost.py --self-test

JSON shape:
{
  "currency": "EUR",
  "items": [{"name": "...", "section": "...", "qty": 1, "unit_price": 2.5}]
}

Python 3 standard library only.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from typing import Any, Dict, List


def load_list(path: str) -> dict:
    return json.load(open(path, encoding="utf-8"))


def estimate(data: dict) -> dict:
    currency = data.get("currency") or "USD"
    items = data.get("items") or []
    by_section: Dict[str, float] = defaultdict(float)
    lines = []
    total = 0.0
    for it in items:
        name = it["name"]
        section = it.get("section") or "Other"
        qty = float(it.get("qty", 1))
        price = float(it["unit_price"])
        line_total = qty * price
        total += line_total
        by_section[section] += line_total
        lines.append({
            "name": name,
            "section": section,
            "qty": qty,
            "unit_price": price,
            "line_total": round(line_total, 2),
        })
    return {
        "currency": currency,
        "total": round(total, 2),
        "by_section": {k: round(v, 2) for k, v in sorted(by_section.items())},
        "lines": lines,
        "item_count": len(lines),
    }


def format_report(result: dict) -> str:
    cur = result["currency"]
    lines = [f"Estimated total: {result['total']:.2f} {cur} ({result['item_count']} lines)"]
    lines.append("By section:")
    for sec, amt in result["by_section"].items():
        lines.append(f"  - {sec}: {amt:.2f} {cur}")
    return "\n".join(lines)


def self_test() -> int:
    sample = {
        "currency": "EUR",
        "items": [
            {"name": "rice", "section": "Pantry dry", "qty": 1, "unit_price": 2.2},
            {"name": "eggs", "section": "Dairy & eggs", "qty": 1, "unit_price": 3.2},
            {"name": "milk", "section": "Dairy & eggs", "qty": 2, "unit_price": 1.1},
        ],
    }
    r = estimate(sample)
    cases = [
        ("total", r["total"], 7.6),
        ("dairy_section", r["by_section"]["Dairy & eggs"], 5.4),
        ("pantry", r["by_section"]["Pantry dry"], 2.2),
        ("count", r["item_count"], 3),
        ("currency", r["currency"], "EUR"),
        ("empty", estimate({"items": []})["total"], 0.0),
        ("qty_scale", estimate({"items": [{"name": "x", "section": "A", "qty": 3, "unit_price": 1.5}]})["total"], 4.5),
        ("default_section", estimate({"items": [{"name": "y", "qty": 1, "unit_price": 2}]})["by_section"]["Other"], 2.0),
        ("round", estimate({"items": [{"name": "z", "section": "A", "qty": 1, "unit_price": 1.005}]})["total"], 1.0),
    ]
    failed = 0
    for name, got, expected in cases:
        if isinstance(expected, float):
            ok = abs(float(got) - expected) < 1e-9
        else:
            ok = got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}: got={got!r} expected={expected!r}")
    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Estimate grocery list cost.")
    p.add_argument("--list", help="Path to groceries JSON")
    p.add_argument("--json", action="store_true")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.list:
        p.error("--list is required (or use --self-test)")
    result = estimate(load_list(a.list))
    if a.json:
        print(json.dumps(result, indent=2))
    else:
        print(format_report(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
