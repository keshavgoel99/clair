const { ethers } = require('ethers')

const CONTRACT_ABI = [
  'function campaigns(uint256) view returns (address ngo, uint256 targetAmount, uint256 raisedAmount, uint256 releasedAmount, bool active)',
  'function pledges(uint256,address) view returns (uint256)',
  'function getContractBalance() view returns (uint256)',
]

const RPC_URL = process.env.SEPOLIA_RPC_URL
const CONTRACT_ADDRESS = process.env.CLAIR_FUND_CONTRACT_ADDRESS

if (!RPC_URL) {
  console.warn(
    'SEPOLIA_RPC_URL is not configured'
  )
}

if (!CONTRACT_ADDRESS) {
  console.warn(
    'CLAIR_FUND_CONTRACT_ADDRESS is not configured'
  )
}

const provider = RPC_URL
  ? new ethers.JsonRpcProvider(RPC_URL)
  : null

const contract =
  provider && CONTRACT_ADDRESS
    ? new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )
    : null


async function verifyPledge({
  transactionHash,
  blockchainCampaignId,
  donorWallet,
  amount,
}) {
  if (!contract || !provider) {
    throw new Error(
      'Blockchain provider is not configured'
    )
  }

  // ---------------------------------------------
  // Get transaction receipt
  // ---------------------------------------------

  const receipt =
    await provider.getTransactionReceipt(
      transactionHash
    )

  if (!receipt) {
    throw new Error(
      'Blockchain transaction not found'
    )
  }

  if (receipt.status !== 1) {
    throw new Error(
      'Blockchain transaction failed'
    )
  }

  // ---------------------------------------------
  // Make sure transaction belongs to our contract
  // ---------------------------------------------

  if (
    receipt.to?.toLowerCase() !==
    CONTRACT_ADDRESS.toLowerCase()
  ) {
    throw new Error(
      'Transaction was not sent to the ClairFund contract'
    )
  }

  // ---------------------------------------------
  // Parse Pledged event
  // ---------------------------------------------

  const iface =
    new ethers.Interface(CONTRACT_ABI)

  // We need the event ABI separately because
  // CONTRACT_ABI above intentionally contains
  // only read methods.
  const eventIface =
    new ethers.Interface([
      'event Pledged(uint256 indexed campaignId, address indexed donor, uint256 amount)',
    ])

  let pledgeEvent = null

  for (const log of receipt.logs) {
    try {
      const parsed =
        eventIface.parseLog({
          topics: log.topics,
          data: log.data,
        })

      if (
        parsed &&
        parsed.name === 'Pledged'
      ) {
        pledgeEvent = parsed
        break
      }
    } catch {
      // Ignore logs belonging to other events/contracts.
    }
  }

  if (!pledgeEvent) {
    throw new Error(
      'Pledged event not found in transaction'
    )
  }

  const eventCampaignId =
    Number(
      pledgeEvent.args.campaignId
    )

  const eventDonor =
    pledgeEvent.args.donor

  const eventAmount =
    pledgeEvent.args.amount

  // ---------------------------------------------
  // Verify campaign
  // ---------------------------------------------

  if (
    eventCampaignId !==
    Number(blockchainCampaignId)
  ) {
    throw new Error(
      'Blockchain campaign does not match database campaign'
    )
  }

  // ---------------------------------------------
  // Verify donor wallet
  // ---------------------------------------------

  if (
    eventDonor.toLowerCase() !==
    donorWallet.toLowerCase()
  ) {
    throw new Error(
      'Blockchain donor does not match donor wallet'
    )
  }

  // ---------------------------------------------
  // Verify amount
  // ---------------------------------------------

  const expectedAmount =
    ethers.parseEther(
      String(amount)
    )

  if (
    eventAmount !== expectedAmount
  ) {
    throw new Error(
      'Blockchain pledge amount does not match database amount'
    )
  }

  // ---------------------------------------------
  // Verify campaign exists on-chain
  // ---------------------------------------------

  const campaign =
    await contract.campaigns(
      blockchainCampaignId
    )

  if (
    campaign.ngo ===
    ethers.ZeroAddress
  ) {
    throw new Error(
      'Blockchain campaign does not exist'
    )
  }

  return {
    verified: true,

    transactionHash,

    blockchainCampaignId:
      eventCampaignId,

    donorWallet:
      eventDonor,

    amount:
      ethers.formatEther(
        eventAmount
      ),

    blockNumber:
      receipt.blockNumber,
  }
}


module.exports = {
  verifyPledge,
}