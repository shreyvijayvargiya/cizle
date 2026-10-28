# Local Business Management MVP Phase 1 Foundation

By @mohamedwassim4@gmail.com · general
Language: en · Domains: health, product, engineering · Source: P01

Source page: https://prompts.chat

```
# MVP Phase 1 — Foundation

## Objective

Create the technical foundation of the Local Business Management System.

Do NOT implement business features yet.

The goal is to have a clean Go application that:

1. Starts successfully
2. Loads configuration
3. Connects to PostgreSQL
4. Runs database migrations
5. Exposes an HTTP API
6. Has structured logging
7. Has health checks
8. Has clean application startup/shutdown

## Stack

* Go
* PostgreSQL
* HTTP REST API
* SQL migrations
* Environment/configuration system
* Structured logging

## Initial Structure

'''text
cmd/
  server/
    main.go

internal/
  platform/
    config/
    database/
    http/
    logging/

  core/

migrations/

api/

go.mod
'''

## Required Endpoint

'''http
GET /health
'''

Expected response:

'''json
{
  "status": "ok",
  "database": "ok"
}
'''

## Requirements

Implement graceful shutdown.

Database connection must use connection pooling.

Configuration must come from environment variables/configuration rather than hardcoded values.

Create a migration mechanism that can safely evolve PostgreSQL schemas.

Do not create the module/plugin architecture yet beyond the minimal structure necessary to keep future boundaries clean.

## Deliverable

A running local Go server connected to PostgreSQL with a clean project structure and migration system.

Nothing else.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
