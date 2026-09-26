const { ethers, network, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const factory = await ethers.getContractFactory("DHAPlotNFT");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("DHAPlotNFT deployed to:", address);
  console.log("Network:", network.name);

  // Define the target directory: artifacts/frontend
  const frontendDir = path.join(__dirname, "..", "artifacts", "frontend");
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Read the ABI directly from Hardhat's compiled artifacts
  const contractArtifact = artifacts.readArtifactSync("DHAPlotNFT");

  // Save the address and ABI to a single JSON file
  const configData = {
    address: address,
    abi: contractArtifact.abi
  };

  fs.writeFileSync(
    path.join(frontendDir, "DHAConfig.json"),
    JSON.stringify(configData, null, 2)
  );

  console.log(`Saved contract address and ABI to ${frontendDir}/DHAConfig.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});