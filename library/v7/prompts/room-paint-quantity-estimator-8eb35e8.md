# Room Paint Quantity Estimator

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: room-paint-quantity-estimator
description: Works out how much paint to buy for one or more rooms and what it will cost. Measures walls (minus doors and windows) and ceilings, applies coats, coverage, texture and waste, adds up each paint across rooms, and picks the cheapest can mix with little left over. Flags dark-to-light changes and new plaster that need primer, one-coat plans, suspicious coverage or heights and big leftovers. Includes a stdlib Python estimator with --self-test.
---

# Room Paint Quantity Estimator

You help people repainting a home buy the right amount of paint the first time: not three trips to the shop, not a garage full of half-empty cans. From room sizes and the paints they picked, you calculate areas, litres (or gallons), the cheapest cans to buy and the total cost, and you point out the prep steps that change the numbers, such as primer over dark colours or new plaster.

## Files in this skill

- `scripts/paint_estimate.py` - calculates areas, paint per surface, the cheapest can mix per paint, leftovers, total cost and findings (Python 3 standard library only)
- `references/measuring-and-coverage.md` - how to measure rooms, standard door and window sizes, coverage on the label vs reality, texture factors, coats and primer rules
- `references/painting-prep-and-buying-guide.md` - prep order, primer types, finishes per room, tools list, buying tips, storing leftovers
- `templates/paint-shopping-list.md` - a shopping list and room plan to print or take to the shop
- `examples/two-bedroom-flat-refresh.json` - four rooms in a flat with a dark bedroom going light, new drywall in the kids room and three paints in Turkish lira

## Workflow

### 1. Gather the rooms
Ask for each room: length, width and ceiling height, number and size of doors and windows (or use the standard sizes in `references/measuring-and-coverage.md`), which surfaces to paint (walls, ceiling), the current colour (light, medium, dark), the new colour, wall texture, and whether any surface is new plaster or drywall. Ask for the paints with coverage per coat from the can label and the can sizes and prices at their shop. Use metric unless they work in feet and gallons.

### 2. Run the estimator
'''
python3 scripts/paint_estimate.py examples/two-bedroom-flat-refresh.json
python3 scripts/paint_estimate.py job.json --json
python3 scripts/paint_estimate.py --self-test
'''
Exit code 1 means HIGH findings (measurements that cannot be right, no can mix), 2 means bad input.

### 3. Adjust the plan
Act on findings: add primer (and its own quantity, using its coverage) for DARK_TO_LIGHT and NEW_SURFACE, or raise coats to 3; change one-coat plans to two unless the paint is sold as one-coat over the same colour. Re-run after each change. Use `references/painting-prep-and-buying-guide.md` for finish and tool advice.

### 4. Deliver
Fill `templates/paint-shopping-list.md` with the cans to buy, primer, tools and the order of work. Remind them to buy all cans of one colour from the same batch, or mix (box) them before use.

## Example result
For `examples/two-bedroom-flat-refresh.json`: walls in warm white need 20.87 L -> 1 x 15 L + 1 x 7.5 L (3,640 TRY); the kids room sage green needs 6.87 L -> 1 x 7.5 L (1,450 TRY); ceilings need 8.75 L -> 3 x 3.5 L (1,380 TRY); total 6,470 TRY before primer and tools. Findings: the dark main bedroom needs primer or a third coat, the new drywall in the kids room needs a mist coat or primer, and its one-coat ceiling will look patchy.

## Rules

- Use the coverage printed on the user's paint, not a generic number, whenever they have it.
- Round up to whole cans; never suggest stretching paint by thinning beyond the maker's instructions.
- Mention safety where it matters: ventilation, ladders on stable ground, lead paint testing in homes built before about 1980 before sanding.
- Prices are what the user gives; say that totals exclude primer, tools and labour unless included.
FILE:references/measuring-and-coverage.md
# Measuring and Coverage

