import { expect } from "chai";
import { ethers } from "hardhat";

describe("veri.fi contracts", function () {
  let taskRegistry: Awaited<ReturnType<ReturnType<typeof ethers.getContractFactory>["deploy"]>>;
  let escrowVault: Awaited<ReturnType<ReturnType<typeof ethers.getContractFactory>["deploy"]>>;
  let submissionRegistry: Awaited<ReturnType<ReturnType<typeof ethers.getContractFactory>["deploy"]>>;
  let settlement: Awaited<ReturnType<ReturnType<typeof ethers.getContractFactory>["deploy"]>>;
  let owner: { address: string };
  let participant: { address: string };

  const TASK_ID = ethers.keccak256(ethers.toUtf8Bytes("task-1"));
  const SUBMISSION_ID = ethers.keccak256(ethers.toUtf8Bytes("sub-1"));
  const EVIDENCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
  const METADATA_HASH = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const REWARD = ethers.parseEther("0.1");
  const THRESHOLD_BPS = 7000; // 70%

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    participant = signers[1];

    const TaskRegistryFactory = await ethers.getContractFactory("TaskRegistry");
    taskRegistry = await TaskRegistryFactory.deploy();

    const EscrowVaultFactory = await ethers.getContractFactory("EscrowVault");
    escrowVault = await EscrowVaultFactory.deploy();

    const SubmissionRegistryFactory = await ethers.getContractFactory("SubmissionRegistry");
    submissionRegistry = await SubmissionRegistryFactory.deploy();

    const SettlementFactory = await ethers.getContractFactory("Settlement");
    settlement = await SettlementFactory.deploy(
      await taskRegistry.getAddress(),
      await escrowVault.getAddress(),
      await submissionRegistry.getAddress()
    );
  });

  it("should create task and deposit reward", async function () {
    await taskRegistry.createTask(TASK_ID, REWARD, THRESHOLD_BPS, METADATA_HASH);
    const t = await taskRegistry.getTask(TASK_ID);
    expect(t.sponsor).to.eq(owner.address);
    expect(t.rewardAmount).to.eq(REWARD);
    expect(t.active).to.be.true;

    await escrowVault.depositReward(TASK_ID, { value: REWARD });
    expect(await escrowVault.taskBalances(TASK_ID)).to.eq(REWARD);
  });

  it("should record submission and settle when score passes threshold", async function () {
    await taskRegistry.createTask(TASK_ID, REWARD, THRESHOLD_BPS, METADATA_HASH);
    await escrowVault.depositReward(TASK_ID, { value: REWARD });

    await settlement.recordSubmission(SUBMISSION_ID, TASK_ID, participant.address, EVIDENCE_HASH);

    const scorePass = 8000;
    await settlement.resolveAndSettle(TASK_ID, SUBMISSION_ID, scorePass, THRESHOLD_BPS);

    const sub = await submissionRegistry.getSubmission(SUBMISSION_ID);
    expect(sub.status).to.eq(3);
    expect(await escrowVault.taskBalances(TASK_ID)).to.eq(0);
  });

  it("should reject when score below threshold", async function () {
    await taskRegistry.createTask(TASK_ID, REWARD, THRESHOLD_BPS, METADATA_HASH);
    await escrowVault.depositReward(TASK_ID, { value: REWARD });

    await settlement.recordSubmission(SUBMISSION_ID, TASK_ID, participant.address, EVIDENCE_HASH);
    await settlement.resolveAndSettle(TASK_ID, SUBMISSION_ID, 5000, THRESHOLD_BPS);

    const sub = await submissionRegistry.getSubmission(SUBMISSION_ID);
    expect(sub.status).to.eq(2);
    expect(await escrowVault.taskBalances(TASK_ID)).to.eq(REWARD);
  });
});
