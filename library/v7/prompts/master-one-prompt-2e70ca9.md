# master one prompt

By @sharanshakthii5@gmail.com · general
Language: en · Domains: product, math, data · Source: P01

Source page: https://prompts.chat

```
Create one extremely powerful MASTER PROMPT for Claude Pro.

The purpose of the prompt is to make Claude act as the complete AI development and research team for my final-year college cybersecurity project.

I will provide Claude with:
- the exact project title
- college-provided research papers
- college-provided PDFs
- college PPT/template
- review rubric/guidelines
- any mandatory requirements

The project must be researched, designed, coded, tested, evaluated, documented and prepared for presentation primarily with AI tools.

I am doing the project alone. Therefore the AI must do as much of the research, coding, debugging, testing, documentation and presentation preparation as possible, while keeping the project realistically achievable.

IMPORTANT:
This is a FRESH PROJECT INSTRUCTION.

Do NOT refer to previous conversations.
Do NOT assume previous project decisions.
Do NOT include teammate work.
Do NOT use old project discussions unless I explicitly provide them.
Do NOT assume that any previously discussed feature is our final solution.

The prompt must force Claude to work in STRICT PHASES and prevent it from jumping randomly between research, coding, UI and PPT.

Required workflow:

PHASE 0 — Understand college requirements
PHASE 1 — Research the technology from old to current
PHASE 2 — Analyze existing commercial and academic systems
PHASE 3 — Research current problems and limitations
PHASE 4 — Identify genuine research gaps
PHASE 5 — Generate and rank possible project contributions
PHASE 6 — Strict faculty/reviewer attack test
PHASE 7 — Freeze the final research direction
PHASE 8 — Design architecture
PHASE 9 — Build complete working code
PHASE 10 — Testing and debugging
PHASE 11 — Dataset and experimental design
PHASE 12 — Run experiments and collect real results
PHASE 13 — Build professional UI/dashboard
PHASE 14 — Integrate and validate the complete system
PHASE 15 — PPT and report
PHASE 16 — Mock viva and final reviewer assessment

Claude must finish each phase and wait for my command before moving to the next phase.

==================================================
RESEARCH REQUIREMENT
==================================================

The prompt must instruct Claude to research deeply using reliable and recent sources.

Use sources such as:

IEEE
ACM
USENIX
Springer
Elsevier
reputable conferences/journals
official vendor documentation
official standards
reputable security research

Research both older foundational work and current 2024–2026 developments.

Do not fabricate papers, authors, datasets, statistics, citations or results.

Every important research claim must be verified.

==================================================
NOVELTY REQUIREMENT
==================================================

This is extremely important.

Do NOT tell Claude to make the project "sound innovative."

Tell Claude to determine what is ACTUALLY different after researching existing systems.

The reviewer may ask:

"What is new?"

"This already exists."

"Cisco Umbrella already does this."

"Cloudflare already does this."

"Antivirus already does this."

"Why do we need your project?"

"What exactly is your contribution?"

Therefore Claude must research current products and research before recommending novelty.

If a proposed feature already exists:

→ explicitly identify it
→ do NOT call it novel
→ determine whether there is a legitimate improvement, evaluation, integration, optimization or unresolved limitation

Do not automatically assume that:
- AI
- Machine Learning
- Threat Intelligence
- DNS filtering
- DGA detection
- DNS tunneling detection
- behavioral analysis
- explainable AI
- risk scoring
- adaptive detection
- DoH/DoT detection

are novel.

Research first.

==================================================
DNS SECURITY EXAMPLE
==================================================

If the project is related to DNS filtering/security, investigate modern systems such as:

Cisco Umbrella
Cloudflare DNS/security
Quad9
NextDNS
enterprise DNS security
antivirus/EDR
firewalls
IDS/IPS
web security gateways
open-source DNS security systems

Determine:

What they already do
How they do it
What works well
What limitations remain
What researchers are currently investigating

Also investigate current DNS-security challenges including:

unknown domains
previously unseen threats
false positives
false negatives
threat-intelligence delay
outdated reputation
changing attacker behavior
concept/model drift
DGA evolution
DNS tunneling
DoH
DoT
DNS bypass
privacy
latency
computational overhead
explainability
dataset bias
class imbalance
adversarial attacks
cross-network generalization
temporal behavior
context-aware detection
safe automated response

These are examples only.

Claude must discover better opportunities if current research identifies them.

==================================================
ANTIVIRUS CHALLENGE
==================================================

The prompt must instruct Claude to compare the project against:

Antivirus
EDR
Firewall
IDS/IPS
Web security gateway
DNS security

Claude must explain:

What DNS can see
What DNS cannot see
What DNS can potentially detect earlier
Where DNS overlaps with antivirus
Where DNS provides a distinct security role

Never claim DNS replaces antivirus.

==================================================
RESEARCH GAP
==================================================

Claude must produce:

Existing systems
↓
Existing capabilities
↓
Current limitations
↓
Research attempts
↓
Remaining gap
↓
Research question
↓
Proposed contribution
↓
How the contribution will be experimentally proven

Do not invent a research gap.

==================================================
WOW FACTOR
==================================================

Find ONE genuinely useful "WOW" feature.

It must be:

research-backed
useful
implementable
testable
measurable
demonstrable

Do NOT add unnecessary blockchain, chatbot, LLM or decorative AI features merely to make the project look advanced.

One strong contribution is better than many weak features.

==================================================
REVIEWER MODE
==================================================

The prompt must make Claude act as a hostile faculty reviewer after designing the project.

Claude must ask difficult questions such as:

What exactly is new?
Isn't this already available?
Does Cisco Umbrella already do this?
Does antivirus already do this?
Why not use an existing service?
What is your research gap?
Which paper supports the gap?
What exactly did you implement?
How does the system make decisions?
What happens when Threat Intelligence has no information?
What happens when ML is wrong?
How do you handle false positives?
How do you handle false negatives?
Can attackers bypass it?
What happens with DoH/DoT?
How much latency does it introduce?
How do you prove improvement?
Why this dataset?
Why this algorithm?
What are the limitations?

Claude must identify weaknesses and tell me exactly how to improve them.

It must score the project on:

Problem clarity
Research depth
Existing-system analysis
Research gap
Novelty/differentiation
Technical feasibility
Architecture
Implementation
Dataset
Experiments
Results
Practical usefulness
Security relevance
Performance
UI/demo
Viva defensibility
WOW factor

==================================================
IMPLEMENTATION REQUIREMENT
==================================================

The final project must be a REAL WORKING PROJECT.

Claude must provide:

complete folder structure
complete source code
dependencies
installation commands
configuration
environment variables
database
API
frontend
backend
testing
debugging
deployment/run instructions

No pseudocode.

No fake implementation.

No TODO-only code.

No fake API responses.

No invented results.

If Claude modifies a file, it must provide the complete updated file.

Build incrementally:

BUILD
→ RUN
→ TEST
→ VERIFY
→ FIX
→ NEXT

Never continue while a critical component is broken.

==================================================
AI TOOL STRATEGY
==================================================

The master prompt must tell Claude how to divide work among AI tools:

Claude:
research, literature analysis, research gap, architecture, code generation, code review

ChatGPT:
independent verification, architecture review, debugging, testing, technical reasoning, viva

Cursor:
main codebase implementation and integration

GitHub Copilot:
small coding tasks, autocomplete and tests

Perplexity:
independent research/source verification

v0:
professional UI/dashboard generation

GitHub:
version control

The AI tools are being used as the development/research team, so the workflow should maximize their usefulness.

==================================================
EXPERIMENT REQUIREMENT
==================================================

The project must have REAL experiments.

Claude must design:

baseline
vs
proposed approach

Use appropriate metrics such as:

precision
recall
F1
false-positive rate
false-negative rate
detection rate
latency
processing overhead
generalization
robustness

Only use metrics relevant to the actual project.

All final results must come from experiments we actually run.

Never invent numbers.

==================================================
UI REQUIREMENT
==================================================

If a UI is appropriate, create a professional cybersecurity dashboard.

It must use real backend data.

No static fake dashboard.

Show only useful project information such as:

queries
detections
risk/decision
evidence
alerts
statistics
performance
system status

==================================================
PPT / REPORT REQUIREMENT
==================================================

After the implementation and experiments are validated, generate the PPT and report according to the official college template and rubric.

Everything shown in the PPT must match the actual implementation.

If something is not implemented, label it:

PROPOSED
or
FUTURE SCOPE

Never present planned functionality as completed.

==================================================
VIVA REQUIREMENT
==================================================

Claude must eventually conduct a mock viva.

Ask questions one at a time.

Start basic and become increasingly difficult.

If my answer is wrong:

1. Explain what is wrong.
2. Give the correct technical explanation.
3. Give me a short answer I can say to faculty.
4. Continue with the next question.

==================================================
FINAL AUDIT
==================================================

Before declaring the project complete, Claude must audit:

TITLE
↓
OBJECTIVES
↓
RESEARCH
↓
EXISTING SYSTEMS
↓
CURRENT LIMITATIONS
↓
RESEARCH GAP
↓
CONTRIBUTION
↓
ARCHITECTURE
↓
CODE
↓
DATASET
↓
EXPERIMENTS
↓
REAL RESULTS
↓
UI
↓
PPT
↓
REPORT
↓
DEMO
↓
VIVA

Everything must be consistent.

The final project must survive:

"THIS ALREADY EXISTS. WHAT DID YOU ACTUALLY ADD?"

==================================================
MOST IMPORTANT RULE
==================================================

Be skeptical.

Do not agree with my ideas automatically.

If something already exists, tell me.

If the research gap is weak, tell me.

If the project scope is too large, reduce it.

If an idea is impossible for one developer, reject it.

If a feature is unnecessary, remove it.

If a contribution is genuinely useful and feasible, explain why.

Do not optimize for impressive wording.

Optimize for:

REAL PROBLEM
+
REAL RESEARCH GAP
+
REAL CONTRIBUTION
+
WORKING CODE
+
REAL TESTING
+
REAL EXPERIMENTS
+
REAL RESULTS
+
STRONG DEMO
+
STRONG VIVA

==================================================
OUTPUT FORMAT
==================================================

The generated Claude master prompt must be:

- extremely clear
- structured
- sequential
- unambiguous
- professional
- detailed enough to guide the entire project
- designed to prevent Claude from jumping ahead
- designed for a solo student using multiple AI tools

At the END of the generated master prompt, instruct Claude:

"WAIT FOR THE USER TO PROVIDE THE PROJECT TITLE AND OFFICIAL COLLEGE MATERIAL.

DO NOT START RESEARCH.
DO NOT START CODING.
DO NOT DESIGN THE ARCHITECTURE.

FIRST COMPLETE PHASE 0 ONLY."
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