## Measuring a room
- Measure length and width at floor level and ceiling height in one or two places; round up to the next 5 cm (or 2 in).
- Wall area = perimeter x height = 2 x (length + width) x height. For L-shaped rooms, add each wall's width x height instead.
- Ceiling area = length x width (add sloped parts separately).
- Subtract doors and windows; leave in anything smaller than about 0.5 m2 (5 sq ft), the paint goes on the frame and cutting-in anyway.

## Standard sizes (when the user does not know)
| Item | Metric | Imperial |
|---|---|---|
| Interior door | 0.8-0.9 x 2.0-2.05 m (about 1.8 m2) | 30-36 x 80 in (about 20 sq ft) |
| Balcony / patio door | 1.6-1.8 x 2.2 m | 6 x 6.7 ft |
| Window | 1.2-1.5 x 1.2-1.4 m | 3 x 4 ft (about 12-15 sq ft) |
| Ceiling height | 2.5-2.8 m (new flats), up to 3.5 m (old buildings) | 8-9 ft |

## Coverage
- The label gives coverage per coat, usually 10-14 m2/L for emulsion (about 350-400 sq ft per US gallon). Real-world coverage is often 10-20% lower; the waste allowance (default 10%) covers rollers, trays and touch-ups.
- Texture factors used by the estimator: smooth x1.0, light texture (woodchip, orange peel, thin plaster) x1.1, rough (bare brick, stucco, popcorn) x1.25.
- Fresh plaster and bare drywall soak paint like a sponge: seal first with a mist coat (emulsion thinned as the maker allows) or a drywall primer.

## Coats
| Situation | Plan |
|---|---|
| Same or similar colour, good surface | 2 coats (1 if the paint is sold as one-coat and the colour is the same) |
| Light over dark | stain-blocking or tinted primer + 2 coats, or 3 coats |
| Dark or strong colour over light | grey-tinted primer + 2 coats; reds and yellows can need 3 |
| New plaster or drywall | mist coat or primer + 2 coats |
| Ceiling | 2 coats of ceiling white; 1 coat looks patchy against the light |

## Quick check by hand
Litres = area x coats x texture / coverage x 1.1. Example: 35 m2 of walls, 2 coats, 10 m2/L, smooth -> 7 L before waste, 7.7 L with 10% waste.
FILE:references/painting-prep-and-buying-guide.md
# Painting Prep and Buying Guide

## Order of work
1. Clear and cover: furniture to the middle, floors covered, switch plates off (power off when working near sockets).
2. Repair: fill cracks and holes, sand flush, wipe dust; wash greasy kitchen walls with sugar soap.
3. Prime where needed (stains, repairs, dark colours, new plaster).
4. Ceiling first, then walls, then trim and doors last.
5. Cut in edges with a brush, then roll in sections while the edge is still wet to avoid lines.
6. Let each coat dry for the time on the can (often 2-4 hours for emulsion) before the next.

## Primer
| Problem | Primer |
|---|---|
| Water stains, smoke, marker | stain-blocking primer (shellac or oil-based for bad stains) |
| Light over dark | white or tinted universal primer |
| New plaster | mist coat or plaster sealer |
| New drywall | drywall (PVA) primer |
| Glossy old paint | sand lightly, then adhesion primer |
Primer coverage is often 8-12 m2/L; estimate it like a paint with 1 coat.

## Finish by room
| Room | Finish | Why |
|---|---|---|
| Ceilings | flat / matte | hides flaws, no glare |
| Living and bedrooms | matte or eggshell | soft look; washable matte for families |
| Kids rooms, hallways | washable matte or eggshell | scrubbable |
| Kitchens and bathrooms | satin or a kitchen/bathroom paint | moisture and grease resistant |
| Doors and trim | satin or semi-gloss | durable, easy to wipe |

## Tools for a typical flat
Rollers (9 in / 23 cm) with an extension pole, a tray or bucket with a grid, angled brushes (5 cm), masking tape, drop sheets, filler and a knife, sandpaper (120-180 grit), a sturdy step ladder, rags, gloves. One roller sleeve per colour.

## Buying tips
- Price per litre usually drops with bigger cans; the estimator compares the actual shop prices.
- Buy all cans of a colour together (same batch). If you open more than one can, mix them in a bucket (boxing) so the colour matches.
- Keep about 0.5 L of each colour for touch-ups.
- Low-VOC paints reduce smell; keep windows open and take breaks anyway.

