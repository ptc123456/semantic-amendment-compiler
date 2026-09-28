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

## Verified Studio deployment

- Contract: `0xE751f9774338db467Eff87770F6041686B931Fe4`
- Deployment transaction: `0x998541b2aba99738dc6012a57161f0774e93d232afa5f8ac606a7dc0639f600f`
- Explorer: https://explorer-studio-dev.genlayer.com/address/0xE751f9774338db467Eff87770F6041686B931Fe4
- Network: Studio Next, chain `61997`
- Exact deployed-source commit: `c0100ee`
- Exact deployed-source SHA-256: `599F05C00E8D9D918855D9EEB65896AC4A52C680DA8C9FE1955DA3EF1245F54D`

The live case flow was verified through create, co-signer counter, proposer freeze,
nondeterministic evaluation, authoritative readback, and retry cooldown handling.

The exact local GenVM bundle, source hashes and pre-deployment evidence are retained outside the public tree. No private keys, keystores, internal prompts or transaction evidence are included in this repository.
