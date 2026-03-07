import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TaskRegistry = await ethers.getContractFactory("TaskRegistry");
  const taskRegistry = await TaskRegistry.deploy();
  await taskRegistry.waitForDeployment();
  const taskRegistryAddress = await taskRegistry.getAddress();
  console.log("TaskRegistry deployed to:", taskRegistryAddress);

  const EscrowVault = await ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy();
  await escrowVault.waitForDeployment();
  const escrowVaultAddress = await escrowVault.getAddress();
  console.log("EscrowVault deployed to:", escrowVaultAddress);

  const SubmissionRegistry = await ethers.getContractFactory("SubmissionRegistry");
  const submissionRegistry = await SubmissionRegistry.deploy();
  await submissionRegistry.waitForDeployment();
  const submissionRegistryAddress = await submissionRegistry.getAddress();
  console.log("SubmissionRegistry deployed to:", submissionRegistryAddress);

  const Settlement = await ethers.getContractFactory("Settlement");
  const settlement = await Settlement.deploy(
    taskRegistryAddress,
    escrowVaultAddress,
    submissionRegistryAddress
  );
  await settlement.waitForDeployment();
  const settlementAddress = await settlement.getAddress();
  console.log("Settlement deployed to:", settlementAddress);

  console.log("\n--- Summary ---");
  console.log("TASK_REGISTRY_ADDRESS=" + taskRegistryAddress);
  console.log("ESCROW_VAULT_ADDRESS=" + escrowVaultAddress);
  console.log("SUBMISSION_REGISTRY_ADDRESS=" + submissionRegistryAddress);
  console.log("SETTLEMENT_ADDRESS=" + settlementAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