## Leftovers
Close lids tightly, store upside down above freezing, label with room and date. Do not pour paint down drains; take dried or liquid paint to the local waste or recycling point.
FILE:templates/paint-shopping-list.md
# Paint Shopping List - <home / project> - <date>

**Units:** <metric / imperial>  **Waste allowance:** <10%>  **Shop:** <name>

## Rooms
| Room | Surface | Area | Coats | Paint | Notes (primer, repairs) |
|---|---|---|---|---|---|
| | | | | | |

## Paint to buy
| Paint (brand, colour code, finish) | Needed | Cans | Price |
|---|---|---|---|
| | | | |

## Primer and supplies
- [ ] Primer: <type>, <qty>
- [ ] Rollers <n>, sleeves <n>, tray, extension pole
- [ ] Brushes <sizes>, masking tape <rolls>, drop sheets <n>
- [ ] Filler, sandpaper, sugar soap

**Total estimate:** <paint> + <primer and supplies> = <total>

## Work order
1. Prep and repairs: <rooms>
2. Primer: <rooms>
3. Ceilings: <rooms>
4. Walls: <rooms>
5. Trim and doors: <rooms>
FILE:examples/two-bedroom-flat-refresh.json
{
  "name": "two-bedroom flat refresh before moving in (example prices)",
  "units": "metric",
  "currency": "TRY",
  "waste": 0.1,
  "paints": {
    "wall matte warm white": {"coverage": 11, "cans": [{"size": 15, "price": 2350}, {"size": 7.5, "price": 1290}, {"size": 2.5, "price": 520}]},
    "sage green (kids room)": {"coverage": 10, "cans": [{"size": 7.5, "price": 1450}, {"size": 2.5, "price": 590}, {"size": 0.75, "price": 240}]},
    "ceiling white": {"coverage": 12, "cans": [{"size": 15, "price": 1650}, {"size": 3.5, "price": 460}]}
  },
  "rooms": [
    {"name": "living room", "length": 5.4, "width": 4.2, "height": 2.7,
     "openings": [{"type": "door", "w": 0.9, "h": 2.05}, {"type": "balcony door", "w": 1.8, "h": 2.2}, {"type": "window", "w": 1.5, "h": 1.4}],
     "walls": {"paint": "wall matte warm white", "coats": 2}, "ceiling": {"paint": "ceiling white", "coats": 2}},
    {"name": "main bedroom", "length": 4.0, "width": 3.5, "height": 2.7, "previous": "dark", "new": "light",
     "openings": [{"type": "door", "w": 0.9, "h": 2.05}, {"type": "window", "w": 1.4, "h": 1.4}],
     "walls": {"paint": "wall matte warm white", "coats": 2}, "ceiling": {"paint": "ceiling white", "coats": 2}},
    {"name": "kids room", "length": 3.4, "width": 3.0, "height": 2.7, "new_surface": true,
     "openings": [{"type": "door", "w": 0.8, "h": 2.05}, {"type": "window", "w": 1.2, "h": 1.4}],
     "walls": {"paint": "sage green (kids room)", "coats": 2}, "ceiling": {"paint": "ceiling white", "coats": 1}},
    {"name": "hallway", "length": 4.5, "width": 1.2, "height": 2.7, "texture": "light",
     "openings": [{"type": "doors", "w": 0.9, "h": 2.05, "count": 5}],
     "walls": {"paint": "wall matte warm white", "coats": 2}, "ceiling": {"paint": "ceiling white", "coats": 2}}
  ]
}
FILE:scripts/paint_estimate.py
#!/usr/bin/env python3
"""Room paint quantity and cost estimator (Python 3 standard library only).

Input: a painting job JSON file:
  {"units": "metric", "waste": 0.1, "currency": "TRY",
   "paints": {"wall white": {"coverage": 11, "cans": [{"size": 10, "price": 1450}, {"size": 2.5, "price": 450}]}},
   "rooms": [{"name": "living room", "length": 5.2, "width": 4.1, "height": 2.7,
              "openings": [{"type": "door", "w": 0.9, "h": 2.05}, {"type": "window", "w": 1.6, "h": 1.4, "count": 2}],
              "walls": {"paint": "wall white", "coats": 2},
              "ceiling": {"paint": "ceiling white", "coats": 2},
              "texture": "smooth", "previous": "dark", "new": "light", "new_surface": false}]}
units: metric (m, m2, coverage m2 per litre, cans in litres) or imperial (ft, sq ft,
coverage sq ft per US gallon, cans in gallons). coverage = per coat, from the paint can.
Areas: walls = 2 x (length + width) x height - openings; ceiling = length x width.
texture: smooth (x1.0), light (x1.1, e.g. woodchip, orange peel), rough (x1.25, brick, stucco)
multiplies the paint needed. waste (default 0.10) adds rollers, trays, touch-ups.
Volume per surface = area x coats x texture / coverage x (1 + waste); volumes for the same paint
are added up across rooms, then the cheapest can mix that covers it is chosen (fewer litres
left over on ties).
Findings: OPENINGS_TOO_LARGE (HIGH), NO_CAN_MIX (HIGH), DARK_TO_LIGHT and NEW_SURFACE
(MEDIUM: primer or an extra coat), ONE_COAT, COVERAGE_SUSPECT, ODD_HEIGHT, BIG_LEFTOVER (LOW).
Usage:
  python3 paint_estimate.py job.json
  python3 paint_estimate.py job.json --json
  python3 paint_estimate.py --self-test
Exit code: 0 OK, 1 HIGH findings, 2 bad input.
"""
import argparse
import json
import math
import sys

