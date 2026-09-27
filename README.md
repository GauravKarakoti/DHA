# DHA — Digital Housing Assets

## Overview

DHA is a Web3 learning project for minting and exploring digital plot NFTs on
Ethereum Sepolia. Each ERC-721 stores a plot number, block, area, location, and
metadata URI. These tokens represent digital/virtual plots only and do not
represent legal ownership of real-world property.

Phase 1 focuses on:

- connecting a browser wallet
- switching to Sepolia when needed
- minting a plot as an ERC-721 NFT
- storing standard ERC-721 metadata
- browsing live on-chain plot records
- opening an NFT detail page
- viewing plots owned by the connected wallet

Buying, listings, auctions, bidding, royalties, payments, indexing, and
real-world property claims are intentionally out of scope.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Wouter
- viem for browser transaction encoding
- Solidity 0.8.28
- OpenZeppelin Contracts 5
- Hardhat 2
- ethers v6 for contract deployment and tests
- Ethereum Sepolia

## Project Structure

```text
artifacts/frontend/         React/Vite frontend
artifacts/api-server/       Pinata upload API
contracts/DHAPlotNFT.sol    ERC-721 source
test/DHAPlotNFT.js          Hardhat contract tests
scripts/deploy.js           Sepolia deployment script
hardhat.config.ts           Solidity/compiler/network configuration
.env.example                Environment variable template
```

## Local Development

Install dependencies with pnpm:

```bash
pnpm install
```

Start the frontend with
the workflow-provided `PORT` and `BASE_PATH` values:

```bash
PORT=21248 BASE_PATH=/ pnpm --filter @workspace/frontend run dev
```

For the complete local flow, run the backend API as well:

```bash
PORT=5000 pnpm --filter @workspace/api-server run dev
```

The app is intentionally usable in an unconfigured state. Without a deployed
contract address it shows archive studies labeled as not minted tokens and
does not fabricate blockchain records.

## Environment Variables

Create a local `.env` from `.env.example`:

```text
SEPOLIA_RPC_URL=
PRIVATE_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=11155111
VITE_DHA_CONTRACT_ADDRESS=
VITE_SEPOLIA_CHAIN_ID=0xaa36a7
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
PINATA_JWT=
```

`PRIVATE_KEY` and `SEPOLIA_RPC_URL` are deployment-only secrets and must never
be committed. `PINATA_JWT` is also server-only and must never be exposed as a
`VITE_` variable. Add it through Replit Secrets. The browser frontend only
needs the public contract address, chain ID, and optional public Pinata gateway.

## Hardhat Commands

```bash
pnpm run contract:compile
pnpm run contract:test
pnpm run contract:deploy
```

The deployment command uses `SEPOLIA_RPC_URL` and `PRIVATE_KEY`, then prints
the deployed contract address and network.

## Smart Contract

`DHAPlotNFT` inherits OpenZeppelin's `ERC721` and `Ownable` implementations.
Minting is permissionless for this learning project, while the contract keeps
ownership and future administrative extension points separate from marketplace
logic.

Each mint:

- assigns the next token ID, starting at 1
- rejects the zero address
- rejects empty metadata, block, and location values
- rejects zero plot numbers and zero area
- rejects duplicate plot numbers
- stores plot data on-chain
- associates a standard metadata URI with the token
- emits `PlotMinted`

Before minting, the backend uploads the optional image and the complete JSON
metadata document to Pinata's public IPFS network. The browser receives only
the resulting `ipfs://` metadata URI; the Pinata JWT never reaches the client.
The contract stores that URI unchanged, so the token remains portable across
IPFS gateways.

## Frontend Web3 Architecture

The frontend uses the browser wallet provider directly:

- reads use `eth_call`
- wallet connection uses `eth_accounts` and `eth_requestAccounts`
- network changes use `wallet_switchEthereumChain`
- mints use `eth_sendTransaction`
- metadata resolves HTTP, IPFS, and JSON data URIs
- images are read through the configured public Pinata gateway

The gallery reads `totalSupply`, then resolves token IDs from 1 through the
current supply. After a confirmed mint, returning to the marketplace reads the
same live supply and displays the newly minted token. This is deliberately
simple for Phase 1; the `PlotMinted` event is the extension point for a future
indexer/API.

## Testing

Run the frontend and contract checks:

```bash
pnpm --filter @workspace/frontend run typecheck
PORT=21248 BASE_PATH=/ pnpm --filter @workspace/frontend run build
pnpm run contract:compile
pnpm run contract:test
```

## Sepolia Deployment

1. Add `SEPOLIA_RPC_URL` and `PRIVATE_KEY` through a local
   `.env` file.
2. Run:

   ```bash
   pnpm run contract:deploy
   ```

3. Copy the printed contract address into `VITE_DHA_CONTRACT_ADDRESS`.
4. Restart the frontend workflow.
5. Connect MetaMask on Sepolia and use `/mint`.

## Future Roadmap

Later phases can add separate contracts and services:

```text
DHAPlotNFT → DHAMarketplace → DHAAuction
```

The NFT contract does not contain listings, payments, auctions, or bidding.
That separation keeps Phase 1 easier to audit and leaves a clean path for
future marketplace features.