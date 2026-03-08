// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VeriActEscrow
 * @notice Minimal hackathon escrow: sponsor deposits CTC, verifier releases to worker.
 */
contract VeriActEscrow {
    struct Task {
        address sponsor;
        uint256 reward;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;
    uint256 public nextTaskId = 1;

    address public owner;
    address public verifier;

    event TaskCreated(uint256 indexed taskId, address indexed sponsor, uint256 reward);
    event TaskVerified(uint256 indexed taskId, address indexed worker, uint256 reward);

    error Unauthorized();
    error TaskNotFound();
    error TaskAlreadyCompleted();
    error InvalidReward();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyVerifier() {
        if (msg.sender != verifier) revert Unauthorized();
        _;
    }

    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }

    /**
     * @notice Sponsor deposits reward in CTC. Call with msg.value = reward amount (wei).
     * @return taskId The assigned on-chain task id.
     */
    function createTask() external payable returns (uint256 taskId) {
        if (msg.value == 0) revert InvalidReward();
        taskId = nextTaskId++;
        tasks[taskId] = Task({
            sponsor: msg.sender,
            reward: msg.value,
            completed: false
        });
        emit TaskCreated(taskId, msg.sender, msg.value);
        return taskId;
    }

    /**
     * @notice Verifier backend releases reward to worker. Only callable by verifier.
     */
    function verifyTask(uint256 taskId, address worker) external onlyVerifier {
        Task storage t = tasks[taskId];
        if (t.sponsor == address(0)) revert TaskNotFound();
        if (t.completed) revert TaskAlreadyCompleted();

        uint256 amount = t.reward;
        t.completed = true;

        (bool ok,) = payable(worker).call{ value: amount }("");
        require(ok, "Transfer failed");

        emit TaskVerified(taskId, worker, amount);
    }

    /**
     * @notice Get task details.
     */
    function getTask(uint256 taskId)
        external
        view
        returns (address sponsor, uint256 reward, bool completed)
    {
        Task storage t = tasks[taskId];
        return (t.sponsor, t.reward, t.completed);
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    receive() external payable {}
}
