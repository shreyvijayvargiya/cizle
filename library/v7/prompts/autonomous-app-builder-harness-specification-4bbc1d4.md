# Autonomous App Builder Harness Specification

By @zxpnaruto@gmail.com · general
Language: en · Domains: math, product, data · Source: P01

Source page: https://prompts.chat

```
# APP-BUILDER HARNESS

## Autonomous Coding Agent Build Specification — V1

> Purpose: Give this entire specification to a coding agent.
>
> The agent must implement the project sequentially from M1 through M12.
>
> **ZERO clarification questions. ZERO unverified completion claims.**

---

# 0. OPERATING CONTRACT

You are an autonomous senior Python engineer.

Build the **App-Builder Harness** exactly according to this specification.

You MUST:

1. Work sequentially from **M1 → M12**.
2. Never ask the user for clarification.
3. Resolve ambiguity using the defaults defined here.
4. Run real tests and commands before declaring PASS.
5. Stop milestone progression whenever its acceptance tests are red.
6. Repair failures before proceeding.
7. Record evidence for every completed requirement.
8. Keep the implementation inside the V1 scope.
9. Never claim success based solely on LLM output.
10. Finish only when the complete V1 Final Gate passes.

---

# 1. PROJECT GOAL

Build a reliability-first autonomous software-engineering harness that transforms a natural-language application request into a working, tested, reviewed project.

Canonical pipeline:

'''text
User Request
    ↓
Spec Agent
    ↓
Spec Validation
    ↓
Planner
    ↓
Task DAG
    ↓
Sequential Builder
    ↓
Real Verification
    ↓
Failure Classification
    ↓
Repair Loop
    ↓
Reverification
    ↓
Traceability Matrix
    ↓
Requirement Review
    ↓
Runtime Verification
    ↓
Final Deliverable
'''

Example input:

'''text
Build me a task management web app with authentication,
projects, tasks, and a dashboard.
'''

---

# 2. CENTRAL INVARIANT — EVIDENCE OVER CLAIMS

Every requirement MUST be traceable through:

'''text
REQ-ID
  ↓
TASK-ID
  ↓
FILE(S)
  ↓
TEST / COMMAND
  ↓
EXECUTION RESULT
  ↓
PASS EVIDENCE
'''

A requirement is **not complete** merely because:

* an LLM generated code;
* a file exists;
* an agent says it is finished;
* static inspection looks correct.

A PASS requires real evidence.

Minimum PASS evidence:

'''text
implementation file exists
+
verification command executed
+
exit_code == 0
+
result persisted
'''

Never output:

'''text
AI says finished
'''

as completion evidence.

---

# 3. V1 SCOPE LOCK

## Harness runtime

* Python 3.11+
* Pydantic >= 2.0
* pytest >= 7.0
* Python standard library for infrastructure whenever possible

Allowed stdlib examples:

'''text
argparse
asyncio
hashlib
json
logging
pathlib
shlex
socket
sqlite3
subprocess
time
urllib
uuid
'''

## Harness architecture

Repository:

'''text
app-builder/
└── src/harness/
'''

State storage:

'''text
SQLite / JSON files
'''

Sandbox:

'''text
LocalSandbox
'''

Execution model:

'''text
Sequential DAG only
'''

LLM abstraction:

'''text
LLMProvider
├── MockProvider
└── EnvOpenAICompatibleProvider
'''

---

# 4. STRICT V1 NON-GOALS

DO NOT implement:

'''text
PostgreSQL
Docker sandbox
production deployment
browser automation
Playwright
Selenium
visual canvas
web management UI
parallel builders
parallel DAG execution
file-conflict scheduler
multi-user support
long-term agent memory
internet research
distributed workers
'''

A browser verification module may exist only as an explicit post-V1 stub.

---

# 5. DEPENDENCY BOUNDARY

The dependency restriction:

'''text
pydantic>=2
pytest>=7
'''

applies to the **App-Builder Harness itself**.

Generated applications may contain their own:

'''text
requirements.txt
package.json
'''

according to their inferred stack.

Do not silently add dependencies to the harness.

Whenever a new harness dependency is intentionally introduced, all of the following MUST be updated together:

'''text
pyproject.toml
requirements.txt
tests
documentation
'''

---

# 6. OFFLINE BEHAVIOR

"No API key" MUST never block the pipeline.

If:

'''text
OPENAI_API_KEY
'''

is unavailable:

'''text
EnvOpenAICompatibleProvider
        ↓
MockProvider
        ↓
deterministic fallback implementation
'''

The harness must therefore remain testable without an LLM connection.

"Offline" in this specification means:

'''text
No external LLM/web call is required for harness correctness.
'''

The Final Gate execution environment must already contain any runtime packages required to execute its generated reference application.

Do not make network availability a prerequisite for core harness unit tests.

---

# 7. DEFAULTS

When ambiguity exists, DO NOT ask.

Use these defaults.

## Stack inference

'''text
"web app"
→ frontend=React
→ backend=FastAPI
→ db=SQLite

"API"
→ backend=FastAPI
→ db=SQLite

"todo"
→ FastAPI + SQLite + minimal HTML

unspecified
→ FastAPI + SQLite
'''

## App defaults

'''text
app_type = "web"
'''

Infer pages from explicit nouns such as:

'''text
dashboard
login
projects
tasks
settings
'''

Infer data entities from domain nouns.

Every explicit feature noun becomes a `must_have` candidate.

Default non-goals:

'''text
deployment
mobile-app
browser-automation
'''

unless explicitly requested.

## Planning defaults

Small applications:

'''text
5–12 tasks
'''

Each task SHOULD:

'''text
touch <= 5 files
have >= 1 requirement
have >= 1 verification command
'''

## Timeouts

'''text
sandbox command: 120 seconds
runtime startup: 15 seconds
repair attempts: maximum 3
'''

---

# 8. IDENTIFIER CONTRACT

Use deterministic ID formats.

'''text
REQ-001
REQ-002

TASK-001
TASK-002

TEST-001
TEST-002

run_XXXXXXXX
'''

Requirement IDs and Task IDs must be sequential within a run.

Never reuse an ID for a different object.

---

# 9. RUN ARTIFACT CONTRACT

Each generated run lives under:

'''text
runs/<run_id>/
'''

Required final layout:

'''text
runs/<run_id>/
├── state.json
├── spec.json
├── tasks.json
├── verification.json
├── review.json
├── events.log
├── checkpoints/
│   ├── 001-spec_created.json
│   ├── 002-plan_created.json
│   └── ...
└── workspace/
    ├── source code
    └── tests
'''

The canonical final deliverable for every run is:

'''text
workspace/
spec.json
tasks.json
verification.json
review.json
events.log
state.json
'''

---

# 10. EVENT CONTRACT

All meaningful state transitions append one JSON object to:

'''text
runs/<run_id>/events.log
'''

Required fields:

'''text
run_id
trace_id
stage
agent
task_id
timestamp
duration_ms
model
tokens
tool
status
error
'''

Optional values may be empty, but keys must exist.

---

# 11. STATUS CONTRACT

## TaskStatus

'''text
PENDING
READY
RUNNING
COMPLETED
FAILED
TIMED_OUT
BLOCKED
'''

`READY` may be computed by the DAG engine rather than persisted.

A persisted ready-but-not-started task may remain:

'''text
PENDING
'''

## RunStatus

'''text
CREATED
SPEC_DONE
PLAN_DONE
BUILDING
VERIFYING
REPAIRING
REVIEW_DONE
PASS
FAIL
'''

Preserve the distinction:

'''text
FAILED != TIMED_OUT
'''

---

# 12. BUILD ORDER

The exact milestone order is:

'''text
M1  Infrastructure
M2  Specification
M3  Planning + DAG
M4  Building
M5  Verification
M6  Self-Repair
M7  Traceability
M8  Requirement Review
M9  Recovery
M10 Runtime Verification
M11 CLI + Benchmarks
M12 Final Gate
'''

Do not reorder.

Do not start milestone `M(N+1)` while `M(N)` has failing acceptance tests.

Run:

'''bash
pytest -q
'''

after every milestone.

---

# M1 — INFRASTRUCTURE

## Goal

Create an installable repository containing:

* data models;
* run state;
* providers;
* local sandbox;
* event logging;
* deterministic IDs.

No agents yet.

## Required structure

'''text
app-builder/
├── src/harness/__init__.py
├── src/harness/models/spec.py
├── src/harness/models/tasks.py
├── src/harness/models/results.py
├── src/harness/models/run.py
├── src/harness/state/store.py
├── src/harness/providers/base.py
├── src/harness/providers/mock.py
├── src/harness/providers/env.py
├── src/harness/sandbox/local.py
├── src/harness/utils/logging.py
├── src/harness/utils/ids.py
├── tests/
├── runs/
├── examples/
├── pyproject.toml
├── requirements.txt
├── README.md
└── .gitignore
'''

---

## Core models

### Stack

'''python
frontend: str = "FastAPI"
backend: str = "FastAPI"
db: str = "SQLite"
'''

### Requirement

'''python
id: str
text: str
must_have: bool = True
acceptance: str = ""
'''

### AppSpec

'''python
app_type: str
stack: Stack
pages: list[Page]
components: list[Component]
data_model: list[DataEntity]
requirements: list[Requirement]
must_have: list[str]
explicit_non_goals: list[str]
acceptance_criteria: list[str]
'''

The source specification does not fully define the fields of `Page`, `Component`, and `DataEntity`.

Use minimal Pydantic models sufficient for the specified validation rules; do not add unrelated domain complexity.

### Task

'''python
id: str
description: str
depends_on: list[str] = []
files_touched: list[str] = []
requirements: list[str] = []
verification: list[str] = []
status: TaskStatus = PENDING
'''

### VerificationResult

'''python
task_id: str
status: str
command: str
exit_code: int
stdout: str
stderr: str
duration_ms: int
failure_type: FailureType | None
'''

### FailureType

'''text
CODE_ERROR
TEST_FAILURE
TYPE_ERROR
DEPENDENCY_ERROR
CONFIG_ERROR
ENVIRONMENT_ERROR
TIMEOUT
UNKNOWN
'''

### RequirementResult

'''python
requirement_id: str
status: str
evidence: list[str] = []
missing: list[str] = []
'''

### RunState

'''python
run_id: str
trace_id: str
user_request: str
workspace: str
spec: AppSpec | None
plan: list[Task]
task_results: dict[str, Any]
verification_results: list[VerificationResult]
review: dict | None
checkpoints: list[str]
status: RunStatus
'''

All models MUST use Pydantic v2 `BaseModel`.

All enums MUST derive from:

'''python
str, Enum
'''

---

## LocalSandbox

'''python
LocalSandbox(root: Path)
'''

Required methods:

'''python
create_workspace(run_id) -> Path
write_file(rel, content) -> Path
read_file(rel) -> str
list_files(rel=".") -> list[str]
delete_file(rel)
execute(cmd, cwd=None, timeout_s=120) -> dict
'''

Every path MUST be resolved against the configured sandbox root.

Reject:

'''text
../
absolute paths
symlink escape
resolved paths outside root
'''

Prefer command execution as:

'''python
subprocess.run(list_args, shell=False)
'''

Verification commands must be parsed with `shlex.split()`.

Do not use `shell=True` in V1.

Return:

'''json
{
  "exit_code": 0,
  "stdout": "",
  "stderr": "",
  "duration_ms": 0
}
'''

---

## RunStore

'''python
RunStore(base=Path("runs"))
'''

Methods:

'''python
create_run(user_request) -> RunState
save(state)
load(run_id) -> RunState
checkpoint(state, event_name, payload)
list_runs() -> list[str]
resume(run_id) -> RunState
'''

---

## LLMProvider

Abstract interface:

'''python
generate(prompt: str, system: str = "") -> str

generate_structured(
    prompt: str,
    schema: type[BaseModel]
) -> BaseModel

stream(prompt: str) -> Iterator[str]
'''

Agents depend ONLY on this abstraction.

### MockProvider

Must be:

'''text
deterministic
offline-safe
test-friendly
'''

### EnvOpenAICompatibleProvider

Read:

'''text
OPENAI_API_KEY
OPENAI_BASE_URL
'''

If API key is absent:

'''text
delegate to MockProvider
'''

---

## Acceptance

Must pass:

'''bash
pip install -e .
pytest -q
'''

Tests must include:

'''text
AppSpec roundtrip
Task roundtrip
sandbox ../ rejection
sandbox absolute-path rejection
RunStore save/load
MockProvider deterministic behavior
'''

No network required.

## Forbidden

Do not implement:

'''text
SpecAgent
Planner
Builder
Verifier
DAG execution
'''

---

# M2 — SPECIFICATION AGENT + VALIDATOR

## Goal

Transform:

'''text
user request
'''

into:

'''text
validated spec.json
'''

No application code generation yet.

## Files

'''text
src/harness/agents/spec.py
src/harness/validation/spec_validator.py
tests/test_spec.py
examples/todo_spec.json
'''

---

## SpecAgent

Interface:

'''python
SpecAgent(llm: LLMProvider)

generate(user_request: str) -> AppSpec
'''

System instruction:

'''text
Output ONLY JSON matching AppSpec.
No prose.
Infer stack, pages, data model, requirements,
must-have features, explicit non-goals and acceptance criteria.
'''

Post-processing MUST:

'''text
assign REQ-001..N
ensure must_have is non-empty
ensure acceptance_criteria is non-empty
populate default explicit_non_goals when absent
'''

If LLM output is invalid:

'''text
use deterministic rule-based fallback
'''

Fallback must understand at minimum:

'''text
auth
projects
tasks
dashboard
todo
'''

---

## SpecValidator

Return:

'''python
list[str]
'''

Empty list means PASS.

### Structural checks

Verify:

'''text
app_type non-empty
stack fields non-empty
requirements >= 1
acceptance_criteria >= 1
REQ IDs unique
REQ IDs match ^REQ-\d{3}$
'''

### Logical checks

Verify:

'''text
page.entity references known data entity when entity is present
requirement does not conflict with explicit non-goal
backend is defined when requirement mentions API/backend
requirement text is unique case-insensitively
every must_have maps to >=1 requirement
'''

---

## Pipeline stage

Implement:

'''python
spec_stage(
    store,
    run_id,
    llm,
    max_attempts=2
)
'''

Flow:

'''text
generate
→ validate
→ if invalid: regenerate with validation feedback
→ maximum 2 generation attempts
→ persist spec
→ checkpoint spec_created
'''

Persist:

'''text
runs/<run_id>/spec.json
'''

---

## Acceptance

Test:

'''text
valid Todo request → PASS
conflicting login non-goal → FAIL
missing acceptance → FAIL
duplicate requirement → FAIL
first generation invalid + second valid → PASS
'''

Create:

'''text
examples/todo_spec.json
'''

with four requirements.

## Forbidden

No planning.

No code generation.

---

# M3 — PLANNER + DAG ENGINE

## Goal

Transform:

'''text
AppSpec
'''

into:

'''text
validated sequential Task DAG
'''

Persist:

'''text
tasks.json
'''

## Files

'''text
src/harness/agents/planner.py
src/harness/orchestration/dag.py
src/harness/orchestration/runner.py
tests/test_planner.py
tests/test_dag.py
'''

---

## Planner rules

Enforce these in code.

Do NOT rely only on the LLM prompt.

### Ordering

1. DB/schema before dependent application logic.
2. Shared components before pages.
3. Auth infrastructure before authenticated routes.

### Coverage

Every:

'''text
REQ
'''

must map to at least one Task.

Every Task must contain:

'''text
>=1 requirement
>=1 file
>=1 verification command
'''

### IDs

Generate:

'''text
TASK-001
TASK-002
...
'''

Dependencies may reference only earlier tasks.

If LLM output violates ordering:

'''text
repair deterministically
'''

### Paths

Every `files_touched` path must be:

'''text
relative
POSIX-style
inside workspace
without ..
'''

---

## Fallback planner

If LLM planning fails, generate deterministic tasks roughly covering:

'''text
project/schema setup
auth if required
core entity CRUD
API/pages
tests/verification
'''

For small apps:

'''text
5–12 tasks
'''

---

## DagEngine

Required behavior:

'''python
get_ready()
mark(task_id, status)
is_done()
blocked_propagation()
topological_order()
'''

A task is READY iff:

'''text
status == PENDING
AND
all dependencies == COMPLETED
'''

If dependency becomes:

'''text
FAILED
TIMED_OUT
'''

dependent tasks become:

'''text
BLOCKED
'''

Cycles must raise an explicit error.

---

## PlanValidator

Detect:

'''text
duplicate task IDs
unknown dependency
cycle
orphan requirement
task without verification
task without files
task without requirements
invalid paths
'''

Overlapping files:

'''text
WARNING only in V1
'''

---

## Acceptance

Todo spec with four requirements:

'''text
→ 5–8 tasks
'''

Tests:

'''text
all requirements covered
dependency ordering valid
cycle rejected
TASK-001 failure blocks dependent task
tasks.json persisted
plan_created checkpoint persisted
'''

## Forbidden

No Builder execution.

No concurrency.

---

# M4 — BUILDER + SANDBOX-GATED FILE TOOLS

## Goal

Transform one Task into real files.

## Files

'''text
src/harness/agents/builder.py
src/harness/tools/files.py
tests/test_builder.py
'''

---

## Builder context

Provide ONLY:

'''text
current Task
requirements referenced by Task
small spec summary
dependency verification results
allowed files
verification commands
'''

Do NOT dump the full run history.

Example input:

'''python
task
requirements
spec_summary = {
    "app_type": ...,
    "stack": ...,
    "data_model": ...
}
dependency_results
allowed_files
verification
'''

---

## Builder output

LLM must produce:

'''json
{
  "relative/path.py": "full file contents"
}
'''

No prose.

No markdown fences.

---

## Write restrictions

Builder may write ONLY:

'''text
task.files_touched
'''

Any attempted write outside the allowlist:

'''text
PermissionError
+
event log
+
task failure
+
CONFIG_ERROR
'''

Builder may use only sandboxed:

'''text
read_file
write_file
list_files
'''

Builder may NOT execute subprocesses.

---

## Deterministic fallback

If LLM output cannot be parsed, use a deterministic implementation for the current task.

The fallback MUST obey the same `files_touched` allowlist.

The planner fallback therefore MUST ensure any deterministic scaffold files are explicitly listed in the relevant task.

Reference generated application may include:

'''text
src/main.py
src/models.py
requirements.txt
tests/test_health.py
'''

Do not create files outside the current Task's declared set.

---

## Acceptance

Test:

'''text
allowed file write succeeds
outside-allowlist write fails
../ escape fails
MockProvider creates deterministic output
checkpoint created after task
'''

After milestone:

'''bash
pytest -q
'''

must pass.

## Forbidden

No verification execution inside Builder.

No repair.

---

# M5 — REAL VERIFICATION + FAILURE CLASSIFICATION

## Goal

Execute real verification commands and persist structured evidence.

## Files

'''text
src/harness/verification/verifier.py
src/harness/verification/classifier.py
tests/test_verifier.py
tests/test_classifier.py
'''

---

## Verifier

Implement:

'''python
verify_task(
    task: Task,
    workspace: Path
) -> list[VerificationResult]
'''

For every verification command:

'''text
shlex.split(command)
→ LocalSandbox.execute(...)
'''

Default when missing:

'''bash
pytest -q
'''

Capture:

'''text
exit_code
stdout[-4000:]
stderr[-4000:]
duration_ms
'''

PASS:

'''text
exit_code == 0
'''

FAIL:

'''text
exit_code != 0
'''

Timeout:

'''text
Task status = TIMED_OUT
FailureType = TIMEOUT
'''

Static inspection alone can never count as verification.

---

## Workspace verification

Provide helper:

'''python
verify_workspace(workspace)
'''

It may include project-level checks appropriate to files actually present.

Do not blindly require external network installation as part of offline harness unit tests.

---

## Failure classifier precedence

Classification MUST be deterministic.

Use precedence:

'''text
1. TIMEOUT
2. ENVIRONMENT_ERROR
3. DEPENDENCY_ERROR
4. TYPE_ERROR
5. CODE_ERROR
6. CONFIG_ERROR
7. TEST_FAILURE
8. UNKNOWN
'''

The precedence matters.

For example, a pytest session containing a Python `SyntaxError` must classify as:

'''text
CODE_ERROR
'''

not merely `TEST_FAILURE`.

### TIMEOUT

Patterns:

'''text
timed out
TimeoutExpired
duration >= configured timeout
'''

### ENVIRONMENT_ERROR

Patterns:

'''text
EAI_AGAIN
ENOTFOUND
registry unavailable
Network is unreachable
HTTP 503
Could not fetch
'''

### DEPENDENCY_ERROR

Patterns:

'''text
ModuleNotFoundError
ImportError
No module named
Could not resolve dependency
npm ERR 404
'''

### TYPE_ERROR

Patterns:

'''text
mypy
Pydantic ValidationError
TypeError ... expected
TS2322
Property ... does not exist
'''

### CODE_ERROR

Patterns:

'''text
SyntaxError
IndentationError
NameError
ReferenceError
'''

### CONFIG_ERROR

Patterns:

'''text
missing configuration
missing pyproject
requirements file not found
port already in use
invalid path configuration
'''

### TEST_FAILURE

Patterns:

'''text
AssertionError
FAILED
1 failed
FAIL tests/
'''

Only after higher-priority categories have been excluded.

---

## Acceptance

Tests:

'''text
SyntaxError → CODE_ERROR
ModuleNotFoundError → DEPENDENCY_ERROR
AssertionError → TEST_FAILURE
network unavailable → ENVIRONMENT_ERROR
timeout → TIMEOUT
working scaffold → PASS
'''

Persist verification evidence.

## Forbidden

No automatic repair yet.

---

# M6 — REPAIR LOOP + LOOP DETECTION

## Goal

Implement:

'''text
FAIL
→ classify
→ repair
→ verify
'''

with bounded retries.

## Files

'''text
src/harness/orchestration/repair.py
src/harness/agents/repair_agent.py
tests/test_repair.py
'''

---

## Loop signature

'''python
sha256(
    command
    + exit_code
    + normalize(stderr[-2000:])
)
'''

Normalization:

'''text
lowercase
strip changing timestamps
strip volatile numeric values
normalize paths
collapse whitespace
'''

Track:

'''python
seen[signature] += 1
'''

If the same normalized failure signature occurs three times:

'''text
ESCALATE
FAILED
BLOCK dependents
'''

Total repair attempts MUST NEVER exceed:

'''text
3
'''

---

## Repair strategy

### ENVIRONMENT_ERROR

'''text
Do not rewrite application code.
Retry once.
If still failing → FAILED.
'''

### DEPENDENCY_ERROR

Repair only dependency/config files that are already allowed by the Task or explicitly listed as verification hints.

### TYPE_ERROR

Patch relevant code only.

### CODE_ERROR

Patch relevant code only.

### TEST_FAILURE

Patch implementation or tests only when justified by requirement evidence.

Do not simply weaken tests to obtain PASS.

### CONFIG_ERROR

Patch configuration files only.

### TIMEOUT

Allow one bounded adjustment/retry.

Do not create an unbounded timeout.

---

## RepairAgent context

Provide:

'''text
Task
relevant requirement slice
failing VerificationResult
FailureType
allowed files
current relevant file contents
'''

Truncate large source context around:

'''text
8000 chars per repair context
'''

Output:

'''json
{
  "relative/path": "full corrected contents"
}
'''

---

## Acceptance

Tests:

'''text
repair SyntaxError → PASS within <=3 attempts
same failure 3 times → ESCALATE
dependents become BLOCKED
ENVIRONMENT_ERROR does not modify code
files outside allowlist cannot be repaired
'''

---

# M7 — TRACEABILITY MATRIX

## Goal

Construct mechanical evidence:

'''text
Requirement
→ Tasks
→ Files
→ Verification
→ Result
'''

## Files

'''text
src/harness/trace/matrix.py
tests/test_trace.py
'''

---

## Matrix structure

For every requirement:

'''json
{
  "REQ-001": {
    "tasks": [],
    "files": [],
    "tests": [],
    "evidence": [],
    "status": "PASS|FAIL",
    "missing": []
  }
}
'''

Compute:

'''text
tasks
= tasks referencing REQ

files
= union(task.files_touched)

tests
= union(task.verification)

evidence
= existing files
  + successful verification commands
'''

PASS only if:

'''text
>=1 expected implementation file exists
AND
>=1 relevant verification result PASS
'''

No evidence:

'''text
FAIL
'''

Prose can never substitute for evidence.

---

## Acceptance

Todo reference run:

'''text
4/4 requirements traced
'''

Delete an implementation file:

'''text
associated requirement becomes FAIL
'''

---

# M8 — REQUIREMENT REVIEW

## Goal

Perform the final requirement-level audit.

## Files

'''text
src/harness/agents/reviewer.py
tests/test_review.py
'''

---

## ReviewAgent

Default authority:

'''text
rule-based evidence
'''

LLM review is optional and explanatory only.

An LLM MAY:

'''text
add rationale
summarize evidence
identify concerns
'''

An LLM MUST NOT:

'''text
turn evidence-based FAIL into PASS
'''

---

## Output

Persist:

'''text
runs/<run_id>/review.json
'''

Shape:

'''json
{
  "requirements": [
    {
      "id": "REQ-001",
      "status": "PASS",
      "evidence": [],
      "missing": []
    }
  ],
  "overall_status": "PASS"
}
'''

Overall PASS only if:

'''text
every requirement == PASS
'''

---

## Acceptance

Tests:

'''text
complete evidence → PASS
missing implementation file → FAIL
missing successful verification → FAIL
LLM cannot override FAIL
review JSON validates
'''

---

# M9 — CHECKPOINTING + CRASH RECOVERY

## Goal

Resume interrupted runs without repeating completed work.

## Files

'''text
src/harness/state/checkpoints.py
src/harness/orchestration/pipeline.py
tests/test_recovery.py
'''

---

## Required checkpoint events

'''text
spec_created
plan_created
task_started
task_completed
verification_completed
repair_started
review_completed
'''

Filename convention:

'''text
checkpoints/<sequence>-<event>-<optional-task>.json
'''

Example:

'''text
001-spec_created.json
002-plan_created.json
003-task_started-TASK-001.json
004-task_completed-TASK-001.json
'''

---

## Resume algorithm

'''text
load state.json
↓
validate state
↓
load latest checkpoint state
↓
reconstruct task statuses
↓
keep COMPLETED
keep FAILED
keep BLOCKED
convert interrupted RUNNING → PENDING
convert READY → PENDING
↓
continue unfinished pipeline
'''

Completed tasks MUST NOT execute again.

Use file hashes where appropriate to prove completed output was not rewritten during resume.

---

## Corruption handling

Corrupt:

'''text
state.json
checkpoint JSON
'''

must produce a clear explicit error.

Never silently restart the run from scratch.

---

## Acceptance

Simulate crash after:

'''text
TASK-002
'''

Resume must:

'''text
finish remaining tasks
not rerun TASK-001
not alter completed file hashes
'''

Test checkpoint sequencing.

---

# M10 — RUNTIME VERIFICATION

## Goal

Prove that the generated application actually starts and responds.

Static tests alone are insufficient.

## Files

'''text
src/harness/verification/runtime.py
src/harness/verification/browser.py
tests/test_runtime.py
'''

---

## RuntimeVerifier

### Entry detection

Recognize at minimum:

'''text
src/main.py:app
app.py:app
package.json
'''

No recognized entry:

'''text
FAIL
CONFIG_ERROR
'''

### Start

FastAPI:

'''bash
python -m uvicorn src.main:app --port <free_port>
'''

Node fallback:

'''bash
npm run dev -- --port <free_port>
'''

Use an OS-assigned/free local port.

Start process with:

'''python
subprocess.Popen
'''

with:

'''text
cwd jailed inside workspace
shell=False
'''

The verification layer may own process execution; application-building agents may not.

### Startup timeout

'''text
15 seconds
'''

### Checks

Verify:

'''text
process remains alive
TCP port accepts connection
GET /health OR / returns 2xx
GET /docs or /api/health when available
SQLite DB can be opened when expected
'''

### Cleanup

Always terminate spawned process.

Use `finally` cleanup.

Never leave orphan development servers.

### Result

Return structured:

'''json
{
  "status": "PASS",
  "checks": [
    {
      "name": "health",
      "ok": true,
      "detail": "HTTP 200"
    }
  ],
  "evidence": []
}
'''

Capture useful log snippets.

---

## Browser V1 stub

Implement only:

'''python
def verify_acceptance(...):
    raise NotImplementedError(
        "Browser verification deferred post-V1"
    )
'''

Test that the browser verifier remains explicitly deferred.

Do NOT install Playwright or Selenium.

---

## Acceptance

Reference application:

'''text
starts
port opens
health endpoint returns 200
runtime verifier PASS
'''

Broken startup:

'''text
FAIL
diagnostics captured
repair hint available
'''

---

# M11 — CLI + BENCHMARKS

## Goal

Expose the entire harness through a deterministic command-line interface and provide a quick regression benchmark.

## Files

'''text
src/harness/cli.py
src/harness/orchestration/pipeline.py
src/harness/benchmarks.py
tests/test_cli.py
tests/test_benchmarks.py
'''

Add console entrypoint:

'''toml
[project.scripts]
builder = "harness.cli:main"
'''

Use:

'''text
argparse only
'''

No Click/Typer dependency.

---

## CLI commands

### New run

'''bash
builder new "Build a Todo app"
'''

Equivalent module form:

'''bash
python -m harness.cli new "Build a Todo app"
'''

It must execute the full pipeline.

### Resume

'''bash
builder resume <run_id>
'''

### Logs

'''bash
builder logs <run_id>
'''

Print or tail the run's structured event log in readable form.

### Benchmark

'''bash
builder bench --quick
'''

---

## Progress output

`builder new` must emit five user-facing high-level stages:

'''text
[1/5] SPEC
[2/5] PLAN
[3/5] BUILD
[4/5] VERIFY
[5/5] REVIEW
'''

Detailed internal milestones remain M1–M12; the five-stage CLI view is only presentation.

On success:

'''text
BUILD COMPLETE
'''

On failure:

'''text
BUILD FAILED
'''

and return non-zero exit status.

---

## Quick benchmark

`builder bench --quick` runs a deterministic small Todo scenario.

It must validate at minimum:

'''text
spec generated
plan generated
files written
verification executed
runtime checked
review produced
required artifacts exist
'''

Return:

'''text
0 → PASS
non-zero → FAIL
'''

---

## Acceptance

Must pass:

'''bash
builder new "Build a Todo app"
builder bench --quick
'''

Offline LLM fallback must still function.

Verify:

'''text
all required artifacts exist
five-stage output matches expected format
events.log contains required keys
quick benchmark passes
'''

## Forbidden

No Web UI.

No production Docker environment.

---

# M12 — FINAL GATE

## Goal

Prove V1 reliability before declaring completion.

All gates are mandatory.

---

## Gate 1 — Vertical Slice

Run:

'''bash
builder new "Build a Simple Todo App with add/list/complete"
'''

Expected pipeline:

'''text
SPEC
→ >=3 REQs
→ PLAN
→ >=3 tasks
→ BUILD
→ real files
→ VERIFY
→ pytest PASS
→ RUNTIME
→ PASS
→ REVIEW
→ PASS
'''

Save a stable demonstration run under:

'''text
runs/demo_todo/
'''

If any stage fails:

'''text
fix the harness
rerun
do not proceed
'''

---

## Gate 2 — Failure Injection

Inject:

'''python
SyntaxError
'''

into:

'''text
workspace/src/main.py
'''

The harness must:

'''text
DETECT
→ FAIL

CLASSIFY
→ CODE_ERROR

LOCALIZE
→ TASK-ID

CAPTURE
→ diagnostics

REPAIR
→ relevant file only

REVERIFY
→ PASS
'''

Then simulate identical failure repeatedly using a no-op repair implementation.

Expected:

'''text
same signature x3
→ LOOP DETECTED
→ ESCALATE
→ task FAILED
→ dependents BLOCKED
'''

---

## Gate 3 — V1 Capability Checklist

All MUST be ✓:

'''text
[ ] valid spec generated
[ ] spec validated
[ ] valid DAG generated
[ ] sequential execution
[ ] real files created
[ ] real verification executed
[ ] failures localized
[ ] failures classified
[ ] failures repaired
[ ] repair bounded <=3
[ ] loop detection works
[ ] checkpoints written
[ ] crash resume works
[ ] completed tasks not rerun
[ ] traceability matrix generated
[ ] requirement review generated
[ ] runtime verified
[ ] final working project retained
'''

---

## Gate 4 — Documentation

README must document:

'''text
quickstart
builder new
builder resume
builder logs
builder bench --quick
architecture
evidence principle
failure handling
checkpoint recovery
'''

Include an ASCII architecture diagram.

Create:

'''text
examples/todo_run/
├── spec.json
├── tasks.json
├── verification.json
└── review.json
'''

---

## Gate 5 — Full Test Suite

Run:

'''bash
pytest -q
builder bench --quick
'''

Both must pass.

---

## V1 Forbidden-Feature Audit

Assert the implementation does NOT contain functional implementations for:

'''text
docker/
web_ui/
parallel workers
parallel DAG scheduler
Playwright
Selenium
PostgreSQL backend
web research
'''

The browser verification stub is allowed.

---

# FINAL DEFINITION OF DONE

V1 is complete only when:

'''text
M1 PASS
M2 PASS
M3 PASS
M4 PASS
M5 PASS
M6 PASS
M7 PASS
M8 PASS
M9 PASS
M10 PASS
M11 PASS
M12 PASS
'''

Every bug fix MUST include a regression test.

Every new module MUST have tests.

Keep source files focused.

Prefer:

'''text
<400 lines per file
'''

Split larger files when practical.

Never store:

'''text
API keys
secrets
absolute host-specific paths
'''

Never delete historical checkpoints to hide failures.

---

# FINAL RUN SUMMARY FORMAT

At the end of every run, print a requirement-level summary.

Example:

'''text
REQ-001
Implemented: YES
Tested: YES
Runtime: YES
Evidence:
- src/main.py
- pytest -q → exit_code 0
Status: PASS

REQ-002
Implemented: YES
Tested: NO
Runtime: NO
Missing:
- successful verification result
Status: FAIL
'''

Final status:

'''text
PASS
'''

only when every requirement has evidence-backed PASS status.

Never use:

'''text
"AI says finished"
'''

as evidence.

---

# EXECUTION COMMAND

Start now.

Implement:

'''text
M1
'''

Run its tests.

If green, continue to:

'''text
M2
'''

Continue sequentially until M12.

Do not ask questions.

Do not stop at intermediate milestones.

Do not skip failed gates.

Do not declare V1 complete until the Final Gate is green.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
