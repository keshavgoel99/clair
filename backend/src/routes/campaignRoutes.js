const express = require('express')

const prisma = require('../db/prisma')

const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()


// =====================================================
// GET ALL ACTIVE CAMPAIGNS
// =====================================================
//
// Any authenticated user can view campaigns.
// Also returns pledge amounts so the frontend can
// calculate how much has been raised.
// =====================================================

router.get(
  '/',
  authenticateToken,
  async (req, res) => {
    try {
      const campaignWhere = {
        active: true,
      };

      if (req.user.role === 'NGO') {
        campaignWhere.ngoId = req.user.id;
      }

      const campaigns = await prisma.campaign.findMany({
        where: campaignWhere,

          include: {
            ngo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            pledges: {
              where: {
                status: {
                  in: [
                    'PLEDGED',
                    'LOCKED',
                    'UTILIZED',
                  ],
                },
              },

              select: {
                amount: true,
              },
            },

            _count: {
              select: {
                pledges: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        })


      // -----------------------------------------------
      // Calculate raised amount
      // -----------------------------------------------

      const campaignsWithRaisedAmount =
        campaigns.map((campaign) => {
          const raisedAmount =
            campaign.pledges.reduce(
              (total, pledge) =>
                total + Number(pledge.amount),
              0
            )

          return {
            ...campaign,

            // Convert Prisma Decimal to number
            target:
              Number(campaign.target),

            raisedAmount,

            // Don't send pledge records
            pledges: undefined,
          }
        })


      res.json({
        campaigns:
          campaignsWithRaisedAmount,
      })

    } catch (error) {
      console.error(
        'Fetch campaigns error:',
        error
      )

      res.status(500).json({
        message:
          'Unable to fetch campaigns',
      })
    }
  }
)


// =====================================================
// CREATE CAMPAIGN
// =====================================================
//
// Only authenticated NGOs can create campaigns.
//
// The blockchain transaction itself happens in the
// frontend through MetaMask.
//
// The backend receives and stores the resulting
// blockchainCampaignId.
// =====================================================

router.post(
  '/',
  authenticateToken,
  authorizeRoles('NGO'),

  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        target,
        blockchainCampaignId,
      } = req.body


      // -----------------------------------------------
      // Validate required fields
      // -----------------------------------------------

      if (
        !title ||
        !description ||
        !category ||
        target === undefined
      ) {
        return res.status(400).json({
          message:
            'All campaign fields are required',
        })
      }


      // -----------------------------------------------
      // Validate target
      // -----------------------------------------------

      const targetAmount =
        Number(target)


      if (
        !Number.isFinite(
          targetAmount
        ) ||
        targetAmount <= 0
      ) {
        return res.status(400).json({
          message:
            'Target must be a positive number',
        })
      }


      // -----------------------------------------------
      // Validate blockchain campaign ID
      // -----------------------------------------------

      let parsedBlockchainCampaignId =
        null


      if (
        blockchainCampaignId !==
          undefined &&
        blockchainCampaignId !==
          null &&
        blockchainCampaignId !== ''
      ) {
        parsedBlockchainCampaignId =
          Number(
            blockchainCampaignId
          )


        if (
          !Number.isInteger(
            parsedBlockchainCampaignId
          ) ||
          parsedBlockchainCampaignId <= 0
        ) {
          return res.status(400).json({
            message:
              'Invalid blockchain campaign ID',
          })
        }
      }


      // -----------------------------------------------
      // Create PostgreSQL campaign
      // -----------------------------------------------

      const campaign =
        await prisma.campaign.create({
          data: {
            title:
              title.trim(),

            description:
              description.trim(),

            category:
              category.trim(),

            target:
              targetAmount,

            // Comes from verified JWT
            ngoId:
              req.user.id,

            // Comes from blockchain
            blockchainCampaignId:
              parsedBlockchainCampaignId,
          },

          include: {
            ngo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            _count: {
              select: {
                pledges: true,
              },
            },

            pledges: {
              where: {
                status: {
                  in: [
                    'PLEDGED',
                    'LOCKED',
                    'UTILIZED',
                  ],
                },
              },

              select: {
                amount: true,
              },
            },
          },
        })


      // -----------------------------------------------
      // Response
      // -----------------------------------------------

      res.status(201).json({
        message:
          'Campaign created successfully',

        campaign,
      })

    } catch (error) {
      console.error(
        'Create campaign error:',
        error
      )

      res.status(500).json({
        message:
          'Unable to create campaign',
      })
    }
  }
)


module.exports = router