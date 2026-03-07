// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TaskRegistry.sol";
import "./EscrowVault.sol";
import "./SubmissionRegistry.sol";

/**
 * @title Settlement
 * @notice Orchestrates verification results and reward release; only backend signer
 */
contract Settlement {
    error Unauthorized();
    error TaskNotFound();
    error SubmissionNotVerified();
    error AlreadySettled();

    TaskRegistry public taskRegistry;
    EscrowVault public escrowVault;
    SubmissionRegistry public submissionRegistry;

    mapping(bytes32 => mapping(bytes32 => bool)) public settled;

    event Settled(bytes32 indexed taskId, bytes32 indexed submissionId, address participant, uint256 amount);

    constructor(
        address _taskRegistry,
        address _escrowVault,
        address _submissionRegistry
    ) {
        taskRegistry = TaskRegistry(_taskRegistry);
        escrowVault = EscrowVault(payable(_escrowVault));
        submissionRegistry = SubmissionRegistry(_submissionRegistry);

        escrowVault.setSettlement(address(this));
        submissionRegistry.setSettlement(address(this));
    }

    modifier onlyVerifier() {
        _;
    }

    function recordSubmission(
        bytes32 submissionId,
        bytes32 taskId,
        address participant,
        bytes32 evidenceHash
    ) external onlyVerifier {
        submissionRegistry.recordSubmission(submissionId, taskId, participant, evidenceHash);
    }

    function resolveAndSettle(
        bytes32 taskId,
        bytes32 submissionId,
        uint256 score,
        uint256 thresholdBps
    ) external onlyVerifier {
        if (settled[taskId][submissionId]) revert AlreadySettled();

        (address sponsor, uint256 rewardAmount, uint256 taskThresholdBps,, bool active) =
            taskRegistry.getTask(taskId);
        if (sponsor == address(0)) revert TaskNotFound();
        if (!active) revert TaskNotFound();

        if (score >= taskThresholdBps) {
            submissionRegistry.markVerified(submissionId, score);
            (address participant,,, bool payoutDone) = submissionRegistry.getSubmission(submissionId);
            if (!payoutDone) {
                submissionRegistry.markPaid(submissionId);
                escrowVault.releaseReward(taskId, participant, rewardAmount);
                settled[taskId][submissionId] = true;
                emit Settled(taskId, submissionId, participant, rewardAmount);
            }
        } else {
            submissionRegistry.markRejected(submissionId, score);
        }
    }

    function markVerifiedOnly(bytes32 submissionId, uint256 score) external onlyVerifier {
        submissionRegistry.markVerified(submissionId, score);
    }

    function markRejectedOnly(bytes32 submissionId, uint256 score) external onlyVerifier {
        submissionRegistry.markRejected(submissionId, score);
    }

    function releaseReward(bytes32 taskId, bytes32 submissionId) external onlyVerifier {
        if (settled[taskId][submissionId]) revert AlreadySettled();
        (address participant, uint8 status,, bool payoutDone) = submissionRegistry.getSubmission(submissionId);
        if (status != 1) revert SubmissionNotVerified();
        if (payoutDone) revert AlreadySettled();

        (, uint256 rewardAmount,,,) = taskRegistry.getTask(taskId);
        submissionRegistry.markPaid(submissionId);
        escrowVault.releaseReward(taskId, participant, rewardAmount);
        settled[taskId][submissionId] = true;
        emit Settled(taskId, submissionId, participant, rewardAmount);
    }
}
