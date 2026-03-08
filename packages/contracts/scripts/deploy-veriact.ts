import { ethers } from "hardhat";

async function main() {
  const verifierAddress = process.env.VERIFIER_ADDRESS || process.env.DEPLOYER_ADDRESS;
  if (!verifierAddress) {
    console.error("Set VERIFIER_ADDRESS or DEPLOYER_ADDRESS for the verifier (backend) account.");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying VeriActEscrow with account:", deployer.address);
  console.log("Verifier (can call verifyTask):", verifierAddress);

  const VeriActEscrow = await ethers.getContractFactory("VeriActEscrow");
  const escrow = await VeriActEscrow.deploy(verifierAddress);
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("\nVeriActEscrow deployed to:", address);
  console.log("\n--- Add to apps/web .env.local ---");
  console.log("NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
