# DHA — Digital Housing Assets

DHA is a Web3 learning marketplace for minting and exploring digital plot NFTs on Ethereum Sepolia.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm run contract:compile` — compile the OpenZeppelin ERC-721 contract
- `pnpm run contract:test` — run the Hardhat contract test suite
- `pnpm run contract:deploy` — deploy to Sepolia using `.env`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Web3 env: `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Web3: Solidity, OpenZeppelin Contracts, Hardhat, ethers, viem-compatible browser wallet flow

## Where things live

- `artifacts/dha-marketplace/` — React/Vite frontend with responsive DHA marketplace routes
- `contracts/DHAPlotNFT.sol` — source-of-truth ERC-721 digital plot contract
- `test/DHAPlotNFT.ts` — Hardhat contract tests
- `scripts/deploy.ts` — Sepolia deployment script
- `hardhat.config.ts` — compiler and Sepolia network configuration
- `.env.example` — required blockchain variables

## Architecture decisions

- Digital plot metadata is kept separate from future marketplace state so listings/auctions can be added in separate contracts later.
- Plot numbers are globally unique on-chain to prevent accidental duplicate digital plots.
- The frontend treats missing contract configuration and missing wallet support as explicit states rather than showing fabricated NFTs or prices.

## Product

DHA lets users connect a browser wallet, switch to Sepolia, mint a digital plot NFT with standard metadata, explore minted plots, inspect on-chain plot data, and view plots owned by the connected wallet. Phase 1 intentionally excludes buying, listings, auctions, prices, and real-world property claims.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
