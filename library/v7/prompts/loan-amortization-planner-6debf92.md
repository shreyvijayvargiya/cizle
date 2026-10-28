# Loan Amortization Planner

By @f · general
Language: en · Domains: finance, education · Source: P01

Source page: https://prompts.chat

```
---
name: loan-amortization-planner
description: Builds fixed-rate loan and mortgage amortization schedules, shows how much of each payment goes to interest, and compares payoff strategies such as extra monthly payments, one-off lump sums, a higher fixed payment, or a shorter term, with interest saved, months saved, payoff date, and an APR estimate when fees apply. Use when a user asks "how much interest will I pay?", "should I overpay my mortgage?", "what if I pay 200 more a month?", or wants a payoff plan for a car, student, personal, or home loan. Includes a tested stdlib Python calculator.
---

# Loan Amortization Planner

You help people understand what a loan really costs and how to pay it off faster in a way that fits their budget. You run the numbers precisely, explain them in plain language, compare realistic options side by side, and point out the trade-offs (emergency savings, other debts, prepayment rules) before anyone sends extra money to a lender.

## Files in this skill

- `scripts/amortize.py` - monthly amortization for fixed-rate loans with extra monthly payments, lump sums, a fixed payment, fees and an APR estimate, a yearly table, and a CSV schedule (Python 3 standard library only)
- `references/amortization-basics.md` - how amortization works, the formulas, and the terms people confuse (rate vs APR, term vs payoff date)
- `references/prepayment-decision-guide.md` - when overpaying makes sense, what to check in the loan contract, and the order of priorities
- `templates/loan-plan.md` - the report to return
- `examples/example-mortgage-overpayment.md` - a worked comparison of three overpayment strategies on a mortgage

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- Amount still owed (or amount to borrow), interest rate, remaining term, and the current monthly payment if known.
- Fixed or variable rate, and when a fixed period ends.
- Fees: arrangement or origination fees, and any prepayment penalty or yearly overpayment limit.
- What the user can afford: an extra amount per month, an expected bonus or one-off sum, and their emergency savings and other debts.
- The goal: lowest total interest, being debt-free by a date, or lowest monthly payment.

### 2. Run the baseline
'''bash
python3 scripts/amortize.py --principal 300000 --rate 4.5 --years 30 --start 2026-12
python3 scripts/amortize.py --principal 18500 --rate 7.9 --months 48 --fee 400   # car loan with a fee: APR estimate
'''
Check that the computed payment matches the lender's statement within a few cents. If it does not, the loan probably has a different day count, fees in the balance, or insurance in the payment: ask, or use `--payment` with the real amount.

### 3. Run the scenarios
'''bash
python3 scripts/amortize.py --principal 300000 --rate 4.5 --years 30 --extra 200
python3 scripts/amortize.py --principal 300000 --rate 4.5 --years 30 --lump 12:10000 --lump 24:10000
python3 scripts/amortize.py --principal 300000 --rate 4.5 --years 30 --payment 2000 --yearly
python3 scripts/amortize.py --principal 300000 --rate 4.5 --years 20                # shorter term
python3 scripts/amortize.py ... --schedule plan.csv --json
'''
Compare 2 to 4 options that the user can really afford. For each, record the monthly outlay, payoff date, total interest, interest saved, and months saved. If you cannot run the script, use the formulas in `references/amortization-basics.md` and say the numbers are approximate.

### 4. Check the decision, not just the math
Go through `references/prepayment-decision-guide.md`: emergency fund first, higher-rate debts first, prepayment penalties and limits, tax effects to check locally, and the after-tax return of the alternative (saving or investing). Never present overpaying as always right.

### 5. Deliver
Fill in `templates/loan-plan.md`: the loan in one line, the baseline, a comparison table of scenarios, a recommendation with reasons, what to ask the lender, and next steps. Follow the style of `examples/example-mortgage-overpayment.md`.

## Rules
- Show every number with its currency and round money to cents; label estimates as estimates.
- The calculator assumes a fixed rate, monthly payments, and extra payments applied to principal straight away with the payment unchanged (the term shortens). Say so, and flag variable rates or lenders that recalculate the payment instead.
- Do not give personal investment or tax advice; explain the trade-off and tell the user what to check with the lender or a licensed adviser.
- If a payment does not even cover the interest, say so clearly and stop: the balance would grow.
- Keep the explanation short and concrete: "every 100 of extra saves about 120 of interest" beats a paragraph of theory.
FILE:references/amortization-basics.md
# Amortization basics

## How a fixed-rate loan is paid off

Each month the lender charges interest on the balance still owed. Your payment first covers that interest; the rest reduces the balance (principal). Because the balance falls, the interest part shrinks every month and the principal part grows, while the payment stays the same. Early payments are mostly interest; late payments are mostly principal.

## Formulas

- Monthly rate: r = annual rate / 12 (for example 4.5% -> 0.00375).
- Payment for a loan P over n months: M = P * r / (1 - (1 + r)^-n). With r = 0: M = P / n.
- Interest this month: balance * r. Principal this month: M - interest.
- Total interest: sum of the interest parts, or approximately M * n - P.
- Months to pay off with payment M: n = -ln(1 - P * r / M) / ln(1 + r). If P * r >= M the loan never ends.

Quick checks: 200,000 at 6% for 30 years -> 1,199.10 per month. 300,000 at 4.5% for 30 years -> 1,520.06 per month.

## Why extra payments save so much

An extra payment reduces the balance immediately, so every later month charges interest on a smaller amount. The saving is roughly the extra amount times the interest it would have carried for the rest of the loan. That is why money paid early in the loan saves more than the same money paid late.

## Terms people confuse

| Term | Meaning |
|---|---|
| Nominal rate | The yearly rate in the contract, used for the monthly interest. |
| APR | Annual percentage rate including fees; compares offers. A loan with a lower rate but high fees can have a higher APR. |
| Term | The planned length (e.g. 30 years). |
| Payoff date | When the balance actually reaches zero; earlier with extra payments. |
| Reduce term vs reduce payment | After an overpayment, some lenders keep the payment and shorten the term (saves more interest), others recalculate a lower payment. Ask which. |
| Principal | The amount still owed, not counting future interest. |
| Amortization schedule | The month-by-month table of payment, interest, principal, and balance. |

## Rounding and small differences

Lenders round to cents each month and may use daily interest (actual days / 365) instead of rate / 12. Results can differ by a few cents per month and a few units in total interest. The last payment usually absorbs the rounding difference.

## Limits of a fixed-rate calculator

- Variable or tracker rates: run scenarios at the current rate and at +1 and +2 percentage points.
- Interest-only periods, balloon payments, payment holidays: model them separately or by hand.
- Insurance, escrow, or account fees inside the monthly payment are not interest; remove them before comparing.
FILE:references/prepayment-decision-guide.md
# Should I pay off my loan faster? A decision guide

Overpaying a loan gives a guaranteed, risk-free "return" equal to the loan's interest rate. That is good, but it is not always the best use of spare money. Work through these steps in order.

## 1. Safety first
- Emergency fund: keep about 3 to 6 months of essential costs in easy-access savings before overpaying. Money sent to a lender is hard to get back.
- Stable income: if a job change, parental leave, or a big expense is coming, build cash first.

## 2. Pay the most expensive debt first
Rank debts by interest rate (avalanche method): credit cards and overdrafts, then personal and car loans, then student loans and mortgages. Overpay the highest rate first. If motivation is the problem, paying the smallest balance first (snowball) can be fine, but say what it costs.

## 3. Read the contract
- Prepayment penalty or early repayment charge (often a percent of the amount overpaid, mostly during a fixed-rate period).
- Yearly overpayment allowance (for example 10 percent of the balance per year without a fee).
- Does an overpayment reduce the term or the payment? Can you choose?
- Minimum overpayment amounts and how to make one (online, by phone, written instruction).

## 4. Compare with the alternative
- Employer retirement matching is usually better than any overpayment: take the full match first.
- Compare the loan rate with the after-tax, after-fee return you could get on savings. A 2% mortgage versus a 4% savings account: saving wins on paper. A 7% car loan versus a 3% savings account: overpaying wins.
- Investing may beat a low-rate loan over long periods but carries risk; the overpayment return is certain.
- Tax: in some countries mortgage interest is tax-deductible, which lowers the effective rate. Check locally; do not assume.

## 5. Pick a strategy
| Strategy | Good when |
|---|---|
| Fixed extra per month | Steady income; builds a habit; saves the most for the same total if started early. |
| Lump sums (bonus, tax refund) | Irregular income; keeps flexibility during the year. |
| Higher fixed payment | Wants a clear debt-free date. |
| Refinance to a shorter term | A lower rate is available and the higher payment is affordable; compare fees. |
| Keep cash, overpay later | Fixed period ending soon (overpay without penalty after), or emergency fund not full. |

## 6. Review
Re-run the numbers once a year, when the rate changes, or when income changes. Remind the user that overpaying can always be paused; a higher contractual payment usually cannot.
FILE:templates/loan-plan.md
# Loan plan: ${loan_name}

**Loan:** ${balance} at ${rate}% (${fixed_or_variable}), ${remaining_term} left, payment ${payment} per month, first payment in this plan ${start_month}
**Fees and rules:** ${fees}; prepayment limit or penalty: ${prepayment_rules}
**Goal:** ${goal}
**Budget for extra payments:** ${extra_budget}

## Baseline

- Monthly payment: 
- Total interest from now: 
- Payoff date: 
- First payment split: interest ... / principal ...

## Scenarios

| Option | Monthly outlay | Payoff date | Total interest | Interest saved | Months saved |
|---|---|---|---|---|---|
| Baseline | | | | - | - |
| A: | | | | | |
| B: | | | | | |
| C: | | | | | |

## Recommendation

Option ... because:
1. 
2. 
3. 

Trade-offs to keep in mind: 

## Before you overpay

- [ ] Emergency fund covers ... months
- [ ] No higher-rate debt left (or it comes first)
- [ ] Prepayment penalty / allowance checked with the lender
- [ ] Overpayment set to reduce the term (or payment, if preferred)

## Questions for the lender

1. 
2. 

## Next steps

1. 
2. 

*Assumptions: fixed rate, monthly payments, extra payments applied to principal immediately. These are estimates, not financial advice.*
FILE:examples/example-mortgage-overpayment.md
# Example: comparing three mortgage overpayment strategies

## User request

"We have 320,000 left on our mortgage at 4.1% fixed with 25 years to go, first payment of this plan in December 2026. We could pay about 300 extra a month, or we get a 15,000 bonus each year for the next three years. A friend says we should just switch to 2,400 a month. What's best? We have 6 months of expenses saved and no other debt. The bank allows 10% overpayment per year without fees."

## Commands

'''bash
python3 scripts/amortize.py --principal 320000 --rate 4.1 --years 25 --start 2026-12
python3 scripts/amortize.py --principal 320000 --rate 4.1 --years 25 --start 2026-12 --extra 300
python3 scripts/amortize.py --principal 320000 --rate 4.1 --years 25 --start 2026-12 --lump 12:15000 --lump 24:15000 --lump 36:15000
python3 scripts/amortize.py --principal 320000 --rate 4.1 --years 25 --start 2026-12 --payment 2400
'''

Output (shortened):

'''
Baseline: 1,706.80 per month, interest 192,038.38, total paid 512,038.38, paid off 2051-11 (300 payments)
Plan (+300.00/month): paid off 2046-02 (231 payments), interest 143,068.39
  Saves 48,969.99 interest and 69 months (5 y 9 m); every 100 of extra saves 70.97
Plan (lump sums 15,000.00 in payment 12, 15,000.00 in payment 24, 15,000.00 in payment 36): paid off 2046-11 (240 payments), interest 133,018.73
  Saves 59,019.65 interest and 60 months (5 y 0 m); every 100 of extra saves 131.15
Plan (fixed payment 2,400.00): paid off 2041-10 (179 payments), interest 107,805.37
  Saves 84,233.01 interest and 121 months (10 y 1 m)
'''

## Loan plan (filled template, shortened)

**Loan:** 320,000.00 at 4.1% fixed, 25 years left, payment 1,706.80 per month, first payment December 2026
**Fees and rules:** overpayments up to 10% of the balance per year are free
**Goal:** pay less interest without losing flexibility

| Option | Monthly outlay | Payoff date | Total interest | Interest saved | Months saved |
|---|---|---|---|---|---|
| Baseline | 1,706.80 | 2051-11 | 192,038.38 | - | - |
| A: +300 per month | 2,006.80 | 2046-02 | 143,068.39 | 48,969.99 | 69 |
| B: 15,000 bonus in years 1 to 3 | 1,706.80 + 45,000 total | 2046-11 | 133,018.73 | 59,019.65 | 60 |
| C: fixed 2,400 per month | 2,400.00 | 2041-10 | 107,805.37 | 84,233.01 | 121 |

**Recommendation:** Option B, plus A if the budget allows. The bonuses are paid early in the loan, so each 100 overpaid saves about 131 of interest, almost twice the rate of the monthly plan (about 71 per 100, because much of that money is paid in later years). It needs no change to the monthly budget, and each 15,000 is within the free 10% allowance (32,000 in year 1). Option C saves the most because it sends about 124,000 of extra money over 15 years, but it raises the fixed outlay by 693 per month; do it only if that fits comfortably, and set it up as a voluntary overpayment rather than a new contract payment so it can be paused.

**Trade-offs:** money overpaid is hard to get back; keep the 6-month emergency fund untouched. If your savings account pays more than 4.1% after tax, saving could beat overpaying on paper; check the rate and any tax rules locally.

**Questions for the lender:**
1. Will overpayments reduce the term with the payment unchanged (assumed above), or recalculate the payment?
2. Does the 10% allowance reset per calendar year or per loan year?

*Assumptions: fixed rate for the whole term, monthly payments, overpayments applied to principal immediately. Estimates, not financial advice.*
FILE:scripts/amortize.py
#!/usr/bin/env python3
"""Fixed-rate loan amortization with extra payments and scenario comparison.

Usage:
  python3 amortize.py --principal 250000 --rate 4.2 --years 30 [options]
  python3 amortize.py --principal 18000 --rate 7.9 --months 60 --extra 150

Options:
  --principal N      amount borrowed (required)
  --rate PCT         nominal annual interest rate in percent, e.g. 4.2 (required; 0 allowed)
  --years N | --months N   term (one of them is required)
  --start YYYY-MM    month of the first payment (default: next month)
  --extra N          extra amount added to every monthly payment
  --extra-from N     payment number where --extra starts (default 1)
  --lump N:AMOUNT    one-off extra payment in payment number N (repeatable)
  --payment N        pay this fixed monthly amount instead of the computed one
  --fee N            one-off upfront fees, used for the cost and APR estimate
  --schedule FILE    write the full monthly schedule as CSV
  --yearly           print a year-by-year table
  --json             print the result as JSON

Extra payments are assumed to reduce principal immediately with no prepayment
penalty and the same monthly payment (term shortens). Rates are nominal annual,
compounded monthly (rate / 12 per month). Money is rounded to cents each month.
Exit codes: 0 ok, 2 usage or input error. Python 3 standard library only.
"""
import argparse
import csv
import datetime as dt
import json
import sys


def monthly_payment(principal, annual_rate, n):
    r = annual_rate / 100 / 12
    if r == 0:
        return principal / n
    return principal * r / (1 - (1 + r) ** -n)


def add_months(ym, k):
    y, m = ym
    m0 = m - 1 + k
    return (y + m0 // 12, m0 % 12 + 1)


def schedule(principal, annual_rate, n, payment=None, extra=0.0, extra_from=1, lumps=None):
    r = annual_rate / 100 / 12
    base = round(payment if payment else monthly_payment(principal, annual_rate, n), 2)
    lumps = lumps or {}
    bal = round(principal, 2)
    rows = []
    k = 0
    while bal > 0.005:
        k += 1
        if k > 1200:
            raise ValueError("the loan is not paid off within 100 years; the payment is too small for the interest")
        interest = round(bal * r, 2)
        if base + (extra if k >= extra_from else 0) <= interest and not lumps.get(k):
            raise ValueError(f"payment {base:.2f} does not cover the monthly interest {interest:.2f}; the balance would grow")
        sched = min(base, bal + interest)
        if payment is None and k == n:
            sched = bal + interest  # last scheduled payment absorbs the rounding difference
        ext = min(extra if k >= extra_from else 0.0, max(bal + interest - sched, 0))
        lump = min(lumps.get(k, 0.0), max(bal + interest - sched - ext, 0))
        principal_paid = round(sched + ext + lump - interest, 2)
        bal = round(bal - principal_paid, 2)
        rows.append({"n": k, "payment": round(sched, 2), "extra": round(ext + lump, 2), "interest": interest,
                     "principal": principal_paid, "balance": max(bal, 0.0)})
    return base, rows


def summarize(rows):
    return {"months": len(rows), "total_interest": round(sum(x["interest"] for x in rows), 2),
            "total_paid": round(sum(x["payment"] + x["extra"] for x in rows), 2),
            "total_extra": round(sum(x["extra"] for x in rows), 2)}


def apr_estimate(principal, fee, payment, n):
    """Annual rate that makes the payments worth principal - fee (bisection)."""
    target = principal - fee
    lo, hi = 0.0, 1.0
    for _ in range(100):
        mid = (lo + hi) / 2
        r = mid / 12
        pv = payment * n if r == 0 else payment * (1 - (1 + r) ** -n) / r
        lo, hi = (mid, hi) if pv > target else (lo, mid)
    return round(lo * 100, 3)


def fmt_ym(ym):
    return f"{ym[0]:04d}-{ym[1]:02d}"


def main(argv):
    p = argparse.ArgumentParser(add_help=True, description="Loan amortization with extra payments")
    p.add_argument("--principal", type=float, required=True)
    p.add_argument("--rate", type=float, required=True)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--years", type=float)
    g.add_argument("--months", type=int)
    p.add_argument("--start")
    p.add_argument("--extra", type=float, default=0.0)
    p.add_argument("--extra-from", type=int, default=1)
    p.add_argument("--lump", action="append", default=[])
    p.add_argument("--payment", type=float)
    p.add_argument("--fee", type=float, default=0.0)
    p.add_argument("--schedule")
    p.add_argument("--yearly", action="store_true")
    p.add_argument("--json", action="store_true")
    try:
        a = p.parse_args(argv)
    except SystemExit as e:
        return 0 if e.code == 0 else 2
    try:
        n = a.months if a.months else round(a.years * 12)
        if a.principal <= 0 or n <= 0 or a.rate < 0 or a.extra < 0 or a.fee < 0:
            raise ValueError("principal and term must be positive; rate, extra, and fee cannot be negative")
        if a.rate > 100:
            raise ValueError("rate is in percent per year, e.g. 4.2 for 4.2%")
        lumps = {}
        for item in a.lump:
            num, _, amt = item.partition(":")
            try:
                if not num.isdigit():
                    raise ValueError
                value = float(amt)
            except ValueError:
                raise ValueError(f"--lump must look like 24:5000 (payment number:amount), got {item!r}") from None
            lumps[int(num)] = lumps.get(int(num), 0.0) + value
        if a.start:
            try:
                y, m = a.start.split("-")
                start = (int(y), int(m))
            except ValueError:
                raise ValueError(f"--start must look like 2026-11, got {a.start!r}") from None
            if not 1 <= start[1] <= 12:
                raise ValueError("--start month must be 01 to 12")
        else:
            t = dt.date.today()
            start = add_months((t.year, t.month), 1)
        base_pay, base_rows = schedule(a.principal, a.rate, n, payment=None)
        scenario = bool(a.extra or lumps or a.payment)
        pay, rows = schedule(a.principal, a.rate, n, payment=a.payment, extra=a.extra,
                             extra_from=a.extra_from, lumps=lumps) if scenario else (base_pay, base_rows)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    base_sum, plan_sum = summarize(base_rows), summarize(rows)
    result = {
        "inputs": {"principal": a.principal, "annual_rate_pct": a.rate, "term_months": n, "first_payment": fmt_ym(start),
                   "extra_monthly": a.extra, "extra_from_payment": a.extra_from, "lumps": lumps, "fixed_payment": a.payment, "fees": a.fee},
        "baseline": {"monthly_payment": base_pay, **base_sum, "payoff": fmt_ym(add_months(start, base_sum["months"] - 1))},
    }
    if a.fee:
        result["baseline"]["apr_estimate_pct"] = apr_estimate(a.principal, a.fee, base_pay, n)
        result["baseline"]["total_cost_incl_fees"] = round(base_sum["total_interest"] + a.fee, 2)
    if scenario:
        result["plan"] = {"monthly_payment": pay, **plan_sum, "payoff": fmt_ym(add_months(start, plan_sum["months"] - 1)),
                          "months_saved": base_sum["months"] - plan_sum["months"],
                          "interest_saved": round(base_sum["total_interest"] - plan_sum["total_interest"], 2)}
        if plan_sum["total_extra"]:
            result["plan"]["interest_saved_per_100_extra"] = round(100 * result["plan"]["interest_saved"] / plan_sum["total_extra"], 2)
    yearly = []
    for i in range(0, len(rows), 12):
        chunk = rows[i:i + 12]
        yearly.append({"year": i // 12 + 1, "paid": round(sum(x["payment"] + x["extra"] for x in chunk), 2),
                       "interest": round(sum(x["interest"] for x in chunk), 2),
                       "principal": round(sum(x["principal"] for x in chunk), 2), "end_balance": chunk[-1]["balance"]})
    result["yearly"] = yearly
    first = base_rows[0]
    result["baseline"]["first_payment_split"] = {"interest": first["interest"], "principal": first["principal"]}

    if a.schedule:
        try:
            with open(a.schedule, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(["n", "month", "payment", "extra", "interest", "principal", "balance"])
                for x in rows:
                    w.writerow([x["n"], fmt_ym(add_months(start, x["n"] - 1)), f"{x['payment']:.2f}", f"{x['extra']:.2f}",
                                f"{x['interest']:.2f}", f"{x['principal']:.2f}", f"{x['balance']:.2f}"])
        except OSError as e:
            print(f"error: cannot write schedule {a.schedule}: {e.strerror}", file=sys.stderr)
            return 2
    if a.json:
        print(json.dumps(result, indent=2))
        return 0
    b = result["baseline"]
    print(f"Loan {a.principal:,.2f} at {a.rate}% for {n} months, first payment {fmt_ym(start)}")
    print(f"Baseline: {b['monthly_payment']:,.2f} per month, interest {b['total_interest']:,.2f}, "
          f"total paid {b['total_paid']:,.2f}, paid off {b['payoff']} ({b['months']} payments)")
    if a.fee:
        print(f"  With fees {a.fee:,.2f}: total cost of borrowing {b['total_cost_incl_fees']:,.2f}, APR about {b['apr_estimate_pct']}%")
    print(f"  First payment: {first['interest']:,.2f} interest, {first['principal']:,.2f} principal")
    if scenario:
        pl = result["plan"]
        what = []
        if a.payment:
            what.append(f"fixed payment {a.payment:,.2f}")
        if a.extra:
            what.append(f"+{a.extra:,.2f}/month" + (f" from payment {a.extra_from}" if a.extra_from > 1 else ""))
        if lumps:
            what.append("lump sums " + ", ".join(f"{v:,.2f} in payment {k}" for k, v in sorted(lumps.items())))
        print(f"Plan ({'; '.join(what)}): paid off {pl['payoff']} ({pl['months']} payments), "
              f"interest {pl['total_interest']:,.2f}")
        ms = pl["months_saved"]
        if ms >= 0 and pl["interest_saved"] >= 0:
            print(f"  Saves {pl['interest_saved']:,.2f} interest and {ms} months ({ms // 12} y {ms % 12} m)"
                  + (f"; every 100 of extra saves {pl['interest_saved_per_100_extra']:,.2f}" if pl.get("interest_saved_per_100_extra") else ""))
        else:
            print(f"  WARNING: this plan costs {-pl['interest_saved']:,.2f} MORE interest and takes {-ms} months longer than the baseline")
    if a.yearly:
        print(f"\nYear-by-year ({'plan' if scenario else 'baseline'}):")
        print(f"{'Year':>4} {'Paid':>12} {'Interest':>12} {'Principal':>12} {'Balance':>12}")
        for y in yearly:
            print(f"{y['year']:>4} {y['paid']:>12,.2f} {y['interest']:>12,.2f} {y['principal']:>12,.2f} {y['end_balance']:>12,.2f}")
    if a.schedule:
        print(f"\nSchedule written to {a.schedule} ({len(rows)} rows)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
