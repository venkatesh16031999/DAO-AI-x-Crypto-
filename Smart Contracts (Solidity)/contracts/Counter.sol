// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is Ownable {
    // State variable to store the count
    uint256 private count;

    // Event to notify when the count changes
    event CountUpdated(uint256 newCount);

    // Constructor to initialize the count
    constructor() {
        count = 0;
    }

    // Function to increment the count
    function increment() public onlyOwner {
        count++;
        emit CountUpdated(count);
    }

    // Function to decrement the count
    function decrement() public onlyOwner {
        require(count > 0, "Count cannot be negative");
        count--;
        emit CountUpdated(count);
    }

    // Function to get the current count
    function getCount() public view returns (uint256) {
        return count;
    }
}