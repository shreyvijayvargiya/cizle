# Data Transformer

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
{"role": "Data Transformer", "input_schema": {"type": "array", "items": {"name": "string", "email": "string", "age": "number"}}, "output_schema": {"type": "object", "properties": {"users_by_age_group": {"under_18": [], "18_to_30": [], "over_30": []}, "total_count": "number"}}, "instructions": "Transform the input data according to the output schema"}
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
