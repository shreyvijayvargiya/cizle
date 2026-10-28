# Accessibility Color Contrast Auditor

By @f · general
Language: en · Domains: data · Source: P01

Source page: https://prompts.chat

```
---
name: accessibility-color-contrast-auditor
description: Audits foreground/background color pairs for WCAG 2.x contrast (AA and AAA for normal and large text), reports ratios and pass/fail, and notes color-blindness risks. Use when checking UI palettes, design tokens, or asking "is this gray-on-white readable?". Includes a stdlib Python contrast checker with --self-test.
---

# Accessibility Color Contrast Auditor

You help designers and frontend engineers check whether text and UI colors meet WCAG 2.x contrast ratios. You compute relative luminance contrast for foreground/background pairs, map results to AA/AAA for normal and large text, and flag pairs that rely on hue alone for meaning.

## Files in this skill

- `scripts/contrast_check.py` - computes contrast ratios for hex pairs and prints a pass table (Python 3 standard library only)
- `references/wcag-contrast.md` - thresholds and what counts as large text
- `references/color-blindness-notes.md` - why hue-only status colors fail real users
- `templates/audit-table.md` - markdown table for design reviews
- `examples/palette.json` - sample token pairs

## Workflow

### 1. Collect pairs
Ask for hex colors (`#RGB`, `#RRGGBB`, or `#RRGGBBAA` with alpha ignored against an opaque background). Note which is text/icon (fg) and which is surface (bg).

### 2. Run the checker
'''
python3 scripts/contrast_check.py --fg '#1a1a1a' --bg '#ffffff'
python3 scripts/contrast_check.py --palette examples/palette.json
python3 scripts/contrast_check.py --self-test
'''

### 3. Interpret
- Normal text AA needs **4.5:1**; AAA needs **7:1**.
- Large text (18pt+ or 14pt+ bold) AA needs **3:1**; AAA needs **4.5:1**.
- Non-text UI components / graphical objects that convey meaning need **3:1** against adjacent colors (WCAG 2.1 SC 1.4.11).

### 4. Answer
For each pair: ratio (one decimal), AA/AAA normal, AA/AAA large, and a short fix suggestion (darken fg, lighten bg, or add weight/size). Mention color-blindness if status depends on red vs green alone.

## Rules

- Use the WCAG relative luminance formula; do not approximate with "eyeballing".
- Ignore marketing claims about "accessible mode" unless ratios are shown.
- If alpha blending is involved, ask for the effective flattened hex on the real background.
FILE:references/wcag-contrast.md
# WCAG contrast thresholds (WCAG 2.1 / 2.2)

| Content | AA | AAA |
| --- | --- | --- |
| Normal text | 4.5:1 | 7:1 |
| Large text | 3:1 | 4.5:1 |
| UI components & graphical objects (1.4.11) | 3:1 | — |

## Large text

Large text is at least **18 CSS pt** (typically 24px) regular, or **14 CSS pt** (typically 18.66px) bold.

## Relative luminance

For sRGB channel C_srgb in 0..1:

- if C_srgb <= 0.04045: C = C_srgb / 12.92
- else: C = ((C_srgb + 0.055) / 1.055) ^ 2.4

L = 0.2126 R + 0.7152 G + 0.0722 B

Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)

## Notes

- Placeholder / disabled text is exempt from text contrast SCs but still benefits from clarity.
- Focus indicators need 3:1 against adjacent colors (2.4.11 / 2.4.13 depending on level).
FILE:references/color-blindness-notes.md
# Color blindness notes for palettes

Contrast ratio alone is not enough when meaning is carried only by hue.

## Common pitfalls

- **Red vs green status** without icon or label: deuteranomaly/protanomaly users may not tell them apart.
- **Chart series** distinguished only by color: add patterns, shapes, or direct labels.
- **Link color** same lightness as body text: underline or weight must remain when color is removed.
- **Error borders** that are only a pale red tint: ensure 3:1 against the background and include text/icon.

## Safer patterns

1. Pair color with text ("Error", "Success") or icon.
2. Use lightness differences, not only hue shifts.
3. Test a grayscale screenshot of the UI.
4. Avoid conveying required-field state with red alone.

## Deuteranopia-friendly tip

Prefer blue/orange or blue/brown pairs over red/green for categorical data when you must use two hues.
FILE:templates/audit-table.md
# Contrast audit

- **Product / screen**:
- **Date**:
- **Standard**: WCAG 2.2 AA (default) / AAA where noted

| Token / use | FG | BG | Ratio | AA normal | AAA normal | AA large | Notes / fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| body text | `#1a1a1a` | `#ffffff` | 16.1 | pass | pass | pass | |
| muted caption | `#9ca3af` | `#ffffff` | 2.5 | fail | fail | fail | Darken to ~`#6b7280` |

## Decisions

