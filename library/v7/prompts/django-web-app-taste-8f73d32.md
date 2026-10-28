# Django Web App taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# Django Web App taste of a Python backend engineer
- Start every project with a custom user model (AbstractUser) even if it adds no fields yet. Confidence: 0.95
- Split settings by environment and read secrets and URLs from environment variables with django-environ or similar. Confidence: 0.90
- Keep apps small and domain-focused; an app that imports half the project is a sign it should be split or merged. Confidence: 0.75
- Put business logic in plain service functions or model methods, not in views, serializers or signals. Confidence: 0.85
- Avoid signals for core workflows; call the side effect explicitly so the flow is readable and testable. Confidence: 0.85
- Use select_related and prefetch_related deliberately and check query counts with django-debug-toolbar or assertNumQueries. Confidence: 0.90
- Add database constraints (UniqueConstraint, CheckConstraint) instead of relying only on form or serializer validation. Confidence: 0.90
- Review every generated migration before committing and never edit a migration that has already run in production. Confidence: 0.90
- Write data migrations with RunPython using apps.get_model, never importing models directly. Confidence: 0.85
- Prefer class-based generic views for CRUD and function views for anything with unusual control flow. Confidence: 0.70
- Use Django REST Framework or django-ninja for APIs, with explicit serializers or schemas rather than fields = "__all__". Confidence: 0.85
- Wrap multi-step writes in transaction.atomic and enqueue background jobs with transaction.on_commit. Confidence: 0.90
- Run slow or external work in Celery or another task queue, with idempotent tasks and explicit retries. Confidence: 0.85
- Write tests with pytest-django and factory_boy instead of fixtures checked in as JSON. Confidence: 0.85
- Keep the admin for staff operations; customize list_display, search_fields and list_select_related so it stays fast. Confidence: 0.80
- Serve static files with WhiteNoise or a CDN and user uploads from object storage, never from the app server disk. Confidence: 0.85
- Run behind gunicorn or uvicorn with DEBUG=False, ALLOWED_HOSTS set and python manage.py check --deploy passing in CI. Confidence: 0.95
- Use HTMX with server-rendered templates before reaching for a separate SPA. Confidence: 0.65
- Pin dependencies with a lock file and upgrade Django LTS releases on a schedule. Confidence: 0.80
- Lint and format with Ruff and type check with mypy plus django-stubs. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
