// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EscrowVault
 * @notice Holds reward funds; only Settlement (verifier) can release
 */
contract EscrowVault {
    error Unauthorized();
    error InsufficientBalance();
    error TransferFailed();

    event RewardDeposited(bytes32 indexed taskId, address indexed sponsor, uint256 amount);
    event RewardReleased(bytes32 indexed taskId, address indexed participant, uint256 amount);
    event FundsReclaimed(bytes32 indexed taskId, address indexed sponsor, uint256 amount);

    address public settlementContract;
    mapping(bytes32 => uint256) public taskBalances;

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

    function depositReward(bytes32 taskId) external payable {
        if (msg.value == 0) revert InsufficientBalance();
        taskBalances[taskId] += msg.value;
        emit RewardDeposited(taskId, msg.sender, msg.value);
    }

    function releaseReward(bytes32 taskId, address participant, uint256 amount) external onlySettlement {
        if (taskBalances[taskId] < amount) revert InsufficientBalance();
        taskBalances[taskId] -= amount;
        (bool ok,) = participant.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit RewardReleased(taskId, participant, amount);
    }

    function reclaimUnusedFunds(bytes32 taskId, address sponsor) external onlySettlement {
        uint256 balance = taskBalances[taskId];
        if (balance == 0) revert InsufficientBalance();
        taskBalances[taskId] = 0;
        (bool ok,) = sponsor.call{value: balance}("");
        if (!ok) revert TransferFailed();
        emit FundsReclaimed(taskId, sponsor, balance);
    }
}
