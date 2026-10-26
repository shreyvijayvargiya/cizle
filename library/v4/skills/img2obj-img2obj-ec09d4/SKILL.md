---
name: object-to-threejs-procedural
description: Use when the user provides or references an object image and wants Codex to validate, reconstruct, review, or refine it as an editable procedural Three.js asset.
---

# Object to Three.js Procedural

Reconstruct the reference as an editable procedural Three.js asset. Optimize first for visible reference fidelity, then for implementation correctness. Polygon count, draw calls, FPS, schemas, receipts, and build success are not visual-quality evidence.

## Required outcome

1. Inspect the real reference and classify it `pass`, `conditional`, or `reject`.
2. Create one concise progressive spec with a stable global core.
3. Run `blockout -> form -> lookdev -> interaction` as four phase types. Interaction remains active while motion is unassessed or required; a justified `not-required` decision removes its runtime gate.
4. In every active phase use one short loop: `spec delta -> build/render -> active-reference comparison -> blind visual scout + independent review -> system promote/rollback -> user approval`.
5. The default fast perceptual workflow uses `approvalMode=final-only`: system
   champions may advance between internal phases, and the final active phase
   requires explicit user approval bound to the exact reviewed artifact.
   `phase-by-phase` remains available when intermediate approval is required.

Do not claim hidden geometry as observed fact. Record it as a bounded assumption or known risk.

Resolve `<plugin-root>` from this loaded file: `SKILL.md` lives at
`<plugin-root>/skills/object-to-threejs-procedural/SKILL.md`. Invoke every bundled
command through the absolute `<plugin-root>/scripts/sculpt.py` path; never assume
the target project's current working directory.

## Default architecture

Use the progressive single-spec layout by default:

```bash
python3 <plugin-root>/scripts/sculpt.py init "Object Name" \
  --image <usable-original-or-white-background-prepared-reference> \
  --reference-separation <clear|mixed|absent> \
  [--imagegen-preparation-mode <white-background-cleanup|white-background-simplification>] \
  [--imagegen-trigger <background-mixing|excessive-complexity|low-source-quality|real-object-photo|combined>] \
  [--declared-simplification <exact-detail-family>] \
  [--planning-sheet-layout <standard|exploded>] \
  --complexity <simple|moderate|complex|ultra> \
  [--quality-profile <balanced|reference-fidelity>] \
  --out object-sculpt.json
```

`init` defaults to the progressive monolithic layout. This means one evolving spec, not one undifferentiated mesh: complex assemblies still use recursive component/feature trees with stable semantic IDs.

Use `--layout modular` only when a subsystem is independently buildable and the observed source can provide a matching module-local crop or mask. Never compare an isolated module render with the full-object reference. Such a pair is `evidence-scope-mismatch` and must not score, consume a retry, or trigger rollback.

## Reference preparation

Require at least one inspectable image. Assess both subject/background separation and whether the source is practical to reconstruct:

- Use the original directly when its complete boundary is readable and its detail/quality is practical for procedural reconstruction. White, neutral, transparent, or strongly contrasting backgrounds are acceptable.
- Invoke the `imagegen` skill once when the subject blends into the background, the source quality obscures construction, the object is impractically complex, or a real-object photo needs a cleaner buildable 3D-style reference. These triggers apply independently.
- ImageGen must output a clean solid-white background with strong subject contrast. Do not request or validate alpha transparency.
- Use `white-background-cleanup` for separation/edge cleanup. Use `white-background-simplification` for reconstruction-blocking complexity, quality, or difficult real-world surface variation, and declare every intentionally simplified detail family.
- Bounded edits may clarify ambiguous edges, remove noise, regularize minor geometry, convert difficult photoreal surface variation into clean buildable 3D masses, and merge or omit non-signature microdetail. Preserve the recognizable class, primary silhouette, macro proportions, major component layout, signature features, pose, and primary viewpoint in the generated target.
- During preparation, compare the generated candidate with the pre-generation image only as a transient identity-drift check. Once accepted, the generated image becomes `sourceImage` and the sole reconstruction and acceptance target; do not store or send the pre-generation image to either reviewer.
- `unassessed` preparation is a strict-quality blocker.

