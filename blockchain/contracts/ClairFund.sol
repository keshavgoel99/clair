// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClairFund {
    address public owner;
    address public verifier;

    bool private locked;

    struct Campaign {
        address ngo;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 releasedAmount;
        bool active;
    }

    struct Milestone {
        string description;
        uint256 amount;
        address payable recipient;
        bool approved;
        bool released;
    }

    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;

    mapping(uint256 => mapping(address => uint256)) public pledges;

    mapping(uint256 => Milestone[]) private campaignMilestones;

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

    event MilestoneCreated(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        string description,
        uint256 amount,
        address indexed recipient
    );

    event MilestoneApproved(
        uint256 indexed campaignId,
        uint256 indexed milestoneId
    );

    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        address indexed recipient,
        uint256 amount
    );

    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier
    );

    event CampaignClosed(
        uint256 indexed campaignId
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner can perform this action"
        );
        _;
    }

    modifier onlyVerifier() {
        require(
            msg.sender == verifier,
            "Only verifier can perform this action"
        );
        _;
    }

    modifier nonReentrant() {
        require(
            !locked,
            "ReentrancyGuard: reentrant call"
        );

        locked = true;

        _;

        locked = false;
    }

    modifier campaignExists(
        uint256 campaignId
    ) {
        require(
            campaignId > 0 &&
            campaignId <= campaignCount &&
            campaigns[campaignId].ngo != address(0),
            "Campaign does not exist"
        );

        _;
    }

    constructor(address initialVerifier) {
        require(
            initialVerifier != address(0),
            "Invalid verifier"
        );

        owner = msg.sender;
        verifier = initialVerifier;
    }

    // ----------------------------------------
    // VERIFIER MANAGEMENT
    // ----------------------------------------

    function setVerifier(
        address newVerifier
    ) external onlyOwner {
        require(
            newVerifier != address(0),
            "Invalid verifier"
        );

        address oldVerifier = verifier;

        verifier = newVerifier;

        emit VerifierUpdated(
            oldVerifier,
            newVerifier
        );
    }

    // ----------------------------------------
    // CAMPAIGN CREATION
    // ----------------------------------------

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
            releasedAmount: 0,
            active: true
        });

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            targetAmount
        );

        return campaignCount;
    }

    // ----------------------------------------
    // DONOR PLEDGE
    // ----------------------------------------

    function pledge(
        uint256 campaignId
    )
        external
        payable
        campaignExists(campaignId)
    {
        Campaign storage campaign =
            campaigns[campaignId];

        require(
            campaign.active,
            "Campaign is not active"
        );

        require(
            msg.value > 0,
            "Pledge must be greater than zero"
        );

        require(
            campaign.raisedAmount + msg.value <=
                campaign.targetAmount,
            "Pledge exceeds campaign target"
        );

        pledges[campaignId][msg.sender] +=
            msg.value;

        campaign.raisedAmount +=
            msg.value;

        emit Pledged(
            campaignId,
            msg.sender,
            msg.value
        );
    }

    // ----------------------------------------
    // CAMPAIGN CLOSING
    // ----------------------------------------

    function closeCampaign(
        uint256 campaignId
    )
        external
        campaignExists(campaignId)
    {
        Campaign storage campaign =
            campaigns[campaignId];

        require(
            msg.sender == campaign.ngo,
            "Only NGO can close campaign"
        );

        require(
            campaign.active,
            "Campaign is already closed"
        );

        campaign.active = false;

        emit CampaignClosed(
            campaignId
        );
    }

    // ----------------------------------------
    // MILESTONE CREATION
    // ----------------------------------------

    function createMilestone(
        uint256 campaignId,
        string calldata description,
        uint256 amount,
        address payable recipient
    )
        external
        campaignExists(campaignId)
    {
        Campaign storage campaign =
            campaigns[campaignId];

        require(
            msg.sender == campaign.ngo,
            "Only NGO can create milestones"
        );

        require(
            campaign.active,
            "Campaign is not active"
        );

        require(
            amount > 0,
            "Milestone amount must be greater than zero"
        );

        require(
            recipient != address(0),
            "Invalid recipient"
        );

        uint256 totalMilestoneAmount = 0;

        for (
            uint256 i = 0;
            i < campaignMilestones[campaignId].length;
            i++
        ) {
            totalMilestoneAmount +=
                campaignMilestones[campaignId][i].amount;
        }

        require(
            totalMilestoneAmount + amount <=
                campaign.targetAmount,
            "Milestones exceed campaign target"
        );

        uint256 milestoneId =
            campaignMilestones[campaignId].length;

        campaignMilestones[campaignId].push(
            Milestone({
                description: description,
                amount: amount,
                recipient: recipient,
                approved: false,
                released: false
            })
        );

        emit MilestoneCreated(
            campaignId,
            milestoneId,
            description,
            amount,
            recipient
        );
    }

    // ----------------------------------------
    // MILESTONE APPROVAL
    // ----------------------------------------

    function approveMilestone(
        uint256 campaignId,
        uint256 milestoneId
    )
        external
        onlyVerifier
        campaignExists(campaignId)
    {
        require(
            milestoneId <
                campaignMilestones[campaignId].length,
            "Milestone does not exist"
        );

        Milestone storage milestone =
            campaignMilestones[campaignId][milestoneId];

        require(
            !milestone.approved,
            "Milestone already approved"
        );

        require(
            !milestone.released,
            "Milestone already released"
        );

        milestone.approved = true;

        emit MilestoneApproved(
            campaignId,
            milestoneId
        );
    }

    // ----------------------------------------
    // FUND RELEASE
    // ----------------------------------------

    function releaseMilestoneFunds(
        uint256 campaignId,
        uint256 milestoneId
    )
        external
        onlyVerifier
        campaignExists(campaignId)
        nonReentrant
    {
        Campaign storage campaign =
            campaigns[campaignId];

        require(
            milestoneId <
                campaignMilestones[campaignId].length,
            "Milestone does not exist"
        );

        Milestone storage milestone =
            campaignMilestones[campaignId][milestoneId];

        require(
            milestone.approved,
            "Milestone not approved"
        );

        require(
            !milestone.released,
            "Milestone already released"
        );

        require(
            campaign.releasedAmount +
                milestone.amount <=
                campaign.raisedAmount,
            "Insufficient raised funds"
        );

        require(
            address(this).balance >=
                milestone.amount,
            "Insufficient contract balance"
        );

        // Effects before external interaction
        milestone.released = true;

        campaign.releasedAmount +=
            milestone.amount;

        // External interaction
        (
            bool success,
        ) = milestone.recipient.call{
            value: milestone.amount
        }("");

        require(
            success,
            "Fund transfer failed"
        );

        emit FundsReleased(
            campaignId,
            milestoneId,
            milestone.recipient,
            milestone.amount
        );
    }

    // ----------------------------------------
    // VIEW FUNCTIONS
    // ----------------------------------------

    function getContractBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    function getMilestoneCount(
        uint256 campaignId
    )
        external
        view
        campaignExists(campaignId)
        returns (uint256)
    {
        return campaignMilestones[campaignId].length;
    }

    function getMilestone(
        uint256 campaignId,
        uint256 milestoneId
    )
        external
        view
        campaignExists(campaignId)
        returns (
            string memory description,
            uint256 amount,
            address recipient,
            bool approved,
            bool released
        )
    {
        require(
            milestoneId <
                campaignMilestones[campaignId].length,
            "Milestone does not exist"
        );

        Milestone storage milestone =
            campaignMilestones[campaignId][milestoneId];

        return (
            milestone.description,
            milestone.amount,
            milestone.recipient,
            milestone.approved,
            milestone.released
        );
    }
}