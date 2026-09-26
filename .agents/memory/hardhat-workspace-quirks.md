---
name: Hardhat workspace quirks
description: Contract tooling constraints specific to this monorepo and its current OpenZeppelin toolchain.
---

Hardhat must write compiler artifacts outside the shared `artifacts/` tree, because Replit artifact folders are otherwise scanned as Solidity artifacts and can break TypeChain ABI parsing. OpenZeppelin 5.6 also requires Solidity 0.8.28 with the Cancun EVM target for its `mcopy` implementation.

**Why:** The workspace already uses `artifacts/` for application packages, and the latest OpenZeppelin utility sources target Cancun-era compiler behavior.

**How to apply:** Keep Hardhat `paths.artifacts` and `paths.cache` isolated, and keep the compiler/EVM target aligned with the installed OpenZeppelin release when upgrading dependencies.