# Python Packaging taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# Python Packaging taste
- Use `pyproject.toml` as the single source of truth and drop `setup.py` for new packages. Confidence: 0.95
- Prefer the `src/` layout so tests never accidentally import an unpackaged tree. Confidence: 0.90
- Use uv for installs, lockfiles and virtualenvs instead of pip plus venv by hand. Confidence: 0.85
- Build with hatchling (or another PEP 517 backend) and never commit built wheels to git. Confidence: 0.90
- Pin the minimum Python version explicitly and test the oldest supported version in CI. Confidence: 0.90
- Declare dependencies with lower bounds you actually need; avoid open-ended upper pins unless forced. Confidence: 0.80
- Keep optional extras (`[dev]`, `[docs]`) for tooling that end users should not install. Confidence: 0.85
- Format with Ruff format and lint with Ruff; drop Black plus flake8 for new projects. Confidence: 0.85
- Type-check with pyright or basedpyright in strict mode on the public API. Confidence: 0.80
- Test with pytest and keep tests outside `src/` under `tests/`. Confidence: 0.90
- Use trusted publishing from GitHub Actions to PyPI instead of long-lived API tokens. Confidence: 0.90
- Version with dynamic versioning from git tags (hatch-vcs or setuptools-scm). Confidence: 0.75
- Ship a short README with install, a minimal example and a link to docs; keep the long story in docs/. Confidence: 0.90
- Include `py.typed` when you publish typed packages so consumers get inline types. Confidence: 0.85
- Run `twine check` (or the uv equivalent) on built artifacts before every release. Confidence: 0.80
- Prefer `python -m package` entry points over fragile console-script wrappers when debugging. Confidence: 0.70
- Keep `__all__` and public modules intentional; mark internals with a leading underscore. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
