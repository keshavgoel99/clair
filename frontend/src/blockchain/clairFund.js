import {
  BrowserProvider,
  Contract,
  parseEther,
} from "ethers";


// =====================================================
// CLAIR FUND CONTRACT
// =====================================================

const CONTRACT_ADDRESS =
  "0x6ae537E35AD24FD5c2A979218497104459366bcd";


const CLAIR_FUND_ABI = [

  // ===================================================
  // EVENTS
  // ===================================================

  "event CampaignCreated(uint256 indexed campaignId, address indexed ngo, uint256 targetAmount)",

  "event Pledged(uint256 indexed campaignId, address indexed donor, uint256 amount)",

  "event MilestoneCreated(uint256 indexed campaignId, uint256 indexed milestoneId, string description, uint256 amount, address indexed recipient)",

  "event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId)",

  "event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, address indexed recipient, uint256 amount)",

  "event CampaignClosed(uint256 indexed campaignId)",


  // ===================================================
  // CAMPAIGNS
  // ===================================================

  "function createCampaign(uint256 targetAmount) returns (uint256)",

  "function campaignCount() view returns (uint256)",

  "function campaigns(uint256 campaignId) view returns (address ngo, uint256 targetAmount, uint256 raisedAmount, uint256 releasedAmount, bool active)",

  "function closeCampaign(uint256 campaignId)",


  // ===================================================
  // PLEDGING
  // ===================================================

  "function pledge(uint256 campaignId) payable",

  "function pledges(uint256 campaignId, address donor) view returns (uint256)",


  // ===================================================
  // MILESTONES
  // ===================================================

  "function createMilestone(uint256 campaignId, string description, uint256 amount, address recipient)",

  "function approveMilestone(uint256 campaignId, uint256 milestoneId)",

  "function releaseMilestoneFunds(uint256 campaignId, uint256 milestoneId)",

  "function getMilestone(uint256 campaignId, uint256 milestoneId) view returns (string description, uint256 amount, address recipient, bool approved, bool released)",

  "function getMilestoneCount(uint256 campaignId) view returns (uint256)",


  // ===================================================
  // CONTRACT STATE
  // ===================================================

  "function owner() view returns (address)",

  "function verifier() view returns (address)",

  "function setVerifier(address newVerifier)",

  "function getContractBalance() view returns (uint256)",
];


// =====================================================
// SEPOLIA
// =====================================================

const SEPOLIA_CHAIN_ID =
  11155111n;


// =====================================================
// CONNECT WALLET
// =====================================================

export async function connectWallet() {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  return {
    address:
      await signer.getAddress(),

    provider,

    signer,
  };
}


// =====================================================
// CREATE BLOCKCHAIN CAMPAIGN
// =====================================================

export async function createBlockchainCampaign(
  targetAmount
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask."
    );
  }

  const numericTarget =
    Number(targetAmount);

  if (
    !Number.isFinite(
      numericTarget
    ) ||
    numericTarget <= 0
  ) {
    throw new Error(
      "Campaign target must be greater than zero."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      signer
    );

  console.log(
    "Creating blockchain campaign..."
  );

  const tx =
    await contract.createCampaign(
      parseEther(
        String(numericTarget)
      )
    );

  console.log(
    "Campaign transaction:",
    tx.hash
  );

  const receipt =
    await tx.wait();

  if (!receipt) {
    throw new Error(
      "Blockchain transaction was not confirmed."
    );
  }

  let blockchainCampaignId =
    null;

  for (
    const log of receipt.logs
  ) {

    try {

      const parsed =
        contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

      if (
        parsed &&
        parsed.name ===
          "CampaignCreated"
      ) {

        blockchainCampaignId =
          Number(
            parsed.args.campaignId
          );

        break;
      }

    } catch {
      // Ignore unrelated logs.
    }
  }

  if (
    blockchainCampaignId ===
    null
  ) {

    const latestCampaignCount =
      await contract.campaignCount();

    blockchainCampaignId =
      Number(
        latestCampaignCount
      );
  }

  if (
    !Number.isInteger(
      blockchainCampaignId
    ) ||
    blockchainCampaignId <= 0
  ) {
    throw new Error(
      "Campaign was created on-chain, but a valid blockchain campaign ID could not be determined."
    );
  }

  return {

    blockchainCampaignId,

    hash:
      receipt.hash,

    walletAddress:
      await signer.getAddress(),

  };
}


// =====================================================
// PLEDGE TO BLOCKCHAIN CAMPAIGN
// =====================================================

