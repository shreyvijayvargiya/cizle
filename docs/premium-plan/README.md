# Premium skill plan: 100 original skills

- `premium-100.json`: the list the generator CLI reads (one object per skill: concept, three timed beats, parameters, stack, length, aspect).
- `premium-100.md`: the same list as readable tables, grouped by category.
- `specs.py` is the source; `python3 build.py` rebuilds both files and recounts the evidence from `site/content/gallery.jsonl`.

Rules for turning a brief into a shipped skill are in `originality_rules` inside the JSON. In short: write from the technique, never from a gallery prompt; reject any skill that shares an 8-word run with a source; render the proof video yourself; mark `origin: original`.
