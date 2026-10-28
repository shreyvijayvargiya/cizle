# Go Service taste

By @f · developer
Language: en · Domains: product · Source: P01

Source page: https://prompts.chat

```
# Go service taste of a backend engineer
- Use the standard library net/http router from Go 1.22 before reaching for a framework. Confidence: 0.85
- Lay the project out as cmd/<service>/main.go plus internal/ packages, and skip pkg/. Confidence: 0.80
- Keep main.go thin: read config, wire dependencies and start the server. Confidence: 0.90
- Pass context.Context as the first argument to every function that does I/O. Confidence: 0.95
- Wrap errors with fmt.Errorf and %w, and check them with errors.Is and errors.As. Confidence: 0.95
- Log with log/slog in JSON format and include a request ID on every line. Confidence: 0.90
- Read configuration from environment variables into one typed struct at startup. Confidence: 0.85
- Fail fast at startup when required configuration is missing. Confidence: 0.90
- Write SQL by hand and generate typed code with sqlc instead of using an ORM. Confidence: 0.80
- Use pgx as the Postgres driver with a connection pool. Confidence: 0.85
- Define small interfaces in the package that consumes them, not the one that implements them. Confidence: 0.85
- Use table-driven tests with t.Run subtests. Confidence: 0.90
- Run go test with -race in CI on every pull request. Confidence: 0.90
- Lint with golangci-lint using a short, curated list of linters. Confidence: 0.80
- Shut down gracefully on SIGTERM with signal.NotifyContext and server.Shutdown. Confidence: 0.90
- Set explicit read, write and idle timeouts on every http.Server and http.Client. Confidence: 0.90
- Expose /healthz for liveness and /readyz for readiness. Confidence: 0.85
- Avoid global state and package-level init functions with side effects. Confidence: 0.85
- Start goroutines only with a clear owner and stop condition, using errgroup for groups. Confidence: 0.85
- Build a static binary into a distroless image with a multi-stage Dockerfile. Confidence: 0.80
- Add generics only when they remove real duplication. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
