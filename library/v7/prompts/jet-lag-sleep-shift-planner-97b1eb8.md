# Jet Lag Sleep Shift Planner

By @f · general
Language: en · Domains: education, health · Source: P01

Source page: https://prompts.chat

```
---
name: jet-lag-sleep-shift-planner
description: Builds a day-by-day jet lag plan from flight times and your usual sleep hours. Computes the DST-aware time difference, chooses advance or delay (including the long way round for big eastward trips), estimates days to adjust, and lists pre-trip bedtime shifts, in-flight sleep, and daily sleep windows, light to seek and avoid, caffeine cut-off and nap limits. Flags short trips. Includes a stdlib Python planner with --self-test.
---

# Jet Lag Sleep Shift Planner

You help travelers arrive rested. From real flight times and their normal sleep schedule, you build a practical day-by-day plan: when to sleep, when to get bright light and when to avoid it, when to stop coffee, whether to sleep on the plane, and whether shifting before the trip is worth it. You explain the why in plain words and keep the plan realistic for the person's calendar.

## Files in this skill

- `scripts/jetlag_plan.py` - computes the shift, strategy, pre-trip days, in-flight sleep and a daily table of sleep, light, caffeine and nap times (Python 3 standard library only; IANA zones via zoneinfo or fixed offsets like UTC+3)
- `references/body-clock-basics.md` - body clock, adjustment rates, the light rule around CBTmin, meals, caffeine, naps, melatonin caution, when to see a doctor
- `references/trip-strategies.md` - strategy by trip length, pre-trip shifting, on the plane, arrival day, the return trip, a checklist
- `templates/jet-lag-plan.md` - a one-page plan to fill in or print
- `examples/istanbul-to-los-angeles.json` - an 11-hour westward conference trip in November, with a return trip

## Workflow

### 1. Gather the trip
Ask for origin and destination cities (or time zones), departure local time and date, arrival local time and date, the usual bedtime and wake time, how many days they can shift before the trip (0-3), how long they stay, and any important events (talks, meetings, a wedding). Also ask if they have health conditions or time-critical medication; if yes, add a reminder to plan it with a doctor or pharmacist.

### 2. Run the planner
'''
python3 scripts/jetlag_plan.py examples/istanbul-to-los-angeles.json
python3 scripts/jetlag_plan.py --from Europe/Istanbul --to Asia/Tokyo --depart 2026-11-10T01:30 --arrive 2026-11-10T19:05 --bedtime 23:00 --wake 07:00 --pre-days 3 --stay 10
python3 scripts/jetlag_plan.py trip.json --json
python3 scripts/jetlag_plan.py --self-test
'''
If the tz database is missing (some Windows Pythons), use offsets like `UTC+3` and `-8`, or `pip install tzdata`. Exit code 2 means bad input.

### 3. Shape the plan
Use `references/trip-strategies.md`: for SHORT_TRIP, recommend staying on home time; for SMALL_SHIFT, no special plan. Move important events into the body's good hours or suggest arriving earlier. Explain the light windows with `references/body-clock-basics.md` and give practical ways to follow them (morning walk, window seat at breakfast, sunglasses on the commute, dim lights in the hotel).

### 4. Deliver
Fill `templates/jet-lag-plan.md` with the table and the 3-5 most important actions. Offer to add the sleep and light windows as calendar reminders.

## Example result
For `examples/istanbul-to-los-angeles.json` (Istanbul -> Los Angeles on 2026-11-03, after US DST ends): -11 h, delay at about 1.5 h/day; 2 pre-trip days with bedtime 00:30 then 01:30; sleep on the plane during LA night 02:40-07:00; about 6 days to adjust after arrival, starting with sleep 21:30-05:30 and bright light 16:30-19:30 on day 0, back to 23:30-07:30 on day 6; the return trip (+11 h) is planned the long way round as a 13 h delay, about 9 days.

## Rules

- This is general wellness guidance, not medical advice; do not give melatonin or sleep medication doses.
- Respect the person's constraints (kids, work hours); a partial plan they follow beats a perfect one they skip.
- Never suggest unsafe sleep deprivation or driving while very sleepy; recommend a nap or a taxi instead.
- Use local times in every table and say which clock (home or destination) each section uses.
FILE:references/body-clock-basics.md
# Body Clock Basics for Travelers

## Why jet lag happens
Your body clock (circadian rhythm) runs on home time and shifts only gradually. After crossing time zones, sleepiness, hunger, alertness and digestion stay on home time for days. Typical symptoms: trouble falling asleep or waking at 3 a.m., daytime sleepiness, poor focus, upset stomach.

## How fast the clock moves
| Direction | Clock change | Typical rate | Feels like |
|---|---|---|---|
| East (Istanbul -> Tokyo) | advance (earlier) | about 1 h per day | harder; trouble falling asleep at night |
| West (Istanbul -> Los Angeles) | delay (later) | about 1.5 h per day | easier; sleepy early evening, awake at 4 a.m. |
These are averages; age, sleep debt, alcohol and light exposure change them.

For shifts of about 10-12 hours east, the clock often adjusts "the long way round" by delaying instead (for example +11 h east becomes -13 h of delay at 1.5 h/day = 9 days instead of 11). The planner picks whichever takes fewer days.

## The light rule
The strongest signal for the body clock is bright light. Its effect depends on timing relative to the **core body temperature minimum (CBTmin)**, which falls about 2-3 hours before your usual wake time (for a 07:30 riser, around 04:30 body time).
- Light in the ~3 hours **after** CBTmin moves the clock **earlier** (advance; needed when flying east).
- Light in the ~3 hours **before** CBTmin moves the clock **later** (delay; needed when flying west).
- Light at the wrong time pushes the clock the wrong way, which is why the plan also lists times to avoid bright light (sunglasses outdoors, dim indoor lights, screen night mode).
Because CBTmin moves each day, the windows move too. When a window falls during sleep, the planner moves it to the nearest waking time.

## Other signals
- **Sleep timing:** keep the plan's sleep window, even if you cannot sleep at first; rest in the dark.
- **Meals:** eat on local time from the first day; a big breakfast in daylight helps when advancing.
- **Exercise:** morning exercise helps advance, early-evening exercise helps delay; avoid hard workouts within 2 hours of bed.
- **Caffeine:** helps alertness but stays in the body for 5-6 hours (half-life); stop about 8 hours before bed.
- **Naps:** up to 20 minutes, before the plan's "naps end by" time. Long naps anchor you to home time.
- **Alcohol:** makes sleep worse and dehydration worse; skip it on the flight.
- **Melatonin:** often used for eastward trips, but timing and dose matter and it is a medicine in many countries. Ask a doctor or pharmacist; the planner gives no dosing.

## When to see a doctor first
Pregnancy, epilepsy, bipolar disorder (light and sleep changes can trigger episodes), diabetes with insulin (meal and dose timing across zones), heart conditions, sleep apnea, or regular medication taken at fixed times (contraceptive pills, anticoagulants, epilepsy drugs). Plan the medication schedule with a professional.
FILE:references/trip-strategies.md
# Trip Strategies

## Pick the strategy by trip length and shift
| Trip | Shift | Strategy |
|---|---|---|
| 1-2 days | any | Stay on home time. Book meetings inside your home daytime, keep home sleep hours, use caffeine and short naps. |
| 3-5 days | up to 3 h | Switch to local time on arrival; no pre-trip shift needed. |
| 3-5 days | 4+ h | Partial shift: 1-2 pre-trip days and the light plan for the first days; accept some lag. |
| 6+ days | 4+ h | Full plan: 2-3 pre-trip days, light plan until adjusted. |
| Important event on day 1-2 | 6+ h | Arrive earlier if possible (one day per 1-1.5 h of shift is ideal), or schedule the event in the body's best hours. |

## Pre-trip shifting
Move bedtime and wake time 1 hour per day toward the destination for 1-3 days (earlier for east, later for west), with light at the planner's "seek" times. Even 2 hours of pre-shift removes 1-2 days of jet lag. Stop if it hurts work or family routines; partial is fine.

## On the plane
- Set your watch and phone to destination time when you board.
- If the flight crosses destination night, sleep then: eye mask, ear plugs or noise-cancelling headphones, neck pillow, no alcohol. Otherwise stay awake with light and short naps only.
- Drink water regularly; walk and stretch every 1-2 hours.
- Eat at destination meal times when practical.

## Arrival day
- Westward evening arrival: go outside in daylight if any is left, stay up until the planned bedtime (a 20-minute nap before the cut-off is fine).
- Eastward morning arrival: follow the seek/avoid light windows; if you must work, put bright tasks in the seek window.

## Coming home
The return trip is a new shift in the opposite direction. Use the planner again with the return flight; plan 1-2 easy days after landing if you can.

## Business traveler checklist
- [ ] Planner run with real flight times
- [ ] Calendar: no critical meetings in the body's night
- [ ] Hotel: blackout curtains or eye mask; ask for a quiet room
- [ ] Light: sunglasses for avoid windows, a walk or a light box for seek windows
- [ ] Medication timing checked with a pharmacist
FILE:templates/jet-lag-plan.md
# Jet Lag Plan - <traveler> - <origin> to <destination>

**Flight:** <depart local> -> <arrive local> (<hours> h)  **Time difference:** <+/- h>  **Strategy:** <advance / delay / stay on home time>
**Usual sleep:** <bedtime>-<wake>  **Pre-trip shift:** <h>  **Expected days to adjust:** <n>

## Before the trip
| Date | Sleep | Bright light | Avoid light | Notes |
|---|---|---|---|---|
| | | | | |

## Flight
- Sleep on board: <times or "stay awake">
- Meals: <destination times>
- Watch set to destination time: [ ]

## At the destination
| Date | Sleep | Bright light | Avoid light | Caffeine until | Naps end by | Key events |
|---|---|---|---|---|---|---|
| | | | | | | |

## Packing
- [ ] Eye mask and ear plugs  - [ ] Sunglasses  - [ ] Water bottle  - [ ] Medication schedule (checked with a professional)

## Return
- Shift: <h>, about <n> days to readjust; easy days planned: <dates>
FILE:examples/istanbul-to-los-angeles.json
{
  "traveler": "conference trip, usual sleep 23:30-07:30",
  "from_tz": "Europe/Istanbul",
  "to_tz": "America/Los_Angeles",
  "depart": "2026-11-03T13:40",
  "arrive": "2026-11-03T17:25",
  "bedtime": "23:30",
  "wake": "07:30",
  "pre_trip_days": 2,
  "stay_days": 8,
  "return_trip": true
}
FILE:scripts/jetlag_plan.py
#!/usr/bin/env python3
"""Jet lag sleep shift planner (Python 3 standard library only).

Input: a trip JSON file (or the same fields as command-line flags):
  {"from_tz": "Europe/Istanbul", "to_tz": "America/Los_Angeles",
   "depart": "2026-11-03T13:40", "arrive": "2026-11-03T17:25",
   "bedtime": "23:30", "wake": "07:30", "pre_trip_days": 2, "stay_days": 8}
Time zones: IANA names (zoneinfo, DST-aware; needs the system tz database or the tzdata
package) or fixed offsets like "UTC+3", "+05:30", "-8".  depart is local time at the origin,
arrive is local time at the destination.

Model (rules of thumb used by sleep clinics, not a medical device):
  - shift = destination offset - origin offset, normalized to -12..+12 h (+ = east).
  - the body clock moves about 1 h/day when advancing (eastward) and 1.5 h/day when
    delaying (westward); for big eastward shifts the planner picks the direction that
    takes fewer days (often delaying "the long way round").
  - optional pre-trip shift: 1 h/day for pre_trip_days, toward the destination.
  - core body temperature minimum (CBTmin) ~3 h before usual wake time. Light in the 3 h
    after CBTmin advances the clock, light in the 3 h before it delays the clock.
  - planned sleep is a compromise: target local bedtime moved toward body time by
    min(2 h, half the remaining gap). Caffeine stops 8 h and naps (max 20 min) end 7 h
    before planned bedtime.
Usage:
  python3 jetlag_plan.py trip.json
  python3 jetlag_plan.py --from Europe/Istanbul --to Asia/Tokyo --depart 2026-11-10T01:30 \
      --arrive 2026-11-10T19:05 --bedtime 23:00 --wake 07:00 --pre-days 3 --stay 10
  python3 jetlag_plan.py trip.json --json
  python3 jetlag_plan.py --self-test
Exit code: 0 OK, 2 bad input.
"""
import argparse
import datetime as dt
import json
import math
import re
import sys

ADVANCE_RATE = 1.0
DELAY_RATE = 1.5


class TripError(ValueError):
    pass


def parse_tz(name):
    s = str(name).strip()
    m = re.fullmatch(r"(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::?(\d{2}))?", s, re.I)
    if m:
        sign = 1 if m.group(1) == "+" else -1
        mins = int(m.group(2)) * 60 + int(m.group(3) or 0)
        if mins > 14 * 60:
            raise TripError(f"offset out of range: {s!r}")
        return dt.timezone(dt.timedelta(minutes=sign * mins), s)
    if s.upper() in ("UTC", "GMT", "Z"):
        return dt.timezone.utc
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo(s)
    except Exception:
        raise TripError(f"unknown time zone {s!r}; use an IANA name like Europe/Istanbul or an offset like UTC+3")


def parse_hm(s, field):
    m = re.fullmatch(r"(\d{1,2}):(\d{2})", str(s).strip())
    if not m or int(m.group(1)) > 23 or int(m.group(2)) > 59:
        raise TripError(f"{field} must be HH:MM, got {s!r}")
    return int(m.group(1)) * 60 + int(m.group(2))


def parse_local(s, tz, field):
    try:
        t = dt.datetime.fromisoformat(str(s).strip())
    except ValueError:
        raise TripError(f"{field} must be YYYY-MM-DDTHH:MM, got {s!r}")
    if t.tzinfo is not None:
        t = t.replace(tzinfo=None)
    return t.replace(tzinfo=tz)


def hm(mins):
    mins = round(mins) % 1440
    return f"{mins // 60:02d}:{mins % 60:02d}"


def offset_h(t):
    return t.utcoffset().total_seconds() / 3600


def choose_direction(shift):
    """shift in -12..12 (east positive). Return (signed hours to move the body, rate, label)."""
    if shift == 0:
        return 0.0, ADVANCE_RATE, "none"
    if shift > 0:
        adv_days = math.ceil(shift / ADVANCE_RATE)
        alt = shift - 24
        del_days = math.ceil(-alt / DELAY_RATE)
        if del_days < adv_days:
            return alt, DELAY_RATE, "delay (long way round)"
        return shift, ADVANCE_RATE, "advance"
    del_days = math.ceil(-shift / DELAY_RATE)
    alt = shift + 24
    adv_days = math.ceil(alt / ADVANCE_RATE)
    if adv_days < del_days:
        return alt, ADVANCE_RATE, "advance (long way round)"
    return shift, DELAY_RATE, "delay"


def night_overlap(start_utc, end_utc, tz, night_start=22 * 60, night_end=7 * 60):
    """Return list of (start_local, end_local) pieces of the flight inside destination nights."""
    pieces = []
    t = start_utc
    step = dt.timedelta(minutes=5)
    cur = None
    while t < end_utc:
        loc = t.astimezone(tz)
        m = loc.hour * 60 + loc.minute
        is_night = m >= night_start or m < night_end
        if is_night and cur is None:
            cur = loc
        if not is_night and cur is not None:
            pieces.append((cur, loc))
            cur = None
        t += step
    if cur is not None:
        pieces.append((cur, end_utc.astimezone(tz)))
    return pieces


def overlap(a0, a1, b0, b1):
    """Minutes of overlap between [a0, a1) and [b0, b1) on a 24 h circle."""
    best = 0
    for k in (-1440, 0, 1440):
        best += max(0, min(a1, b1 + k) - max(a0, b0 + k))
    return best


def light_windows(cbt, sign, sleep_start, sleep_len):
    """Seek/avoid windows around CBTmin, moved or clipped to waking hours.
    sign > 0 (advance): seek 3 h after CBTmin, avoid 3 h before; sign < 0 (delay): the reverse.
    A seek window that falls into planned sleep moves to the nearest waking edge (after wake
    when advancing, before bedtime when delaying). Avoid windows are clipped to waking time."""
    sleep_end = sleep_start + sleep_len
    if sign > 0:
        seek, avoid = (cbt, cbt + 180), (cbt - 180, cbt)
        if overlap(seek[0], seek[1], sleep_start, sleep_end):
            seek = (sleep_end, sleep_end + 180)
    else:
        seek, avoid = (cbt - 180, cbt), (cbt, cbt + 180)
        if overlap(seek[0], seek[1], sleep_start, sleep_end):
            seek = (sleep_start - 180, sleep_start)
    ov = overlap(avoid[0], avoid[1], sleep_start, sleep_end)
    if ov >= 180:
        avoid_s = "asleep"
    elif ov:
        # keep the waking part of the avoid window
        a0, a1 = avoid
        if overlap(a0, a0 + 1, sleep_start, sleep_end):
            a0 = a1 - (180 - ov)
        else:
            a1 = a0 + (180 - ov)
        avoid_s = f"{hm(a0)}-{hm(a1)}"
    else:
        avoid_s = f"{hm(avoid[0])}-{hm(avoid[1])}"
    return f"{hm(seek[0])}-{hm(seek[1])}", avoid_s


def plan(trip):
    for k in ("from_tz", "to_tz", "depart", "arrive"):
        if not trip.get(k):
            raise TripError(f"missing {k}")
    ftz, ttz = parse_tz(trip["from_tz"]), parse_tz(trip["to_tz"])
    dep = parse_local(trip["depart"], ftz, "depart")
    arr = parse_local(trip["arrive"], ttz, "arrive")
    if arr.astimezone(dt.timezone.utc) <= dep.astimezone(dt.timezone.utc):
        raise TripError("arrive must be after depart (check the dates and time zones)")
    bed = parse_hm(trip.get("bedtime", "23:00"), "bedtime")
    wake = parse_hm(trip.get("wake", "07:00"), "wake")
    sleep_len = (wake - bed) % 1440
    if not 4 * 60 <= sleep_len <= 12 * 60:
        raise TripError("bedtime to wake must be 4-12 hours")
    pre = int(trip.get("pre_trip_days", 0))
    stay = int(trip.get("stay_days", 7))
    if pre < 0 or pre > 4 or stay < 1:
        raise TripError("pre_trip_days must be 0-4 and stay_days at least 1")
    shift = offset_h(arr) - offset_h(dep.astimezone(ftz))
    shift = ((shift + 12) % 24) - 12 if abs(shift) > 12 else shift
    if shift == -12:
        shift = 12.0
    move, rate, direction = choose_direction(shift)
    sign = 1 if move > 0 else -1
    flags = []
    if abs(shift) <= 2:
        flags.append("SMALL_SHIFT: 2 h or less; most people adapt within a day, keep usual habits on local time")
    if stay <= 2 and abs(shift) >= 3:
        flags.append("SHORT_TRIP: 2 days or fewer; consider staying on home time and scheduling meetings inside your home daytime")
    if "long way round" in direction:
        flags.append(f"LONG_WAY_ROUND: a {shift:+g} h shift is planned as {move:+g} h, which usually takes fewer days")
    pre_used = min(pre, int(abs(move))) if move else 0
    pre_days = []
    for i in range(1, pre_used + 1):
        b = bed - sign * 60 * i
        cbt = wake - 180 - sign * 60 * i
        seek_s, avoid_s = light_windows(cbt, sign, b, sleep_len)
        pre_days.append({"day": f"pre {i - pre_used - 1}", "date": str((dep.date() - dt.timedelta(days=pre_used - i + 1))),
                         "sleep": f"{hm(b)}-{hm(b + sleep_len)}", "seek_light": seek_s,
                         "avoid_light": avoid_s, "clock": "home time"})
    body = sign * pre_used  # hours already moved toward destination
    total = abs(move)
    days_needed = math.ceil(max(0.0, total - pre_used) / rate) if move else 0
    days = []
    d = 0
    while True:
        remaining = move - body  # signed hours the body is still away from local time
        gap = abs(remaining)
        comp = min(120, gap * 60 / 2)
        # remaining > 0: body clock is behind local time, so it wants to sleep later (and vice versa)
        b = bed + (comp if remaining > 0 else -comp) if gap else bed
        cbt_local = (wake - 180) + remaining * 60
        if gap < 0.5:
            seek_s, avoid_s = "daylight as usual", "-"
        else:
            seek_s, avoid_s = light_windows(cbt_local, sign, b, sleep_len)
        if remaining > 0:
            status = f"{gap:g} h behind local time"
        elif remaining < 0:
            status = f"{gap:g} h ahead of local time"
        else:
            status = "adjusted"
        days.append({"day": d, "date": str(arr.date() + dt.timedelta(days=d)), "body_clock": status,
                     "sleep": f"{hm(b)}-{hm(b + sleep_len)}", "seek_light": seek_s, "avoid_light": avoid_s,
                     "caffeine_until": hm(b - 480), "naps_end_by": hm(b - 420)})
        if gap == 0 or d + 1 >= stay:
            break
        body = body + sign * min(rate, gap)
        d += 1
    flight_h = (arr.astimezone(dt.timezone.utc) - dep.astimezone(dt.timezone.utc)).total_seconds() / 3600
    nights = night_overlap(dep.astimezone(dt.timezone.utc), arr.astimezone(dt.timezone.utc), ttz)
    nights = [(a, b) for a, b in nights if (b - a).total_seconds() >= 3600]
    if nights:
        inflight = "sleep during destination night: " + "; ".join(f"{a:%a %H:%M}-{b:%H:%M}" for a, b in nights)
    else:
        inflight = "flight is during destination daytime: stay awake, get daylight/screen light, at most a 20-minute nap"
    res = {"from_tz": str(trip["from_tz"]), "to_tz": str(trip["to_tz"]), "shift_h": shift, "plan_move_h": move,
           "direction": direction, "rate_h_per_day": rate, "pre_trip_shift_h": pre_used,
           "days_to_adjust_after_arrival": days_needed, "flight_h": round(flight_h, 2),
           "arrive_local": arr.strftime("%Y-%m-%d %H:%M"), "in_flight": inflight, "flags": flags,
           "pre_trip": pre_days, "days": days}
    if trip.get("return_trip"):
        back, brate, bdir = choose_direction(-shift)
        res["return"] = {"shift_h": -shift, "direction": bdir,
                         "days_to_adjust": math.ceil(abs(back) / brate) if back else 0}
    return res


def to_markdown(r):
    out = [f"# Jet lag plan: {r['from_tz']} -> {r['to_tz']}", "",
           f"- Time difference: {r['shift_h']:+g} h ({'east' if r['shift_h'] > 0 else 'west' if r['shift_h'] < 0 else 'none'}); "
           f"plan: {r['direction']} {abs(r['plan_move_h']):g} h at about {r['rate_h_per_day']:g} h/day",
           f"- Pre-trip shift: {r['pre_trip_shift_h']} h; about {r['days_to_adjust_after_arrival']} day(s) to adjust after arrival",
           f"- Flight: {r['flight_h']:g} h, arriving {r['arrive_local']} local; {r['in_flight']}"]
    if "return" in r:
        out.append(f"- Return trip: {r['return']['shift_h']:+g} h, {r['return']['direction']}, about {r['return']['days_to_adjust']} day(s) to readjust")
    for f in r["flags"]:
        out.append(f"- **{f.split(':')[0]}**:{f.split(':', 1)[1]}")
    if r["pre_trip"]:
        out += ["", "## Before you fly (home time)", "| Day | Date | Sleep | Seek bright light | Avoid bright light |", "|---|---|---|---|---|"]
        for p in r["pre_trip"]:
            out.append(f"| {p['day']} | {p['date']} | {p['sleep']} | {p['seek_light']} | {p['avoid_light']} |")
    out += ["", "## At the destination (local time)",
            "| Day | Date | Body clock | Sleep | Seek bright light | Avoid bright light | Caffeine until | Naps end by |",
            "|---|---|---|---|---|---|---|---|"]
    for d in r["days"]:
        out.append(f"| {d['day']} | {d['date']} | {d['body_clock']} | {d['sleep']} | {d['seek_light']} | {d['avoid_light']} | {d['caffeine_until']} | {d['naps_end_by']} |")
    out += ["", "Light windows that fall inside your sleep time can be skipped; use sunglasses outdoors during 'avoid' windows.",
            "Rules of thumb only. Ask a doctor or pharmacist before using melatonin or sleep medication."]
    return "\n".join(out)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    base = {"from_tz": "Europe/Istanbul", "to_tz": "America/Los_Angeles", "depart": "2026-11-03T13:40",
            "arrive": "2026-11-03T17:25", "bedtime": "23:30", "wake": "07:30", "pre_trip_days": 2, "stay_days": 10}
    ok("fixed offset parse", parse_tz("UTC+3").utcoffset(None) == dt.timedelta(hours=3) and parse_tz("+05:30").utcoffset(None) == dt.timedelta(hours=5, minutes=30))
    ok("negative offset parse", parse_tz("-8").utcoffset(None) == dt.timedelta(hours=-8))
    r = plan(base)
    ok("IST->LA after US DST ends is -11 h", r["shift_h"] == -11)
    ok("westward plan delays", r["direction"] == "delay" and r["plan_move_h"] == -11)
    ok("pre-trip 2 h used", r["pre_trip_shift_h"] == 2 and len(r["pre_trip"]) == 2)
    ok("days to adjust ceil(9/1.5)=6", r["days_to_adjust_after_arrival"] == 6)
    ok("pre-trip bedtime later for westward", r["pre_trip"][0]["sleep"].startswith("00:30") and r["pre_trip"][1]["sleep"].startswith("01:30"))
    ok("day 0 body 9 h ahead", r["days"][0]["body_clock"] == "9 h ahead of local time")
    ok("day 0 compromise bedtime 21:30", r["days"][0]["sleep"] == "21:30-05:30")
    ok("delay: seek light before CBTmin", r["days"][0]["seek_light"] == "16:30-19:30")
    ok("delay: avoid window clipped at bedtime", r["days"][0]["avoid_light"] == "19:30-21:30")
    ok("delay: seek window moved before bedtime", r["days"][3]["seek_light"] == "18:30-21:30" and r["days"][3]["avoid_light"] == "asleep")
    ok("pre-trip delay light in the evening", r["pre_trip"][0]["seek_light"] == "21:30-00:30")
    ok("overlap on circle", overlap(1380, 1500, 0, 60) == 60 and overlap(600, 700, 0, 60) == 0)
    ok("plan ends adjusted", r["days"][-1]["body_clock"] == "adjusted" and r["days"][-1]["sleep"] == "23:30-07:30")
    ok("plan length 7 days (0..6)", len(r["days"]) == 7)
    ok("flight of 14.75 h", r["flight_h"] == 14.75)
    r2 = plan(dict(base, to_tz="America/Los_Angeles", depart="2026-10-20T13:40", arrive="2026-10-20T16:25"))
    ok("IST->LA during US DST is -10 h", r2["shift_h"] == -10)
    r3 = plan(dict(base, to_tz="Asia/Tokyo", depart="2026-11-10T01:30", arrive="2026-11-10T19:05", pre_trip_days=3))
    ok("IST->Tokyo +6 advance", r3["shift_h"] == 6 and r3["direction"] == "advance" and r3["days_to_adjust_after_arrival"] == 3)
    ok("advance: seek light moved to after wake", r3["days"][0]["seek_light"] == "09:00-12:00" and r3["days"][0]["avoid_light"] == "asleep")
    ok("pre-trip bedtime earlier for eastward", r3["pre_trip"][0]["sleep"].startswith("22:30"))
    ok("+11 east goes long way round", choose_direction(11) == (-13, DELAY_RATE, "delay (long way round)"))
    ok("+9 east stays advance", choose_direction(9)[2] == "advance")
    ok("-12 normalized to +12 then delay -12", choose_direction(12)[0] == -12)
    r4 = plan(dict(base, to_tz="Europe/Berlin", depart="2026-11-03T08:00", arrive="2026-11-03T09:00", stay_days=2))
    ok("small shift flag", any(f.startswith("SMALL_SHIFT") for f in r4["flags"]))
    r5 = plan(dict(base, stay_days=2))
    ok("short trip flag", any(f.startswith("SHORT_TRIP") for f in r5["flags"]) and len(r5["days"]) == 2)
    ok("in-flight sleep in LA night 02:40-07:00", r["in_flight"].endswith("Tue 02:40-07:00"))
    ok("Tokyo daytime flight: stay awake", "destination daytime" in r3["in_flight"])
    ok("caffeine 8 h before bed", r["days"][-1]["caffeine_until"] == "15:30" and r["days"][-1]["naps_end_by"] == "16:30")
    for bad, label in ((dict(base, to_tz="Mars/Olympus"), "unknown tz rejected"), (dict(base, bedtime="25:00"), "bad bedtime rejected"),
                       (dict(base, arrive="2026-11-02T10:00"), "arrival before departure rejected"), (dict(base, pre_trip_days=9), "pre-trip >4 rejected")):
        try:
            plan(bad)
            ok(label, False)
        except TripError:
            ok(label, True)
    ok("hm wraps midnight", hm(-30) == "23:30" and hm(1500) == "01:00")
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Plan sleep and light timing to beat jet lag.")
    ap.add_argument("file", nargs="?", help="trip JSON")
    ap.add_argument("--from", dest="from_tz")
    ap.add_argument("--to", dest="to_tz")
    ap.add_argument("--depart")
    ap.add_argument("--arrive")
    ap.add_argument("--bedtime")
    ap.add_argument("--wake")
    ap.add_argument("--pre-days", type=int, dest="pre_trip_days")
    ap.add_argument("--stay", type=int, dest="stay_days")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    try:
        trip = json.load(open(a.file, encoding="utf-8")) if a.file else {}
        for k in ("from_tz", "to_tz", "depart", "arrive", "bedtime", "wake", "pre_trip_days", "stay_days"):
            if getattr(a, k) is not None:
                trip[k] = getattr(a, k)
        r = plan(trip)
    except (OSError, TripError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else to_markdown(r))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
