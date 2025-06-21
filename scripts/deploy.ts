import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  const SokoChain = await ethers.getContractFactory("contracts/SokoChain.sol:SokoChain");
  const sokoChain = await SokoChain.deploy();

  await sokoChain.waitForDeployment();

  console.log("SokoChain deployed to:", await sokoChain.getAddress());

  // Save the contract address and ABI for the frontend
  const fs = require("fs");
  const contractsDir = "frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ SokoChain: await sokoChain.getAddress() }, undefined, 2)
  );
  const SokoChainArtifact = await ethers.getContractFactory("contracts/SokoChain.sol:SokoChain");
  fs.writeFileSync(
    contractsDir + "/SokoChain.json",
    JSON.stringify(SokoChainArtifact.interface.formatJson(), null, 2)
  );

  console.log("Contract address and ABI saved to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