TEXTURE = {"smooth": 1.0, "light": 1.1, "rough": 1.25}
UNITS = {"metric": {"len": "m", "area": "m2", "vol": "L", "cov": (6, 16), "height": (2.2, 4.0)},
         "imperial": {"len": "ft", "area": "sq ft", "vol": "gal", "cov": (250, 450), "height": (7.0, 13.0)}}
LIGHTNESS = {"light": 0, "medium": 1, "dark": 2}


class JobError(ValueError):
    pass


def num(x, what, minimum=0.0, strict=True):
    if isinstance(x, bool) or not isinstance(x, (int, float)) or (x <= minimum if strict else x < minimum):
        raise JobError(f"{what} must be a number {'>' if strict else '>='} {minimum:g}")
    return float(x)


def best_mix(need, cans):
    """Cheapest combination of cans with total size >= need; ties -> less leftover, fewer cans."""
    cans = sorted(cans, key=lambda c: -c["size"])
    best = None

    def rec(i, vol, cost, picked):
        nonlocal best
        if vol >= need - 1e-9:
            key = (round(cost, 6), round(vol - need, 6), sum(picked))
            if best is None or key < best[0]:
                best = (key, list(picked), vol, cost)
            return
        if i == len(cans) or (best is not None and cost > best[0][0] + 1e-9):
            return
        c = cans[i]
        top = math.ceil((need - vol) / c["size"] - 1e-9)
        for k in ([top] if i == len(cans) - 1 else range(top, -1, -1)):
            picked.append(k)
            rec(i + 1, vol + k * c["size"], cost + k * c["price"], picked)
            picked.pop()

    if need <= 0:
        return {"cans": [], "volume": 0.0, "cost": 0.0, "leftover": 0.0}
    rec(0, 0.0, 0.0, [])
    if best is None:
        return None
    _, picked, vol, cost = best
    return {"cans": [{"size": c["size"], "count": k, "price": c["price"]} for c, k in zip(cans, picked) if k],
            "volume": vol, "cost": cost, "leftover": vol - need}


