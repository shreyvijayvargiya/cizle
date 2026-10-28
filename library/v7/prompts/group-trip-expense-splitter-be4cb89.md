# Group Trip Expense Splitter

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: group-trip-expense-splitter
description: Splits shared costs for a group trip, house share, or event: equal, subset, weighted, or exact splits, mixed currencies with stated rates, and repayments already made, all in integer cents so totals match. Produces per-person balances and a short "who pays whom" list (at most one transfer fewer than people). Use when friends ask "who owes what?" after a trip or a shared house month. Includes a stdlib Python splitter with --self-test.
---

# Group Trip Expense Splitter

You help a group settle shared expenses fairly and without arguments. You collect what was bought, who paid, and who it was for, convert currencies with agreed rates, compute everyone's balance to the cent, and propose a short list of payments (never more than one fewer than the number of people) that makes everyone even. You explain every number so anyone in the group can check it.

## Files in this skill

- `scripts/split_expenses.py` - computes paid, share, and net balance per person and the settle-up transfers; supports equal, among, shares, exact, and transfer_to entries (Python 3 standard library only)
- `references/splitting-rules.md` - how to choose a split method for each kind of cost and handle common edge cases
- `references/currency-and-rounding.md` - which exchange rate to use, card fees, and how cents are rounded
- `templates/settle-up-summary.md` - a summary to paste into the group chat
- `examples/trip.json` - a 4-person weekend with a skipped dinner, student tickets, weighted drinks, USD and GBP costs, and a cash repayment

## Workflow

### 1. Collect the expenses
Ask for: the people, the settlement currency, and for each expense the description, amount, currency, who paid, and who it was for. Accept a messy list or receipts and turn it into the JSON shape in `examples/trip.json`. Ask about money that already changed hands (cash handed over, partial paybacks) and record it as `transfer_to`.

### 2. Choose the split for each item
Default is equal among everyone. Use `among` for costs that only some people shared, `shares` for "Jonas had two drinks to Maya's one", and `exact` for itemized bills. See `references/splitting-rules.md` and confirm unclear items with the group instead of guessing.

### 3. Set currency rates
Agree on one rate per currency (card statement rate, or a published rate on a stated date) and put it in `rates` as "1 unit = X settlement units". See `references/currency-and-rounding.md`.

### 4. Run the splitter
'''
python3 scripts/split_expenses.py examples/trip.json
python3 scripts/split_expenses.py trip.json --json > settle.json
python3 scripts/split_expenses.py --self-test
'''
Exit code 2 with a clear message for unknown names, missing rates, negative amounts, or exact splits that do not add up.

### 5. Share the result
Fill `templates/settle-up-summary.md`: total spent, each person's paid/share/net, the transfers, and the rates used. Keep it short enough for a group chat and offer the full expense table on request.

## Rules

- Never guess who shared an expense; ask, or split equally and say so.
- Totals must match to the cent; mention who received rounding cents.
- Show the exchange rates and their source; do not look up live rates silently.
- Stay neutral: present numbers, not judgments about who spent more.
- Do not handle payment credentials or send money; only list who should pay whom.
FILE:references/splitting-rules.md
# Splitting Rules and Edge Cases

## Choosing a method
| Situation | Method | Example |
|---|---|---|
| Everyone used it | equal (default) | accommodation, car rental, shared groceries |
| Only some people took part | `among` | dinner one person skipped, a tour two people joined |
| Uneven use of the same thing | `shares` | drinks, nights stayed (3 nights vs 2), fuel by distance |
| Itemized bill or different prices | `exact` | student vs adult tickets, separate menu items |
| Money already handed over | `transfer_to` | cash paid back, a bank transfer during the trip |

## Edge cases
- **Someone arrives late or leaves early.** Use `shares` by nights for the accommodation (e.g. 3, 3, 2, 3).
- **Couples or families paying as one.** Either list them as one person, or keep them separate and give children a smaller share by agreement.
- **Deposits and refunds.** Amounts must be positive, so lower the original expense by the refund. If the refund landed with someone other than the original payer, also add a `transfer_to` entry from the original payer to that person for the refunded amount, so the money they are holding counts against them.
- **Tips and service charges.** Split like the bill they belong to.
- **Gifts for one member (birthday dinner).** Use `among` with everyone except the guest.
- **Shared kitty / common pot.** Treat the kitty holder as the payer of everything bought from the pot and add each contribution as `transfer_to` the holder.
- **Personal items on a shared receipt.** Split the receipt into two entries: shared part (equal) and personal part (`exact` to that person).

