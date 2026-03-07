// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SubmissionRegistry
 * @notice Records submissions and verification results; gates payouts
 */
contract SubmissionRegistry {
    error Unauthorized();
    error SubmissionNotFound();
    error AlreadyProcessed();

    event SubmissionRecorded(
        bytes32 indexed submissionId,
        bytes32 indexed taskId,
        address indexed participant,
        bytes32 evidenceHash
    );
    event SubmissionVerified(bytes32 indexed submissionId, uint256 score);
    event SubmissionRejected(bytes32 indexed submissionId, uint256 score);
    event RewardReleased(bytes32 indexed submissionId, address indexed participant, uint256 amount);

    struct Submission {
        address participant;
        bytes32 evidenceHash;
        uint8 status; // 0 pending, 1 verified, 2 rejected, 3 paid
        uint256 score;
        bool payoutDone;
    }

    address public settlementContract;
    mapping(bytes32 => Submission) public submissions;

    constructor() {
        settlementContract = msg.sender;
    }

    modifier onlySettlement() {
        if (msg.sender != settlementContract) revert Unauthorized();
        _;
    }

    function setSettlement(address _settlement) external {
        if (settlementContract != address(0) && msg.sender != settlementContract) revert Unauthorized();
        settlementContract = _settlement;
    }

    function recordSubmission(
        bytes32 submissionId,
        bytes32 taskId,
        address participant,
        bytes32 evidenceHash
    ) external onlySettlement {
        if (submissions[submissionId].participant != address(0)) revert AlreadyProcessed();
        submissions[submissionId] = Submission({
            participant: participant,
            evidenceHash: evidenceHash,
            status: 0,
            score: 0,
            payoutDone: false
        });
        emit SubmissionRecorded(submissionId, taskId, participant, evidenceHash);
    }

    function markVerified(bytes32 submissionId, uint256 score) external onlySettlement {
        Submission storage s = submissions[submissionId];
        if (s.participant == address(0)) revert SubmissionNotFound();
        if (s.status != 0) revert AlreadyProcessed();
        s.status = 1;
        s.score = score;
        emit SubmissionVerified(submissionId, score);
    }

    function markRejected(bytes32 submissionId, uint256 score) external onlySettlement {
        Submission storage s = submissions[submissionId];
        if (s.participant == address(0)) revert SubmissionNotFound();
        if (s.status != 0) revert AlreadyProcessed();
        s.status = 2;
        s.score = score;
        emit SubmissionRejected(submissionId, score);
    }

    function markPaid(bytes32 submissionId) external onlySettlement {
        Submission storage s = submissions[submissionId];
        if (s.participant == address(0)) revert SubmissionNotFound();
        if (s.payoutDone) revert AlreadyProcessed();
        s.payoutDone = true;
        s.status = 3;
        emit RewardReleased(submissionId, s.participant, 0);
    }

    function getSubmission(bytes32 submissionId) external view returns (
        address participant,
        uint8 status,
        uint256 score,
        bool payoutDone
    ) {
        Submission storage s = submissions[submissionId];
        if (s.participant == address(0)) revert SubmissionNotFound();
        return (s.participant, s.status, s.score, s.payoutDone);
    }
}