def estimate(job):
    units = str(job.get("units", "metric")).lower()
    if units not in UNITS:
        raise JobError("units must be metric or imperial")
    U = UNITS[units]
    waste = num(job.get("waste", 0.1), "waste", 0, strict=False)
    paints = job.get("paints") or {}
    if not paints:
        raise JobError("paints is empty")
    for pname, p in paints.items():
        num(p.get("coverage"), f"paint {pname!r} coverage")
        if not p.get("cans"):
            raise JobError(f"paint {pname!r} has no cans")
        for c in p["cans"]:
            num(c.get("size"), f"paint {pname!r} can size")
            num(c.get("price", 0), f"paint {pname!r} can price", 0, strict=False)
    rooms = job.get("rooms") or []
    if not rooms:
        raise JobError("rooms is empty")
    findings, lines, need = [], [], {}

    def f(sev, code, where, msg):
        findings.append({"severity": sev, "code": code, "where": where, "message": msg})

    for r in rooms:
        name = r.get("name") or "room"
        L, W, H = (num(r.get(k), f"{name}: {k}") for k in ("length", "width", "height"))
        if not U["height"][0] <= H <= U["height"][1]:
            f("LOW", "ODD_HEIGHT", name, f"height {H:g} {U['len']} is unusual; check the unit and the measurement")
        tex = str(r.get("texture", "smooth")).lower()
        if tex not in TEXTURE:
            raise JobError(f"{name}: texture must be smooth, light or rough")
        openings = 0.0
        for o in r.get("openings") or []:
            cnt = o.get("count", 1)
            if not isinstance(cnt, int) or isinstance(cnt, bool) or cnt < 0:
                raise JobError(f"{name}: opening count must be a whole number >= 0")
            openings += num(o.get("w"), f"{name}: opening w") * num(o.get("h"), f"{name}: opening h") * cnt
        gross = 2 * (L + W) * H
        surfaces = {"walls": gross - openings, "ceiling": L * W}
        if openings >= gross * 0.6:
            f("HIGH", "OPENINGS_TOO_LARGE", name, f"openings {openings:.1f} {U['area']} are {openings / gross:.0%} of the walls; check the measurements")
            surfaces["walls"] = max(surfaces["walls"], 0.0)
        prev, new = r.get("previous"), r.get("new")
        for sname in ("walls", "ceiling"):
            s = r.get(sname)
            if not s:
                continue
            pname = s.get("paint")
            if pname not in paints:
                raise JobError(f"{name} {sname}: unknown paint {pname!r}")
            coats = s.get("coats", 2)
            if not isinstance(coats, int) or isinstance(coats, bool) or coats < 1:
                raise JobError(f"{name} {sname}: coats must be a whole number >= 1")
            cov = float(paints[pname]["coverage"])
            primer = bool(s.get("primer"))
            if sname == "walls" and prev in LIGHTNESS and new in LIGHTNESS and LIGHTNESS[prev] - LIGHTNESS[new] >= 2 and coats < 3 and not primer:
                f("MEDIUM", "DARK_TO_LIGHT", name, "dark to light colour change: add a stain-blocking primer or a third coat")
            if r.get("new_surface") and not primer and coats < 3:
                f("MEDIUM", "NEW_SURFACE", name, f"new plaster or drywall on the {sname}: seal with a mist coat or primer first (it soaks up paint)")
            if coats == 1:
                f("LOW", "ONE_COAT", f"{name} {sname}", "one coat usually looks patchy; plan two")
            vol = surfaces[sname] * coats * TEXTURE[tex] / cov * (1 + waste)
            need[pname] = need.get(pname, 0.0) + vol
            lines.append({"room": name, "surface": sname, "area": round(surfaces[sname], 2), "coats": coats,
                          "paint": pname, "texture": tex, "volume": round(vol, 2)})
    for pname, p in paints.items():
        lo, hi = U["cov"]
        if pname in need and not lo <= p["coverage"] <= hi:
            f("LOW", "COVERAGE_SUSPECT", pname, f"coverage {p['coverage']:g} {U['area']}/{U['vol']} per coat is outside the usual {lo}-{hi}; check the label")
    buys, total = [], 0.0
    for pname in sorted(need):
        mix = best_mix(round(need[pname], 4), paints[pname]["cans"])
        if mix is None:
            f("HIGH", "NO_CAN_MIX", pname, "no can combination found")
            continue
        total += mix["cost"]
        buys.append(dict(mix, paint=pname, need=round(need[pname], 2)))
        if mix["volume"] and mix["leftover"] > 0.3 * mix["volume"] and mix["leftover"] > 1:
            f("LOW", "BIG_LEFTOVER", pname, f"{mix['leftover']:.1f} {U['vol']} left over; keep it for touch-ups or check smaller can prices")
    rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    findings.sort(key=lambda x: rank[x["severity"]])
    return {"name": job.get("name", "painting job"), "units": units, "currency": job.get("currency", ""),
            "waste": waste, "lines": lines, "buy": buys, "total_cost": round(total, 2), "findings": findings}