- [ ] Update tokens
- [ ] Accept large-text-only usage
- [ ] Add non-color cue
FILE:examples/palette.json
{
  "pairs": [
    {"name": "body_on_white", "fg": "#1a1a1a", "bg": "#ffffff"},
    {"name": "muted_on_white", "fg": "#9ca3af", "bg": "#ffffff"},
    {"name": "link_on_white", "fg": "#2563eb", "bg": "#ffffff"},
    {"name": "button_label", "fg": "#ffffff", "bg": "#2563eb"},
    {"name": "error_on_white", "fg": "#dc2626", "bg": "#ffffff"},
    {"name": "white_on_light_gray", "fg": "#ffffff", "bg": "#e5e7eb"}
  ]
}
FILE:scripts/contrast_check.py
#!/usr/bin/env python3
"""WCAG contrast ratio checker for hex fg/bg pairs.

Usage:
    python3 contrast_check.py --fg '#1a1a1a' --bg '#ffffff'
    python3 contrast_check.py --palette palette.json
    python3 contrast_check.py --self-test

Python 3 standard library only.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from typing import Dict, List, Tuple


def parse_hex(color: str) -> Tuple[float, float, float]:
    c = color.strip().lstrip("#")
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    if len(c) == 8:
        c = c[:6]  # ignore alpha
    if len(c) != 6:
        raise ValueError(f"Bad hex color: {color!r}")
    r = int(c[0:2], 16) / 255.0
    g = int(c[2:4], 16) / 255.0
    b = int(c[4:6], 16) / 255.0
    return r, g, b


def channel(c: float) -> float:
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: Tuple[float, float, float]) -> float:
    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(fg: str, bg: str) -> float:
    l1 = relative_luminance(parse_hex(fg))
    l2 = relative_luminance(parse_hex(bg))
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def evaluate(ratio: float) -> Dict[str, bool]:
    return {
        "aa_normal": ratio >= 4.5,
        "aaa_normal": ratio >= 7.0,
        "aa_large": ratio >= 3.0,
        "aaa_large": ratio >= 4.5,
        "ui_3_1": ratio >= 3.0,
    }


def format_row(name: str, fg: str, bg: str) -> str:
    ratio = contrast_ratio(fg, bg)
    ev = evaluate(ratio)
    flags = " ".join(
        f"{k}={'PASS' if v else 'FAIL'}"
        for k, v in ev.items()
        if k in ("aa_normal", "aaa_normal", "aa_large")
    )
    return f"{name}: {fg} on {bg} -> {ratio:.2f}:1  {flags}"


def self_test() -> int:
    cases = [
        ("black_white", contrast_ratio("#000000", "#ffffff"), 21.0),
        ("white_black", contrast_ratio("#ffffff", "#000000"), 21.0),
        ("body", contrast_ratio("#1a1a1a", "#ffffff") > 12.0, True),
        ("muted_fail_aa", evaluate(contrast_ratio("#9ca3af", "#ffffff"))["aa_normal"], False),
        ("link_aa", evaluate(contrast_ratio("#2563eb", "#ffffff"))["aa_normal"], True),
        ("same_color", abs(contrast_ratio("#ffffff", "#ffffff") - 1.0) < 1e-9, True),
        ("short_hex", abs(contrast_ratio("#000", "#fff") - 21.0) < 1e-9, True),
        ("parse3", parse_hex("#abc") == parse_hex("#aabbcc"), True),
        ("ui_pass", evaluate(3.0)["ui_3_1"], True),
        ("aaa_border", evaluate(7.0)["aaa_normal"], True),
        ("just_under_aa", evaluate(4.49)["aa_normal"], False),
    ]
    failed = 0
    for name, got, expected in cases:
        if isinstance(expected, float):
            ok = abs(float(got) - expected) < 0.05
        else:
            ok = got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}: got={got!r} expected={expected!r}")
    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Check WCAG contrast for fg/bg hex pairs.")
    p.add_argument("--fg")
    p.add_argument("--bg")
    p.add_argument("--palette", help="JSON file with {pairs:[{name,fg,bg}]}")
    p.add_argument("--json", action="store_true")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    rows = []
    if a.palette:
        data = json.load(open(a.palette, encoding="utf-8"))
        for pair in data.get("pairs", []):
            rows.append(pair)
    elif a.fg and a.bg:
        rows.append({"name": "pair", "fg": a.fg, "bg": a.bg})
    else:
        p.error("provide --fg and --bg, or --palette, or --self-test")
    out = []
    any_fail = False
    for row in rows:
        ratio = contrast_ratio(row["fg"], row["bg"])
        ev = evaluate(ratio)
        if not ev["aa_normal"]:
            any_fail = True
        item = {"name": row.get("name", "pair"), "fg": row["fg"], "bg": row["bg"], "ratio": round(ratio, 2), **ev}
        out.append(item)
        if not a.json:
            print(format_row(item["name"], item["fg"], item["bg"]))
    if a.json:
        print(json.dumps(out, indent=2))
    return 1 if any_fail else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