Default new work to `reference-fidelity`. Use `balanced` only when the user explicitly accepts a lower visual bar.

## Progressive spec contract

Do not author the complete final spec before the first render. Keep the stable core small and extend it with one phase-local delta.

Always-loaded stable core:

- target and observed reference;
- coordinate frame and relative scale;
- primary silhouette, proportions, landmarks, and negative spaces;
- stable semantic IDs and macro hierarchy;
- bounded assumptions and known risks;
- `sourceImage` as the sole reconstruction and acceptance authority.
- `viewingContract.renderPipeline`, including explicit and runtime-verifiable
  anti-aliasing for every rendered phase.

Phase-owned fields:

- `blockout`: object class, assessed visual style, complexity tier, macro components, primary framing, silhouette, proportions.
- `form`: recursive children/features, topology strategy, attachments, repetition systems, signature detail, conditional view hypotheses.
- `lookdev`: materials, colors, rigidity, roughness/gloss, microrelief, PBR maps, lighting, contact shadow.
- `interaction`: motion assessment, exact moving component IDs, pivots, axes, limits/rates, motion clearance, runtime evidence.

IDs remain stable. Edit authority and review scope are cumulative: the active phase must inspect its own and every earlier phase's visible quality, and may improve earlier work when the richer current render exposes a real defect or clear opportunity. Thus Lookdev may repair geometry/Form and Interaction may repair geometry or materials. A passed phase is a baseline, not a frozen result; only future-phase work remains forbidden. Every earlier-phase repair must use the same exact-ID/path impact assessment, challenger checkpoint, source/current/previous visual comparison, whole-result regression veto, rollback, and human approval as current-phase work. A phase delta may not silently reuse IDs or overwrite a stable-core fact; if observed evidence falsifies a core fact, record the reason.

Use the concise current-phase packet instead of reopening the whole spec:

```bash
python3 <plugin-root>/scripts/sculpt.py context object-sculpt.json
```

Read `workPacket.contextProjection`, edit only `specDeltaContract.editablePaths`, and leave `futurePhaseWorkForbidden` alone. Read additional files only after a named validation failure proves they are relevant.

## The four phases

### Blockout

Goal: converge the complete object's observed primary-view silhouette and macro proportions as quickly as possible.

- Build the whole silhouette-coupled object or one foundation assembly, not a body-only crop judged against the full object.
- Before the first build, resolve `viewHypothesisPolicy`. Use the standard 2x2 order `three-quarter | side` over `back | front`. For a `complex` or `ultra` assembly with separable or internal components, use `exploded | side` over `back | front`; only the first tile is exploded and the other views remain assembled. Display/register the sheet and use it only as planning-veto evidence.
- Skip the 2x2 only when the object is classified `simple`, strong bilateral/radial/axial symmetry is visible, confidence is at least `0.8`, and the evidence and reason are recorded.
- Use the observed primary view as the acceptance authority.
- Do not create recursive detail plans, PBR maps, motion pivots, or runtime receipts here.
- Geometry may be coarse, but all identity-defining major parts visible in the source must exist and be positioned plausibly.

### Form

Goal: make structure, attachments, local shape, balance, and signature details correct without damaging accepted Blockout layers.

Recursively decompose complex components. `compound` and `complex` components are never atomic. Each component or feature needs a construction-specific ID/name, host/parent, numeric transform/size, evidence/confidence, review criteria, and an executable realization. Use children for independently shaped/material/attached/moving parts; use named features for details embedded in one continuous host.

Every repeated or attached system must declare parent/socket plus `contact`, `overlap`, or `gap` intent. Review both the local crop and the full assembly so a locally good part cannot be accepted in the wrong position or scale.

