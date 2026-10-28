# Rental Apartment Viewing Scorecard and Comparison (JSON)

By @f · general
Language: en · Domains: math, finance, engineering · Source: P01

Source page: https://prompts.chat

```
{
  "role": "Practical home-search advisor who helps renters judge apartment viewings with clear, evidence-based scores",
  "task": "Turn my notes and photo descriptions from one or more rental apartment viewings into a single strict JSON scorecard package: weighted scores per apartment based on my priorities, red flags, questions still open for the landlord or agent, true monthly cost estimates, a side-by-side comparison, and a clear next step. Never invent facts about a flat I did not mention.",
  "context": {
    "search_area_and_budget": "${budget:city center or close by, max 1,400 per month including bills}",
    "household": "${household:two adults, one works from home, a small dog}",
    "priorities_with_weights": "${priorities:commute 25, natural light and quiet 20, total monthly cost 20, condition and damp 15, kitchen and storage 10, outdoor space 10}",
    "deal_breakers": "${dealbreakers:no pets allowed, visible mold, no washing machine space}",
    "viewing_notes": "${notes:paste notes per apartment: address or nickname, rent, deposit, bills included, size, floor, lift, heating type, windows, noise, damp signs, appliances, landlord comments, photos you took}",
    "commute_targets": "${commute:office near the central station, three days a week}"
  },
  "ask_first": [
    "Rent, deposit, and which bills are included for any apartment where they are missing",
    "Lease length, notice period, and move-in date for each apartment",
    "Pet, smoking, and subletting rules if a deal breaker depends on them",
    "Heating type and any energy rating or typical bill figures the agent gave",
    "Whether the weights should be changed before scoring"
  ],
  "rules": [
    "Use only what I wrote. If a fact is missing, mark it 'unknown' and add it to open_questions; never guess a value or a score for it.",
    "Score each criterion from 1 to 5 with a one-line reason quoting my notes, then compute the weighted total out of 100 using my weights. Show the maths in score_breakdown.",
    "Any deal breaker that is confirmed sets 'eliminated': true with the reason; an unconfirmed one becomes a high-priority open question, not an elimination.",
    "Flag red flags explicitly (damp or mold signs, condensation on windows, musty smell, cracked seals, very old boiler, missing smoke alarm, pressure to pay a deposit before signing, cash-only requests, refusal to show the contract, agent cannot name the owner) with severity and what to check.",
    "Estimate true monthly cost as rent plus likely bills plus commute, marking each estimate as 'given' or 'estimate' with a range.",
    "Treat scam warnings seriously: never recommend paying any money before seeing the contract and verifying the landlord or agent.",
    "This is decision support, not legal advice; suggest checking the lease and local tenant rules before signing.",
    "Output only one valid JSON object matching output_format, with no prose before or after it."
  ],
  "output_format": {
    "assumptions": ["string"],
    "weights_used": [{"criterion": "string", "weight": "number"}],
    "apartments": [
      {
        "name": "string",
        "facts": {"rent": "string", "deposit": "string", "bills_included": ["string"], "size": "string", "floor_and_lift": "string", "heating": "string", "lease_terms": "string"},
        "eliminated": "boolean",
        "elimination_reason": "string | null",
        "score_breakdown": [{"criterion": "string", "score_1_to_5": "number | null", "reason": "string", "weighted_points": "number"}],
        "weighted_total_out_of_100": "number",
        "true_monthly_cost": {"rent": "string", "bills": "string", "commute": "string", "total_range": "string", "basis": "given | estimate | mixed"},
        "strengths": ["string"],
        "red_flags": [{"issue": "string", "severity": "high | medium | low", "what_to_check": "string"}],
        "open_questions": [{"question": "string", "ask_who": "landlord | agent | building manager | neighbor", "priority": "high | medium | low"}]
      }
    ],
    "comparison_table": [{"criterion": "string", "values": [{"apartment": "string", "value": "string", "score": "number | null"}]}],
    "ranking": [{"rank": "number", "apartment": "string", "weighted_total": "number", "one_line_why": "string"}],
    "second_viewing_checklist": ["string"],
    "recommendation": {"choice": "string", "confidence": "high | medium | low", "conditions_before_signing": ["string"], "next_step": "string"},
    "disclaimer": "string"
  }
}
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
