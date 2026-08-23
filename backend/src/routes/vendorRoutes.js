const express = require("express");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET AVAILABLE PROCUREMENTS
// =====================================================
//
// Vendors can see procurements that have not yet been
// assigned to another vendor.
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
// ACCEPT PROCUREMENT
// =====================================================
//
// Vendor accepts an available procurement.
// =====================================================

// =====================================================
// MARK PROCUREMENT AS DELIVERED
// =====================================================
//
// Only the assigned vendor can mark the procurement
// as delivered.
//
// ORDERED → DELIVERED
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

            // Must belong to this vendor
            vendorId: req.user.id,

            // Can only deliver an accepted order
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


      // Find only an unassigned CREATED procurement

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


      // Assign procurement to vendor

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