Consume the registered Blockout-preparation 2x2; do not regenerate it unless provenance is invalid or the user explicitly changes the reconstruction target.

- The registered sheet is one cached edge-to-edge 2x2 ImageGen planning sheet using either the standard order or, for a complex/ultra assembly, `exploded | side` over `back | front`.
- Skip it only when the assessed complexity tier is `simple` **and** observed evidence supports strong bilateral, radial, or axial symmetry with confidence at least `0.8`. Record the symmetry type, evidence refs, and reason in `skipAssessment`.
- Moderate, complex, ultra, asymmetric, articulated, occluded, or uncertain objects always require the 2x2 turnaround. Separate sequential ImageGen views do not satisfy the default policy.
- Synthetic views are `planning-veto` only. They can expose implausible depth or assembly structure but can never approve fidelity or replace `sourceImage`.

### Lookdev

Goal: match color zones, material class, optical finish, surface response, lighting, and grounding while continuing to inspect and improve visible Blockout/Form quality without regressing the whole result.

Only now extract or author independent albedo, roughness, height/normal, and AO. Describe materials concretely: hard/soft, rigid/flexible, matte/glossy, smooth/wrinkled/pitted/granular. Never reuse albedo as another PBR channel. Use geometry for silhouette-changing relief and material response for sub-silhouette microdetail.

Resolve each material through one explicit `textureSet.sourceType`: `procedural`,
`reference-extracted`, `imagegen-authored`, or `external-authored`. Keep legacy
`referencePbr` valid as the reference-extracted compatibility path. If a
source-supported surface is impractically complex to reproduce procedurally,
invoke the `imagegen` skill once to author a flat, neutral-lit, project-local
texture swatch offline. Use it primarily as albedo; roughness, height/normal,
AO, metalness, and alpha remain independently evidenced channels. Record the
final prompt, workspace path/URL, hash, evidence refs, and baked-light/seam
checks. This authored texture is an implementation asset: it never replaces
or gains acceptance authority over `sourceImage`.

Await the generated runtime's `materialReady` promise before Lookdev review,
confirm that the assessed shading treatment was applied, then inspect the
`neutral`, `grazing`, and `reference` views. A failed texture load is a blocker,
not a successful material with missing detail.

Anti-aliasing is not a Lookdev effect: it belongs to the stable review render
contract and applies from Blockout onward. Bloom, SSAO, depth of field, grading,
and other appearance effects remain optional Lookdev work and must not be used
to hide form or material defects.

### Interaction

Goal: apply object-class knowledge even when the user did not ask for animation.

- If observed joints or a high-confidence domain prior imply motion, set `interactionContract.status=required` and implement exact component ID, pivot, axis, limits/rate, and tested key states.
- If no meaningful object-specific motion exists, set `not-required` with a concrete reason; do not invent physics, destruction, or hidden mechanisms.
- Runtime receipts, motion clearance, and final full-project typecheck belong here or in finalization, not in earlier visual cycles.

## One fast cycle per attempt

For the current phase:

1. Obtain `sculpt context` once.
2. Before editing, write one bounded impact assessment for the complete correction batch: canonical `activePhase`, exact target IDs and allowed parameter paths, protected component IDs, structural invariants, expected effect, possible side effects, structured `downstreamImpact` entries, risk, rollback checkpoint, and `safe-to-apply`. Each downstream entry names a phase strictly later than `activePhase`, its predicted effect, mitigation performed now, and the future check that can verify the prediction. Reject or narrow the batch if it can alter untargeted structure or leaves a material downstream risk without mitigation. A `strategy-reset` must explicitly set `strategyChange: true`; an ordinary refinement must set it to `false`.
3. Apply the assessed correction batch—owned by the active phase or repairing an earlier phase—only to a challenger; never mutate the champion checkpoint.
4. Run one fail-fast phase validation/build and one application build sufficient to render. Do not full-typecheck between individual edits.
5. Capture the required render(s).
6. Create one exact `sourceImage`/render comparison. For two to four views, present one 2x2 sheet rather than sequential images.
7. Run deterministic preflight; if valid, run the blind visual scout and primary independent reviewer concurrently from the same immutable image evidence.
8. Let the system promote, refine, rollback, or change strategy atomically.
9. After a system gate passes, advance automatically under `final-only`; on the
   final active phase show the exact comparison/runtime evidence and ask for
   explicit approval. Under `phase-by-phase`, request the same approval after
   every phase. Structured change feedback always reruns the full AI gate.

