const express = require("express");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET VERIFICATION
// =====================================================

router.get(
  "/:procurementId",
  authenticateToken,

  async (req, res) => {
    try {
      const procurementId =
        Number(req.params.procurementId);

      if (!Number.isInteger(procurementId)) {
        return res.status(400).json({
          message: "Invalid procurement ID",
        });
      }

      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id: procurementId,

            OR: [
              {
                ngoId: req.user.id,
              },
              {
                vendorId: req.user.id,
              },
            ],
          },
        });

      if (!procurement) {
        return res.status(404).json({
          message: "Procurement not found",
        });
      }

      const verification =
        await prisma.verification.findUnique({
          where: {
            procurementId,
          },
        });

      if (!verification) {
        return res.status(404).json({
          message:
            "Verification has not been created yet",
        });
      }

      res.json({
        verification,
      });

    } catch (error) {
      console.error(
        "Fetch verification error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch verification",
      });
    }
  }
);


// =====================================================
// START VERIFICATION
// =====================================================
//
// For now this is a placeholder.
// Later this endpoint will call the AI.
// =====================================================

router.post(
  "/:procurementId/run",
  authenticateToken,
  authorizeRoles("NGO"),

  async (req, res) => {
    try {
      const procurementId =
        Number(req.params.procurementId);

      if (!Number.isInteger(procurementId)) {
        return res.status(400).json({
          message: "Invalid procurement ID",
        });
      }

      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id: procurementId,
            ngoId: req.user.id,
            status: "VERIFICATION_PENDING",
          },
        });

      if (!procurement) {
        return res.status(404).json({
          message:
            "Procurement is not ready for verification",
        });
      }

      const verification =
        await prisma.verification.findUnique({
          where: {
            procurementId,
          },
        });

      if (!verification) {
        return res.status(404).json({
          message:
            "Verification record not found",
        });
      }


      // -----------------------------------------------
      // TEMPORARY AI PLACEHOLDER
      // -----------------------------------------------

      const aiScore = 0;

      const aiResult =
        "AI verification has not been connected yet.";


      const updatedVerification =
        await prisma.verification.update({
          where: {
            procurementId,
          },

          data: {
            status: "PENDING_AI",
            aiScore,
            aiResult,
          },
        });


      res.json({
        message:
          "Verification started",

        verification:
          updatedVerification,
      });

    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to start verification",
      });
    }
  }
);


module.exports = router;