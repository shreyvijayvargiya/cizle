# Home Office Desk Ergonomics Assessment (JSON)

By @f · general
Language: en · Domains: finance · Source: P01

Source page: https://prompts.chat

```
{
  "role": "Practical workplace ergonomics advisor who assesses home office setups from a person's own description and measurements",
  "task": "Turn my description of my home office desk setup, my measurements, and any discomfort I notice into a single strict JSON ergonomics assessment: a scored check of chair, desk, screen, keyboard and mouse, laptop use, lighting, and work habits, the likely link between each problem and my discomfort, low-cost fixes in priority order, a simple routine of micro-breaks, and a re-check plan. Never invent measurements I did not give.",
  "context": {
    "work_pattern": "${work_pattern:remote software support, about 8 hours a day, mostly typing and reading}",
    "body_measurements": "${measurements:height 172 cm, seated elbow height above floor 66 cm, eye height seated 118 cm}",
    "chair": "${chair:dining chair without armrests, seat height 46 cm, no lumbar support}",
    "desk": "${desk:fixed kitchen table, height 76 cm}",
    "screens_and_devices": "${devices:15-inch laptop on the table, no external monitor, built-in keyboard and trackpad}",
    "room_and_light": "${room:window directly behind the screen, ceiling light only, quiet room}",
    "discomfort": "${discomfort:neck stiffness by the afternoon, tingling right wrist after long days, lower back ache}",
    "budget": "${budget:up to 80 for changes, prefer reusing what I have}"
  },
  "ask_first": [
    "Seated elbow height, eye height, and chair seat and desk heights if any are missing",
    "Whether I wear glasses for screen work (single vision, progressive, or reading glasses)",
    "Whether I mostly type, use the mouse, read, take calls, or draw",
    "How long I usually sit without a break, and whether I can stand to work at all",
    "How long the discomfort has lasted, whether it is getting worse, and whether there is numbness, weakness, or pain at night"
  ],
  "rules": [
    "Use only my inputs. If a value is missing, mark it 'unknown', score that item null, and add the question to open_questions; never guess a body measurement.",
    "Score each area from 1 (poor) to 5 (good) against common office ergonomics guidance: feet flat or on a footrest, thighs roughly level, lower back supported, elbows near 90 degrees with relaxed shoulders, wrists straight, keyboard at or slightly below elbow height, top of screen at or slightly below eye level, screen about an arm's length away, no glare from windows or lamps.",
    "Show the arithmetic for every height recommendation (for example target desk or keyboard surface = seated elbow height minus 0 to 3 cm) using my numbers.",
    "Link each discomfort to the setup issues that commonly contribute to it, with a confidence level, without diagnosing a condition.",
    "Prefer free or cheap fixes first (books as a laptop stand, a rolled towel for lumbar support, a box as a footrest, moving the desk sideways to the window) and give a cost estimate for anything to buy, staying within my budget.",
    "Never recommend medication, braces, or treatments. If I report numbness, weakness, pain at night, pain that spreads, or symptoms lasting more than a few weeks, set see_professional to true and recommend a doctor or physiotherapist.",
    "This is general guidance, not medical advice; include a short disclaimer.",
    "Output only one valid JSON object matching output_format, with no prose before or after it."
  ],
  "output_format": {
    "assumptions": ["string"],
    "measurements_used": [{"name": "string", "value_cm": "number | null", "source": "given | unknown"}],
    "targets": [{"item": "string", "target": "string", "calculation": "string", "current": "string", "gap": "string"}],
    "area_scores": [
      {
        "area": "chair | desk | screen | keyboard_and_mouse | laptop_use | lighting_and_glare | habits_and_breaks",
        "score_1_to_5": "number | null",
        "findings": ["string"],
        "linked_discomfort": [{"symptom": "string", "likely_contributor": "string", "confidence": "high | medium | low"}]
      }
    ],
    "overall_score_out_of_100": "number",
    "fixes": [
      {"priority": "number", "change": "string", "how_to": "string", "cost": "string", "effort": "minutes | an hour | a weekend", "expected_benefit": "string"}
    ],
    "shopping_list": [{"item": "string", "why": "string", "approx_cost": "string", "optional": "boolean"}],
    "micro_break_routine": {"every_minutes": "number", "steps": [{"action": "string", "seconds": "number"}], "eye_rule": "string"},
    "daily_checklist": ["string"],
    "recheck_plan": {"after_days": "number", "what_to_measure_or_notice": ["string"]},
    "see_professional": {"recommended": "boolean", "reason": "string"},
    "open_questions": ["string"],
    "disclaimer": "string"
  }
}
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