After at most two non-visual operations, the next material action must produce a new render, unless a named blocker prevents it. Schema repair, receipts, cache writes, screenshot bookkeeping, or reviewer setup do not count as modeling progress.

Batch validation and generation. Repeat a command only after its inputs changed or its failure produced a new falsifiable correction. Run a full project typecheck only at Interaction/finalization unless it is the only available render build.

## Review contract

Every visual checkpoint requires the current render and exact side-by-side comparison with `sourceImage`. It is the sole acceptance reference. Synthetic planning views may appear only in a separately labeled planning sheet and never approve acceptance.

Use two distinct review roles:

- The blind visual scout receives only `sourceImage`, `currentRender`, `previousRender` when a prior checkpoint exists, their exact side-by-side comparison, the active `phaseId`, and that phase's compact visual rubric. It must not receive the spec, phase packet, IDs, parameters, scores, builder defense, or primary verdict. It performs a mandatory earlier-quality sweep first, then the active-phase review, and must inspect every rubric check before deciding. Those checks explicitly cover excessive reference deviation, visible assembly/contact/attachment alignment, reference-relative balance or intentional asymmetry, missing/invented/malformed signature detail, and material/surface response that is visibly simpler or less plausible than the reference. It may `reject` a major/critical issue owned by the active phase (`phaseScope: current`) or any earlier phase (`phaseScope: protected`, a backward-compatible token meaning prior quality scope, not a frozen layer). Earlier phases may also produce non-blocking improvement directions. A small numeric score drop alone is not a rejection reason; score regression must be corroborated by the visual comparison. Blockout judges silhouette/framing/macro proportion/major parts; Form adds structure/shape/attachments/balance/signature detail and can improve Blockout; Lookdev adds color/material/surface/lighting/grounding and can improve Blockout/Form; Interaction adds motion/clearance/runtime states and can improve all earlier phases. Only future-phase issues are `deferred` and cannot reject. The scout scans the full rubric but returns at most seven highest-impact directions, and assigns no scores, IDs, parameter paths, or numeric fixes.
- The primary independent reviewer receives the raw reference, current render/comparison, phase packet, and all IDs editable in the cumulative current-or-earlier scope—never the builder's proposed score or defense. It must review in the same order: first map remaining or improvable earlier-phase geometry/structure/lookdev defects to exact IDs and corrections, then review the active phase. It supplies one composite shape-similarity score, independently reviews every applicable critical or `mustPass` feature target, and returns exact component corrections. It may not approve merely because the active-phase work is good while an obvious earlier-phase defect or required feature failure remains. The system gate requires composite score `>=0.70`, every critical or `mustPass` feature gate, and blind-scout `approve`; explicit user approval remains the configured final human gate.

The primary reviewer must run as a separate sub-agent. After both reviewers return, the main agent maps every blind-scout observation 1:1 into the separate `blindScoutMapping` artifact using exact spec targets. It may not drop, merge, or rewrite the scout's decision/severity; an unmapped current/protected `critical|major` observation keeps the gate blocked.

The scout supplements rather than replaces the primary reviewer. Use a fresh context distinct from both builder and primary reviewer so spec assumptions cannot contaminate its purely visual diagnosis. The runtime validates the emitted scout packet fields, but it cannot inspect an external orchestrator's hidden prompt or conversation history. Passing any denied context to the scout is a protocol failure; report that review and completion as `UNVERIFIED`.

