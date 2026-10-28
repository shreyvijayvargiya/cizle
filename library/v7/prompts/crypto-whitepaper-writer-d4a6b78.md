# Crypto Whitepaper Writer

By @nitishktech · general
Language: en · Domains: finance, engineering, math · Source: P01

Source page: https://prompts.chat

```
---
name: crypto-whitepaper-writer
description: Write a credible, well-structured whitepaper for any crypto/blockchain project (L1 chain, DeFi protocol, oracle network, stablecoin, token system) — grounded in the structural and rhetorical patterns of Bitcoin, Ethereum, Uniswap, Chainlink, and MakerDAO, not generic ICO-hype templates. Use whenever asked to draft, outline, or review a crypto/Web3 whitepaper.
---

# Crypto Whitepaper Writer

## Why this skill exists

Most AI-generated crypto whitepapers read like marketing decks: vague "revolutionary" language,
unbacked security claims, a roadmap standing in for proof, tokenomics as decoration. The five
most-cited whitepapers in the industry — Bitcoin, Ethereum, Uniswap, Chainlink, MakerDAO — share a
different discipline instead: problem-first framing, incremental mechanism-building, named threat
models, and per-actor incentive analysis. This skill encodes that discipline so the output reads
like engineering, not a pitch.

See `reference.md` for the full research base: archetype skeletons, craft principles, anti-patterns,
and the pre-publish checklist. Read it before drafting.

## Step 1 — Gather inputs before writing a word

Do not start drafting until you have, from the user:

- **The problem** this project solves, in one sentence, with a concrete scenario of what fails
  without it.
- **The project archetype** — the closest match in `reference.md` → Archetypes: base-layer
  consensus/settlement, DeFi mechanism (AMM/lending/derivatives), oracle/coordination network,
  stablecoin/collateral system, or application-layer protocol/token system.
- **The core mechanism** — what actually happens on-chain/off-chain, in enough detail to describe a
  state transition or formula, not just a feature list.
- **Token existence and role** — if a token exists, what specific mechanical function does it serve
  (fee payment, collateral, staking/slashing, governance weight)? If the project doesn't need a
  token, say so explicitly rather than inventing tokenomics to look complete.
- **Known limitations / open risks** the team is willing to state honestly.

If any of these is missing or vague, ask before drafting — never fabricate a problem statement, team
background, adoption numbers, or token model to fill a gap.

## Step 2 — Pick the section skeleton, calibrate length

Match the archetype to its skeleton in `reference.md`. Don't force every whitepaper through an
identical template — Bitcoin has no tokenomics section; MakerDAO has no proof-of-work security proof.
Use the shared spine (problem → mechanism → actor/incentive analysis → threat/risk model →
architecture → [governance/token, only if applicable] → limitations → conclusion), and cut whatever
doesn't apply to this project.

Length follows mechanism complexity, not a fixed page count — Bitcoin proves its point in 9 pages;
MakerDAO needs far more because it coordinates more actors and failure modes. Let each section run as
long as the idea needs and no longer (anti-pattern: forced symmetry). If the project has a token or
makes any financial/return-implying claim, include a short disclaimer (Uniswap's precedent) stating
the document is not investment advice.

## Step 3 — Draft section by section, applying the craft principles

Work through `reference.md`'s craft principles as each section gets written. The ones that matter
most in practice:

- Open with a failure scenario, not a mission statement.
- Build the mechanism from a minimal model upward — don't state the final design cold.
- Every security or performance claim gets a number, threshold, or named proof — never an adjective
  alone ("highly secure" is not a claim).
- Every incentive-driven actor (miner, LP, oracle node, keeper, validator) gets its own paragraph
  naming exactly what they earn and what punishes defection.
- Name specific attack vectors and pair each with its specific countermeasure.
- Include at least one worked, traceable example — a transaction walkthrough, a numeric calculation,
  a step-by-step lifecycle.
- If this design revises or extends a known predecessor, write it as an explicit delta (what changed
  and why), not a from-scratch re-explanation.

## Step 4 — Run the anti-pattern filter before showing a draft

Scan against `reference.md`'s anti-pattern list. Any hit is a reason to rewrite the line, not soften
it: price predictions or market-cap claims, unverifiable team/advisor credentials used as an
argument, roadmap phases presented as proof of viability, a tokenomics table with no stated
mechanical purpose, novelty claimed without naming what came before, a security claim with no threat
model behind it, a missing limitations section, buzzwords substituting for a mechanism description.

## Step 5 — Self-check and disclose gaps

Before finalizing:

- Confirm every numeric or technical claim traces to something the user provided or a cited external
  source — flag anything you inferred rather than were told.
- Confirm a limitations/risks section exists and isn't hollow.
- Run `reference.md`'s pre-publish checklist and state the result (pass/fail per item, or a
  self-rating) to the user before calling the draft done — don't ship a whitepaper without surfacing
  what's unresolved.

## Output format

Markdown, sections matching the chosen archetype skeleton, an abstract at the top, references/sources
at the bottom if external material was used. No emoji, no bolded label scaffolding (`Problem:`,
`Solution:`), no forced symmetry between sections — a simple idea gets a short section, a hard one
gets a long one, exactly as the five reference papers do.

Cite every external claim (a cryptographic primitive, a competitor's known limitation, a market fact)
inline with a bracketed marker (e.g. `[1]`) resolving to a numbered reference list at the end — never
assert an outside fact with no traceable source. See `reference.md` → Calibration examples for what a
compliant vs. non-compliant sentence looks like before you draft the real thing.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