## Fairness checks before sharing
1. Sum of everyone's share equals total spent.
2. Every expense has a payer who was actually there.
3. Nobody's share includes things they explicitly declined.
4. The group agreed on the rates and on any unequal splits.
FILE:references/currency-and-rounding.md
# Currency and Rounding

## Picking exchange rates
- **Best:** the rate on the payer's card or bank statement for that charge, including any foreign transaction fee, because that is what they actually paid.
- **Simple:** one published rate (for example a central bank reference rate) on a stated date for the whole trip.
- **Cash bought at an exchange office:** the rate they bought the cash at.
Write rates as "1 unit of foreign currency = X units of settlement currency": `"USD": 0.92` means 1 USD = 0.92 EUR.

## Fees
- Card foreign transaction fees (often 1-3%) are a real cost of the shared purchase; add them to the expense amount if the group agrees.
- Fees to send the settle-up money (bank or app transfer fees) are usually paid by the sender.

## Rounding to the cent
1. Each expense is converted and rounded once (half up) to whole cents.
2. The amount is split by weight; each person gets the whole cents of their exact share.
3. Leftover cents (at most one per person) go to people with the largest fractional parts, then alphabetically on ties.
This keeps every expense exact to the cent and the result reproducible. Over a trip the rounding difference per person is a few cents at most.

## Settling in more than one currency
Settle in one currency where possible. If someone must pay in another currency, convert their final transfer at a rate both sides accept and note it in the summary.
FILE:templates/settle-up-summary.md
# Settle-up - <trip or event name>

**Dates:** <dates>  **People:** <names>  **Settlement currency:** <currency>
**Total spent:** <amount> across <n> expenses  **Rates used:** <1 USD = 0.92 EUR (card statements), ...>

## Balances
| Person | Paid | Share | Net (+ gets back / - owes) |
|---|---|---|---|
| | | | |

## Who pays whom
- <name> pays <name> <amount>
- <name> pays <name> <amount>

## Notes
- Unequal splits: <dinner without Leo, student tickets, drinks by count>
- Rounding cents went to: <names>
- Already settled during the trip: <cash or transfers>

## Group chat message
> Trip totals are in! We spent <total> together. To settle up: <transfer 1>; <transfer 2>; <transfer 3>. Full breakdown is in the thread. Shout if anything looks off by <date>.
FILE:examples/trip.json
{
  "trip": "Lisbon long weekend, 4 friends",
  "currency": "EUR",
  "rates": {"USD": 0.92, "GBP": 1.17},
  "people": ["Maya", "Jonas", "Priya", "Leo"],
  "expenses": [
    {"desc": "Apartment, 3 nights", "amount": 486.00, "paid_by": "Maya"},
    {"desc": "Airport taxi", "amount": 38.50, "paid_by": "Jonas"},
    {"desc": "Groceries for breakfasts", "amount": 61.27, "paid_by": "Priya"},
    {"desc": "Seafood dinner (Leo skipped)", "amount": 142.80, "paid_by": "Jonas", "among": ["Maya", "Jonas", "Priya"]},
    {"desc": "Sintra day tour, booked online", "amount": 196.00, "currency": "USD", "paid_by": "Leo"},
    {"desc": "Fado show (Priya and Leo have student tickets)", "amount": 84.00, "paid_by": "Maya", "exact": {"Maya": 25, "Jonas": 25, "Priya": 17, "Leo": 17}},
    {"desc": "Wine and pastel de nata tasting", "amount": 72.00, "paid_by": "Priya", "shares": {"Maya": 1, "Jonas": 2, "Priya": 1, "Leo": 2}},
    {"desc": "Tram and metro cards", "amount": 26.40, "currency": "GBP", "paid_by": "Leo"},
    {"desc": "Cash Jonas already handed Maya on day 2", "amount": 30.00, "paid_by": "Jonas", "transfer_to": "Maya"}
  ]
}
FILE:scripts/split_expenses.py
#!/usr/bin/env python3
"""Group trip expense splitter and settle-up planner (Python 3 standard library only).

Input JSON:
{
  "currency": "EUR",                         # settlement currency
  "rates": {"USD": 0.92, "TRY": 0.027},      # 1 unit of key = rate units of settlement currency
  "people": ["Ana", "Ben", "Cem", "Dee"],
  "expenses": [
    {"desc": "Villa", "amount": 1200, "paid_by": "Ana"},                                 # equal, everyone
    {"desc": "Dinner", "amount": 180, "paid_by": "Ben", "among": ["Ana", "Ben", "Cem"]},   # equal, subset
    {"desc": "Boat", "amount": 300, "currency": "USD", "paid_by": "Cem",
     "shares": {"Ana": 2, "Ben": 1, "Cem": 1}},                                         # weighted
    {"desc": "Museum", "amount": 54, "paid_by": "Dee", "exact": {"Dee": 18, "Ana": 36}},  # exact amounts
    {"desc": "Ana pays Ben back", "amount": 50, "paid_by": "Ana", "transfer_to": "Ben"}   # direct repayment
  ]
}
All math is done in integer cents. Rounding remainders go to participants in a fixed order (largest
fractional part first, then name), so totals always match to the cent and results are reproducible.
Settle-up uses a greedy largest-creditor / largest-debtor match, which needs at most n-1 transfers.

Usage:
  python3 split_expenses.py trip.json
  python3 split_expenses.py trip.json --json
  python3 split_expenses.py --self-test
Exit code: 0 OK, 2 bad input.
"""
import argparse
import json
import sys
from decimal import Decimal, ROUND_HALF_UP