def g(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


def report(res):
    U = UNITS[res["units"]]
    cur = res["currency"]
    out = [f"# Paint estimate: {res['name']}", "",
           f"Units: {res['units']} ({U['area']}, {U['vol']}); waste allowance {res['waste']:.0%}", "",
           f"| Room | Surface | Area ({U['area']}) | Coats | Paint | Texture | Paint needed ({U['vol']}) |", "|---|---|---|---|---|---|---|"]
    for l in res["lines"]:
        out.append(f"| {l['room']} | {l['surface']} | {g(l['area'])} | {l['coats']} | {l['paint']} | {l['texture']} | {g(l['volume'])} |")
    out += ["", "## Shopping list", f"| Paint | Needed ({U['vol']}) | Buy | Bought ({U['vol']}) | Left over | Cost |", "|---|---|---|---|---|---|"]
    for b in res["buy"]:
        mix = " + ".join(f"{c['count']} x {g(c['size'])} {U['vol']}" for c in b["cans"])
        out.append(f"| {b['paint']} | {g(b['need'])} | {mix} | {g(b['volume'])} | {g(b['leftover'])} | {g(b['cost'])} {cur} |")
    out += ["", f"**Total paint cost: {g(res['total_cost'])} {cur}** (primer, tape, rollers and fillers not included)", "", "## Findings"]
    if not res["findings"]:
        out.append("- none")
    for x in res["findings"]:
        out.append(f"- **{x['severity']} {x['code']}** ({x['where']}): {x['message']}")
    return "\n".join(out) + "\n"


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    cans = [{"size": 10, "price": 100}, {"size": 2.5, "price": 30}]
    m = best_mix(11, cans)
    ok("11 L -> 10 + 2.5 for 130", m["cost"] == 130 and m["volume"] == 12.5)
    m = best_mix(8, cans)
    ok("8 L -> one 10 L (100 < 4 x 30)", m["cans"] == [{"size": 10, "count": 1, "price": 100}])
    m = best_mix(7, cans)
    ok("7 L -> 3 x 2.5 for 90", m["cost"] == 90 and m["leftover"] == 0.5)
    ok("tie prefers less leftover", best_mix(2, [{"size": 4, "price": 10}, {"size": 2, "price": 10}])["volume"] == 2)
    ok("zero need buys nothing", best_mix(0, cans)["cans"] == [])
    base = {"waste": 0, "paints": {"w": {"coverage": 10, "cans": cans}},
            "rooms": [{"name": "r", "length": 4, "width": 3, "height": 2.5, "walls": {"paint": "w", "coats": 2}}]}
    r = estimate(base)
    ok("wall area 2x(4+3)x2.5 = 35", r["lines"][0]["area"] == 35)
    ok("35 m2 x 2 coats / 10 = 7 L", r["lines"][0]["volume"] == 7)
    ok("clean job has no findings", r["findings"] == [] and r["total_cost"] == 90)
    j = json.loads(json.dumps(base)); j["rooms"][0]["openings"] = [{"w": 0.9, "h": 2, "count": 1}, {"w": 1.2, "h": 1.25, "count": 2}]
    ok("openings subtracted (35 - 1.8 - 3 = 30.2)", estimate(j)["lines"][0]["area"] == 30.2)
    j = json.loads(json.dumps(base)); j["rooms"][0]["ceiling"] = {"paint": "w", "coats": 1}
    r = estimate(j)
    ok("ceiling area 12 and one-coat flagged", r["lines"][1]["area"] == 12 and any(x["code"] == "ONE_COAT" for x in r["findings"]))
    ok("same paint summed across surfaces", r["buy"][0]["need"] == 8.2)
    j = json.loads(json.dumps(base)); j["waste"] = 0.1; j["rooms"][0]["texture"] = "rough"
    ok("rough + 10% waste: 7 x 1.25 x 1.1", estimate(j)["lines"][0]["volume"] == 9.62)
    j = json.loads(json.dumps(base)); j["rooms"][0].update(previous="dark", new="light")
    ok("dark to light flagged", any(x["code"] == "DARK_TO_LIGHT" for x in estimate(j)["findings"]))
    j["rooms"][0]["walls"]["primer"] = True
    ok("primer clears dark to light", not any(x["code"] == "DARK_TO_LIGHT" for x in estimate(j)["findings"]))
    j = json.loads(json.dumps(base)); j["rooms"][0]["new_surface"] = True
    ok("new surface flagged", any(x["code"] == "NEW_SURFACE" for x in estimate(j)["findings"]))
    j = json.loads(json.dumps(base)); j["rooms"][0]["openings"] = [{"w": 3, "h": 2.5, "count": 4}]
    ok("openings too large flagged", any(x["code"] == "OPENINGS_TOO_LARGE" for x in estimate(j)["findings"]))
    j = json.loads(json.dumps(base)); j["paints"]["w"]["coverage"] = 30
    ok("coverage suspect flagged", any(x["code"] == "COVERAGE_SUSPECT" for x in estimate(j)["findings"]))
    j = json.loads(json.dumps(base)); j["rooms"][0]["height"] = 8
    ok("metric height 8 m flagged", any(x["code"] == "ODD_HEIGHT" for x in estimate(j)["findings"]))
    imp = {"units": "imperial", "waste": 0, "paints": {"w": {"coverage": 350, "cans": [{"size": 1, "price": 40}, {"size": 5, "price": 170}]}},
           "rooms": [{"name": "r", "length": 12, "width": 10, "height": 8, "walls": {"paint": "w", "coats": 2}}]}
    r = estimate(imp)
    ok("imperial 352 sq ft x2 / 350 -> 2.01 gal -> 3 x 1 gal", r["lines"][0]["area"] == 352 and r["buy"][0]["cans"] == [{"size": 1, "count": 3, "price": 40}])
    j = json.loads(json.dumps(base)); j["paints"]["w"]["cans"] = [{"size": 1, "price": 5}]; j["rooms"][0]["length"] = 40
    ok("big leftover not flagged for exact fit", not any(x["code"] == "BIG_LEFTOVER" for x in estimate(j)["findings"]))
    j = json.loads(json.dumps(base)); j["paints"]["w"]["cans"] = [{"size": 20, "price": 150}]
    ok("big leftover flagged (20 L for 7 L)", any(x["code"] == "BIG_LEFTOVER" for x in estimate(j)["findings"]))
    for mut, label in ((lambda j: j.update(units="cubits"), "bad units"), (lambda j: j.update(paints={}), "no paints"),
                       (lambda j: j["rooms"][0].update(height=0), "zero height"),
                       (lambda j: j["rooms"][0]["walls"].update(paint="x"), "unknown paint"),
                       (lambda j: j["rooms"][0]["walls"].update(coats=1.5), "fractional coats"),
                       (lambda j: j["rooms"][0].update(texture="glitter"), "bad texture"),
                       (lambda j: j.update(rooms=[]), "no rooms")):
        j = json.loads(json.dumps(base))
        mut(j)
        try:
            estimate(j)
            ok(label + " rejected", False)
        except JobError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Estimate paint quantity, cans to buy and cost for rooms.")
    ap.add_argument("file", nargs="?", help="painting job JSON")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("give a job JSON file or --self-test")
    try:
        res = estimate(json.load(open(a.file, encoding="utf-8")))
    except (OSError, json.JSONDecodeError, JobError, AttributeError, TypeError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(res, indent=2) if a.json else report(res), end="\n" if a.json else "")
    return 1 if any(x["severity"] == "HIGH" for x in res["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
