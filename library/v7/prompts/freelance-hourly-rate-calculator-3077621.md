# Freelance Hourly Rate Calculator

By @f · general
Language: en · Domains: math, product, finance · Source: P01

Source page: https://prompts.chat

```
---
name: freelance-hourly-rate-calculator
description: Works out the hourly and day rate a freelancer must charge from the take-home income they want. Counts taxes, business costs, savings, vacation, holidays, sick days, the real billable share and a risk buffer, shows how the rate moves with billable time, and prices a project with contingency. Flags rates below break-even or target, unrealistic billable hours and rates off the market. Includes a stdlib Python calculator with --self-test.
---

# Freelance Hourly Rate Calculator

You help freelancers and people about to go freelance find a rate they can live on. Most underprice because they divide a salary by 2080 hours and forget taxes, insurance, equipment, unpaid holidays, sick days and the hours spent on sales and admin. You work backwards from the take-home income they want to the minimum hourly rate, round it to a rate they can quote, show what their current rate really pays, and price their next project.

## Files in this skill

- `scripts/rate_calc.py` - calculates revenue needed, billable hours, minimum, quoted, day and break-even rates, a billable-share table, the current-rate gap and a project price (Python 3 standard library only)
- `references/rate-math.md` - the formulas step by step, typical cost lists, billable share by type of work, tax rough guides and common mistakes
- `references/pricing-and-raising-rates.md` - day, project, retainer and value pricing, how to quote, and how to raise rates with existing clients
- `templates/rate-card.md` - a one-page rate card with hourly, day and package prices and terms
- `examples/ux-designer-rate-plan.json` - a Berlin UX designer who wants 48,000 EUR take-home and currently charges 65 EUR/h

## Workflow

### 1. Collect the numbers
Ask for: the take-home income they want per year (after tax and business costs), savings they want to put aside (pension, emergency fund), their effective tax and social contribution rate (if unknown, use the rough guide in `references/rate-math.md` and tell them to confirm with an accountant), every business cost (insurance, software, equipment, workspace, accountant, marketing, training), hours per week, vacation weeks, public holidays, sick and training days, and the share of working time that is really billable. Also ask for the current rate, typical market rates for their field and region, and an upcoming project estimate if they have one.

### 2. Run the calculator
'''
python3 scripts/rate_calc.py examples/ux-designer-rate-plan.json
python3 scripts/rate_calc.py plan.json --round 10 --json
python3 scripts/rate_calc.py --self-test
'''
Exit code 1 means HIGH findings, 2 means bad input.

### 3. Explain the result
Lead with the minimum rate and the quoted rate, then walk the chain from take-home to revenue so they see where the money goes. Use the billable-share table to show why 60% billable is the honest default. If the current rate is too low, show the shortfall and the billable hours it would take to close it, then give options from `references/pricing-and-raising-rates.md`: raise rates for new clients first, move to day or project pricing, cut costs, or lower the target.

### 4. Deliver
Fill `templates/rate-card.md` with the hourly, day and package prices, payment terms and the date of the next rate review.

## Example result
For `examples/ux-designer-rate-plan.json`: 48,000 EUR take-home + 7,800 EUR set-asides = 83,284 EUR profit before 33% tax; + 13,500 EUR costs and an 8% risk buffer = 105,200 EUR revenue. 214 working days at 60% billable = 1027 billable hours, so the minimum is 102.41 EUR/h: quote 105 EUR/h or 840 EUR/day. At the current 65 EUR/h, take-home would be 24,311 EUR (23,689 short), and hitting the target would need 94.5% billable time (HIGH BELOW_REQUIRED). The 120 h clinic app redesign with 20% contingency comes to 15,120 EUR instead of 9,360 EUR.

## Rules

- Tax figures are rough guides, not tax advice; tell them to confirm their rate with a local accountant.
- Never assume more than 70% billable time without evidence from their own time tracking.
- Show the formulas and inputs so they can change one assumption and re-run.
- A rate below the market can be raised; a minimum above the market needs a different offer, not just a higher number.
- Use the currency and the tax situation they give; do not mix currencies.
FILE:references/rate-math.md
# Rate Math

## The chain, step by step
1. **Needed after tax** = target take-home + set-asides (pension, emergency fund, savings goals)
2. **Profit before tax** = needed after tax / (1 - effective tax and social contribution rate)
3. **Revenue needed** = (profit before tax + business costs) / (1 - risk buffer)
4. **Working days** = 260 weekdays - vacation weeks x 5 - public holidays - sick days - training days
5. **Billable hours** = working days x hours per week / 5 x billable share
6. **Minimum rate** = revenue needed / billable hours
7. **Quoted rate** = minimum rounded up (to 5 or 10); **day rate** = quoted x hours per day
8. **Break-even rate** = business costs / (1 - buffer) / billable hours (pays the bills, pays you nothing)

Check: take-home at a rate R = (R x billable hours x (1 - buffer) - costs) x (1 - tax) - set-asides.

## Why "salary / 2080" is wrong
2080 = 52 weeks x 40 hours. A freelancer is paid for none of: vacation (20-30 days), public holidays (8-14), sick days (5-10), training (3-10), and the 30-50% of working time spent on sales, proposals, admin, invoicing and learning. A 60,000 salary also comes with employer pension and social contributions, paid leave and equipment. The usual rule of thumb, hourly rate = salary / 1000 to 1200, lands near the result of the full calculation.

## Billable share by type of work
| Situation | Realistic billable share |
|---|---|
| New freelancer, still finding clients | 35-50% |
| Mix of projects, regular clients | 50-65% |
| Long full-time contract with one client | 70-85% (but sales stop, and the gap after the contract is long) |
| Agency-style with heavy account management | 45-60% |

Measure it: track every working hour for 4-8 weeks, then use the real share.

## Typical business costs
- Health, disability and liability insurance (where self-paid)
- Pension contributions if compulsory (or put them in set-asides)
- Hardware with replacement cycle (laptop 3 years, phone 2-3 years), software subscriptions, cloud and domains
- Workspace: coworking, home office share, internet, phone
- Accountant, bank fees, payment provider fees, invoicing tool
- Marketing: website, portfolio, platforms, events, travel to clients
- Training: courses, books, conferences
- Professional memberships, licences, legal templates

## Effective tax and contribution rate (rough guide only)
The effective rate is total income tax and compulsory social contributions divided by profit. It depends on the country, region, legal form, family situation and deductions. As a first rough guess for a single person with profit around 60,000-100,000 in Europe or North America, 25-40% is common; low-tax regimes and flat-rate schemes can be much lower. Always confirm with a local accountant and replace the guess.

## Risk buffer
Covers late or unpaid invoices, gaps between clients, scope that cannot be billed and slow months. 5% for stable retainers, 10-15% for project work with new clients.

## Common mistakes
- Using gross revenue as income (taxes and costs come out later)
- Planning 100% billable hours
- Forgetting VAT/sales tax is not income (rates here are net of VAT)
- Not pricing holidays: every week off has to be paid for by the weeks worked
- Discounting the hourly rate for long projects without a guaranteed volume
FILE:references/pricing-and-raising-rates.md
# Pricing Models and Raising Rates

## Choosing a pricing model
| Model | Use when | Calculation from the minimum rate |
|---|---|---|
| Hourly | Unclear scope, support work, small changes | Quoted rate; bill in 15 or 30 minute steps |
| Day rate | Workshops, embedded work, contracts | Quoted rate x hours per day; half-day = 55-60% of a day (switching cost) |
| Project (fixed price) | Clear deliverables, you estimate well | Estimated hours x (1 + contingency) x quoted rate; list what is included and the number of revisions |
| Retainer | Ongoing work each month | Reserved hours per month x quoted rate, often 5-10% lower for guaranteed volume; unused hours expire |
| Value-based | Your work drives measurable revenue or savings | 5-20% of the first-year value, never below the project price |

Contingency for fixed prices: 10-15% for work you have done many times, 20-30% for new types of work, 30-50% with unclear requirements or many stakeholders.

## Quoting
- Quote a number, not a range; ranges get negotiated to the bottom.
- Show the price per package or deliverable, not the hours, when you price by project.
- Put payment terms on the quote: 30-50% upfront for new clients, net 14 or net 30, late fee, what happens when scope changes.
- Rates are net of VAT/sales tax; say so.

## When the minimum is below the market
Quote at least the market middle for your level. Charging less signals lower quality and leaves no room for slow months.

## When the minimum is above the market
A higher number alone will not sell. Options:
1. Specialise (industry or problem) so you compete with fewer people and can price above the general market.
2. Package outcomes and use project or value pricing.
3. Cut costs that do not bring work.
4. Raise the billable share with retainers and fewer, larger clients.
5. Lower the target for the first year and plan rate increases.

## Raising rates with existing clients
- New clients get the new rate immediately.
- Existing clients: 30-60 days notice, a date, a short reason (more experience, scope, market), no apology.
- Raise by 10-20% at a time, once a year or when you are fully booked for 3+ months.
- Offer the old rate for a prepaid block of hours or a longer retainer if you want to keep a key client.

Sample notice:
> From 1 January, my rate for new work will be 105 EUR per hour (840 EUR per day). Work already agreed stays at the current rate until it is finished. Thank you for the great collaboration this year; I look forward to the next projects.

## Signals that the rate is too low
- You are fully booked for months and nobody pushes back on price.
- You win almost every proposal.
- You cannot take time off or pay for training.
FILE:templates/rate-card.md
# Rate Card - <name>, <role>

**Valid from:** <date>  **Next review:** <date + 12 months>  **Currency:** <EUR>, prices net of VAT

## Rates
| Service | Price |
|---|---|
| Hourly rate | <105> per hour |
| Day rate (8 h) | <840> per day |
| Half day (4 h) | <480> |
| Monthly retainer (<20> h, unused hours expire) | <2,000> per month |

## Packages
| Package | Includes | Price |
|---|---|---|
| <UX audit> | <expert review of 10 key screens, prioritised report, 1 h call> | <2,400> |
| <App redesign> | <research, wireframes, UI for <n> screens, 2 revision rounds, design system> | <15,120> |

## Terms
- Payment: <40% upfront, rest on delivery>, invoices due in <14> days; late fee <x%> per month
- Scope changes: quoted separately before work starts
- Revisions: <2> rounds included, then hourly
- Cancellation: <notice period / fee>
- Travel: <outside city billed at cost + travel time at 50%>

## Behind the numbers (private, do not send)
- Minimum rate: <102.41>/h at <60>% billable (<1027> h/year)
- Break-even rate: <14.29>/h
- Target take-home: <48,000>, revenue needed: <105,200>
FILE:examples/ux-designer-rate-plan.json
{
  "name": "Deniz, freelance UX/UI designer (Berlin)",
  "currency": "EUR",
  "target_net_income": 48000,
  "set_asides": [
    {"name": "retirement", "annual": 6000},
    {"name": "emergency fund top-up", "monthly": 150}
  ],
  "tax": {"effective_rate_pct": 33},
  "business_costs": [
    {"name": "health and care insurance (self-paid)", "monthly": 520},
    {"name": "coworking desk", "monthly": 190},
    {"name": "software (Figma, Adobe, Notion)", "monthly": 95},
    {"name": "laptop and display (3-year write-off)", "annual": 1100},
    {"name": "accountant", "monthly": 110},
    {"name": "liability insurance", "annual": 280},
    {"name": "website, portfolio and domain", "annual": 240},
    {"name": "courses and conferences", "annual": 900}
  ],
  "time": {
    "hours_per_week": 40,
    "vacation_weeks": 5,
    "public_holidays_days": 10,
    "sick_days": 6,
    "training_days": 5,
    "billable_pct": 60,
    "hours_per_day": 8
  },
  "risk_buffer_pct": 8,
  "current_rate": 65,
  "market_rate": {"low": 70, "high": 110},
  "project": {"name": "Clinic booking app redesign", "estimated_hours": 120, "contingency_pct": 20}
}
FILE:scripts/rate_calc.py
#!/usr/bin/env python3
"""Freelance hourly rate calculator (Python 3 standard library only).

Works backwards from the take-home income you want to the hourly and day rate you must charge,
counting taxes, business costs, unpaid time and a risk buffer. Compares the result with your
current rate and the market, and prices a project.

Input JSON (amounts per year unless "monthly" is given):
  {"name": "...", "currency": "EUR",
   "target_net_income": 48000,                      # take-home after tax and costs
   "set_asides": [{"name": "retirement", "annual": 6000}],          (optional, after tax)
   "tax": {"effective_rate_pct": 32},               # income tax + social contributions on profit
   "business_costs": [{"name": "coworking", "monthly": 180}, {"name": "laptop", "annual": 2400}],
   "time": {"hours_per_week": 40, "vacation_weeks": 5, "public_holidays_days": 10,
            "sick_days": 6, "training_days": 5, "billable_pct": 60, "hours_per_day": 8},
   "risk_buffer_pct": 10,                           # unpaid invoices, gaps between clients
   "current_rate": 55, "market_rate": {"low": 60, "high": 95},       (optional)
   "project": {"name": "...", "estimated_hours": 120, "contingency_pct": 20}}  (optional)
Formulas:
  needed after tax   = target net + set-asides
  profit before tax  = needed after tax / (1 - tax rate)
  revenue needed     = (profit before tax + business costs) / (1 - risk buffer)
  working days       = 260 - vacation weeks x 5 - holidays - sick days - training days
  billable hours     = working days x hours per week / 5 x billable %
  minimum rate       = revenue needed / billable hours; quoted rate = minimum rounded up to
                       the next --round (default 5); project price rounded up to 10; day rate = quoted x hours per day
  break-even rate    = business costs / (1 - buffer) / billable hours (no income at all)
  net at a rate      = (rate x billable hours x (1 - buffer) - costs) x (1 - tax) - set-asides
Findings (severity):
  HIGH   NO_TAX            tax rate missing or 0
  HIGH   BELOW_BREAK_EVEN  current rate does not even cover business costs
  HIGH   BELOW_REQUIRED    current rate below the minimum rate (yearly shortfall shown)
  MEDIUM ABOVE_MARKET      minimum rate above the market high: niche, value pricing or lower target
  MEDIUM BILLABLE_HIGH     billable share above 75% of working time
  MEDIUM LONG_HOURS        more than 50 hours per week
  MEDIUM SHORT_VACATION    under 3 weeks of vacation
  LOW    UNDER_MARKET      quoted rate below the market low: you can likely charge more
  LOW    NO_BUFFER         risk buffer 0
  LOW    NO_SICK_DAYS      no sick days planned
  LOW    NO_CONTINGENCY    project quote without contingency
Usage:
  python3 rate_calc.py plan.json
  python3 rate_calc.py plan.json --round 10 --json
  python3 rate_calc.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import json
import math
import sys

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class DataError(ValueError):
    pass


def annual(item):
    if "annual" in item:
        return float(item["annual"])
    if "monthly" in item:
        return float(item["monthly"]) * 12
    raise DataError(f"cost '{item.get('name', '?')}' needs 'annual' or 'monthly'")


def round_up(x, step):
    return math.ceil(x / step - 1e-9) * step


def calc(cfg, step=5):
    t = cfg.get("time") or {}
    hpw = float(t.get("hours_per_week", 40))
    hpd = float(t.get("hours_per_day", hpw / 5))
    billable = float(t.get("billable_pct", 60)) / 100
    vac, hol = float(t.get("vacation_weeks", 4)), float(t.get("public_holidays_days", 10))
    sick, train = float(t.get("sick_days", 5)), float(t.get("training_days", 0))
    tax = float((cfg.get("tax") or {}).get("effective_rate_pct", 0)) / 100
    buffer = float(cfg.get("risk_buffer_pct", 0)) / 100
    if "target_net_income" not in cfg:
        raise DataError("target_net_income is required")
    net = float(cfg["target_net_income"])
    if not (0 <= tax < 0.9) or not (0 <= buffer < 0.5):
        raise DataError("tax must be 0-90% and risk buffer 0-50%")
    if not (0 < billable <= 1) or hpw <= 0:
        raise DataError("billable_pct must be 1-100 and hours_per_week > 0")
    costs = [{"name": c.get("name", "cost"), "annual": annual(c)} for c in cfg.get("business_costs", [])]
    sets = [{"name": s.get("name", "set-aside"), "annual": annual(s)} for s in cfg.get("set_asides", [])]
    cost_total = sum(c["annual"] for c in costs)
    set_total = sum(s["annual"] for s in sets)
    working_days = 260 - vac * 5 - hol - sick - train
    if working_days <= 0:
        raise DataError("no working days left after vacation, holidays, sick and training days")
    avail = working_days * hpw / 5
    bill_h = avail * billable
    after_tax = net + set_total
    pre_tax = after_tax / (1 - tax)
    revenue = (pre_tax + cost_total) / (1 - buffer)
    min_rate = revenue / bill_h
    rate = round_up(min_rate, step)
    breakeven = cost_total / (1 - buffer) / bill_h

    def net_at(r, hours=bill_h):
        return (r * hours * (1 - buffer) - cost_total) * (1 - tax) - set_total

    sens = []
    for pct in (40, 50, 60, 70, 80):
        h = avail * pct / 100
        sens.append({"billable_pct": pct, "billable_hours": round(h), "min_rate": round(revenue / h, 2)})
    res = {"name": cfg.get("name", "freelancer"), "currency": cfg.get("currency", ""),
           "costs": costs, "set_asides": sets, "business_costs": round(cost_total, 2), "set_aside_total": round(set_total, 2),
           "target_net_income": net, "profit_before_tax": round(pre_tax, 2), "revenue_needed": round(revenue, 2),
           "working_days": working_days, "available_hours": round(avail, 1), "billable_hours": round(bill_h, 1),
           "billable_pct": billable * 100, "min_rate": round(min_rate, 2), "quoted_rate": rate,
           "day_rate": round_up(rate * hpd, step), "hours_per_day": hpd, "break_even_rate": round(breakeven, 2),
           "net_at_quoted": round(net_at(rate), 2), "sensitivity": sens, "findings": []}
    findings = res["findings"]

    def add(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    cur = cfg.get("current_rate")
    cur_info = None
    if cur:
        cur = float(cur)
        hours_needed = revenue / cur
        cur_info = {"rate": cur, "net_income": round(net_at(cur), 2), "shortfall": round(net - net_at(cur), 2),
                    "billable_hours_needed": round(hours_needed), "billable_pct_needed": round(hours_needed / avail * 100, 1)}
        res["current"] = cur_info
    if tax == 0:
        add("HIGH", "NO_TAX", "no tax rate given; income tax and social contributions usually take 25-45% of profit")
    if cur_info and cur < breakeven:
        add("HIGH", "BELOW_BREAK_EVEN", f"current rate {cur:g} is below the break-even rate {breakeven:.2f}; every billed hour loses money")
    elif cur_info and cur < min_rate:
        add("HIGH", "BELOW_REQUIRED", f"current rate {cur:g} is {min_rate - cur:.2f} below the minimum {min_rate:.2f}; take-home falls {cur_info['shortfall']:,.0f} short "
            f"(you would need {cur_info['billable_hours_needed']} billable hours, {cur_info['billable_pct_needed']}% of working time)")
    m = cfg.get("market_rate") or {}
    if m.get("high") and min_rate > float(m["high"]):
        add("MEDIUM", "ABOVE_MARKET", f"minimum rate {min_rate:.2f} is above the market high {m['high']}; specialise, price by value, cut costs or lower the target")
    elif m.get("low") and rate < float(m["low"]):
        add("LOW", "UNDER_MARKET", f"quoted rate {rate:g} is below the market low {m['low']}; quote at least {m['low']}")
    if billable > 0.75:
        add("MEDIUM", "BILLABLE_HIGH", f"{billable * 100:.0f}% billable leaves too little time for sales, admin and learning; 50-70% is realistic")
    if hpw > 50:
        add("MEDIUM", "LONG_HOURS", f"{hpw:g} hours per week is not sustainable for a year")
    if vac < 3:
        add("MEDIUM", "SHORT_VACATION", f"only {vac:g} weeks of vacation planned; nobody pays you for holidays, so price them in")
    if buffer == 0:
        add("LOW", "NO_BUFFER", "no risk buffer for unpaid invoices and gaps between clients; 5-15% is common")
    if sick == 0:
        add("LOW", "NO_SICK_DAYS", "no sick days planned; budget at least 5")
    p = cfg.get("project")
    if p:
        hrs = float(p.get("estimated_hours", 0))
        cont = float(p.get("contingency_pct", 0)) / 100
        res["project"] = {"name": p.get("name", "project"), "estimated_hours": hrs, "contingency_pct": cont * 100,
                          "quoted_hours": round(hrs * (1 + cont), 1), "price": round_up(hrs * (1 + cont) * rate, 10),
                          "price_at_current": round_up(hrs * (1 + cont) * cur, 10) if cur else None}
        if cont == 0:
            add("LOW", "NO_CONTINGENCY", "project estimate has no contingency; add 15-30% for unknowns and revisions")
    findings.sort(key=lambda f: SEV_ORDER[f["severity"]])
    return res


def money(x, cur=""):
    return f"{x:,.0f} {cur}".strip() if abs(x) >= 100 else f"{x:,.2f} {cur}".strip()


def rate_fmt(x, cur=""):
    return f"{x:,.2f} {cur}".strip()


def render(r):
    c = r["currency"]
    out = [f"# Freelance rate plan: {r['name']}", "",
           f"Minimum rate {rate_fmt(r['min_rate'], c)}/h -> quote **{rate_fmt(r['quoted_rate'], c)}/h**, day rate {money(r['day_rate'], c)} ({r['hours_per_day']:g} h)",
           f"Break-even (covers costs, no income): {rate_fmt(r['break_even_rate'], c)}/h | take-home at the quoted rate: {money(r['net_at_quoted'], c)}/year", "",
           "## From take-home to revenue", "| Step | Amount |", "|---|---|",
           f"| Target take-home | {money(r['target_net_income'], c)} |",
           f"| + set-asides ({', '.join(s['name'] for s in r['set_asides']) or 'none'}) | {money(r['set_aside_total'], c)} |",
           f"| = profit before tax | {money(r['profit_before_tax'], c)} |",
           f"| + business costs | {money(r['business_costs'], c)} |",
           f"| = revenue needed (incl. risk buffer) | {money(r['revenue_needed'], c)} |", "",
           "## Time", f"{r['working_days']:g} working days, {r['available_hours']:g} working hours, {r['billable_pct']:g}% billable = **{r['billable_hours']:g} billable hours**", "",
           "| Billable share | Billable hours | Minimum rate |", "|---|---|---|"]
    for s in r["sensitivity"]:
        out.append(f"| {s['billable_pct']}% | {s['billable_hours']} | {rate_fmt(s['min_rate'], c)} |")
    out += ["", "## Business costs", "| Cost | Per year |", "|---|---|"]
    for k in r["costs"]:
        out.append(f"| {k['name']} | {money(k['annual'], c)} |")
    if r.get("current"):
        cu = r["current"]
        out += ["", "## Current rate", f"At {rate_fmt(cu['rate'], c)}/h: take-home {money(cu['net_income'], c)}/year "
                f"({'short by ' + money(cu['shortfall'], c) if cu['shortfall'] > 0 else 'target met'}); target needs {cu['billable_hours_needed']} billable hours ({cu['billable_pct_needed']}% of working time)"]
    if r.get("project"):
        p = r["project"]
        out += ["", f"## Project quote: {p['name']}", f"{p['estimated_hours']:g} h + {p['contingency_pct']:g}% contingency = {p['quoted_hours']:g} h x {rate_fmt(r['quoted_rate'], c)} -> **{money(p['price'], c)}**"
                + (f" (at the current rate: {money(p['price_at_current'], c)})" if p.get("price_at_current") else "")]
    out += ["", "## Findings"]
    if not r["findings"]:
        out.append("- none")
    for f in r["findings"]:
        out.append(f"- {f['severity']} {f['code']}: {f['message']}")
    return "\n".join(out) + "\n"


def self_test():
    tests, ok = [], 0

    def check(name, cond):
        nonlocal ok
        tests.append(name)
        print(("PASS " if cond else "FAIL ") + name)
        ok += bool(cond)

    base = {"target_net_income": 50000, "tax": {"effective_rate_pct": 30}, "business_costs": [{"name": "x", "annual": 10000}],
            "time": {"hours_per_week": 40, "vacation_weeks": 4, "public_holidays_days": 10, "sick_days": 5, "training_days": 5, "billable_pct": 60},
            "risk_buffer_pct": 10}
    r = calc(base)
    check("working days 260-20-10-5-5 = 220", r["working_days"] == 220)
    check("billable hours 220 x 8 x 60% = 1056", r["billable_hours"] == 1056)
    check("profit before tax 50000/0.7", abs(r["profit_before_tax"] - 71428.57) < 0.01)
    check("revenue (71428.57+10000)/0.9", abs(r["revenue_needed"] - 90476.19) < 0.01)
    check("minimum rate 90476.19/1056 = 85.68", abs(r["min_rate"] - 85.68) < 0.01)
    check("quoted rate rounded up to 90", r["quoted_rate"] == 90)
    check("day rate 8 x 90 = 720", r["day_rate"] == 720)
    check("break-even 10000/0.9/1056 = 10.52", abs(r["break_even_rate"] - 10.52) < 0.01)
    check("net at the minimum rate equals target", abs(((r["min_rate"] * 1056 * 0.9 - 10000) * 0.7) - 50000) < 10)
    check("clean plan has no findings", r["findings"] == [])
    check("monthly cost x 12", annual({"monthly": 150}) == 1800)
    check("set-asides raise the rate", calc({**base, "set_asides": [{"name": "pension", "annual": 7000}]})["min_rate"] > r["min_rate"])
    check("sensitivity 50% rate higher than 70%", r["sensitivity"][1]["min_rate"] > r["sensitivity"][3]["min_rate"])

    def codes(**over):
        c = json.loads(json.dumps(base))
        for k, v in over.items():
            if isinstance(v, dict) and isinstance(c.get(k), dict):
                c[k].update(v)
            else:
                c[k] = v
        return {f["code"] for f in calc(c)["findings"]}

    check("no tax HIGH", "NO_TAX" in codes(tax={"effective_rate_pct": 0}))
    check("below required HIGH", "BELOW_REQUIRED" in codes(current_rate=60))
    check("below break-even HIGH", "BELOW_BREAK_EVEN" in codes(current_rate=8))
    check("rate above market MEDIUM", "ABOVE_MARKET" in codes(market_rate={"low": 40, "high": 70}))
    check("rate under market LOW", "UNDER_MARKET" in codes(market_rate={"low": 120, "high": 160}))
    check("billable 85% MEDIUM", "BILLABLE_HIGH" in codes(time={"billable_pct": 85}))
    check("55 h/week MEDIUM", "LONG_HOURS" in codes(time={"hours_per_week": 55}))
    check("2 weeks vacation MEDIUM", "SHORT_VACATION" in codes(time={"vacation_weeks": 2}))
    check("no buffer LOW", "NO_BUFFER" in codes(risk_buffer_pct=0))
    check("no sick days LOW", "NO_SICK_DAYS" in codes(time={"sick_days": 0}))
    check("no contingency LOW", "NO_CONTINGENCY" in codes(project={"estimated_hours": 40, "contingency_pct": 0}))
    p = calc({**base, "project": {"estimated_hours": 100, "contingency_pct": 20}})["project"]
    check("project 120 h x 90 = 10800", p["quoted_hours"] == 120 and p["price"] == 10800)
    for bad, label in (({"tax": {"effective_rate_pct": 95}}, "tax 95% rejected"), ({"time": {"billable_pct": 0}}, "billable 0 rejected"),
                       ({"time": {"vacation_weeks": 60}}, "no working days rejected")):
        try:
            c = json.loads(json.dumps(base))
            for k, v in bad.items():
                c[k].update(v)
            calc(c)
            check(label, False)
        except DataError:
            check(label, True)
    print(f"{ok}/{len(tests)} passed")
    return 0 if ok == len(tests) else 1


def main():
    ap = argparse.ArgumentParser(description="Freelance hourly rate calculator")
    ap.add_argument("plan", nargs="?", help="plan JSON file")
    ap.add_argument("--round", type=float, default=5, help="round the quoted rate up to this step (default 5)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.plan:
        ap.error("plan file required")
    try:
        with open(a.plan, encoding="utf-8") as fh:
            r = calc(json.load(fh), a.round)
    except (OSError, json.JSONDecodeError, DataError, ValueError, TypeError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else render(r), end="\n" if a.json else "")
    return 1 if any(f["severity"] == "HIGH" for f in r["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
