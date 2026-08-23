const express = require('express')

const prisma = require('../db/prisma')

const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()


// CREATE PLEDGE
// Only authenticated donors can create pledges.

router.post(
  '/',
  authenticateToken,
  authorizeRoles('DONOR'),

  async (req, res) => {
    try {
      const {
        campaignId,
        amount,
      } = req.body


      // Validate campaign ID

      if (campaignId === undefined) {
        return res.status(400).json({
          message: 'Campaign ID is required',
        })
      }


      const parsedCampaignId =
        Number(campaignId)

      if (
        !Number.isInteger(parsedCampaignId) ||
        parsedCampaignId <= 0
      ) {
        return res.status(400).json({
          message: 'Invalid campaign ID',
        })
      }


      // Validate amount

      const pledgeAmount = Number(amount)

      if (
        !Number.isFinite(pledgeAmount) ||
        pledgeAmount <= 0
      ) {
        return res.status(400).json({
          message: 'Amount must be a positive number',
        })
      }


      // Find campaign

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


      // Check campaign is active

      if (!campaign.active) {
        return res.status(400).json({
          message: 'This campaign is no longer active',
        })
      }


      // Find existing pledges

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
        Number(
          existingPledges._sum.amount || 0
        )


      const targetAmount =
        Number(campaign.target)


      const remainingAmount =
        targetAmount - alreadyPledged


      // Campaign already fully funded

      if (remainingAmount <= 0) {
        return res.status(400).json({
          message:
            'This campaign has already reached its target',
        })
      }


      // Don't allow pledge above remaining target

      if (pledgeAmount > remainingAmount) {
        return res.status(400).json({
          message:
            `Maximum pledge allowed is ₹${remainingAmount}`,
        })
      }


      // Create pledge
      //
      // IMPORTANT:
      // donorId comes from the JWT.
      // The frontend does NOT choose the donor.

      const pledge =
        await prisma.pledge.create({
          data: {
            amount: pledgeAmount,

            donorId: req.user.id,

            campaignId: parsedCampaignId,
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


      res.status(201).json({
        message: 'Pledge created successfully',
        pledge,
      })

    } catch (error) {
      console.error(
        'Create pledge error:',
        error
      )

      res.status(500).json({
        message: 'Unable to create pledge',
      })
    }
  }
)


// GET MY PLEDGES
// Only authenticated donors can view their pledges.

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


      res.json({
        pledges,
      })

    } catch (error) {
      console.error(
        'Get pledges error:',
        error
      )

      res.status(500).json({
        message: 'Unable to fetch pledges',
      })
    }
  }
)


module.exports = router