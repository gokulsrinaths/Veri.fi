// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TaskRegistry
 * @notice Stores task metadata and active status for veri.fi
 */
contract TaskRegistry {
    error Unauthorized();
    error TaskNotFound();
    error TaskAlreadyClosed();
    error InvalidTask();

    event TaskCreated(
        bytes32 indexed taskId,
        address indexed sponsor,
        uint256 rewardAmount,
        uint256 thresholdBps,
        bytes32 metadataHash
    );
    event TaskClosed(bytes32 indexed taskId);

    struct Task {
        address sponsor;
        uint256 rewardAmount;
        uint256 thresholdBps;
        bytes32 metadataHash;
        bool active;
    }

    mapping(bytes32 => Task) public tasks;

    function createTask(
        bytes32 taskId,
        uint256 rewardAmount,
        uint256 thresholdBps,
        bytes32 metadataHash
    ) external {
        if (rewardAmount == 0 || thresholdBps > 10000) revert InvalidTask();
        if (tasks[taskId].sponsor != address(0)) revert InvalidTask();

        tasks[taskId] = Task({
            sponsor: msg.sender,
            rewardAmount: rewardAmount,
            thresholdBps: thresholdBps,
            metadataHash: metadataHash,
            active: true
        });

        emit TaskCreated(taskId, msg.sender, rewardAmount, thresholdBps, metadataHash);
    }

    function closeTask(bytes32 taskId) external {
        Task storage t = tasks[taskId];
        if (t.sponsor == address(0)) revert TaskNotFound();
        if (t.sponsor != msg.sender) revert Unauthorized();
        if (!t.active) revert TaskAlreadyClosed();

        t.active = false;
        emit TaskClosed(taskId);
    }

    function getTask(bytes32 taskId) external view returns (
        address sponsor,
        uint256 rewardAmount,
        uint256 thresholdBps,
        bytes32 metadataHash,
        bool active
    ) {
        Task storage t = tasks[taskId];
        if (t.sponsor == address(0)) revert TaskNotFound();
        return (t.sponsor, t.rewardAmount, t.thresholdBps, t.metadataHash, t.active);
    }
}
