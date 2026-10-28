# Dockerfile Best Practices Reviewer

By @f · general
Language: en · Domains: health · Source: P01

Source page: https://prompts.chat

```
---
name: dockerfile-best-practices-reviewer
description: Reviews Dockerfiles for security, image size, build cache, and runtime reliability: secrets baked into layers, running as root, unpinned base images, curl piped to a shell, ADD misuse, apt and pip caches left in layers, dependency installs that bust the cache, shell-form CMD, and missing multi-stage builds or health checks, then writes a corrected Dockerfile and .dockerignore. Use when a user shares a Dockerfile and asks "review my Dockerfile", "why is my image so big?", "is this container secure?", or "why does every build reinstall dependencies?". Includes a tested stdlib Python linter.
---

# Dockerfile Best Practices Reviewer

You help developers ship container images that are small, fast to rebuild, and safe to run. You read a Dockerfile the way a careful platform engineer would: you find what leaks secrets or gives away root, what makes the image heavy, and what forces slow rebuilds, and you return a corrected Dockerfile that still builds and runs the same app.

## Files in this skill

- `scripts/lint_dockerfile.py` - parses a Dockerfile (continuation lines, multi-stage builds) and reports HIGH, WARN, and INFO findings with a fix for each (Python 3 standard library only)
- `references/dockerfile-rules.md` - every rule the linter checks, why it matters, and the correct pattern
- `references/language-patterns.md` - proven multi-stage patterns for Node.js, Python, Go, and Java, plus a starter .dockerignore
- `templates/dockerfile-review.md` - the review report to return
- `examples/example-node-api-review.md` - a worked review of a Node.js API Dockerfile

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- The Dockerfile, and the .dockerignore if there is one.
- Language and framework, how the app is built and started, and the port.
- Where it runs (Kubernetes, ECS, a VM with Docker Compose, a laptop) and whether that platform already has health checks.
- Constraints: required base images (company registry, distroless, Alpine or Debian), native dependencies, and whether the build uses BuildKit.

### 2. Run the linter
'''bash
python3 scripts/lint_dockerfile.py Dockerfile
python3 scripts/lint_dockerfile.py services/*/Dockerfile --fail-on warn    # stricter, for CI
python3 scripts/lint_dockerfile.py - --json < Dockerfile
'''
The linter is a fast first pass based on patterns, not a full build. Read the whole Dockerfile yourself as well: it cannot know whether a package is really needed, whether a file copied in contains secrets, or whether the app writes to a path that a non-root user cannot access. If you cannot run the script, apply `references/dockerfile-rules.md` by hand.

### 3. Fix in this order
1. Security (HIGH): remove literal secrets from ENV, ARG, and RUN and use BuildKit secret mounts or runtime configuration instead; tell the user to rotate any secret that was ever committed or pushed in an image. Add a non-root USER. Replace curl-pipe-shell and chmod 777.
2. Reproducibility: pin base images to a version tag (digest for high-assurance builds) and use lockfile installs (npm ci, pip with a requirements lock, go mod download).
3. Build cache: copy dependency manifests first, install, then copy the source. Combine update and install in one RUN.
4. Size: multi-stage build, slim or distroless runtime base, no recommended packages, clean package caches in the same layer, a good .dockerignore.
5. Runtime: exec-form CMD or ENTRYPOINT, one process per container, a HEALTHCHECK if the platform has no probe, sensible WORKDIR and file ownership.
Rerun the linter on the corrected file until there are no HIGH findings and every WARN is fixed or explained.

### 4. Deliver
Fill in `templates/dockerfile-review.md`: summary, findings table, the corrected Dockerfile with short comments, a .dockerignore, how to build and test it, and an estimate of the size and rebuild-time impact. Use patterns from `references/language-patterns.md` and follow the style of `examples/example-node-api-review.md`.

## Rules
- Keep the app's behavior: same start command, port, environment variables, and files at runtime, unless the user agrees to change them.
- Never print or repeat a real secret found in the file; refer to it by name and tell the user to rotate it.
- Do not claim exact image sizes without a build; give ranges and say how to measure (`docker image ls`, `docker history`).
- Prefer official, maintained base images; mention the trade-offs of Alpine (musl) versus Debian slim versus distroless for the user's language.
- Explain each change in one line so the user learns the rule, not just the fix.
FILE:references/dockerfile-rules.md
# Dockerfile rules checked by the linter

Each rule: what is detected, why it matters, and the pattern to use instead.

## HIGH (security)

### secret-in-env / secret-in-run
Detected: ENV or ARG with a name like PASSWORD, SECRET, TOKEN, API_KEY, ACCESS_KEY, PRIVATE_KEY, CREDENTIALS and a literal value; `--password=...` or `user:pass@` URLs in RUN; ARG names that look like secrets (WARN).
Why: every ENV value and build arg is stored in the image config and history (`docker history --no-trunc`). Anyone who can pull the image can read it. Deleting it in a later layer does not remove it.
Use instead:
'''dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN="$(cat /run/secrets/npm_token)" npm ci
'''
Build with `docker build --secret id=npm_token,src=$HOME/.npm_token .`. Pass runtime secrets as environment variables from the platform or a secrets manager. Rotate any secret that was ever in an image.

### root-user
Detected: no USER in the final stage, or USER root / 0.
Why: a process that escapes the app as root inside the container has far more power over the host and other containers.
Use instead: create a user and switch before CMD; many official images already include one (`node`, `nobody`).
'''dockerfile
RUN groupadd -r app && useradd -r -g app -u 10001 app
COPY --chown=app:app . /app
USER app
'''

### curl-pipe-shell
Detected: `curl ... | sh` or `wget ... | bash`.
Why: runs whatever the server returns, with no integrity check; a compromised or changed script ends up in every build.
Use instead: download, verify a checksum, then run.
'''dockerfile
RUN curl -fsSLo /tmp/install.sh https://example.com/install.sh \
    && echo "<sha256>  /tmp/install.sh" | sha256sum -c - \
    && sh /tmp/install.sh && rm /tmp/install.sh
'''

### chmod-777
Detected: `chmod 777` or `chmod -R 777`.
Why: any user or process in the container can modify the files, including app code.
Use instead: `COPY --chown=app:app` and `chmod 755` for executables, `644` for files.

## WARN

| Rule | Detected | Why | Fix |
|---|---|---|---|
| unpinned-base | FROM without tag or with :latest | builds change silently; hard to reproduce or roll back | `FROM node:20.11-bookworm-slim` or pin a digest `@sha256:...` |
| use-copy | ADD for local files or URLs | ADD auto-extracts archives and downloads without checksums | COPY for files; curl with checksum or `ADD --checksum=` for URLs; ADD is fine for local tar archives you want extracted |
| update-alone | `apt-get update` (or apk/yum) without install in the same RUN | the cached update layer gets reused with a newer install line, so packages come from a stale index | `RUN apt-get update && apt-get install -y ...` |
| cache-bust | dependency install after `COPY . .` | any source change invalidates the install layer, so every build reinstalls everything | copy manifests first, install, then copy the source |
| sudo | sudo in RUN | not needed (build runs as root until USER), adds a setuid binary | run the step before USER |
| ssh-port | EXPOSE 22 | containers should not run SSH daemons | `docker exec`, `kubectl exec` |
| multiple-cmd | more than one CMD or ENTRYPOINT in a stage | only the last one counts; usually a mistake | keep one |

## INFO

| Rule | Fix |
|---|---|
| apt-recommends | `apt-get install -y --no-install-recommends ...` |
| apt-lists | end the same RUN with `&& rm -rf /var/lib/apt/lists/*` |
| apk-cache | `apk add --no-cache ...` |
| pip-cache | `pip install --no-cache-dir ...` or a BuildKit cache mount |
| npm-ci | `npm ci --omit=dev` uses the lockfile exactly |
| shell-form | `CMD ["node", "server.js"]` so the app is PID 1 and receives SIGTERM for graceful shutdown |
| cd-in-run | `WORKDIR /app` |
| no-healthcheck | `HEALTHCHECK CMD curl -fsS http://localhost:3000/health || exit 1` if the platform has no probe; Kubernetes ignores HEALTHCHECK and uses its own probes |
| single-stage | build in a builder stage; copy only the output into a slim runtime stage |
| many-layers | combine related RUN steps; fewer, purposeful layers |
| dockerignore | exclude `.git`, `node_modules`, `.env*`, build output, logs, and local secrets |

## What the linter cannot see
- Whether copied files contain secrets (check .dockerignore and the repo).
- Vulnerable packages in the base image or dependencies: suggest an image scanner in CI.
- Whether the non-root user can write where the app writes (logs, uploads, caches).
- Architecture issues (arm64 vs amd64), native modules, and Alpine musl compatibility.
FILE:references/language-patterns.md
# Multi-stage patterns by language

Adapt versions to the project. All examples run as a non-root user, use exec-form CMD, and keep build tools out of the runtime image.

## Node.js (npm)
'''dockerfile
# syntax=docker/dockerfile:1
FROM node:20.11-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20.11-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.11-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
'''
Skip the build stage if there is no compile step. Use `node:<version>-alpine` only if native modules work with musl.

## Python (pip)
'''dockerfile
FROM python:3.12-slim AS build
WORKDIR /app
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
ENV PATH="/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY --from=build /venv /venv
RUN useradd -r -u 10001 app
COPY --chown=app:app . .
USER app
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
'''
If packages need compilers (psycopg2, numpy from source), install `build-essential` only in the build stage.

## Go
'''dockerfile
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot
ENTRYPOINT ["/app"]
'''
A static Go binary on distroless or scratch gives images of a few MB to tens of MB.

## Java (Maven)
'''dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre
RUN useradd -r -u 10001 app
WORKDIR /app
COPY --from=build --chown=app:app /src/target/app.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
'''

## Starter .dockerignore
'''
.git
.gitignore
.dockerignore
Dockerfile*
node_modules
dist
build
target
__pycache__
*.pyc
.venv
.env
.env.*
*.log
coverage
.idea
.vscode
secrets/
*.pem
*.key
'''

## Measuring the result
- `docker build -t app:review .` then `docker image ls app:review` for size.
- `docker history app:review` to see which layers are large.
- Change one source file and rebuild: the dependency install step should say CACHED.
FILE:templates/dockerfile-review.md
# Dockerfile review: ${service_name}

**App:** ${language_and_framework}, started with ${start_command}, port ${port}
**Runs on:** ${platform}
**Linter:** HIGH ${high} / WARN ${warn} / INFO ${info} before; HIGH 0 / WARN ${warn_after} / INFO ${info_after} after

## Summary

Two or three sentences: the biggest security problem, the biggest size or speed problem, and the expected improvement.

## Findings

| # | Level | Line | Problem | Fix |
|---|---|---|---|---|
| 1 | HIGH | | | |

## Action needed outside the Dockerfile

- Rotate: (names of any secrets that were in the file or image, never their values)
- Platform: health probes, read-only filesystem, resource limits

## Corrected Dockerfile

'''dockerfile
(full corrected Dockerfile with one-line comments on changed parts)
'''

## .dockerignore

'''
(entries)
'''

## Build and verify

'''bash
docker build -t ${image}:review .
docker run --rm -p ${port}:${port} ${image}:review
docker image ls ${image}:review
python3 scripts/lint_dockerfile.py Dockerfile
'''

## Expected impact (estimate)

- Image size: from about ... to about ...
- Rebuild after a source change: dependency layer cached
- Security: non-root, no secrets in layers, pinned base
FILE:examples/example-node-api-review.md
# Example: review of a Node.js API Dockerfile

## User request

"Our orders API image is 1.2 GB and every build reinstalls all npm packages, even when I change one line. Can you review the Dockerfile? It runs on Kubernetes, Express app, `node server.js`, port 3000. No native modules as far as I know."

## Input Dockerfile

'''dockerfile
FROM node
ENV NODE_ENV=production
ENV DB_PASSWORD=supersecret123
RUN apt-get update
RUN apt-get install -y curl git build-essential
WORKDIR /app
COPY . .
RUN npm install
RUN curl -fsSL https://example.com/install-agent.sh | bash
RUN chmod -R 777 /app
ADD config.json /app/config.json
EXPOSE 3000 22
CMD node server.js
'''

## Linter run

'''
$ python3 scripts/lint_dockerfile.py Dockerfile
Dockerfile: 1 stage(s): node
  HIGH 4  WARN 5  INFO 7
  HIGH line 1   root-user       the final image runs as root
  HIGH line 3   secret-in-env   ENV DB_PASSWORD contains a literal secret; it is stored in the image layers and history
  HIGH line 9   curl-pipe-shell downloads a script and pipes it straight into a shell
  HIGH line 10  chmod-777       chmod 777 makes files writable by every user
  WARN line 1   unpinned-base   base image 'node' has no tag, so it means :latest and changes without notice
  WARN line 4   update-alone    'apt-get update' runs in its own layer; a later install may use a stale cached index
  WARN line 8   cache-bust      dependencies are installed after 'COPY . .' (line 7), so any source change reinstalls them
  WARN line 11  use-copy        ADD is used for local files; it also auto-extracts archives and fetches URLs
  WARN line 12  ssh-port        port 22 (SSH) is exposed; containers should not run an SSH server
  INFO line 1   no-healthcheck  no HEALTHCHECK in the final stage
  INFO line 1   single-stage    build tools are installed in the only stage, so they ship in the final image
  INFO line 5   apt-recommends  apt installs recommended packages too
  INFO line 5   apt-lists       apt package lists are left in the layer (tens of MB)
  INFO line 7   dockerignore    COPY of the whole build context
  INFO line 8   npm-ci          npm install can change the lockfile and versions
  INFO line 13  shell-form      shell-form CMD runs under /bin/sh -c, so the app is not PID 1 and may miss SIGTERM
'''

## Review (filled template, shortened)

**Linter:** HIGH 4 / WARN 5 / INFO 7 before; HIGH 0 / WARN 0 / INFO 0 after

**Summary:** The image ships a database password in its layers and runs as root, and it pipes a remote script into bash. It is large because it uses the full `node` image with compilers and git, and slow because `COPY . .` comes before `npm install`. The corrected two-stage Dockerfile removes the secret, runs as the built-in `node` user, and caches dependencies; expect roughly 200 to 300 MB instead of 1.2 GB (measure with `docker image ls`).

| # | Level | Line | Problem | Fix |
|---|---|---|---|---|
| 1 | HIGH | 3 | DB_PASSWORD literal in ENV, visible in `docker history` | removed; inject from a Kubernetes Secret at runtime |
| 2 | HIGH | - | runs as root | `USER node` (built into the official image) |
| 3 | HIGH | 9 | remote install script piped into bash | removed: the agent now runs as a Kubernetes sidecar; if it must stay, download, verify the checksum, then run |
| 4 | HIGH | 10 | chmod -R 777 /app | `COPY --chown=node:node` instead |
| 5 | WARN | 1 | untagged `node` base | `node:20.11-bookworm-slim` |
| 6 | WARN | 4 | apt-get update in its own layer | combined with install and list cleanup |
| 7 | WARN | 8 | npm install after `COPY . .` | manifests first, `npm ci --omit=dev` in a deps stage |
| 8 | WARN | 11 | ADD for a local file | COPY |
| 9 | WARN | 12 | EXPOSE 22 | removed; use `kubectl exec` |
| 10 | INFO | 5, 13 | build tools and git in the runtime image, shell-form CMD | dropped (no native modules), exec-form CMD |

**Action needed outside the Dockerfile:** rotate DB_PASSWORD now (it is in every image pushed so far), and add it to the Deployment from a Kubernetes Secret. Kubernetes ignores HEALTHCHECK, so also add a readiness and liveness probe on /health; the HEALTHCHECK below helps local Docker and Compose.

## Corrected Dockerfile

'''dockerfile
# syntax=docker/dockerfile:1
FROM node:20.11-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20.11-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node src/ ./src/
COPY --chown=node:node config.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]
'''

## .dockerignore

'''
.git
node_modules
.env
.env.*
*.log
coverage
Dockerfile*
'''

## Verify

'''
$ python3 scripts/lint_dockerfile.py Dockerfile
Dockerfile: 2 stage(s): node:20.11-bookworm-slim AS deps, node:20.11-bookworm-slim
  HIGH 0  WARN 0  INFO 0
  no problems found
'''

Note: the source now lives in `src/`, so the start command became `node src/server.js`; if your entry file is elsewhere, keep your original path. If a dependency turns out to need compilers, install `build-essential` and `python3` in the deps stage only.
FILE:scripts/lint_dockerfile.py
#!/usr/bin/env python3
"""Review a Dockerfile for security, image size, build cache, and reliability problems.

Usage:
  python3 lint_dockerfile.py Dockerfile [more Dockerfiles] [--json] [--fail-on high|warn|info]
  python3 lint_dockerfile.py - < Dockerfile

Checks (rule ids in brackets):
  HIGH  secrets in ENV/ARG or in RUN (secret-in-env, secret-in-run), final stage runs as root
        (root-user), pipe from curl/wget to a shell (curl-pipe-shell), chmod 777 (chmod-777)
  WARN  untagged or :latest base image (unpinned-base), ADD for local files or URLs (use-copy),
        apt/apk/yum update without install in the same RUN (update-alone), COPY of the whole
        context before installing dependencies (cache-bust), sudo (sudo), EXPOSE 22 (ssh-port),
        more than one CMD or ENTRYPOINT in a stage (multiple-cmd)
  INFO  apt-get without --no-install-recommends or without cleaning lists, pip without
        --no-cache-dir, npm install instead of npm ci, shell-form CMD/ENTRYPOINT, cd in RUN
        instead of WORKDIR, no HEALTHCHECK, single-stage build with build tools, many RUN layers,
        COPY of the whole context (check .dockerignore)
Exit codes: 0 ok, 1 findings at or above --fail-on (default high), 2 usage or read error.
Python 3 standard library only.
"""
import json
import re
import shlex
import sys

LEVELS = {"info": 0, "warn": 1, "high": 2}
SECRET_KEY = re.compile(r"(PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|ACCESS_?KEY|PRIVATE_?KEY|CREDENTIALS?)", re.I)
BUILD_TOOLS = re.compile(r"\b(build-essential|gcc|g\+\+|make|cmake|maven|gradle|golang|rustc|cargo|npm run build|go build|mvn )", re.I)


def logical_lines(text):
    """Join continuation lines; return list of (line_no, instruction, args). Skips comments and parser directives."""
    out, buf, start = [], "", None
    escape = "\\"
    for i, raw in enumerate(text.replace("\r\n", "\n").split("\n"), 1):
        m = re.match(r"^#\s*escape\s*=\s*(\S)", raw)
        if m and not out and not buf:
            escape = m.group(1)
            continue
        s = raw.strip()
        if not buf and (not s or s.startswith("#")):
            continue
        if buf and s.startswith("#"):
            continue
        if start is None:
            start = i
        if s.endswith(escape):
            buf += s[:-1] + " "
            continue
        buf += s
        parts = buf.split(None, 1)
        out.append((start, parts[0].upper(), parts[1] if len(parts) > 1 else ""))
        buf, start = "", None
    if buf:
        parts = buf.split(None, 1)
        out.append((start, parts[0].upper(), parts[1] if len(parts) > 1 else ""))
    return out


def review(text):
    lines = logical_lines(text)
    findings = []

    def add(level, rule, line, msg, fix):
        findings.append({"level": level, "rule": rule, "line": line, "message": msg, "fix": fix})

    if not any(ins == "FROM" for _, ins, _ in lines):
        raise ValueError("no FROM instruction found (is this a Dockerfile?)")
    stages, cur = [], None
    for ln, ins, args in lines:
        if ins == "FROM":
            m = re.match(r"(?:--platform=\S+\s+)?(\S+)(?:\s+AS\s+(\S+))?", args, re.I)
            cur = {"line": ln, "image": m.group(1) if m else args, "name": m.group(2) if m else None, "ins": []}
            stages.append(cur)
        elif cur is not None:
            cur["ins"].append((ln, ins, args))
    names = {s["name"].lower() for s in stages if s["name"]}
    arg_names = {a.split("=")[0].strip() for _, i, a in lines if i == "ARG"}

    for s in stages:
        img = s["image"]
        if img.lower() in names or img == "scratch" or img.startswith("$"):
            pass
        elif "@sha256:" in img:
            pass
        elif ":" not in img.split("/")[-1]:
            add("warn", "unpinned-base", s["line"], f"base image '{img}' has no tag, so it means :latest and changes without notice",
                f"pin a version, e.g. {img}:<version>-slim, or a digest")
        elif img.endswith(":latest"):
            add("warn", "unpinned-base", s["line"], f"base image '{img}' uses :latest", "pin a specific version tag or digest")

    final = stages[-1]
    run_count = 0
    for idx, s in enumerate(stages):
        cmds = [x for x in s["ins"] if x[1] in ("CMD", "ENTRYPOINT")]
        for kind in ("CMD", "ENTRYPOINT"):
            k = [x for x in cmds if x[1] == kind]
            if len(k) > 1:
                add("warn", "multiple-cmd", k[-1][0], f"{len(k)} {kind} instructions in one stage; only the last one counts",
                    f"keep a single {kind}")
        copied_all = None
        for ln, ins, args in s["ins"]:
            low = args.lower()
            if ins in ("ENV", "ARG"):
                pairs = re.findall(r"([A-Za-z_][A-Za-z0-9_]*)(?:(?:=|\s+)(\"[^\"]*\"|'[^']*'|[^\s=]\S*))?", args) if ins == "ARG" or "=" in args else [tuple((args.split(None, 1) + [""])[:2])]
                for key, val in pairs:
                    if SECRET_KEY.search(key) and val and not val.startswith("$") and val.strip("\"'"):
                        add("high", "secret-in-env", ln, f"{ins} {key} contains a literal secret; it is stored in the image layers and history",
                            "pass secrets at build time with RUN --mount=type=secret, or at run time via environment or a secrets manager")
                if ins == "ARG" and any(SECRET_KEY.search(k) for k, _ in pairs) and not any(v for k, v in pairs if SECRET_KEY.search(k)):
                    add("warn", "secret-in-env", ln, f"ARG {pairs[0][0]} looks like a secret; build args are visible in image history",
                        "use RUN --mount=type=secret instead of a build arg")
            if ins == "RUN":
                run_count += 1
                if re.search(r"(curl|wget)\b[^|;&]*\|\s*(sudo\s+)?(ba|z|da)?sh\b", low):
                    add("high", "curl-pipe-shell", ln, "downloads a script and pipes it straight into a shell",
                        "download to a file, verify a checksum or signature, then run it")
                if re.search(r"chmod\s+(-r\s+)?0?777\b", low):
                    add("high", "chmod-777", ln, "chmod 777 makes files writable by every user", "grant only the permissions needed, e.g. chmod 755 or chown to the app user")
                if re.search(r"(--password[= ]\S+|://[^/\s:@]+:[^@\s$]+@)", args) or re.search(r"\b(token|api[_-]?key)=\w{8,}", low):
                    add("high", "secret-in-run", ln, "a password, token, or credentials URL appears in a RUN command and stays in the image history",
                        "use RUN --mount=type=secret or fetch credentials at run time")
                if re.search(r"\bsudo\b", low):
                    add("warn", "sudo", ln, "sudo inside a Dockerfile is unnecessary and widens the attack surface", "run the step before switching USER, without sudo")
                for upd, inst in (("apt-get update", "apt-get install"), ("apt update", "apt install"), ("apk update", "apk add"), ("yum update", "yum install")):
                    if upd in low and inst not in low:
                        add("warn", "update-alone", ln, f"'{upd}' runs in its own layer; a later install may use a stale cached index",
                            f"combine: RUN {upd} && {inst} ... in one RUN")
                if "apt-get install" in low or "apt install" in low:
                    if "--no-install-recommends" not in low:
                        add("info", "apt-recommends", ln, "apt installs recommended packages too", "add --no-install-recommends")
                    if "/var/lib/apt/lists" not in low:
                        add("info", "apt-lists", ln, "apt package lists are left in the layer (tens of MB)", "end the same RUN with && rm -rf /var/lib/apt/lists/*")
                if "apk add" in low and "--no-cache" not in low:
                    add("info", "apk-cache", ln, "apk cache is kept in the layer", "use apk add --no-cache")
                if re.search(r"\bpip3?\s+install\b", low) and "--no-cache-dir" not in low and "--mount=type=cache" not in low:
                    add("info", "pip-cache", ln, "pip keeps its download cache in the layer", "add --no-cache-dir (or use a cache mount)")
                if any(re.fullmatch(r"\s*npm\s+(install|i)(\s+--?(?!g\b|global\b)[\w-]+(=\S+)?)*\s*", seg) for seg in re.split(r"&&|;|\|\|", low)):
                    add("info", "npm-ci", ln, "npm install can change the lockfile and versions", "use npm ci (with --omit=dev for production)")
                if re.match(r"cd\s+\S+\s*&&", low) or re.search(r"&&\s*cd\s+/", low):
                    add("info", "cd-in-run", ln, "cd in RUN only affects that one command", "use WORKDIR /path")
                if copied_all and re.search(r"\b(npm (ci|install)|pip3? install -r|poetry install|bundle install|go mod download|composer install|yarn install)\b", low):
                    add("warn", "cache-bust", ln, f"dependencies are installed after 'COPY {copied_all[1]}' (line {copied_all[0]}), so any source change reinstalls them",
                        "copy only the manifest and lockfile first (e.g. COPY package*.json ./), install, then COPY the rest")
                    copied_all = None
            if ins == "ADD":
                src = args.split()[0] if args.split() else ""
                if re.match(r"https?://", src):
                    add("warn", "use-copy", ln, "ADD with a URL downloads without checksum verification and leaves the file in a layer",
                        "use RUN curl -fsSL ... with a checksum check, or ADD --checksum=sha256:...")
                elif not re.search(r"\.(tar|tar\.gz|tgz|tar\.xz|tar\.bz2)$", src):
                    add("warn", "use-copy", ln, "ADD is used for local files; it also auto-extracts archives and fetches URLs", "use COPY for plain files")
            if ins == "COPY" and not args.startswith("--from"):
                parts = [p for p in args.split() if not p.startswith("--")]
                if parts and parts[0] in (".", "./", "*"):
                    copied_all = (ln, " ".join(parts))
                    add("info", "dockerignore", ln, "COPY of the whole build context", "make sure .dockerignore excludes .git, node_modules, .env, build output, and secrets")
            if ins == "EXPOSE" and re.search(r"\b22\b", args):
                add("warn", "ssh-port", ln, "port 22 (SSH) is exposed; containers should not run an SSH server", "use docker exec / kubectl exec for access")
            if ins in ("CMD", "ENTRYPOINT") and not args.strip().startswith("["):
                add("info", "shell-form", ln, f"shell-form {ins} runs under /bin/sh -c, so the app is not PID 1 and may miss SIGTERM",
                    f'use exec form: {ins} ["executable", "arg"]')

    users = [(ln, a.strip()) for ln, i, a in final["ins"] if i == "USER"]
    if not users or users[-1][1].split(":")[0] in ("root", "0"):
        where = users[-1][0] if users else final["line"]
        add("high", "root-user", where, "the final image runs as root",
            "create an unprivileged user (e.g. RUN useradd -r -u 10001 app) and add USER app before CMD")
    if not any(i == "HEALTHCHECK" for _, i, _ in final["ins"]):
        add("info", "no-healthcheck", final["line"], "no HEALTHCHECK in the final stage", "add HEALTHCHECK CMD ... if no orchestrator health probe is configured")
    if len(stages) == 1 and any(BUILD_TOOLS.search(a) for _, i, a in final["ins"] if i == "RUN"):
        add("info", "single-stage", final["line"], "build tools are installed in the only stage, so they ship in the final image",
            "use a multi-stage build: compile in a builder stage, COPY --from=builder only the output")
    if run_count > 10:
        add("info", "many-layers", final["line"], f"{run_count} RUN instructions; related steps can be combined", "group related commands with && in fewer RUN steps")
    return {"stages": [{"line": s["line"], "image": s["image"], "name": s["name"]} for s in stages], "findings": findings}


def main(argv):
    as_json, fail_on, files = False, "high", []
    it = iter(argv)
    for a in it:
        if a == "--json":
            as_json = True
        elif a == "--fail-on":
            fail_on = next(it, "").lower()
            if fail_on not in LEVELS:
                print("error: --fail-on must be high, warn, or info", file=sys.stderr)
                return 2
        elif a in ("-h", "--help"):
            print(__doc__)
            return 0
        elif a.startswith("--"):
            print(f"error: unknown option {a}", file=sys.stderr)
            return 2
        else:
            files.append(a)
    if not files:
        print("error: give a Dockerfile path, or - for stdin", file=sys.stderr)
        return 2
    reports, worst = [], -1
    for f in files:
        try:
            text = sys.stdin.read() if f == "-" else open(f, encoding="utf-8").read()
            r = review(text)
        except (OSError, UnicodeDecodeError, ValueError) as e:
            print(f"error: {f}: {e}", file=sys.stderr)
            return 2
        r["file"] = f
        r["findings"].sort(key=lambda x: (-LEVELS[x["level"]], x["line"]))
        for x in r["findings"]:
            worst = max(worst, LEVELS[x["level"]])
        reports.append(r)
    if as_json:
        print(json.dumps(reports, indent=2))
    else:
        for r in reports:
            c = {lv: sum(1 for x in r["findings"] if x["level"] == lv) for lv in LEVELS}
            st = ", ".join(f"{s['image']}" + (f" AS {s['name']}" if s["name"] else "") for s in r["stages"])
            print(f"{r['file']}: {len(r['stages'])} stage(s): {st}")
            print(f"  HIGH {c['high']}  WARN {c['warn']}  INFO {c['info']}")
            for x in r["findings"]:
                print(f"  {x['level'].upper():<4} line {x['line']:<3} {x['rule']:<15} {x['message']}")
                print(f"       fix: {x['fix']}")
            if not r["findings"]:
                print("  no problems found")
    return 1 if worst >= LEVELS[fail_on] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
