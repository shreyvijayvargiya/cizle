# Hiking Route Time and Water Planner

By @f · general
Language: en · Domains: health, data, education · Source: P01

Source page: https://prompts.chat

```
---
name: hiking-route-time-and-water-planner
description: Plans a day hike leg by leg. Estimates time with Naismith's rule and Langmuir's descent corrections, adjusted for terrain, fitness, pack weight and breaks, gives clock times for each leg, checks the finish against sunset and the latest safe start, and works out water to carry between refills and snacks to pack. Flags after-dark finishes, long dry stretches and hard terrain late in the day. Includes a stdlib Python planner with --self-test.
---

# Hiking Route Time and Water Planner

You help hikers turn a route into a realistic timetable: when they will reach each point, whether they finish in daylight, and how much water and food to carry. You show the rule behind each number, prefer conservative estimates, and always leave room for a slower day. You are not a substitute for local knowledge, a map or a weather forecast, and you say so when it matters.

## Files in this skill

- `scripts/hike_plan.py` - reads a legs CSV and prints a timetable, daylight check, water per stretch, food and findings (Python 3 standard library only)
- `references/time-rules.md` - Naismith's rule, Langmuir's corrections, terrain/fitness/pack factors, breaks and how to calibrate them
- `references/water-food-and-safety.md` - drinking rates, refill planning and water treatment, snacks, daylight margins, turnaround times and the safety checklist
- `templates/hike-plan.md` - the plan to share with the group and leave with a contact at home
- `examples/eagle-ridge-loop.csv` - a 22 km late-October loop with a scramble section and one refill point

## Workflow

### 1. Split the route into legs
Ask for the route (map app or guidebook), the date, and the group: pace, fitness, youngest or slowest member, pack weight. Split the route at summits, passes, huts, junctions and water sources; for each leg get the distance, ascent and descent (from the app's elevation profile) and the terrain type (road, path, rough, scramble, snow, bushwhack). Mark where water can be refilled. Get the sunset time for the date and place, and the forecast temperature.

### 2. Run the planner
'''
python3 scripts/hike_plan.py examples/eagle-ridge-loop.csv --start 09:30 --sunset 17:20 --temp 24 --fitness 1.1 --pack-kg 9
python3 scripts/hike_plan.py my-route.csv --start 07:00 --sunset 20:45 --temp 31 --break-min 15 --json
python3 scripts/hike_plan.py --self-test
'''
Exit code 1 means a HIGH finding (finish after sunset), 2 means bad input.

### 3. Adjust the plan
For AFTER_DARK or SMALL_MARGIN: start earlier (the script prints the latest sensible start), shorten the route, or pick a bail-out point and a turnaround time. For LONG_DRY_STRETCH: add a refill, carry more capacity, or move the long climb to the cool morning. For HARD_TERRAIN_LATE: reverse the loop so the scramble comes first. Explain the formulas from `references/time-rules.md` when asked, and suggest calibrating the fitness factor after the first leg.

### 4. Deliver
Fill `templates/hike-plan.md`: timetable with clock times, turnaround time, water and food list, bail-out options and the emergency details to leave with someone at home.

## Example result
For `examples/eagle-ridge-loop.csv` (22.2 km, +1170 m / -1150 m) starting 09:30 at fitness 1.1 and 24 C: 7h08 moving, 8h19 with breaks, finish about 17:49, which is 29 minutes after the 17:20 sunset (HIGH AFTER_DARK; latest sensible start 08:01). The first four legs have no water, so 4.4 L must be carried (MEDIUM LONG_DRY_STRETCH). Starting at 08:00 finishes at 16:19 with 61 minutes to spare; the water stretch remains, so the plan adds a 2 L bladder or a cached bottle at Pine Saddle.

## Rules

- Estimates are a starting point: tell the group to compare the real time on the first leg with the plan and rescale.
- Keep at least 60 minutes of daylight in hand, and a headlamp in every pack all year.
- Never suggest drinking untreated water; recommend filtering or treating any natural source.
- Weather, snow, river crossings and route conditions override any timetable: tell users to check the forecast and local reports, and to turn back when conditions change.
- Do not give medical advice beyond basic hydration and food guidance; point to first-aid training and local rescue numbers.
FILE:references/time-rules.md
# Time Rules

## Naismith's rule (1892)
Allow 1 hour for every 5 km on the flat plus 1 hour for every 600 m of ascent (the original was 3 miles per hour plus 1 hour per 2000 ft).
'''
moving minutes = distance_km / pace_kmh * 60 + ascent_m / 10
'''
Example: 4.2 km with 380 m of ascent = 50.4 + 38 = 88 minutes before adjustments.

## Langmuir's corrections for descent
Naismith treats descent like the flat. Langmuir refined it:
- gentle descent, 5 to 12 degrees (about 9 to 21 %): subtract 10 minutes per 300 m of descent
- steep descent, more than 12 degrees: add 10 minutes per 300 m of descent
- under 5 degrees: no change
The script estimates the descent angle from the descent and the share of the leg's distance spent going down. It never lets a leg drop below half its flat time.

## Multipliers used by the script
| Factor | Value | When |
|---|---|---|
| Terrain road | 0.9 | Paved or forest road |
| Terrain path | 1.0 | Good footpath |
| Terrain rough | 1.25 | Rocky, rooty, loose or boggy path |
| Terrain scramble | 1.6 | Hands needed, exposed steps |
| Terrain snow | 1.5 | Soft or old snow without crampon work |
| Terrain bushwhack | 1.6 | No path, vegetation |
| Fitness | 0.85 / 1.0 / 1.2 / 1.4 | Fast and fit / average / relaxed or mixed group / young children |
| Pack | +2 % per kg above 10 kg | Overnight or heavy loads |
| Breaks | 10 min per hour (default) | Use 15 to 20 for photo walks, families, big groups |

Terrain multiplies the whole leg, including the climbing time.

## Calibrating
After the first leg, divide the real time by the planned time. If the group took 1h50 for a planned 1h37, the factor is 1.13: rerun with `--fitness` multiplied by that and check the finish again. Groups move at the pace of the slowest person; plan for them.

## Other rules you may meet
- Tranter's corrections: a fitness and fatigue table on top of Naismith, used for long mountain days.
- Tobler's hiking function: speed = 6 * exp(-3.5 * |slope + 0.05|) km/h, used in GIS tools; it gives similar totals on mixed routes.

## Turnaround time
For an out-and-back or a route with a bail-out, set a fixed turnaround time: the latest time you can leave the farthest point and still be back with an hour of daylight. Example: sunset 17:20, keep 60 minutes, the return takes 3h10 -> turn around by 13:10 wherever you are.
FILE:references/water-food-and-safety.md
# Water, Food and Safety

## Drinking rates used by the script
| Temperature | Litres per hour (total time) |
|---|---|
| under 15 C | 0.4 |
| 15 to 24 C | 0.5 |
| 25 to 29 C | 0.75 |
| 30 C and above | 1.0 |
Plus 0.1 L per 100 m of ascent, because climbing makes you sweat more. Needs vary a lot between people; heavy sweaters, children and people at altitude may need more. Drink a little often rather than a lot at once, and add electrolytes (salt tablets, drink mix or salty snacks) on hot days or when drinking more than about 3 L.

## Carry planning
- The start and every leg marked `water_at_end = yes` are refill points.
- Carry = largest amount needed between two refill points plus a 0.5 L reserve.
- More than 3 L (3 kg) is heavy; options are caching water, choosing a route past a hut or spring, or moving the hottest climb to early morning.
- Confirm that springs and huts actually have water at that time of year (many huts close in late autumn; springs dry up in late summer).

## Treating water
Treat all natural water: a hollow-fibre filter (bacteria and protozoa), chlorine dioxide tablets (also viruses, wait the full contact time, often 30 minutes, up to 4 hours for Cryptosporidium), UV pens for clear water, or boiling for 1 minute (3 minutes above 2000 m). Filter cloudy water through a cloth first.

## Food
About 200 to 300 kcal per hour on the move keeps energy steady on a long day: nuts, bars, dried fruit, cheese, sandwiches. The script uses 250 kcal per hour of total time. Pack one extra snack per person as an emergency reserve.

## Daylight
- Get sunset for the exact place and date (weather or astronomy apps). In mountains the sun leaves valleys and east-facing slopes earlier than the official time.
- Civil twilight gives about 20 to 40 minutes of usable light after sunset in mid-latitudes, less in the tropics. Do not plan to use it.
- Keep 60 minutes of daylight in hand (the default `--margin`). Every pack gets a headlamp with charged batteries.

## Safety checklist
- Forecast checked the evening before and the morning of the hike (thunderstorms, wind on ridges, freezing level).
- Route plan, start time, turnaround time and expected return left with someone at home, with who to call and when.
- Map offline on the phone, plus a power bank; paper map and compass on remote routes.
- Layers and a waterproof jacket, hat and gloves above the tree line even in summer, sun protection.
- Small first-aid kit, blister plasters, emergency blanket, whistle.
- Know the local emergency number (112 in Europe, 911 in North America) and the mountain rescue procedure.
- Rule: the group stays together and turns back at the turnaround time, at the first lightning, or when anyone is not feeling well.
FILE:templates/hike-plan.md
# Hike plan: <route name>, <date>

**Group:** <names / number of people>   **Leader:** <name, phone>
**Route:** <22.2 km loop, +1170 m / -1150 m, map link>
**Start:** <08:00 at Eagle Ridge car park>   **Expected finish:** <16:19>   **Sunset:** <17:20>
**Turnaround time:** <13:00 at the summit, whatever happens>
**Latest call-out time for the home contact:** <19:00>

## Timetable
| Leg | km | Up / down m | Terrain | Planned start | Planned end | Water refill |
|---|---|---|---|---|---|---|
| <Car park to Pine Saddle> | <4.2> | <+380 / -20> | <path> | <08:00> | <09:53> | <no> |

Settings used: <pace 5 km/h, fitness 1.1, breaks 10 min/h, 24 C>. Check the first leg and rescale.

## Water and food
- Carry from the start: <4.4 L per person> (no refill until <Spring Hut>)
- Refill at: <Spring Hut tap (open until end of October?), treat stream water>
- Snacks: <2100 kcal per person> + one spare
- Electrolytes: <yes / no>

## Bail-out options
- <After Pine Saddle: forest road back to the car park, 3.5 km, 1h>
- <Skip the ridge traverse: descend the north path from the summit>

## Kit
- <headlamp, layers, waterproof, map offline + power bank, first aid, whistle, filter or tablets>

## Weather and conditions
- Forecast: <checked on ... : dry, 24 C, wind 20 km/h on ridge>
- Notes: <scramble section is wet after rain; avoid if wet>

## Emergency
- Emergency number: <112>   Mountain rescue: <...>
- Home contact: <name, phone>: if no message by <19:00>, call <number> with this plan.
FILE:examples/eagle-ridge-loop.csv
leg,distance_km,ascent_m,descent_m,terrain,water_at_end
Car park to Pine Saddle,4.2,380,20,path,no
Pine Saddle to Eagle Ridge summit,3.1,520,40,rough,no
Eagle Ridge traverse,1.6,120,150,scramble,no
Ridge down to Spring Hut,3.8,30,560,path,yes
Spring Hut to Blue Lake,4.5,80,210,path,no
Blue Lake back to car park,5.0,40,170,road,yes
FILE:scripts/hike_plan.py
#!/usr/bin/env python3
"""Hiking route time and water planner (Python 3 standard library only).

Reads a CSV of route legs and estimates moving time per leg with Naismith's rule
(5 km/h plus 1 hour per 600 m of ascent) and Langmuir's descent corrections,
adjusted for terrain, fitness and pack weight, then adds breaks, gives clock
times for every leg, checks the finish against sunset, and works out how much
water to carry between refill points and how much food to pack.

CSV columns (header required; ; or , separated):
  leg, distance_km, ascent_m, descent_m, terrain, water_at_end
terrain: road | path | rough | scramble | snow | bushwhack   water_at_end: yes/no

Usage:
  python3 hike_plan.py route.csv --start 08:30 --sunset 17:10 --temp 24
  python3 hike_plan.py route.csv --start 07:00 --fitness 1.2 --pack-kg 14 --json
  python3 hike_plan.py --self-test
Exit codes: 0 = plan fine, 1 = HIGH findings (finish after sunset), 2 = bad input.
"""
import argparse, csv, io, json, math, sys

TERRAIN = {"road": 0.9, "path": 1.0, "trail": 1.0, "rough": 1.25, "scramble": 1.6, "snow": 1.5, "bushwhack": 1.6}
REQUIRED = ["leg", "distance_km", "ascent_m", "descent_m", "terrain", "water_at_end"]
SEV = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class InputError(Exception):
    pass


def num(v, field, row):
    try:
        x = float(str(v).strip().replace(",", "."))
    except ValueError:
        raise InputError(f"row {row}: {field} '{v}' is not a number")
    if x < 0:
        raise InputError(f"row {row}: {field} cannot be negative")
    return x


def hm(s):
    try:
        h, m = s.strip().split(":")
        h, m = int(h), int(m)
        assert 0 <= h < 24 and 0 <= m < 60
        return h * 60 + m
    except Exception:
        raise InputError(f"time '{s}' must be HH:MM")


def clock(mins):
    mins = int(round(mins))
    day, rem = divmod(mins, 1440)
    return f"{rem // 60:02d}:{rem % 60:02d}" + (f" (+{day}d)" if day else "")


def dur(mins):
    mins = int(round(mins))
    return f"{mins // 60}h{mins % 60:02d}"


def read_legs(text):
    sample = text[:2000]
    delim = ";" if sample.count(";") > sample.count(",") else ","
    rd = csv.DictReader(io.StringIO(text), delimiter=delim)
    if not rd.fieldnames:
        raise InputError("empty CSV")
    fields = [f.strip().lower() for f in rd.fieldnames]
    missing = [c for c in REQUIRED if c not in fields]
    if missing:
        raise InputError("missing columns: " + ", ".join(missing))
    legs = []
    for i, raw in enumerate(rd, start=2):
        r = {k.strip().lower(): (v or "").strip() for k, v in raw.items() if k}
        if not any(r.values()):
            continue
        t = r["terrain"].lower() or "path"
        if t not in TERRAIN:
            raise InputError(f"row {i}: terrain '{t}' must be one of {', '.join(TERRAIN)}")
        w = r["water_at_end"].lower()
        if w not in ("yes", "no", "y", "n", "1", "0", "true", "false", ""):
            raise InputError(f"row {i}: water_at_end must be yes or no")
        legs.append({"leg": r["leg"] or f"Leg {len(legs) + 1}",
                     "distance_km": num(r["distance_km"], "distance_km", i),
                     "ascent_m": num(r["ascent_m"], "ascent_m", i),
                     "descent_m": num(r["descent_m"], "descent_m", i),
                     "terrain": t, "water_at_end": w in ("yes", "y", "1", "true")})
    if not legs:
        raise InputError("no legs in CSV")
    return legs


def water_rate(temp_c):
    """Litres per hour of total time, before the ascent extra."""
    if temp_c < 15:
        return 0.4
    if temp_c < 25:
        return 0.5
    if temp_c < 30:
        return 0.75
    return 1.0


def leg_minutes(leg, pace_kmh):
    d, up, down = leg["distance_km"], leg["ascent_m"], leg["descent_m"]
    flat = d / pace_kmh * 60
    climb = up / 10.0  # Naismith: 60 min per 600 m
    descent_adj = 0.0
    steep = False
    if down > 0 and d > 0:
        horiz = d * 1000 * (down / (up + down))  # share of the leg spent descending
        angle = math.degrees(math.atan(down / horiz)) if horiz > 0 else 90
        if 5 <= angle <= 12:
            descent_adj = -down / 300 * 10   # Langmuir: gentle descent is faster
        elif angle > 12:
            descent_adj = down / 300 * 10    # steep descent is slower
        steep = angle > 14
    if up > 0 and d > 0:
        horiz_up = d * 1000 * (up / (up + down))
        steep = steep or math.degrees(math.atan(up / horiz_up)) > 14  # about 25 %
    return max(flat + climb + descent_adj, flat * 0.5), steep


def plan(legs, start, sunset=None, pace=5.0, fitness=1.0, pack_kg=8.0, break_min=10.0, temp=18.0, margin=60):
    if pace <= 0 or fitness <= 0:
        raise InputError("pace and fitness must be positive")
    pack_factor = 1.0 + max(0.0, pack_kg - 10) * 0.02  # +2 % per kg above 10 kg
    rate = water_rate(temp)
    t = start
    rows, findings = [], []
    stretch, stretches, stretch_legs = 0.0, [], []
    for leg in legs:
        base, steep = leg_minutes(leg, pace)
        moving = base * TERRAIN[leg["terrain"]] * fitness * pack_factor
        total = moving * (1 + break_min / 60)
        water = total / 60 * rate + leg["ascent_m"] / 100 * 0.1
        t_start, t = t, t + total
        rows.append({**leg, "moving_min": round(moving), "with_breaks_min": round(total),
                     "start": clock(t_start), "end": clock(t), "end_min": t, "water_l": round(water, 2), "steep": steep})
        stretch += water
        stretch_legs.append(leg["leg"])
        if leg["water_at_end"]:
            stretches.append((stretch, stretch_legs)); stretch, stretch_legs = 0.0, []
        if steep:
            findings.append(("LOW", "STEEP_LEG", f"{leg['leg']}: average gradient over 25 %; expect slower going than the formula and take care on the descent"))
    if stretch_legs:
        stretches.append((stretch, stretch_legs))
    moving_total = sum(r["moving_min"] for r in rows)
    total = t - start
    carry = max(s for s, _ in stretches) + 0.5
    for s, names in stretches:
        if s + 0.5 > 3.0:
            findings.append(("MEDIUM", "LONG_DRY_STRETCH", f"{' -> '.join(names)}: {s + 0.5:.1f} L to carry with no refill; add a refill, cache water or start earlier in the cool"))
    summary = {
        "distance_km": round(sum(l["distance_km"] for l in legs), 1),
        "ascent_m": round(sum(l["ascent_m"] for l in legs)),
        "descent_m": round(sum(l["descent_m"] for l in legs)),
        "moving_min": round(moving_total), "total_min": round(total),
        "start": clock(start), "finish": clock(t),
        "water_total_l": round(sum(r["water_l"] for r in rows), 1),
        "carry_max_l": round(carry, 1),
        "food_kcal": int(round(total / 60 * 250, -1)),
        "water_rate_l_per_h": rate, "pack_factor": round(pack_factor, 2),
    }
    if sunset is not None:
        left = sunset - t
        summary["sunset"] = clock(sunset)
        summary["minutes_before_sunset"] = round(left)
        summary["latest_start"] = clock(sunset - margin - total)
        if left < 0:
            findings.append(("HIGH", "AFTER_DARK", f"finish {clock(t)} is {dur(-left)} after sunset {clock(sunset)}; start by {summary['latest_start']}, shorten the route or plan a bail-out"))
        elif left < margin:
            findings.append(("MEDIUM", "SMALL_MARGIN", f"finish {clock(t)} leaves only {round(left)} min before sunset (target {margin}); start by {summary['latest_start']} and carry a headlamp"))
        for r in rows:
            if r["terrain"] in ("scramble", "snow") and r["end_min"] > sunset - 120:
                findings.append(("MEDIUM", "HARD_TERRAIN_LATE", f"{r['leg']} ({r['terrain']}) ends at {r['end']}, within 2 h of sunset; tired legs and fading light on hard ground"))
    if moving_total > 8 * 60:
        findings.append(("LOW", "LONG_DAY", f"{dur(moving_total)} moving time; check that everyone has done a day this long recently"))
    if temp >= 28 and any(l["ascent_m"] >= 300 for l in legs):
        findings.append(("MEDIUM", "HEAT", f"{temp:g} C with big climbs: start at first light, rest in shade, electrolytes with the water"))
    findings.sort(key=lambda f: SEV[f[0]])
    for r in rows:
        r.pop("end_min")
    return {"legs": rows, "summary": summary, "stretches": [{"legs": n, "litres": round(s + 0.5, 1)} for s, n in stretches],
            "findings": [{"severity": a, "code": b, "message": c} for a, b, c in findings]}


def to_markdown(p, args):
    s = p["summary"]
    out = ["# Hike plan", "",
           f"Settings: pace {args.pace:g} km/h, fitness x{args.fitness:g}, pack {args.pack_kg:g} kg (x{s['pack_factor']}), breaks {args.break_min:g} min per hour, {args.temp:g} C",
           "",
           f"Route: {s['distance_km']} km, +{s['ascent_m']} m / -{s['descent_m']} m; moving {dur(s['moving_min'])}, with breaks {dur(s['total_min'])}",
           f"Start {s['start']}, finish about {s['finish']}" + (f"; sunset {s['sunset']}, " + (f"{s['minutes_before_sunset']} min to spare" if s['minutes_before_sunset'] >= 0 else f"{dur(-s['minutes_before_sunset'])} AFTER sunset") + f"; latest sensible start {s['latest_start']}" if "sunset" in s else ""),
           "", "| Leg | km | Up m | Down m | Terrain | Moving | With breaks | Start | End | Water L | Refill at end |",
           "|---|---|---|---|---|---|---|---|---|---|---|"]
    for r in p["legs"]:
        out.append(f"| {r['leg']} | {r['distance_km']:g} | {r['ascent_m']:g} | {r['descent_m']:g} | {r['terrain']} | {dur(r['moving_min'])} | "
                   f"{dur(r['with_breaks_min'])} | {r['start']} | {r['end']} | {r['water_l']:.1f} | {'yes' if r['water_at_end'] else 'no'} |")
    out += ["", "## Water and food",
            f"- Drinking rate {s['water_rate_l_per_h']} L/h at this temperature plus 0.1 L per 100 m of climbing; total about {s['water_total_l']} L",
            f"- Carry at most {s['carry_max_l']} L (largest stretch between refills, incl. 0.5 L reserve); treat stream water"]
    for st in p["stretches"]:
        out.append(f"  - {' -> '.join(st['legs'])}: {st['litres']} L")
    out.append(f"- Food: about {s['food_kcal']} kcal of snacks (about 250 kcal per hour on the move), plus a spare")
    out += ["", "## Findings"]
    out += [f"- {f['severity']} {f['code']}: {f['message']}" for f in p["findings"]] or ["- none"]
    out += ["", "Estimates only: check them against your group's real pace on the first leg and adjust."]
    return "\n".join(out)


def self_test():
    res = []

    def check(name, cond):
        res.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    def L(d, up, down, terrain="path", water="no", name="x"):
        return {"leg": name, "distance_km": d, "ascent_m": up, "descent_m": down, "terrain": terrain, "water_at_end": water == "yes"}

    check("flat 10 km at 5 km/h = 120 min", round(leg_minutes(L(10, 0, 0), 5)[0]) == 120)
    check("Naismith 600 m climb adds 60 min", round(leg_minutes(L(5, 600, 0), 5)[0]) == 120)
    g = leg_minutes(L(6, 0, 900), 5)[0]  # angle ~8.5 deg: gentle
    check("gentle descent is faster (Langmuir)", round(g) == 72 - 30)
    st = leg_minutes(L(2, 0, 600), 5)  # ~16.7 deg: steep
    check("steep descent is slower and flagged", round(st[0]) == 24 + 20 and st[1])
    check("steep ascent flagged", leg_minutes(L(1, 400, 0), 5)[1])
    check("descent never below half the flat time", leg_minutes(L(10, 0, 1500), 5)[0] >= 60)
    p = plan([L(10, 0, 0)], hm("08:00"), break_min=0)
    check("finish time no breaks", p["summary"]["finish"] == "10:00")
    p = plan([L(10, 0, 0)], hm("08:00"), break_min=10)
    check("10 min break per hour", p["summary"]["total_min"] == 140)
    check("terrain multiplier", plan([L(10, 0, 0, "scramble")], 0, break_min=0)["summary"]["moving_min"] == 192)
    check("fitness multiplier", plan([L(10, 0, 0)], 0, fitness=1.2, break_min=0)["summary"]["moving_min"] == 144)
    check("pack over 10 kg slows", plan([L(10, 0, 0)], 0, pack_kg=15, break_min=0)["summary"]["moving_min"] == 132)
    p = plan([L(10, 0, 0)], hm("15:00"), sunset=hm("16:30"), break_min=0)
    check("AFTER_DARK HIGH", p["findings"][0]["code"] == "AFTER_DARK" and p["findings"][0]["severity"] == "HIGH")
    check("latest start", p["summary"]["latest_start"] == "13:30")
    p = plan([L(10, 0, 0)], hm("14:00"), sunset=hm("16:30"), break_min=0)
    check("SMALL_MARGIN", [f["code"] for f in p["findings"]] == ["SMALL_MARGIN"])
    check("no finding with time to spare", plan([L(10, 0, 0)], hm("08:00"), sunset=hm("18:00"))["findings"] == [])
    check("HARD_TERRAIN_LATE", any(f["code"] == "HARD_TERRAIN_LATE" for f in
          plan([L(3, 0, 0, "scramble")], hm("13:00"), sunset=hm("15:00"))["findings"]))
    check("water rate by temperature", [water_rate(t) for t in (10, 20, 27, 33)] == [0.4, 0.5, 0.75, 1.0])
    p = plan([L(10, 0, 0, water="yes"), L(10, 0, 0)], 0, temp=20, break_min=0)
    check("water per leg", p["legs"][0]["water_l"] == 1.0)
    check("carry = largest stretch + reserve", p["summary"]["carry_max_l"] == 1.5)
    p = plan([L(10, 500, 0), L(10, 0, 500)], 0, temp=31, break_min=0)
    check("LONG_DRY_STRETCH and HEAT", {"LONG_DRY_STRETCH", "HEAT"} <= {f["code"] for f in p["findings"]})
    check("LONG_DAY", any(f["code"] == "LONG_DAY" for f in plan([L(45, 0, 0)], 0)["findings"]))
    check("food kcal", plan([L(10, 0, 0)], 0, break_min=0)["summary"]["food_kcal"] == 500)
    check("clock wraps past midnight", clock(1500) == "01:00 (+1d)")
    legs = read_legs("leg;distance_km;ascent_m;descent_m;terrain;water_at_end\nA;3,5;200;0;Path;yes\n")
    check("semicolon CSV + decimal comma", legs[0]["distance_km"] == 3.5 and legs[0]["water_at_end"])
    for bad, why in [("leg,distance_km\nA,1\n", "missing columns"),
                     ("leg,distance_km,ascent_m,descent_m,terrain,water_at_end\nA,x,0,0,path,no\n", "non-number"),
                     ("leg,distance_km,ascent_m,descent_m,terrain,water_at_end\nA,1,-5,0,path,no\n", "negative"),
                     ("leg,distance_km,ascent_m,descent_m,terrain,water_at_end\nA,1,0,0,lava,no\n", "unknown terrain")]:
        try:
            read_legs(bad); check("rejects " + why, False)
        except InputError:
            check("rejects " + why, True)
    try:
        hm("25:00"); check("rejects bad time", False)
    except InputError:
        check("rejects bad time", True)
    passed = sum(res)
    print(f"{passed}/{len(res)} passed")
    return 0 if passed == len(res) else 1


def main():
    ap = argparse.ArgumentParser(description="Hiking route time and water planner")
    ap.add_argument("csv", nargs="?", help="legs CSV")
    ap.add_argument("--start", help="start time HH:MM")
    ap.add_argument("--sunset", help="sunset time HH:MM")
    ap.add_argument("--pace", type=float, default=5.0, help="flat walking speed km/h (default 5)")
    ap.add_argument("--fitness", type=float, default=1.0, help="time multiplier: 0.85 fast, 1.0 average, 1.2 relaxed, 1.4 with young kids")
    ap.add_argument("--pack-kg", type=float, default=8.0, help="pack weight; +2%% time per kg above 10")
    ap.add_argument("--break-min", type=float, default=10.0, help="break minutes per hour of walking (default 10)")
    ap.add_argument("--temp", type=float, default=18.0, help="expected daytime temperature C")
    ap.add_argument("--margin", type=int, default=60, help="minutes of daylight to keep in hand (default 60)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.csv or not a.start:
        ap.error("give a CSV and --start, or --self-test")
    try:
        with open(a.csv, encoding="utf-8-sig") as fh:
            legs = read_legs(fh.read())
        p = plan(legs, hm(a.start), hm(a.sunset) if a.sunset else None, a.pace, a.fitness, a.pack_kg, a.break_min, a.temp, a.margin)
    except (OSError, InputError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(p, indent=2) if a.json else to_markdown(p, a))
    return 1 if any(f["severity"] == "HIGH" for f in p["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
