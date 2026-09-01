const express = require("express");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// SAVE VENDOR WALLET ADDRESS
// =====================================================
//
// Vendors connect MetaMask from the frontend and send
// their wallet address here.
//
// The vendor ID ALWAYS comes from the JWT.
// =====================================================

router.patch(
  "/wallet",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const {
        walletAddress,
      } = req.body;


      // -----------------------------------------------
      // Validate wallet address
      // -----------------------------------------------

      if (
        typeof walletAddress !== "string" ||
        !/^0x[a-fA-F0-9]{40}$/.test(
          walletAddress
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid Ethereum wallet address",
        });
      }


      // -----------------------------------------------
      // Save wallet address
      // -----------------------------------------------

      const vendor =
        await prisma.user.update({
          where: {
            id: req.user.id,
          },

          data: {
            walletAddress:
              walletAddress.toLowerCase(),
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            walletAddress: true,
          },
        });


      res.json({
        message:
          "Wallet address saved successfully",

        vendor,
      });

    } catch (error) {
      console.error(
        "Save vendor wallet error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to save wallet address",
      });
    }
  }
);


// =====================================================
// GET MY WALLET
// =====================================================
//
// Allows the vendor dashboard to retrieve the currently
// saved wallet address.
// =====================================================

router.get(
  "/wallet",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const vendor =
        await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            walletAddress: true,
          },
        });


      if (!vendor) {
        return res.status(404).json({
          message:
            "Vendor not found",
        });
      }


      res.json({
        walletAddress:
          vendor.walletAddress || null,
      });

    } catch (error) {
      console.error(
        "Get vendor wallet error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch wallet address",
      });
    }
  }
);


// =====================================================
// GET AVAILABLE PROCUREMENTS
// =====================================================

router.get(
  "/procurements",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const procurements =
        await prisma.procurement.findMany({
          where: {
            vendorId: req.user.id,
          },

          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },

            ngo: {
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
        "Fetch vendor procurements error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch procurements",
      });
    }
  }
);


// =====================================================
// MARK PROCUREMENT AS DELIVERED
// =====================================================

router.patch(
  "/procurements/:id/deliver",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const procurementId =
        Number(req.params.id);

      if (!Number.isInteger(procurementId)) {
        return res.status(400).json({
          message:
            "Invalid procurement ID",
        });
      }

      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id: procurementId,
            vendorId: req.user.id,
            status: "ORDERED",
          },
        });

      if (!procurement) {
        return res.status(404).json({
          message:
            "Procurement not found or cannot be marked as delivered",
        });
      }

      const updatedProcurement =
        await prisma.procurement.update({
          where: {
            id: procurementId,
          },

          data: {
            status: "DELIVERED",
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
              },
            },

            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        });

      res.json({
        message:
          "Procurement marked as delivered",

        procurement:
          updatedProcurement,
      });

    } catch (error) {
      console.error(
        "Mark delivered error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark procurement as delivered",
      });
    }
  }
);


// =====================================================
// ACCEPT PROCUREMENT
// =====================================================

router.patch(
  "/procurements/:id/accept",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const procurementId =
        Number(req.params.id);

      if (!Number.isInteger(procurementId)) {
        return res.status(400).json({
          message:
            "Invalid procurement ID",
        });
      }


      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id: procurementId,
            status: "CREATED",
            vendorId: req.user.id,
          },
        });


      if (!procurement) {
        return res.status(404).json({
          message:
            "Procurement is no longer available",
        });
      }


      const updatedProcurement =
        await prisma.procurement.update({
          where: {
            id: procurementId,
          },

          data: {
            vendorId: req.user.id,
            status: "ORDERED",
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
              },
            },

            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        });


      res.json({
        message:
          "Procurement accepted successfully",

        procurement:
          updatedProcurement,
      });

    } catch (error) {
      console.error(
        "Accept procurement error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to accept procurement",
      });
    }
  }
);


module.exports = router;