class SplitError(ValueError):
    pass


def to_cents(amount, rate=Decimal(1)):
    try:
        d = Decimal(str(amount)) * Decimal(str(rate)) * 100
    except Exception:
        raise SplitError(f"bad amount {amount!r}")
    return int(d.quantize(Decimal(1), rounding=ROUND_HALF_UP))


def fmt(cents, cur):
    sign = "-" if cents < 0 else ""
    return f"{sign}{abs(cents) // 100:,}.{abs(cents) % 100:02d} {cur}"


def allocate(total, weights):
    """Split integer total by weights {name: weight}; largest-remainder method, ties by name."""
    wsum = sum(weights.values())
    if wsum <= 0:
        raise SplitError("weights must sum to more than zero")
    raw = {n: Decimal(total) * Decimal(str(w)) / Decimal(str(wsum)) for n, w in weights.items()}
    base = {n: int(v) for n, v in raw.items()}
    left = total - sum(base.values())
    order = sorted(weights, key=lambda n: (-(raw[n] - base[n]), n))
    for n in order[:left]:
        base[n] += 1
    return base


def compute(data):
    cur = data.get("currency") or "EUR"
    rates = {k.upper(): v for k, v in (data.get("rates") or {}).items()}
    people = data.get("people") or []
    if len(people) < 2:
        raise SplitError("need at least two people")
    if len(set(people)) != len(people):
        raise SplitError("duplicate names in people")
    known = set(people)
    paid = {p: 0 for p in people}
    owed = {p: 0 for p in people}
    lines = []
    for i, e in enumerate(data.get("expenses") or [], start=1):
        desc = e.get("desc") or f"expense {i}"
        payer = e.get("paid_by")
        if payer not in known:
            raise SplitError(f"{desc}: paid_by {payer!r} is not in people")
        ecur = (e.get("currency") or cur).upper()
        if ecur == cur.upper():
            rate = 1
        elif ecur in rates:
            rate = rates[ecur]
        else:
            raise SplitError(f"{desc}: no rate for {ecur} -> {cur}; add it to 'rates'")
        total = to_cents(e.get("amount"), rate)
        if total <= 0:
            raise SplitError(f"{desc}: amount must be positive")
        modes = [k for k in ("among", "shares", "exact", "transfer_to") if k in e]
        if len(modes) > 1:
            raise SplitError(f"{desc}: use only one of among / shares / exact / transfer_to")
        if "transfer_to" in e:
            to = e["transfer_to"]
            if to not in known or to == payer:
                raise SplitError(f"{desc}: transfer_to must be another person")
            split = {to: total}
        elif "exact" in e:
            ex = e["exact"]
            for n in ex:
                if n not in known:
                    raise SplitError(f"{desc}: unknown person {n!r}")
            split = {n: to_cents(v, rate) for n, v in ex.items()}
            diff = total - sum(split.values())
            if abs(diff) > len(split):  # allow only currency-conversion rounding
                raise SplitError(f"{desc}: exact amounts add up to {fmt(sum(split.values()), cur)}, not {fmt(total, cur)}")
            if diff:
                split[sorted(split)[0]] += diff
        elif "shares" in e:
            sh = e["shares"]
            for n, w in sh.items():
                if n not in known:
                    raise SplitError(f"{desc}: unknown person {n!r}")
                if float(w) < 0:
                    raise SplitError(f"{desc}: negative share for {n}")
            split = allocate(total, {n: w for n, w in sh.items() if float(w) > 0})
        else:
            among = e.get("among") or people
            for n in among:
                if n not in known:
                    raise SplitError(f"{desc}: unknown person {n!r}")
            split = allocate(total, {n: 1 for n in among})
        paid[payer] += total
        for n, c in split.items():
            owed[n] += c
        lines.append({"desc": desc, "paid_by": payer, "amount": total, "original": f"{e.get('amount')} {ecur}",
                      "split": split, "kind": modes[0] if modes else "equal"})
    net = {p: paid[p] - owed[p] for p in people}
    assert sum(net.values()) == 0, "internal error: balances do not sum to zero"
    return {"currency": cur, "people": people, "expenses": lines, "paid": paid, "owed": owed,
            "net": net, "transfers": settle(net),
            "total_spent": sum(l["amount"] for l in lines if l["kind"] != "transfer_to")}