After both AI layers and deterministic gates pass, human approval is the final phase gate:

- show the current render/output plus exact side-by-side or Interaction runtime evidence;
- state that the system gate passed, but do not claim the phase is complete yet;
- ask the user to approve or identify `visualRegion`, `problem`, and `expectedDirection`;
- never infer approval from silence, a previous phase, or a generally positive comment;
- when changes are requested, map the human-described region to exact component IDs/parameters, refine, rerun both AI reviewers, and ask again only after the new artifact passes.

Record the response with:

```bash
python3 <plugin-root>/scripts/sculpt.py approve object-sculpt.json \
  --pass-id <blockout|form|lookdev|interaction> \
  --decision approved \
  --user-statement "<exact user approval>"
```

For a rejection, record both the exact user statement and structured feedback:

```bash
python3 <plugin-root>/scripts/sculpt.py approve object-sculpt.json \
  --pass-id <blockout|form|lookdev|interaction> \
  --decision changes-requested \
  --user-statement "<exact user request>" \
  --feedback-json '[{"visualRegion":"<where>","problem":"<what>","expectedDirection":"<desired change>"}]'
```

Reviewer scores use normalized `0..1` values. Suitability and complexity `scores.*` use ordinal integers `0..3`; never mix the scales.

Every actionable issue must identify:

- exact `component`, `detail-feature`, `material`, `repetition`, `topology-group`, `motion-affordance`, or `global` ID;
- observed mismatch and expected result;
- numeric `set`, `scale`, `translate`, `rotate`, or `replace` operation;
- parameter path, value/unit, and final expected value;
- view/evidence that will falsify the correction.

Apply all corrections in one atomic batch before rendering again.

Before that batch is executable, its `impactAssessment` must prove that it is local and recoverable:

- `targetIds` exactly equal the correction targets and `allowedPaths` exactly equal their parameter paths;
- `activePhase` is the canonical current phase (`blockout`, `form`, `lookdev`, or `interaction`);
- `protectedComponentIds` identify neighboring/accepted components that must not change;
- `structuralInvariants` state the hierarchy, attachments, proportions, or motion relationships that must survive;
- `expectedEffect`, `possibleSideEffects`, `risk`, and `rollbackCheckpoint` make the blast radius explicit;
- `downstreamImpact` is a non-empty array whose entries provide a `phase` strictly later than `activePhase`, plus `prediction`, `currentMitigation`, and `futureVerification`; it analyzes later-phase compatibility without authoring later-phase fields;
- only `verdict: safe-to-apply` proceeds. The builder must narrow/reject an unsafe proposal before touching code or spec.

## Champion and rollback policy

Checkpoint `spec + code + generated output + render + comparison + scores` together.

- Seed the first valid scored candidate as the system phase champion. It remains `awaiting-user-approval` until the user approves it.
- Promote when the AI similarity gate and blind scout pass; keep the highest-scoring compatible champion. Decide visual regression from the source/current/previous image comparison, never from a pixel-overlap score.
- A challenger that fails the three-signal gate remains in audit history; restore the highest-scoring compatible champion transactionally.
- A reviewer `stop` does not bypass comparison: score the rendered challenger and restore the champion on regression.
- Three consecutive non-improvements exhaust the strategy. Keep the champion, record one `strategy-reset`, and materially change representation before another render.
- An improving candidate resets the consecutive-failure count; useful refinement may continue up to the safety cap.
- Evidence/schema/hash/scope failures do not consume quality attempts because they do not prove the render is worse.
- A human `changes-requested` decision does not unlock the next phase. Preserve its structured feedback, refine the same phase, rerun deterministic and both AI gates, then request approval for the new hash-bound artifact.

No deterministic pixel-overlap score is computed, stored, displayed, or used for promotion and rollback. Image integrity checks prove provenance only and cannot compensate for poor visual quality.