export async function pledgeToCampaign(
  campaignId,
  ethAmount
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const parsedCampaignId =
    Number(campaignId);

  const parsedAmount =
    Number(ethAmount);

  if (
    !Number.isInteger(
      parsedCampaignId
    ) ||
    parsedCampaignId <= 0
  ) {
    throw new Error(
      "Invalid blockchain campaign ID."
    );
  }

  if (
    !Number.isFinite(
      parsedAmount
    ) ||
    parsedAmount <= 0
  ) {
    throw new Error(
      "Pledge amount must be greater than zero."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      signer
    );

  const tx =
    await contract.pledge(
      parsedCampaignId,
      {
        value:
          parseEther(
            String(parsedAmount)
          ),
      }
    );

  const receipt =
    await tx.wait();

  if (!receipt) {
    throw new Error(
      "Pledge transaction was not confirmed."
    );
  }

  return {

    hash:
      receipt.hash,

    walletAddress:
      await signer.getAddress(),

  };
}


// =====================================================
// CREATE BLOCKCHAIN MILESTONE
// =====================================================
//
// Called by the NGO.
//
// campaignId = blockchain campaign ID
// description = procurement description
// amount = ETH amount
// recipient = vendor wallet
// =====================================================

export async function createBlockchainMilestone(
  campaignId,
  description,
  ethAmount,
  recipient
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const parsedCampaignId =
    Number(campaignId);

  const parsedAmount =
    Number(ethAmount);

  if (
    !Number.isInteger(
      parsedCampaignId
    ) ||
    parsedCampaignId <= 0
  ) {
    throw new Error(
      "Invalid blockchain campaign ID."
    );
  }

  if (
    !description ||
    !description.trim()
  ) {
    throw new Error(
      "Milestone description is required."
    );
  }

  if (
    !Number.isFinite(
      parsedAmount
    ) ||
    parsedAmount <= 0
  ) {
    throw new Error(
      "Milestone amount must be greater than zero."
    );
  }

  if (
    typeof recipient !== "string" ||
    !/^0x[a-fA-F0-9]{40}$/.test(
      recipient
    )
  ) {
    throw new Error(
      "Invalid vendor wallet address."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      signer
    );

  console.log(
    "Creating blockchain milestone..."
  );

  const tx =
    await contract.createMilestone(
      parsedCampaignId,
      description.trim(),
      parseEther(
        String(parsedAmount)
      ),
      recipient
    );

  console.log(
    "Milestone transaction:",
    tx.hash
  );

  const receipt =
    await tx.wait();

  if (!receipt) {
    throw new Error(
      "Milestone transaction was not confirmed."
    );
  }

  let blockchainMilestoneId =
    null;

  for (
    const log of receipt.logs
  ) {

    try {

      const parsed =
        contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

      if (
        parsed &&
        parsed.name ===
          "MilestoneCreated"
      ) {

        blockchainMilestoneId =
          Number(
            parsed.args.milestoneId
          );

        break;
      }

    } catch {
      // Ignore unrelated logs.
    }
  }

  // Fallback to the latest milestone count.
  if (
    blockchainMilestoneId ===
    null
  ) {

    const milestoneCount =
      await contract.getMilestoneCount(
        parsedCampaignId
      );

    blockchainMilestoneId =
      Number(
        milestoneCount
      ) - 1;
  }

  if (
    !Number.isInteger(
      blockchainMilestoneId
    ) ||
    blockchainMilestoneId < 0
  ) {
    throw new Error(
      "Milestone was created on-chain, but its ID could not be determined."
    );
  }

  return {

    blockchainMilestoneId,

    hash:
      receipt.hash,

    walletAddress:
      await signer.getAddress(),

  };
}


// =====================================================
// APPROVE BLOCKCHAIN MILESTONE
// =====================================================
//
// IMPORTANT:
// Only the configured verifier can successfully call
// this function on the smart contract.
// =====================================================

export async function approveBlockchainMilestone(
  campaignId,
  milestoneId
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const parsedCampaignId =
    Number(campaignId);

  const parsedMilestoneId =
    Number(milestoneId);

  if (
    !Number.isInteger(
      parsedCampaignId
    ) ||
    parsedCampaignId <= 0
  ) {
    throw new Error(
      "Invalid blockchain campaign ID."
    );
  }

  if (
    !Number.isInteger(
      parsedMilestoneId
    ) ||
    parsedMilestoneId < 0
  ) {
    throw new Error(
      "Invalid blockchain milestone ID."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      signer
    );

  const tx =
    await contract.approveMilestone(
      parsedCampaignId,
      parsedMilestoneId
    );

  const receipt =
    await tx.wait();

  if (!receipt) {
    throw new Error(
      "Milestone approval transaction was not confirmed."
    );
  }

  return {

    hash:
      receipt.hash,

    walletAddress:
      await signer.getAddress(),

  };
}


// =====================================================
// RELEASE BLOCKCHAIN MILESTONE FUNDS
// =====================================================
//
// IMPORTANT:
// Only the configured verifier can successfully call
// this function on the smart contract.
// =====================================================

export async function releaseBlockchainMilestoneFunds(
  campaignId,
  milestoneId
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const parsedCampaignId =
    Number(campaignId);

  const parsedMilestoneId =
    Number(milestoneId);

  if (
    !Number.isInteger(
      parsedCampaignId
    ) ||
    parsedCampaignId <= 0
  ) {
    throw new Error(
      "Invalid blockchain campaign ID."
    );
  }

  if (
    !Number.isInteger(
      parsedMilestoneId
    ) ||
    parsedMilestoneId < 0
  ) {
    throw new Error(
      "Invalid blockchain milestone ID."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      signer
    );

  const tx =
    await contract.releaseMilestoneFunds(
      parsedCampaignId,
      parsedMilestoneId
    );

  const receipt =
    await tx.wait();

  if (!receipt) {
    throw new Error(
      "Milestone release transaction was not confirmed."
    );
  }

  return {

    hash:
      receipt.hash,

    walletAddress:
      await signer.getAddress(),

  };
}


// =====================================================
// READ BLOCKCHAIN MILESTONE
// =====================================================

export async function getBlockchainMilestone(
  campaignId,
  milestoneId
) {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const contract =
    new Contract(
      CONTRACT_ADDRESS,
      CLAIR_FUND_ABI,
      provider
    );

  const milestone =
    await contract.getMilestone(
      Number(campaignId),
      Number(milestoneId)
    );

  return {

    description:
      milestone.description,

    amount:
      milestone.amount,

    recipient:
      milestone.recipient,

    approved:
      milestone.approved,

    released:
      milestone.released,

  };
}


// =====================================================
// EXPORT CONTRACT ADDRESS
// =====================================================

export {
  CONTRACT_ADDRESS,
};
