# DHA (Digital Housing Assets)

A learning-focused Web3 application where users can create and mint digital plot NFTs on the Ethereum network.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `/contracts` — Source-of-truth for Solidity smart contracts and ERC-721 implementations.
- `/scripts` — Hardhat deployment and operational scripts.
- `/src/app` — Next.js frontend pages and routing.
- `/src/components` — UI components (styled as a premium real-estate/NFT marketplace).

## Architecture decisions

- Learning-First Scope: Phase 1 prioritizes end-to-end full-stack Web3 integration (contract creation, deployment, and frontend blockchain interactions) over complex economic mechanics.
- Premium UI / Deferred Mechanics: The frontend is designed to look and feel like a modern, premium NFT/real-estate marketplace, but secondary market actions (buying, selling, and auctions) are explicitly mocked or deferred to later phases.
- Standardized Tokens: Leveraging OpenZeppelin's battle-tested ERC-721 standard to ensure secure, standard-compliant NFT minting.

## Product

Phase 1 Capabilities (Current):
  - Wallet Integration: Users can connect to the app using MetaMask.
  - Minting Engine: Users enter specific digital plot details and mint them directly as ERC-721 NFTs.
  - Metadata & Gallery: The app stores plot metadata and displays minted NFTs in a stylized public gallery.
  - Asset Management: Users can click into specific NFT details and view their owned assets in a "My Plots" dashboard.

Future Phases:
  - 🛒 Marketplace: Mechanics to list and buy digital plots.
  - 🔨 Auctions: Bidding systems for high-value NFTs.
  - 📊 Analytics & Indexing: Advanced Web3 features, on-chain data indexing (e.g., The Graph), and market analytics.

## User preferences

_Will Populate as I build — explicit user instructions worth remembering across sessions._

## Gotchas

- Network Requirement: Users must ensure their MetaMask wallet is switched to the Ethereum Sepolia testnet before interacting with the application.
- Gas Fees: Users will need Sepolia test ETH (obtainable via standard faucets) to execute the minting transactions.
- Security: Always keep your deployment `PRIVATE_KEY` strictly in `.env` and ensure it is included in your `.gitignore`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