## User-visible progress

At the start, state the active phases and an ETA range. After every complete cycle or named blocker, report:

- current phase and champion/challenger state;
- accepted gates versus active gates;
- component IDs changed;
- visible render plus exact side-by-side comparison;
- before/after reviewer layers and deterministic geometry diagnostics;
- promote, reject, rollback, or strategy-change result;
- system-pass versus user-approved status;
- next correction and recalculated ETA range.

Do not narrate every internal schema/build/cache action as a separate progress step. A pre-render blocker may say `visual comparison: not available yet` with the exact reason; never reuse a stale image.

## Completion gate

Do not claim completion until the active phase plan is complete, the configured
approval mode is satisfied for the latest system-passed artifact, the final
champion spec validates, generated TypeScript compiles with `three`, the real
app loads without relevant errors, every comparison is bound to the reviewed
artifact and its render-pipeline receipt, cumulative visual quality did not
regress, and required interaction has real runtime proof. If a required external
check or independent-review context cannot run, name the missing evidence and
report the result as `UNVERIFIED`; do not substitute confidence for execution.

Performance is an optional post-lookdev audit activated only by an explicit user/device budget. Restore the visual champion after any performance refinement that lowers visual quality.

## Reference routing

Load the mandatory reference mapped to the active phase or problem below. The
phase packet does not carry reference filenames:

- suitability/global contract: `references/pre-spec-assessment.md`;
- visual-style axes, values, and derivation: `references/visual-style-classification.md`;
- visible anatomical face/hand schema and critical review:
  `references/anatomical-regions.md`;
- geometry/recursive representation: `references/procedural-patterns.md`;
- attachments: `references/attachment-joint-correctness.md`;
- materials/lighting: `references/material-lighting-realism.md`;
- interaction: `references/action-ready-models.md`;
- screenshots/scores: `references/browser-screenshot-feedback.md`;
- corrections/rollback: `references/self-correction-loop.md`;
- terminology: `references/3d-graphics-terminology.md`.

Optional component-pattern references are capability modules, not schema
extensions. Use the current `sculpt context` output
`capabilities.packs[].reference` as the canonical path for a matched pack. Load
one only after an observed component or named phase problem matches its trigger;
never classify the whole object into one exclusive category or preload the
library:

- trunks/branches/stems/leaves/grass: `references/patterns/vegetation.md`; load
  `references/patterns/procedural-tree-generation.md` only for an automatic
  whole-tree first Form construction;
- bounded terrain/ground/rocks/boulders/cliffs:
  `references/patterns/procedural-landform-generation.md` only for an automatic
  first Form construction;
- rigid manufactured panels/frames/fasteners/machinery: `references/patterns/hard-surface-machinery.md`;
- exposed organic skin/eyes/flesh: `references/patterns/organic-skin-eyes.md`;
- visible hair/fur/bristles/fibers: `references/patterns/hair-fur-fiber.md`;
- cloth/garments/straps/upholstery: `references/patterns/fabric-cloth.md`;
- glass/liquid/lenses/clear covers: `references/patterns/transmissive-surfaces.md`;
- rotor/hinge/slide/sway/deformation or action-ready articulated digits:
  `references/patterns/procedural-motion.md`;
- glow/energy/smoke/fog/aura: `references/patterns/effects-emissive-volume.md`;
- logos/labels/symbols/stripes/text: `references/patterns/markings-decals-text.md`.

The executable registry may compose every matched pack on different components.
The two-reference limit is only a context-loading budget: expand full pattern
instructions for at most two active-blocker owners at once unless a third
blocker proves necessary. Mandatory phase/schema contracts such as
`anatomical-regions.md` do not consume this optional-pattern budget. Pattern
examples must map into registered JSON paths, emitters, and typed correction
operators; unsupported requests return `capability-gap` rather than prose-only
advice or guessed code.
