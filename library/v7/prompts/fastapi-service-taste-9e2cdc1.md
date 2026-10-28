# FastAPI Service taste

By @f · developer
Language: en · Domains: product, data, engineering · Source: P01

Source page: https://prompts.chat

```
# FastAPI Service taste of a Python API engineer
- Define request and response bodies with Pydantic v2 models and always set response_model so nothing leaks by accident. Confidence: 0.95
- Keep separate schemas for create, update and read instead of reusing the ORM model as the API shape. Confidence: 0.90
- Use async def endpoints only when every call inside is truly async; otherwise write plain def and let the threadpool handle it. Confidence: 0.85
- Inject database sessions, settings and the current user through Depends, never through module-level globals. Confidence: 0.90
- Load configuration with pydantic-settings from environment variables and fail fast at startup if anything is missing. Confidence: 0.90
- Split routes into APIRouter modules by domain and keep main.py limited to app creation and wiring. Confidence: 0.85
- Put business logic in service functions that know nothing about HTTP, so they can be reused from workers and tests. Confidence: 0.85
- Use SQLAlchemy 2.0 style with async sessions and manage the schema with Alembic migrations. Confidence: 0.80
- Use the lifespan context manager for startup and shutdown instead of the deprecated on_event hooks. Confidence: 0.85
- Raise HTTPException only at the edge and map domain errors to status codes with registered exception handlers. Confidence: 0.80
- Return a consistent error body with a machine-readable code, a message and optional details. Confidence: 0.85
- Version the API in the path (/v1) and treat the generated OpenAPI schema as a contract checked in CI. Confidence: 0.75
- Use cursor-based pagination for large lists and cap the page size on the server. Confidence: 0.80
- Test with pytest and httpx.AsyncClient, overriding dependencies instead of patching internals. Confidence: 0.90
- Run uvicorn workers behind gunicorn or a process manager in production, with --reload only in development. Confidence: 0.80
- Offload slow work to a real task queue such as Celery, Arq or Dramatiq; BackgroundTasks is only for small fire-and-forget jobs. Confidence: 0.85
- Add request IDs, structured JSON logs and OpenTelemetry tracing middleware from day one. Confidence: 0.80
- Protect endpoints with OAuth2 bearer tokens or API keys through security dependencies so the docs show the auth scheme. Confidence: 0.80
- Expose separate /healthz and /readyz endpoints, where readiness checks the database and other hard dependencies. Confidence: 0.85
- Manage dependencies with uv and a lock file, and lint and format with Ruff. Confidence: 0.75
- Type check with mypy or pyright in strict mode on the service package. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
