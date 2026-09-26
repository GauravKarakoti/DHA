const { ethers, network } = require("hardhat");

async function main() {
  const factory = await ethers.getContractFactory("DHAPlotNFT");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("DHAPlotNFT deployed to:", await contract.getAddress());
  console.log("Network:", network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});