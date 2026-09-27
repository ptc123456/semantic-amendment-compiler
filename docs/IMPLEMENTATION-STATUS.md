## Current implementation status

`contract.py` now uses the approved Studio Next dependency `py-genlayer:5jyc...` and validates with the pinned local GenVM bundle. Public methods: `create_case`, `counter`, `freeze`, `evaluate`, `retry`, `get_case`, `get_history`, `list_cases`.

The contract enforces proposer/co-signer authorization, state guards, bounded text, immutable revision increments, max three evaluation attempts, fail-closed `UNRESOLVED`, and authoritative views. Transaction cooldown/reconciliation remains a client/evidence-layer invariant until the current runtime exposes a verified block-time primitive; no unverified timestamp API is introduced.
