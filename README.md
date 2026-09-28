# Semantic Amendment Compiler

A bounded GenLayer contract for resolving disputed amendment wording. A proposer submits draft text, a co-signer counters, the proposer freezes the case, and validator consensus produces a canonical result or `UNRESOLVED`.

## Studio Next

- Network: Studio Next
- Chain ID: 61997
- RPC: `https://studio-dev.genlayer.com/api`
- CLI preset: `studio-dev`
- SDK preset: `studioDevnet`

## Contract

`contract.py` exposes `create_case`, `counter`, `freeze`, `evaluate`, `retry`, `get_case`, `get_history`, and `list_cases`. The contract bounds input text, checks actor permissions, increments revisions, caps retries, and exposes authoritative read methods. Nondeterministic evaluation runs through the current equivalence wrapper and fails closed to `UNRESOLVED` when the result is malformed or cannot be validated.

## Local verification

```text
python -m pytest -q tests       # 6 passed
genv GENVM_VERSION=v0.6.0-rc5 genvm-lint lint contract.py
genv GENVM_VERSION=v0.6.0-rc5 genvm-lint schema contract.py
genv GENVM_VERSION=v0.6.0-rc5 genvm-lint validate contract.py
npm run build
```

The public Vercel deployment is available at
https://semantic-amendment-compiler-build.vercel.app

The exact local GenVM bundle, source hashes and pre-deployment evidence are retained outside the public tree. No private keys, keystores, internal prompts or transaction evidence are included in this repository.
