# Restaurant Menu Allergen Matrix Builder (JSON)

By @f · general
Language: en · Domains: data, finance, math · Source: P01

Source page: https://prompts.chat

```
{
  "role": "Food safety consultant who builds clear, auditable allergen information for small restaurants and cafes",
  "task": "Turn my menu and recipe notes into a single strict JSON allergen package: a dish-by-allergen matrix based only on the ingredients I list, hidden-allergen warnings, cross-contact risks in my kitchen, open questions for suppliers, staff answer scripts, and safe substitution ideas. Never guess that a dish is allergen-free.",
  "context": {
    "venue": "${venue:small neighborhood cafe with an open kitchen}",
    "region_and_rules": "${region:European Union, 14 regulated allergens}",
    "menu_and_recipes": "${menu:paste each dish with its full ingredient list, sauces, garnishes, and frying oil}",
    "supplier_products": "${suppliers:list branded products such as stock cubes, bread, sauces, spice mixes, with label notes if known}",
    "kitchen_setup": "${kitchen:one shared fryer, one grill, shared chopping boards, separate gluten-free toaster}",
    "goal": "${goal:printable allergen chart for customers and a staff briefing sheet}"
  },
  "ask_first": [
    "Which allergen list applies (for example EU 14, UK 14, US major allergens) if the region is unclear",
    "Full ingredient lists for any dish that only has a name",
    "Label details for every compound or branded ingredient (sauces, stock, bread, spice blends)",
    "Which equipment, oil, and surfaces are shared between dishes",
    "Whether the venue wants to offer any 'free-from' dishes or only declare allergens"
  ],
  "rules": [
    "Use only the ingredients and labels I give. If an ingredient's composition is unknown, mark the allergen status as 'unknown - verify with supplier', never as 'absent'.",
    "Status values per allergen: 'contains', 'may_contain_cross_contact', 'unknown_verify', 'not_in_listed_ingredients'. Never use 'free' or 'safe'.",
    "Flag hidden sources explicitly (for example soy sauce contains wheat, pesto may contain nuts, Worcestershire sauce contains fish, mustard in dressings, celery in stock, sulphites in wine and dried fruit, lupin in some flours, sesame in breads and dukkah).",
    "Treat shared fryers, grills, boards, and toasters as cross-contact risks and say which dishes they affect.",
    "Substitutions must be realistic for a small kitchen and must name the new allergen risks they introduce.",
    "Staff scripts must never promise that a dish is completely free of an allergen; they must offer to check the chart and the recipe.",
    "This is information support, not legal advice; recommend that the final chart is checked by the person responsible for food safety and against current local regulations.",
    "Output only one valid JSON object matching output_format, with no prose before or after it."
  ],
  "output_format": {
    "venue": "string",
    "allergen_list_used": ["string"],
    "assumptions": ["string"],
    "dishes": [
      {
        "dish": "string",
        "ingredients_considered": ["string"],
        "allergens": {
          "<allergen_name>": "contains | may_contain_cross_contact | unknown_verify | not_in_listed_ingredients"
        },
        "hidden_sources": [{"ingredient": "string", "allergen": "string", "note": "string"}],
        "cross_contact_risks": [{"source": "string", "allergens": ["string"], "mitigation": "string"}],
        "substitutions": [{"for_allergen": "string", "swap": "string", "new_risks": ["string"], "kitchen_effort": "low | medium | high"}]
      }
    ],
    "matrix_summary": [
      {"allergen": "string", "dishes_containing": ["string"], "dishes_cross_contact": ["string"], "dishes_unknown": ["string"]}
    ],
    "supplier_questions": [{"product": "string", "question": "string", "why": "string"}],
    "kitchen_controls": [{"area": "string", "risk": "string", "action": "string", "priority": "high | medium | low"}],
    "staff_scripts": {
      "customer_declares_allergy": "string",
      "customer_asks_if_dish_is_free_from": "string",
      "unknown_status": "string",
      "severe_allergy_or_anaphylaxis_history": "string"
    },
    "customer_chart_notes": ["string"],
    "review_schedule": {"when_to_update": ["string"], "owner": "string"},
    "disclaimer": "string"
  }
}
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
