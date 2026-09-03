const express = require("express");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET AVAILABLE VENDORS
// =====================================================
//
// Only NGOs can view vendors.
// =====================================================

router.get(
  "/vendors",
  authenticateToken,
  authorizeRoles("NGO"),

  async (req, res) => {
    try {
      const vendors =
        await prisma.user.findMany({
          where: {
            role: "VENDOR",
          },

          select: {
            id: true,
            name: true,
            email: true,
          },

          orderBy: {
            name: "asc",
          },
        });

      res.json({
        vendors,
      });

    } catch (error) {
      console.error(
        "Fetch vendors error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch vendors",
      });
    }
  }
);

// =====================================================
// GET DONOR PROCUREMENT TRANSPARENCY
// =====================================================
//
// Donors can view procurements belonging to campaigns
// they have contributed to.
//
// This exposes:
// Campaign → NGO → Procurement → Vendor → Documents
// → Verification status
// =====================================================

router.get(
  "/donor",
  authenticateToken,
  authorizeRoles("DONOR"),

  async (req, res) => {
    try {
      // -----------------------------------------------
      // Find campaigns this donor has contributed to
      // -----------------------------------------------

      const pledges = await prisma.pledge.findMany({
        where: {
          donorId: req.user.id,
        },

        select: {
          campaignId: true,
        },
      });

      const campaignIds = [
        ...new Set(
          pledges.map((pledge) => pledge.campaignId)
        ),
      ];

      if (campaignIds.length === 0) {
        return res.json({
          procurements: [],
        });
      }

      // -----------------------------------------------
      // Fetch procurements for those campaigns
      // -----------------------------------------------

      const procurements =
        await prisma.procurement.findMany({
          where: {
            campaignId: {
              in: campaignIds,
            },
          },

          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },

            ngo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            documents: true,

            verification: {
              select: {
                id: true,
                status: true,
                aiScore: true,
                aiResult: true,
                reviewedAt: true,
                createdAt: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        procurements,
      });

    } catch (error) {
      console.error(
        "Fetch donor procurements error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch procurement transparency data",
      });
    }
  }
);

// =====================================================
// CREATE PROCUREMENT
// =====================================================
//
// Only NGOs can create procurements.
// The NGO can only create a procurement for a campaign
// that belongs to that NGO.
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("NGO"),

  async (req, res) => {
    try {
      const {
        campaignId,
        title,
        description,
        amount,
        vendorId,
      } = req.body;


      // -----------------------------------------------
      // Validate fields
      // -----------------------------------------------

      if (
        campaignId === undefined ||
        !title ||
        !description ||
        amount === undefined ||
        vendorId === undefined
      ) {
        return res.status(400).json({
          message:
            "All procurement fields are required",
        });
      }


      // -----------------------------------------------
      // Validate amount
      // -----------------------------------------------

      const procurementAmount =
        Number(amount);

      if (
        !Number.isFinite(
          procurementAmount
        ) ||
        procurementAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Amount must be a positive number",
        });
      }


      // -----------------------------------------------
      // Verify vendor
      // -----------------------------------------------

      const vendor =
        await prisma.user.findFirst({
          where: {
            id: Number(vendorId),
            role: "VENDOR",
          },

          select: {
            id: true,
            name: true,
            email: true,
          },
        });


      if (!vendor) {
        return res.status(400).json({
          message:
            "Selected vendor does not exist",
        });
      }


      // -----------------------------------------------
      // Find campaign
      // -----------------------------------------------

      const campaign =
        await prisma.campaign.findFirst({
          where: {
            id: Number(campaignId),

            // NGO can only use its own campaign
            ngoId: req.user.id,

            active: true,
          },
        });


      if (!campaign) {
        return res.status(404).json({
          message:
            "Campaign not found or does not belong to you",
        });
      }


      // -----------------------------------------------
      // Create procurement
      // -----------------------------------------------

      const procurement =
        await prisma.procurement.create({
          data: {
            title:
              title.trim(),

            description:
              description.trim(),

            amount:
              procurementAmount,

            campaignId:
              campaign.id,

            ngoId:
              req.user.id,

            vendorId:
              Number(vendorId),

            status:
              "CREATED",
          },

          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },

            ngo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });


      res.status(201).json({
        message:
          "Procurement created successfully",

        procurement,
      });

    } catch (error) {
      console.error(
        "Create procurement error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create procurement",
      });
    }
  }
);


// =====================================================
// GET NGO PROCUREMENTS
// =====================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles("NGO"),

  async (req, res) => {
    try {
      const procurements =
        await prisma.procurement.findMany({
          where: {
            ngoId: req.user.id,
          },

          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },

            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });


      res.json({
        procurements,
      });

    } catch (error) {
      console.error(
        "Fetch procurements error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch procurements",
      });
    }
  }
);


module.exports = router;