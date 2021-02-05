pragma solidity ^0.5.2;

contract MultiSig {
    address[] public approvers;
    uint256 public quorum;
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }

    mapping(uint256 => Transfer) transfers;
    // Next id for Transfer
    uint256 nextId;
    // Keep track of which approvers have already approved transfer
    mapping(address => mapping(uint256 => bool)) approvals;

    constructor(address[] memory _approvers, uint256 _quorum) public payable {
        approvers = _approvers;
        quorum = _quorum;
    }

    function createTransfer(uint256 amount, address payable to)
        external
        onlyApprover()
    {
        // container for transfers
        // call the struct
        // Store the Transfer
        transfers[nextId] = Transfer(nextId, amount, to, 0, false);
        // Prevent solidity from overriding existing Transfer struct
        nextId++;
    }

    function sendTransfer(uint256 id) external onlyApprover() {
        // Make sure transfer has not been sent before
        require(transfers[id].sent == false, "Transfer has already been sent");
        if (approvals[msg.sender][id] == false) {
            approvals[msg.sender][id] = true;
            // Prevent user from approving twice
            transfers[id].approvals++;
        }
        if (transfers[id].approvals >= quorum) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint256 amount = transfers[id].amount;
            to.transfer(amount);
            return;
        }
    }

    modifier onlyApprover() {
        bool allowed = false;
        for (uint256 i; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "Only approver allowed");
        _;
    }
}
