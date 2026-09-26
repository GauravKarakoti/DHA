import "@nomicfoundation/hardhat-toolbox";
import { config as loadEnv } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

loadEnv();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    ...(sepoliaRpcUrl && privateKey
      ? {
          sepolia: {
            url: sepoliaRpcUrl,
            accounts: [privateKey],
          },
        }
      : {}),
  },
  paths: {
    artifacts: "./hardhat-artifacts",
    cache: "./hardhat-cache",
  },
};

export default config;