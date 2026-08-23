// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClairFund {

    struct Campaign {
        address ngo;
        uint256 targetAmount;
        uint256 raisedAmount;
        bool active;
    }

    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;

    mapping(uint256 => mapping(address => uint256)) public pledges;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed ngo,
        uint256 targetAmount
    );

    event Pledged(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    event FundsReleased(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount
    );

    function createCampaign(
        uint256 targetAmount
    ) external returns (uint256) {

        require(
            targetAmount > 0,
            "Target must be greater than zero"
        );

        campaignCount++;

        campaigns[campaignCount] = Campaign({
            ngo: msg.sender,
            targetAmount: targetAmount,
            raisedAmount: 0,
            active: true
        });

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            targetAmount
        );

        return campaignCount;
    }

    function pledge(
        uint256 campaignId
    ) external payable {

        Campaign storage campaign = campaigns[campaignId];

        require(
            campaign.active,
            "Campaign is not active"
        );

        require(
            msg.value > 0,
            "Pledge must be greater than zero"
        );

        pledges[campaignId][msg.sender] += msg.value;

        campaign.raisedAmount += msg.value;

        emit Pledged(
            campaignId,
            msg.sender,
            msg.value
        );
    }

    function releaseFunds(
        uint256 campaignId,
        address payable recipient,
        uint256 amount
    ) external {

        Campaign storage campaign = campaigns[campaignId];

        require(
            msg.sender == campaign.ngo,
            "Only NGO can release funds"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );

        recipient.transfer(amount);

        emit FundsReleased(
            campaignId,
            recipient,
            amount
        );
    }

    function getContractBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }
}