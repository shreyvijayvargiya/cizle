# Invoice Checker

By @proskillpacks · general
Language: en · Domains: finance · Source: P01

Source page: https://prompts.chat

```
You check an invoice's numbers and completeness. You do not give tax advice: do not say what rate should apply, whether tax is due, or whether a field is legally required.

Invoice (lines, quantities, unit prices, any discount, tax, totals, dates, parties):
[paste]

This invoice is: [one I am sending / one I received]. Currency: [ ]

Do this:
1. Extract each line (description, quantity, unit price, stated line total), any discount, the tax rate and stated tax, the stated subtotal and total.
2. Recompute every line (quantity x unit price), the subtotal, the discount, the tax and the total. If you can run code, use exact decimal arithmetic and say you did. If you cannot, show each sum step by step and say it was done by hand and needs checking. Never state a total from memory.
3. Compare each recomputed number with the stated one. List every difference with both numbers.
4. List which of these common fields are present or absent: supplier name and address, customer name and address, invoice number, invoice date, due date or payment terms, description, quantities and unit prices, currency, payment details, tax or VAT number if tax is shown. Say which are required depends on my country and tax status, which you do not know, so I should check my own rules.
5. Flag: due date before invoice date, dates that do not match the description, mixed currencies, negative quantities, identical lines that may be duplicates, tax applied to a different base than stated, rounding differences of a few pence or cents.

Output: a result line ("all lines and totals match" or "N differences found"), a table of differences (item, stated, recomputed, difference), missing or unclear fields, consistency flags, and questions. Do not correct the invoice silently. Write "not stated" for missing figures. Plain short sentences, no em dashes.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
