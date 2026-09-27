# Implementation Plan — Semantic Amendment Compiler

## Baseline
Research dossier `E:\Genlayer-Projects\semantic-amendment-compiler`, revision R1. Runtime adaptation approved: Studio Next bundle `v0.6.0-rc5`, dependency `py-genlayer:5jyc...`.

## Product scope
One contract and one case workflow. Proposer submits bounded draft text; co-signer counters/accepts; proposer freezes; anyone evaluates; contract stores canonical amendment or `UNRESOLVED`. No external source, credentials, value transfer or second contract.

## Contract architecture
Single `gl.contract.Contract` with explicit typed persistent fields and deterministic state guards. Public methods: `create_case`, `counter`, `freeze`, `evaluate`, `retry`, `get_case`, `get_history`, `list_cases`. Storage uses current supported GenLayer collections/custom storage only after schema probe.

## Authority/state
Proposer creates and may freeze. Co-signer counters or accepts once. Anyone may evaluate a frozen case. States: DRAFT, COUNTERED, FROZEN, ACCEPTED, REJECTED, UNRESOLVED. Expected-revision CAS and creator+nonce idempotency protect writes.

## Nondeterministic decision
One bounded `gl.nondet.exec_prompt` call inside the current equivalence/custom validator wrapper. Inputs are immutable copied primitives. Output schema is `{v, decision, reason_code, evidence_hash}`; every consequential field is independently checked. Malformed output, validator error or disagreement leaves state unchanged; agreed ambiguity stores `UNRESOLVED`.

## Bounds/serialization
Canonical sorted-key JSON, duplicate-key rejection, UTF-8 aggregate cap 16 KiB, no floats/NaN/unknown keys, bounded strings and enums, sized integer fields.

## Recovery
Maximum three attempts; 60-second cooldown; immutable operation journal; ambiguous hashes reconcile rather than resubmit. Read methods expose state, revision, history and outcome for authoritative readback.

## Tests
Deterministic authorization/state/CAS/nonce/bounds; prompt-injection fixture; mocked agreement, malformed output, validator disagreement and unavailable execution; serialization/pickling; exact schema/lint/typecheck; readback predicates. Live Studio and frontend tests remain later gates.

## Evidence/gates
SPEC_LOCK -> CODE_EDIT -> PRE_DEPLOY (anonymous gate skipped only by recorded task-local override) -> Studio deployment/E2E -> POST_DEPLOY_TEST -> GitHub -> Vercel release/E2E. No signing or deployment before all prerequisites.

## Files
Allowed implementation: `contract.py`, `tests/`, `frontend/`, manifests, README and public verification docs. Forbidden public files: secrets, keys, internal prompts, governance, dossier drafts, logs/cache, preflight evidence and temporary artifacts.
