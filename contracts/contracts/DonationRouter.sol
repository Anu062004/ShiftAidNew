// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonationRouter
 * @dev Smart contract for logging cross-chain donations on Polygon
 * This contract emits events when donations are logged, providing transparency
 * and on-chain proof of all donations made through ShiftAid
 */
contract DonationRouter {
    // Event emitted when a donation is logged
    event DonationLogged(
        address indexed donor,
        address indexed ngo,
        string amount,
        string coin,
        string orderId,
        bytes32 indexed donationHash,
        uint256 timestamp
    );

    // Struct to store donation information
    struct Donation {
        address donor;
        address ngo;
        string amount;
        string coin;
        string orderId;
        bytes32 donationHash;
        uint256 timestamp;
    }

    // Mapping to store donations by hash
    mapping(bytes32 => Donation) public donations;

    // Array to store all donation hashes
    bytes32[] public allDonationHashes;

    // Total donations count
    uint256 public totalDonations;

    /**
     * @dev Log a donation on-chain
     * @param donor Address of the donor
     * @param ngo Address of the NGO receiving the donation
     * @param amount Amount donated (as string to support decimals)
     * @param coin Coin/token symbol (e.g., "USDC.polygon")
     * @param orderId SideShift order ID for reference
     * @return donationHash Unique hash of this donation
     */
    function logDonation(
        address donor,
        address ngo,
        string memory amount,
        string memory coin,
        string memory orderId
    ) public returns (bytes32) {
        require(donor != address(0), "Invalid donor address");
        require(ngo != address(0), "Invalid NGO address");
        require(bytes(amount).length > 0, "Amount cannot be empty");
        require(bytes(coin).length > 0, "Coin cannot be empty");

        // Create unique hash for this donation
        bytes32 donationHash = keccak256(
            abi.encodePacked(
                donor,
                ngo,
                amount,
                coin,
                orderId,
                block.timestamp,
                block.number
            )
        );

        // Store donation
        Donation memory donation = Donation({
            donor: donor,
            ngo: ngo,
            amount: amount,
            coin: coin,
            orderId: orderId,
            donationHash: donationHash,
            timestamp: block.timestamp
        });

        donations[donationHash] = donation;
        allDonationHashes.push(donationHash);
        totalDonations++;

        // Emit event
        emit DonationLogged(
            donor,
            ngo,
            amount,
            coin,
            orderId,
            donationHash,
            block.timestamp
        );

        return donationHash;
    }

    /**
     * @dev Get donation details by hash
     * @param donationHash Hash of the donation
     * @return donation Donation struct
     */
    function getDonation(bytes32 donationHash) public view returns (Donation memory) {
        return donations[donationHash];
    }

    /**
     * @dev Get total number of donations
     * @return count Total donations
     */
    function getTotalDonations() public view returns (uint256) {
        return totalDonations;
    }

    /**
     * @dev Get all donation hashes (with pagination support)
     * @param offset Starting index
     * @param limit Number of items to return
     * @return hashes Array of donation hashes
     */
    function getDonationHashes(uint256 offset, uint256 limit) public view returns (bytes32[] memory) {
        uint256 length = allDonationHashes.length;
        if (offset >= length) {
            return new bytes32[](0);
        }

        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }

        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allDonationHashes[i];
        }

        return result;
    }
}


