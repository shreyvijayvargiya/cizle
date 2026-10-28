# Home Appliance Energy Cost Estimator

By @f · general
Language: en · Domains: math, education, gaming · Source: P01

Source page: https://prompts.chat

```
---
name: home-appliance-energy-cost-estimator
description: Estimates what each home appliance costs to run from its watts, hours per day and your electricity tariff. Reads a CSV, works out kWh and cost per day, month and year, standby (vampire) loads, each appliance's share and off-peak pricing, compares the total with a real bill, and ranks savings ideas such as LED bulbs, 30 C washes and cutting standby by yearly savings. Includes a stdlib Python estimator with --self-test.
---

# Home Appliance Energy Cost Estimator

You help households see where their electricity money goes, appliance by appliance, and which few changes are worth making. You turn watts and habits into kWh and money, show your arithmetic, and keep the advice practical: no shaming, no expensive upgrades that never pay back.

## Files in this skill

- `scripts/energy_cost.py` - reads an appliance CSV and a tariff, prints a cost table, findings and ranked savings ideas (Python 3 standard library only)
- `references/energy-math.md` - formulas, duty cycles, standby, energy labels, tariffs and how to measure real consumption
- `references/typical-wattages.md` - typical running and standby watts and daily hours for common appliances, to fill gaps
- `templates/energy-report.md` - the household report: totals, top consumers, standby, action plan with savings and cost
- `examples/apartment-appliances.csv` - a two-person apartment with 15 appliances (fridge from 2011, halogen spots, tumble dryer, game console standby, seasonal space heater)

## Workflow

### 1. Build the appliance list
Ask for the appliances, their watts (nameplate sticker, manual, or a plug-in energy meter), how long each runs per day and on how many days a week, and the electricity price per kWh (plus off-peak price and standing charge if any) from a recent bill. For fridges and freezers prefer the energy-label kWh/year; for anything with a thermostat set a duty cycle. Fill gaps from `references/typical-wattages.md` and say which values are assumptions. If they have a bill, ask for the monthly kWh to cross-check.

### 2. Run the estimator
'''
python3 scripts/energy_cost.py examples/apartment-appliances.csv --rate 0.32 --offpeak-rate 0.21 --standing-charge 0.40 --bill-kwh 330 --currency EUR
python3 scripts/energy_cost.py my-home.csv --rate 0.15 --currency USD --json
python3 scripts/energy_cost.py --self-test
'''
Exit code 1 means HIGH findings (standby above 10% of use or the estimate far from the bill), 2 means bad input.

### 3. Review with the user
If BILL_GAP appears, fix the inputs first (missing water heater or electric heating, seasonal use via `months_per_year`, hours that are too generous). Then go through the top consumers, the standby list and the ideas. Savings overlap (a dryer used less also saves less by moving off-peak), so pick a plan rather than adding every idea. Use `references/energy-math.md` to explain any number.

### 4. Deliver
Fill `templates/energy-report.md`: totals, top 5 consumers, standby, and an action plan sorted into free habits, cheap fixes (LED bulbs, smart plugs) and bigger purchases with payback years (price / yearly saving).

## Example result
For `examples/apartment-appliances.csv` at EUR 0.32/kWh (off-peak 0.21, standing charge 0.40/day): 12.3 kWh/day, 373 kWh/month, 4479 kWh/year, energy EUR 118.38/month or EUR 1420.54/year (EUR 1566.54 with the standing charge). Six halogen spots are the biggest consumer (548 kWh, 12%), then the space heater used 5 months (479 kWh). Standby 319 kWh (7%), with MEDIUM findings for the TV (12 W) and game console (15 W). Within 13% of the 330 kWh bill, so no BILL_GAP. Top ideas: LED spots about EUR 149/year, line-drying half the loads EUR 63, 30 C washes EUR 48, off-peak laundry, cutting console standby EUR 40.

## Rules

- Show the formula once and the assumptions for every guessed value.
- Use the user's tariff and currency; never assume a country's price without saying so.
- Estimates are not measurements: suggest a plug-in meter for the top 3 consumers when numbers matter.
- Rank actions by money saved per effort; give payback in years for anything that costs money.
- Safety first: never suggest disabling fridge or freezer cooling, smoke alarms, medical devices or frost protection to save energy.
FILE:references/energy-math.md
# Energy Math

## Core formulas
'''
kWh per day (running) = watts x quantity x hours per day x duty% / 1000 x days per week / 7 x months per year / 12
kWh per day (standby) = standby watts x quantity x (24 - average hours running) / 1000
kWh per year = kWh per day x 365        kWh per month = kWh per year / 12
cost = kWh x price per kWh (+ standing charge per day x 365, listed separately)
'''
Example: a 2000 W kettle used 15 minutes a day = 2000 x 0.25 / 1000 = 0.5 kWh/day = 183 kWh/year; at 0.32 per kWh = 58.40 a year.

## Watts vs other numbers on the label
- W (watts) is what you need. kW x 1000 = W.
- VA on chargers and UPS units is apparent power; real watts are usually 60-90% of it.
- mAh or Wh on batteries is capacity, not power draw.
- Nameplate watts are the maximum. Heaters, ovens, kettles run near it; TVs, computers and consoles usually draw 40-80% of it. A plug-in meter gives the truth in a day.

## Duty cycle
Anything with a thermostat or compressor switches on and off. The fraction of time it is really on is the duty cycle.
| Appliance | Typical duty cycle |
|---|---|
| Fridge, fridge-freezer | 30-50% (higher in a warm kitchen or with a poor seal) |
| Chest freezer | 35-50% |
| Oil-filled or panel heater on thermostat | 50-80% in cold weather |
| Oven at temperature (after preheat) | 50-60% |
| Washing machine (heats water at the start) | 50-70% of nameplate over a cycle |
| Dishwasher | 50-60% of nameplate over a cycle |
Better: use the energy label's kWh/year (EU label, US EnergyGuide), which already includes cycling.

## Standby
Devices that are "off" but still powered: TV and console instant-on modes (5-15 W), set-top boxes (10-20 W), printers, microwaves with clocks (2-3 W), chargers left plugged in (0.1-0.5 W). Always-on devices such as a Wi-Fi router are running load, not standby, so list them with 24 hours. 10 W of standby around the clock = 88 kWh/year. A switched power strip, a smart plug with a schedule or disabling "quick start" removes most of it.

## Tariffs
- Flat rate: one price per kWh.
- Time of use: cheaper off-peak hours (often night). Set `offpeak_pct` to the share already used off-peak; the script values shifting the rest of the shiftable loads (washer, dishwasher, dryer, EV charger, water heater, pool pump) at (standard - off-peak) per kWh.
- Tiered/block rates: price rises with monthly use. Use the marginal (top tier) price to value savings.
- Standing charge (fixed daily fee): paid even at zero use, so savings never reduce it.
- Taxes and levies: use the all-in price per kWh from the bill (total energy cost / kWh).

## Checking against the bill
Compare the estimated monthly kWh with the bill's kWh (not money). Within 25% is good for a habit-based estimate. Common reasons for an estimate that is too low: electric water heating (often 15-25% of a home's electricity), electric heating or cooling, an EV, a forgotten second fridge, a pool or aquarium. Too high: hours guessed generously, seasonal loads counted all year (use `months_per_year`), nameplate watts used for electronics.

## Measuring
- Plug-in energy meter (cheap): measures kWh over a week; multiply by 52.
- Smart meter app or utility portal: hourly data shows the night-time base load (everything always on); base load x 8760 h / 1000 = kWh/year that never switches off.
- Read the meter before and after a known run (e.g. one oven hour) with everything else steady.

## Payback
payback years = purchase price / yearly saving. LED bulbs: months. Smart plugs for standby: 1-2 years. Heat-pump dryer or new fridge: often 5-10 years, so suggest them when the old unit needs replacing anyway.
FILE:references/typical-wattages.md
# Typical Wattages and Use

Starting values when the user does not know. Always label them as assumptions; real models vary a lot.

| Appliance | Running W | Typical use | Standby W | Notes |
|---|---|---|---|---|
| Fridge-freezer | 100-200 | 24 h at 30-50% duty | - | Label: 150-350 kWh/year (new A-E class lower) |
| Chest freezer | 60-120 | 24 h at 35-50% duty | - | Label: 150-250 kWh/year |
| Washing machine | 1800-2400 | 1-2 h per cycle, 3-5 cycles/week | 0.5-2 | 0.5-1.0 kWh per 40 C cycle |
| Tumble dryer (vented/condenser) | 2000-3000 | 1-1.5 h per load | 0.5-1 | Heat-pump dryer about half |
| Dishwasher | 1200-2000 | 1-2 h per cycle | 0.5-1 | 0.8-1.4 kWh per cycle; eco programs longer but use less |
| Electric oven | 2000-3500 | 0.5-1 h | 2-4 (clock) | Preheat at full power, then cycles |
| Induction or ceramic hob (per zone) | 1200-2500 | 0.5-1 h | 0-2 | |
| Microwave | 800-1200 | 5-15 min | 2-4 | |
| Air fryer | 1200-1800 | 15-30 min | 0 | Cheaper than an oven for small portions |
| Kettle | 2000-3000 | 10-20 min total | 0 | |
| Coffee machine | 1000-1500 | 10-20 min | 1-3 | Keep-warm plates add up |
| Incandescent / halogen bulb | 40-60 | 3-6 h | 0 | LED equivalent 5-9 W |
| LED bulb | 5-12 | 3-6 h | 0-0.5 (smart bulbs) | |
| TV 43-65 inch LED | 60-150 | 3-5 h | 0.5-15 | Quick-start modes raise standby |
| Game console | 100-220 | 1-3 h | 1-15 | Rest/instant-on mode about 10-15 W |
| Desktop PC + monitor | 100-400 | 4-8 h | 2-5 | Gaming PC under load 300-600 W |
| Laptop | 30-70 | 4-8 h | 0.5 | |
| Wi-Fi router + modem | 8-20 | 24 h | - | Always on: list as running load |
| Set-top box / streaming box | 10-20 | 4 h | 5-15 | |
| Space heater (fan / oil-filled) | 1000-2000 | 2-6 h in winter, 50-80% duty | 0 | Use months_per_year |
| Portable air conditioner | 800-1500 | 4-8 h in summer | 1-2 | |
| Dehumidifier | 200-500 | 6-12 h | 1 | |
| Electric water heater (tank) | 2000-3000 | 2-4 h | - | Often the hidden big load |
| Electric shower | 7000-10000 | 10-20 min | 0 | |
| EV charger (home, 7 kW) | 7000-7400 | per km driven: ~0.15-0.2 kWh/km | 2-5 | Use kWh/year = km/year x 0.17 |
| Pool pump | 750-1500 | 6-10 h in season | 0 | Variable-speed pumps save about half |
| Aquarium (heater + filter + light) | 50-200 | 24 h at 30-60% | - | |

Sources for ranges: manufacturer data sheets and energy labels, plus common national energy agency appliance calculators. Check the user's model when a value drives a decision.
FILE:templates/energy-report.md
# Home electricity report: <household name or address>

**Tariff:** <EUR 0.32/kWh, off-peak 0.21 (23:00-07:00), standing charge 0.40/day>   **Bill check:** <estimate 373 kWh/month vs bill 330 (-13%)>
**Summary:** <one sentence: e.g. "Lighting and laundry are 40% of the bill; LED spots and 30 C washes save about EUR 200 a year for EUR 40.">

## Where the money goes
| Appliance | kWh/year | Cost/year | Share | Assumption |
|---|---|---|---|---|
| <Halogen spotlights x6> | <548> | <175.20> | <12%> | <50 W, 5 h/day> |
| <...> | | | | |

Total: <4479 kWh/year, EUR 1420.54 energy + EUR 146 standing charge>

## Standby (always paid, nothing gained)
<319 kWh/year, about EUR 102. Biggest: game console 15 W, TV 12 W.>

## Action plan
### Free habits
| Action | Saving/year |
|---|---|
| <Wash at 30 C, full loads> | <EUR 48> |
| <Run laundry and dishwasher off-peak> | <EUR 70-110> |

### Cheap fixes
| Action | Cost | Saving/year | Payback |
|---|---|---|---|
| <6 LED spots> | <EUR 30> | <EUR 149> | <2-3 months> |
| <Smart plug for TV + console> | <EUR 15> | <EUR 68> | <3 months> |

### Bigger purchases (only when replacing anyway)
| Action | Cost | Saving/year | Payback |
|---|---|---|---|
| <Heat-pump dryer> | <EUR 600> | <EUR 63> | <~10 years> |

## Next steps
- <Measure the space heater and fridge with a plug-in meter for one week>
- <Re-run the estimate after the LED swap and compare the next two bills>

Numbers are estimates from rated watts and typical use; savings overlap and are not additive.
FILE:examples/apartment-appliances.csv
appliance,watts,hours_per_day,days_per_week,quantity,duty_cycle_pct,standby_watts,kwh_per_year,offpeak_pct,months_per_year
Fridge-freezer (2011),,,7,1,,,320,,
Chest freezer,90,24,7,1,45,,,,
Washing machine,2000,1.5,4,1,60,1.5,,,
Tumble dryer,2500,1,3,1,,0.5,,,
Dishwasher,1800,1.5,5,1,55,1,,30,
Electric oven,2400,1,4,1,60,3,,,
Kettle,2200,0.25,7,1,,,,,
Microwave,1100,0.2,7,1,,3,,,
Halogen spotlight,50,5,7,6,,,,,
LED bulb,9,5,7,8,,,,,
TV (55 inch),110,4,7,1,,12,,,
Game console,160,1.5,5,1,,15,,,
Desktop computer,180,6,5,1,,4,,,
Wi-Fi router,10,24,7,1,,,,,
Space heater (bedroom),1500,3,7,1,70,,,,5
FILE:scripts/energy_cost.py
#!/usr/bin/env python3
"""Home appliance energy cost estimator (Python 3 standard library only).

Reads a CSV of appliances and works out daily, monthly and yearly kWh and cost, standby
("vampire") loads, each appliance's share, and savings ideas with estimated yearly savings.

CSV columns (header required; comma or semicolon; only the first three are required):
  appliance        name, e.g. "Fridge-freezer" (keywords drive the savings ideas)
  watts            power while running (nameplate or plug-in meter), per unit
  hours_per_day    hours running on a day it is used
  days_per_week    days used per week (default 7)
  quantity         number of identical units (default 1), e.g. 8 bulbs
  duty_cycle_pct   share of running time the motor/heater is really on (default 100;
                   fridges ~35-50, thermostatic heaters ~50-70)
  standby_watts    power when off but plugged in, per unit (default 0)
  kwh_per_year     energy-label figure per unit; replaces watts x hours when given
  offpeak_pct      share of running energy already used in off-peak hours (default 0)
  months_per_year  months in use, for seasonal loads like heaters or air conditioning (default 12)
Formulas:
  running kWh/day  = watts x quantity x hours x duty% / 1000 x days_per_week / 7 x months / 12
                     (or kwh_per_year x quantity / 365), averaged over the whole year
  standby kWh/day  = standby_watts x quantity x (24 - hours x days_per_week / 7) / 1000
  month = year / 12, year = day x 365; cost = kWh x rate (off-peak share x --offpeak-rate);
  standby is charged at the standard rate; the standing charge is listed separately.
Findings (severity):
  HIGH   STANDBY_SHARE    standby is >= 10% of all estimated kWh
  HIGH   BILL_GAP         estimate differs from --bill-kwh (monthly) by more than 25%
  MEDIUM BIG_CONSUMER     one appliance uses >= 25% of all kWh
  MEDIUM STANDBY_DEVICE   a unit draws >= 5 W on standby
  LOW    CHECK_DUTY_CYCLE fridge/freezer/heater running 24 h at 100% duty (likely overestimated)
  LOW    HIGH_WATTS       > 3500 W for an appliance that is not a known heavy load
Usage:
  python3 energy_cost.py appliances.csv --rate 0.32 --currency EUR
  python3 energy_cost.py appliances.csv --rate 0.32 --offpeak-rate 0.21 --standing-charge 0.40 --bill-kwh 260 --json
  python3 energy_cost.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import csv
import io
import json
import sys

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
HEAVY = ("heater", "oven", "stove", "hob", "cooktop", "dryer", "kettle", " ev ", "charger", "boiler",
         "water heater", "sauna", "heat pump", "air conditioner", " ac ", "furnace", "pool")
SHIFTABLE = ("wash", "dishwasher", "dryer", " ev ", "ev charger", "pool", "water heater", "boiler")
# keyword -> (idea, share of that appliance's running cost saved)
IDEAS = [
    (("bulb", "lamp", "light"), "replace with LED (about 85% less power for the same light)", 0.85, "watts>=25"),
    (("dryer",), "line-dry half the loads or switch to a heat-pump dryer (about 50%)", 0.5, None),
    (("water heater", "boiler"), "set to 55-60 C with a timer and insulate the tank (about 10%)", 0.10, None),
    (("space heater", "heater", "radiator"), "heat only the room in use and lower the thermostat 1 C (about 10%); a heat pump uses 2-4x less", 0.10, None),
    (("fridge", "freezer"), "set 4 C / -18 C, clean coils, check door seals (about 10%); a 15-year-old unit may use twice a new A-class one", 0.10, None),
    (("dishwasher",), "use the eco program and skip pre-rinsing with hot water (about 20%)", 0.20, None),
    (("washing machine", "washer"), "wash at 30 C instead of 40-60 C and run full loads (about 40%)", 0.40, None),
    (("kettle",), "boil only the water you need (about 25%)", 0.25, None),
    (("oven",), "use a microwave or air fryer for small meals (about 30%)", 0.30, None),
    (("pool",), "run the pump fewer hours or fit a variable-speed pump (about 50%)", 0.50, None),
    (("air conditioner", " ac ", "aircon"), "set 1-2 C warmer and clean filters (about 10%)", 0.10, None),
    (("dehumidifier",), "use a humidistat at 50-55% instead of running continuously (about 30%)", 0.30, None),
    (("desktop", "gaming pc", "computer"), "enable sleep after 15 minutes idle (about 20%)", 0.20, None),
]


class DataError(ValueError):
    pass


def num(row, key, default, line):
    v = (row.get(key) or "").strip().replace(",", ".") if isinstance(row.get(key), str) else row.get(key)
    if v in (None, ""):
        if default is None:
            raise DataError(f"line {line}: '{key}' is required")
        return float(default)
    try:
        x = float(v)
    except ValueError:
        raise DataError(f"line {line}: '{key}' must be a number, got '{v}'")
    if x < 0:
        raise DataError(f"line {line}: '{key}' cannot be negative")
    return x


def read_csv(text):
    first = text.splitlines()[0] if text.strip() else ""
    delim = ";" if first.count(";") > first.count(",") else ","
    rd = csv.DictReader(io.StringIO(text), delimiter=delim)
    if not rd.fieldnames or not {"appliance", "watts", "hours_per_day"} <= {f.strip().lower() for f in rd.fieldnames}:
        if not rd.fieldnames or "kwh_per_year" not in [f.strip().lower() for f in rd.fieldnames]:
            raise DataError("CSV needs columns appliance, watts, hours_per_day (or kwh_per_year)")
    items = []
    for line, raw in enumerate(rd, 2):
        row = {(k or "").strip().lower(): v for k, v in raw.items()}
        name = (row.get("appliance") or "").strip()
        if not name:
            continue
        label = (row.get("kwh_per_year") or "").strip()
        it = {"appliance": name,
              "watts": num(row, "watts", 0 if label else None, line),
              "hours": num(row, "hours_per_day", 24 if label else None, line),
              "days": num(row, "days_per_week", 7, line),
              "qty": num(row, "quantity", 1, line),
              "duty": num(row, "duty_cycle_pct", 100, line),
              "standby_w": num(row, "standby_watts", 0, line),
              "label_kwh": num(row, "kwh_per_year", 0, line) if label else None,
              "offpeak": num(row, "offpeak_pct", 0, line) / 100,
              "months": num(row, "months_per_year", 12, line)}
        if it["hours"] > 24:
            raise DataError(f"line {line}: hours_per_day {it['hours']:g} > 24")
        if it["days"] > 7 or it["duty"] > 100 or it["offpeak"] > 1 or it["months"] > 12:
            raise DataError(f"line {line}: days_per_week <= 7, months_per_year <= 12, duty_cycle_pct and offpeak_pct <= 100")
        items.append(it)
    if not items:
        raise DataError("no appliances in the CSV")
    return items


def has(name, words):
    low = " " + name.lower() + " "
    return any(w in low for w in words)


def estimate(items, rate, offpeak_rate=None, standing=0.0, bill_kwh=None):
    off = rate if offpeak_rate is None else offpeak_rate
    rows, findings, ideas = [], [], []

    def add(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})
    for it in items:
        avg_hours = it["hours"] * it["days"] / 7
        if it["label_kwh"] is not None:
            run_day = it["label_kwh"] * it["qty"] / 365
        else:
            run_day = it["watts"] * it["qty"] * avg_hours * it["duty"] / 100 / 1000 * it["months"] / 12
        sb_day = it["standby_w"] * it["qty"] * (24 - avg_hours) / 1000
        run_cost_y = run_day * 365 * ((1 - it["offpeak"]) * rate + it["offpeak"] * off)
        sb_cost_y = sb_day * 365 * rate
        rows.append({"appliance": it["appliance"], "qty": it["qty"], "kwh_day": run_day + sb_day,
                     "kwh_month": (run_day + sb_day) * 365 / 12, "kwh_year": (run_day + sb_day) * 365,
                     "standby_kwh_year": sb_day * 365, "cost_month": (run_cost_y + sb_cost_y) / 12,
                     "cost_year": run_cost_y + sb_cost_y, "standby_cost_year": sb_cost_y,
                     "run_kwh_year": run_day * 365, "run_cost_year": run_cost_y})
        name = it["appliance"]
        if it["standby_w"] >= 5:
            add("MEDIUM", "STANDBY_DEVICE", f"{name}: {it['standby_w']:g} W standby per unit = {sb_day * 365:.0f} kWh/year; a switched power strip or unplugging saves {sb_cost_y:.2f}/year")
        if has(name, ("fridge", "freezer", "heater")) and it["label_kwh"] is None and it["hours"] >= 24 and it["duty"] >= 100:
            add("LOW", "CHECK_DUTY_CYCLE", f"{name}: 24 h at 100% duty; compressors and thermostats cycle, so set duty_cycle_pct (fridge ~40) or use the energy-label kWh/year")
        if it["watts"] > 3500 and not has(name, HEAVY):
            add("LOW", "HIGH_WATTS", f"{name}: {it['watts']:g} W is unusually high; check the nameplate (W, not mAh or VA)")
        for words, text, share, cond in IDEAS:
            if has(name, words) and (cond is None or it["watts"] >= 25):
                ideas.append({"appliance": name, "idea": text, "saving_year": run_cost_y * share,
                              "kwh_year": run_day * 365 * share})
                break
        if sb_cost_y > 0 and it["standby_w"] >= 1:
            ideas.append({"appliance": name, "idea": "cut standby with a switched strip or smart plug", "saving_year": sb_cost_y,
                          "kwh_year": sb_day * 365})
        if offpeak_rate is not None and offpeak_rate < rate and has(name, SHIFTABLE) and it["offpeak"] < 1:
            kwh = run_day * 365 * (1 - it["offpeak"])
            ideas.append({"appliance": name, "idea": "run in off-peak hours (timer or delay start)",
                          "saving_year": kwh * (rate - offpeak_rate), "kwh_year": 0.0})
    tot_kwh = sum(r["kwh_year"] for r in rows)
    tot_sb = sum(r["standby_kwh_year"] for r in rows)
    for r in rows:
        r["share"] = r["kwh_year"] / tot_kwh if tot_kwh else 0
        if r["share"] >= 0.25:
            add("MEDIUM", "BIG_CONSUMER", f"{r['appliance']} is {r['share']:.0%} of the estimated use ({r['kwh_year']:.0f} kWh/year); check it first")
    if tot_kwh and tot_sb / tot_kwh >= 0.10:
        add("HIGH", "STANDBY_SHARE", f"standby is {tot_sb / tot_kwh:.0%} of all use ({tot_sb:.0f} kWh/year, {tot_sb * rate:.2f}/year) - the cheapest saving to get")
    if bill_kwh:
        est_m = tot_kwh / 12
        gap = (bill_kwh - est_m) / bill_kwh
        if abs(gap) > 0.25:
            add("HIGH", "BILL_GAP", f"estimate {est_m:.0f} kWh/month vs bill {bill_kwh:g} kWh/month ({gap:+.0%}); "
                + ("missing appliances (water heating, electric heating, EV?) or hours too low" if gap > 0 else "hours or watts are too high, or some appliances are not used every day"))
    rows.sort(key=lambda r: -r["kwh_year"])
    ideas.sort(key=lambda x: -x["saving_year"])
    findings.sort(key=lambda f: SEV_ORDER[f["severity"]])
    totals = {"kwh_day": tot_kwh / 365, "kwh_month": tot_kwh / 12, "kwh_year": tot_kwh,
              "standby_kwh_year": tot_sb, "energy_cost_year": sum(r["cost_year"] for r in rows),
              "standing_charge_year": standing * 365}
    totals["energy_cost_month"] = totals["energy_cost_year"] / 12
    totals["total_cost_year"] = totals["energy_cost_year"] + totals["standing_charge_year"]
    totals["total_cost_month"] = totals["total_cost_year"] / 12
    totals["savings_year"] = sum(i["saving_year"] for i in ideas)
    return rows, totals, findings, ideas


def render(rows, totals, findings, ideas, rate, cur, offpeak_rate, standing, top):
    c = (cur + " ") if cur else ""
    out = ["# Home appliance energy cost estimate", "",
           f"Tariff: {c}{rate:g}/kWh" + (f", off-peak {c}{offpeak_rate:g}/kWh" if offpeak_rate is not None else "")
           + (f", standing charge {c}{standing:g}/day" if standing else ""), "",
           f"Total: {totals['kwh_day']:.1f} kWh/day, {totals['kwh_month']:.0f} kWh/month, {totals['kwh_year']:,.0f} kWh/year; "
           f"energy {c}{totals['energy_cost_month']:,.2f}/month, {c}{totals['energy_cost_year']:,.2f}/year"
           + (f"; with standing charge {c}{totals['total_cost_year']:,.2f}/year" if standing else ""),
           f"Standby: {totals['standby_kwh_year']:.0f} kWh/year ({totals['standby_kwh_year'] / totals['kwh_year']:.0%})" if totals["kwh_year"] else "", "",
           "| Appliance | Qty | kWh/day | kWh/month | kWh/year | Standby kWh/yr | Cost/month | Cost/year | Share |",
           "|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        out.append(f"| {r['appliance']} | {r['qty']:g} | {r['kwh_day']:.2f} | {r['kwh_month']:.1f} | {r['kwh_year']:.0f} | "
                   f"{r['standby_kwh_year']:.0f} | {r['cost_month']:.2f} | {r['cost_year']:.2f} | {r['share']:.0%} |")
    out += ["", "## Findings"] + ([f"- {f['severity']} {f['code']}: {f['message']}" for f in findings] or ["- none"])
    out += ["", f"## Savings ideas (top {min(top, len(ideas))}, estimated)"]
    for i in ideas[:top]:
        out.append(f"- {i['appliance']}: {i['idea']} -> about {c}{i['saving_year']:.2f}/year" + (f", {i['kwh_year']:.0f} kWh" if i["kwh_year"] else ""))
    if len(ideas) > top:
        out.append(f"- ... {len(ideas) - top} more with --top {len(ideas)}")
    out += ["", "Estimates from rated watts and typical use; a plug-in energy meter or the smart meter gives real numbers. Savings overlap, so do not add them all up."]
    return "\n".join(out)


def self_test():
    results = []

    def check(name, cond):
        results.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    def run(csv_text, **kw):
        return estimate(read_csv(csv_text), kw.pop("rate", 0.30), **kw)
    rows, t, f, i = run("appliance,watts,hours_per_day\nKettle,2000,0.5\n")
    check("1 kWh/day kettle", abs(rows[0]["kwh_day"] - 1.0) < 1e-9)
    check("365 kWh/year", abs(t["kwh_year"] - 365) < 1e-9)
    check("cost per year at 0.30", abs(t["energy_cost_year"] - 109.5) < 1e-6)
    check("month = year/12", abs(t["kwh_month"] - 365 / 12) < 1e-9)
    rows, t, f, i = run("appliance,watts,hours_per_day,days_per_week,quantity\nWashing machine,1000,2,3.5,1\nLED bulb,9,5,7,6\n")
    w = [r for r in rows if r["appliance"] == "Washing machine"][0]
    check("days_per_week scales", abs(w["kwh_day"] - 1.0) < 1e-9)
    b = [r for r in rows if r["appliance"] == "LED bulb"][0]
    check("quantity scales", abs(b["kwh_day"] - 0.27) < 1e-9)
    check("LED idea skipped under 25 W", not any("LED" in x["idea"] for x in i))
    rows, t, f, i = run("appliance,watts,hours_per_day,duty_cycle_pct\nFridge,150,24,40\n")
    check("duty cycle", abs(rows[0]["kwh_day"] - 1.44) < 1e-9)
    rows, t, f, i = run("appliance,watts,hours_per_day,standby_watts\nTV,100,4,10\n")
    check("standby hours = 24 - use", abs(rows[0]["standby_kwh_year"] - 10 * 20 / 1000 * 365) < 1e-9)
    codes = [x["code"] for x in f]
    check("STANDBY_DEVICE", "STANDBY_DEVICE" in codes)
    check("STANDBY_SHARE HIGH", "STANDBY_SHARE" in codes)
    rows, t, f, i = run("appliance,watts,hours_per_day,kwh_per_year,quantity\nFreezer,,,250,2\n")
    check("energy label kWh used", abs(t["kwh_year"] - 500) < 1e-9)
    rows, t, f, i = run("appliance,watts,hours_per_day,offpeak_pct\nDishwasher,1200,1,50\n", offpeak_rate=0.15)
    check("off-peak share priced", abs(rows[0]["cost_year"] - 1.2 * 365 * (0.5 * 0.30 + 0.5 * 0.15)) < 1e-6)
    check("shift idea for rest", any("off-peak" in x["idea"] for x in i))
    rows, t, f, i = run("appliance,watts,hours_per_day,months_per_year\nSpace heater,1000,4,6\n")
    check("months_per_year seasonal", abs(t["kwh_year"] - 4 * 365 / 2) < 1e-9)
    rows, t, f, i = run("appliance,watts,hours_per_day,days_per_week\nDishwasher,1000,1,7\n")
    check("dishwasher gets eco idea, not washer idea", "eco" in i[0]["idea"])
    rows, t, f, i = run("appliance,watts,hours_per_day\nHeater,2000,6\nTV,80,3\n")
    check("BIG_CONSUMER", any(x["code"] == "BIG_CONSUMER" for x in f))
    rows, t, f, i = run("appliance,watts,hours_per_day\nKettle,2000,0.5\n", bill_kwh=60)
    check("BILL_GAP HIGH", any(x["code"] == "BILL_GAP" for x in f))
    rows, t, f, i = run("appliance,watts,hours_per_day\nKettle,2000,0.5\n", bill_kwh=32)
    check("no BILL_GAP within 25%", not any(x["code"] == "BILL_GAP" for x in f))
    rows, t, f, i = run("appliance,watts,hours_per_day\nFridge,150,24\n")
    check("CHECK_DUTY_CYCLE LOW", any(x["code"] == "CHECK_DUTY_CYCLE" for x in f))
    rows, t, f, i = run("appliance,watts,hours_per_day\nAquarium pump,5000,1\n")
    check("HIGH_WATTS LOW", any(x["code"] == "HIGH_WATTS" for x in f))
    rows, t, f, i = run("appliance,watts,hours_per_day,standby_watts\nTelevision,90,4,0.5\nWater heater,2000,3,0\n", offpeak_rate=0.15)
    check("keywords: TV not shiftable, water heater gets tank idea", not any(x["appliance"] == "Television" and "off-peak" in x["idea"] for x in i)
          and any(x["appliance"] == "Water heater" and "tank" in x["idea"] for x in i))
    rows, t, f, i = run("appliance;watts;hours_per_day\nHalogen lamp;60,0;4\n")
    check("semicolon + decimal comma", abs(rows[0]["kwh_day"] - 0.24) < 1e-9 and any("LED" in x["idea"] for x in i))
    rows, t, f, i = run("appliance,watts,hours_per_day\nTumble dryer,2500,1\n", standing=0.5)
    check("standing charge separate", abs(t["standing_charge_year"] - 182.5) < 1e-9 and abs(t["total_cost_year"] - t["energy_cost_year"] - 182.5) < 1e-9)
    check("dryer idea 50%", abs(i[0]["saving_year"] - 2.5 * 365 * 0.30 * 0.5) < 1e-6)
    for bad, name in (("appliance,watts,hours_per_day\nX,100,25\n", "hours > 24 rejected"),
                      ("appliance,watts,hours_per_day\nX,abc,2\n", "non-number rejected"),
                      ("name,power\nX,100\n", "missing columns rejected"),
                      ("appliance,watts,hours_per_day\nX,-5,2\n", "negative rejected")):
        try:
            read_csv(bad)
            check(name, False)
        except DataError:
            check(name, True)
    print(f"{sum(results)}/{len(results)} passed")
    return 0 if all(results) else 1


def main():
    ap = argparse.ArgumentParser(description="Home appliance energy cost estimator")
    ap.add_argument("csv", nargs="?", help="appliances CSV")
    ap.add_argument("--rate", type=float, help="price per kWh (standard rate)")
    ap.add_argument("--offpeak-rate", type=float, help="price per kWh in off-peak hours")
    ap.add_argument("--standing-charge", type=float, default=0.0, help="fixed charge per day")
    ap.add_argument("--currency", default="", help="label, e.g. EUR, USD, TRY")
    ap.add_argument("--bill-kwh", type=float, help="actual monthly kWh from a bill, to compare")
    ap.add_argument("--top", type=int, default=8, help="savings ideas to show (default 8)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.csv or a.rate is None:
        ap.error("give a CSV and --rate, or --self-test")
    try:
        with open(a.csv, encoding="utf-8-sig") as fh:
            items = read_csv(fh.read())
        rows, totals, findings, ideas = estimate(items, a.rate, a.offpeak_rate, a.standing_charge, a.bill_kwh)
    except (OSError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if a.json:
        print(json.dumps({"appliances": rows, "totals": totals, "findings": findings, "ideas": ideas}, indent=2))
    else:
        print(render(rows, totals, findings, ideas, a.rate, a.currency, a.offpeak_rate, a.standing_charge, a.top))
    return 1 if any(f["severity"] == "HIGH" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
