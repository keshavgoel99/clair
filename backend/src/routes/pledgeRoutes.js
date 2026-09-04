const express = require('express')
const prisma = require('../db/prisma')

const {
  verifyPledge,
} = require('../services/blockchainService')

const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

router.post(
  '/',
  authenticateToken,
  authorizeRoles('DONOR'),
  async (req, res) => {
    try {
      const {
        campaignId,
        amount,
        blockchainTx,
      } = req.body

      const parsedCampaignId = Number(campaignId)

      if (
        !Number.isInteger(parsedCampaignId) ||
        parsedCampaignId <= 0
      ) {
        return res.status(400).json({
          message: 'Invalid campaign ID',
        })
      }

      const pledgeAmount = Number(amount)

      if (
        !Number.isFinite(pledgeAmount) ||
        pledgeAmount <= 0
      ) {
        return res.status(400).json({
          message: 'Amount must be a positive number',
        })
      }

      if (
        blockchainTx !== undefined &&
        blockchainTx !== null &&
        blockchainTx !== ''
      ) {
        if (
          typeof blockchainTx !== 'string' ||
          !/^0x[a-fA-F0-9]{64}$/.test(blockchainTx)
        ) {
          return res.status(400).json({
            message: 'Invalid blockchain transaction hash',
          })
        }
      }

      const campaign =
        await prisma.campaign.findUnique({
          where: {
            id: parsedCampaignId,
          },
        })

      if (!campaign) {
        return res.status(404).json({
          message: 'Campaign not found',
        })
      }

      if (!campaign.active) {
        return res.status(400).json({
          message: 'This campaign is no longer active',
        })
      }

      const existingPledges =
        await prisma.pledge.aggregate({
          where: {
            campaignId: parsedCampaignId,
            status: {
              in: [
                'PLEDGED',
                'LOCKED',
                'UTILIZED',
              ],
            },
          },
          _sum: {
            amount: true,
          },
        })

      const alreadyPledged =
        Number(existingPledges._sum.amount || 0)

      const targetAmount =
        Number(campaign.target)

      const remainingAmount =
        targetAmount - alreadyPledged

      if (remainingAmount <= 0) {
        return res.status(400).json({
          message:
            'This campaign has already reached its target',
        })
      }

      if (pledgeAmount > remainingAmount) {
        return res.status(400).json({
          message:
            'Maximum pledge allowed is Rs. ' +
            remainingAmount,
        })
      }

      let pledgeStatus = 'PLEDGED'

      if (blockchainTx) {
        if (!campaign.blockchainCampaignId) {
          return res.status(400).json({
            message:
              'Campaign is not linked to a blockchain campaign',
          })
        }

        const donor =
          await prisma.user.findUnique({
            where: {
              id: req.user.id,
            },
            select: {
              walletAddress: true,
            },
          })

        if (!donor || !donor.walletAddress) {
          return res.status(400).json({
            message:
              'Donor wallet address is not registered',
          })
        }

        try {
          await verifyPledge({
            transactionHash: blockchainTx,
            blockchainCampaignId:
              campaign.blockchainCampaignId,
            donorWallet:
              donor.walletAddress,
            amount: pledgeAmount,
          })

          pledgeStatus = 'LOCKED'
        } catch (blockchainError) {
          console.error(
            'Blockchain verification failed:',
            blockchainError
          )

          return res.status(400).json({
            message:
              blockchainError.message ||
              'Blockchain pledge verification failed',
          })
        }
      }

      const pledge =
        await prisma.pledge.create({
          data: {
            amount: pledgeAmount,
            donorId: req.user.id,
            campaignId: parsedCampaignId,
            blockchainTx:
              blockchainTx || null,
            status: pledgeStatus,
          },
          include: {
            campaign: {
              include: {
                ngo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        })

      return res.status(201).json({
        message: 'Pledge created successfully',
        pledge,
      })
    } catch (error) {
      console.error(
        'Create pledge error:',
        error
      )

      return res.status(500).json({
        message: 'Unable to create pledge',
      })
    }
  }
)

router.get(
  '/my',
  authenticateToken,
  authorizeRoles('DONOR'),
  async (req, res) => {
    try {
      const pledges =
        await prisma.pledge.findMany({
          where: {
            donorId: req.user.id,
          },
          include: {
            campaign: {
              include: {
                ngo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

      return res.json({
        pledges,
      })
    } catch (error) {
      console.error(
        'Get pledges error:',
        error
      )

      return res.status(500).json({
        message: 'Unable to fetch pledges',
      })
    }
  }
)

module.exports = router
