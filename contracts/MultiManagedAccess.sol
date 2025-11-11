// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MultiManagedAccess {
    address public owner;
    address[] public managers;
    bool[] public confirmed;
    uint immutable BACKUP_MANAGER_NUMBERS;

    constructor(address _owner, address[] memory _managers, uint _manager_numbers) {
        require(_manager_numbers >= 3, "size unmatched");
        require(_managers.length == _manager_numbers, "size unmatched");
        owner = _owner;
        BACKUP_MANAGER_NUMBERS = _manager_numbers;
        managers = new address[](_manager_numbers);
        confirmed = new bool[](_manager_numbers);
        for (uint i = 0; i < _manager_numbers; i++) {
            managers[i] = _managers[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    function allConfirmed() internal view returns (bool) {
        for (uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
            if (!confirmed[i]) {
                return false;
            }
        }
        return true;
    }

    function reset() internal {
        for (uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
            confirmed[i] = false;
        }
    }

    modifier onlyAllConfirmed() {
        require(allConfirmed(), "Not all confirmed yet");
        reset();
        _;
    }

    function confirm() external {
        bool found = false;
        for (uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
            if (managers[i] == msg.sender) {
                confirmed[i] = true;
                found = true;
                break;
            }
        }
        require(found, "You are not a manager");
    }
}