def settle(net):
    cred = sorted([[c, n] for n, c in net.items() if c > 0], key=lambda x: (-x[0], x[1]))
    debt = sorted([[-c, n] for n, c in net.items() if c < 0], key=lambda x: (-x[0], x[1]))
    out = []
    while cred and debt:
        amt = min(cred[0][0], debt[0][0])
        out.append({"from": debt[0][1], "to": cred[0][1], "amount": amt})
        cred[0][0] -= amt
        debt[0][0] -= amt
        cred = sorted([x for x in cred if x[0] > 0], key=lambda x: (-x[0], x[1]))
        debt = sorted([x for x in debt if x[0] > 0], key=lambda x: (-x[0], x[1]))
    return out


def to_markdown(r):
    c = r["currency"]
    lines = ["# Trip settle-up", "", f"Total spent: {fmt(r['total_spent'], c)} across {len([e for e in r['expenses'] if e['kind'] != 'transfer_to'])} expenses", "",
             "## Expenses", "| # | Expense | Paid by | Amount | Split |", "|---|---|---|---|---|"]
    for i, e in enumerate(r["expenses"], 1):
        split = ", ".join(f"{n} {fmt(v, c)}" for n, v in sorted(e["split"].items()))
        conv = "" if e["original"].endswith(c.upper()) else f" ({e['original']})"
        lines.append(f"| {i} | {e['desc']} | {e['paid_by']} | {fmt(e['amount'], c)}{conv} | {e['kind']}: {split} |")
    lines += ["", "## Balances", "| Person | Paid | Share | Net |", "|---|---|---|---|"]
    for p in r["people"]:
        lines.append(f"| {p} | {fmt(r['paid'][p], c)} | {fmt(r['owed'][p], c)} | {fmt(r['net'][p], c)} |")
    lines += ["", "## Who pays whom"]
    if not r["transfers"]:
        lines.append("Everyone is even.")
    lines += [f"- {t['from']} pays {t['to']} {fmt(t['amount'], c)}" for t in r["transfers"]]
    return "\n".join(lines)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    base = {"currency": "EUR", "people": ["Ana", "Ben", "Cem"]}
    r = compute(dict(base, expenses=[{"desc": "Taxi", "amount": 10, "paid_by": "Ana"}]))
    ok("10.00 split three ways sums exactly", sum(r["owed"].values()) == 1000 and sorted(r["owed"].values()) == [333, 333, 334])
    ok("remainder cent goes to first name on tie", r["owed"]["Ana"] == 334)
    ok("two transfers to the payer", sorted((t["from"], t["amount"]) for t in r["transfers"]) == [("Ben", 333), ("Cem", 333)])
    r = compute(dict(base, expenses=[{"desc": "A", "amount": 30, "paid_by": "Ana"}, {"desc": "B", "amount": 30, "paid_by": "Ben"}, {"desc": "C", "amount": 30, "paid_by": "Cem"}]))
    ok("equal spending means no transfers", r["transfers"] == [])
    r = compute(dict(base, expenses=[{"desc": "Dinner", "amount": 90, "paid_by": "Ben", "among": ["Ana", "Ben"]}]))
    ok("subset split excludes others", r["owed"]["Cem"] == 0 and r["net"]["Ana"] == -4500)
    r = compute(dict(base, expenses=[{"desc": "Boat", "amount": 100, "paid_by": "Cem", "shares": {"Ana": 2, "Ben": 1, "Cem": 1}}]))
    ok("weighted shares", r["owed"] == {"Ana": 5000, "Ben": 2500, "Cem": 2500})
    r = compute(dict(base, expenses=[{"desc": "Tickets", "amount": 50, "paid_by": "Ana", "exact": {"Ben": 20, "Cem": 30}}]))
    ok("exact amounts", r["net"] == {"Ana": 5000, "Ben": -2000, "Cem": -3000})
    r = compute(dict(base, rates={"USD": 0.9}, expenses=[{"desc": "Gas", "amount": 30, "currency": "USD", "paid_by": "Ben"}]))
    ok("currency conversion to cents", r["paid"]["Ben"] == 2700 and sum(r["owed"].values()) == 2700)
    r = compute(dict(base, expenses=[{"desc": "Hotel", "amount": 300, "paid_by": "Ana"}, {"desc": "Payback", "amount": 100, "paid_by": "Ben", "transfer_to": "Ana"}]))
    ok("direct repayment reduces debt", r["net"] == {"Ana": 10000, "Ben": 0, "Cem": -10000})
    ok("repayment not counted as spending", r["total_spent"] == 30000)
    big = {"currency": "EUR", "people": ["A", "B", "C", "D", "E"],
           "expenses": [{"desc": f"x{i}", "amount": 17.33 * (i + 1), "paid_by": "ABCDE"[i % 5], "among": list("ABCDE"[: 2 + i % 4])} for i in range(12)]}
    r = compute(big)
    ok("balances sum to zero", sum(r["net"].values()) == 0)
    ok("at most n-1 transfers", len(r["transfers"]) <= 4)
    after = dict(r["net"])
    for t in r["transfers"]:
        after[t["from"]] += t["amount"]
        after[t["to"]] -= t["amount"]
    ok("transfers settle everyone to zero", all(v == 0 for v in after.values()))
    ok("deterministic output", compute(big)["transfers"] == r["transfers"])
    bad_inputs = [
        (dict(base, expenses=[{"desc": "X", "amount": 10, "paid_by": "Zed"}]), "unknown payer rejected"),
        (dict(base, expenses=[{"desc": "X", "amount": 10, "currency": "GBP", "paid_by": "Ana"}]), "missing rate rejected"),
        (dict(base, expenses=[{"desc": "X", "amount": 10, "paid_by": "Ana", "exact": {"Ben": 3}}]), "exact mismatch rejected"),
        (dict(base, expenses=[{"desc": "X", "amount": -5, "paid_by": "Ana"}]), "negative amount rejected"),
        ({"people": ["Solo"], "expenses": []}, "single person rejected"),
    ]
    for data, label in bad_inputs:
        try:
            compute(data)
            ok(label, False)
        except SplitError:
            ok(label, True)
    ok("markdown has settle-up section", "## Who pays whom" in to_markdown(compute(dict(base, expenses=[{"desc": "Taxi", "amount": 10, "paid_by": "Ana"}]))))
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Split shared trip expenses and plan a short list of settle-up transfers.")
    ap.add_argument("file", nargs="?", help="trip JSON file, or '-' for stdin")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("trip JSON required (or --self-test)")
    try:
        data = json.load(sys.stdin if a.file == "-" else open(a.file, encoding="utf-8"))
        r = compute(data)
    except (OSError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2, ensure_ascii=False) if a.json else to_markdown(r))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
