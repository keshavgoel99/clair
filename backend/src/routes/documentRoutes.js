const express = require("express");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// UPLOAD DOCUMENT
// =====================================================
//
// Vendor uploads a document for a procurement.
//
// For now we store the file URL/path.
// Actual file storage will be connected next.
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("VENDOR"),

  async (req, res) => {
    try {
      const {
        procurementId,
        type,
        fileUrl,
      } = req.body;


      // -----------------------------------------------
      // Validate fields
      // -----------------------------------------------

      if (
        procurementId === undefined ||
        !type ||
        !fileUrl
      ) {
        return res.status(400).json({
          message:
            "Procurement ID, document type and file URL are required",
        });
      }


      const id =
        Number(procurementId);


      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
            "Invalid procurement ID",
        });
      }


      // -----------------------------------------------
      // Find procurement
      // -----------------------------------------------

      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id,

            // Only the assigned vendor
            // can upload documents.
            vendorId: req.user.id,

            // Documents are submitted
            // after delivery.
            status: "DELIVERED",
          },
        });


      if (!procurement) {
        return res.status(404).json({
          message:
            "Procurement not found or not available for document submission",
        });
      }


      // -----------------------------------------------
      // Create document
      // -----------------------------------------------

      const document =
        await prisma.document.create({
          data: {
            type: type.trim(),

            fileUrl:
              fileUrl.trim(),

            procurementId:
              procurement.id,
          },
        });


      // -----------------------------------------------
      // Move procurement to verification
      // -----------------------------------------------

      await prisma.procurement.update({
        where: {
          id: procurement.id,
        },

        data: {
          status:
            "VERIFICATION_PENDING",
        },
      });
      await prisma.verification.create({
  data: {
    procurementId: procurement.id,
    status: "PENDING",
  },
});

      res.status(201).json({
        message:
          "Document uploaded successfully",

        document,
      });

    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to upload document",
      });
    }
  }
);


// =====================================================
// GET PROCUREMENT DOCUMENTS
// =====================================================
//
// Vendor can view documents belonging to their
// procurements.
// =====================================================

router.get(
  "/procurement/:procurementId",
  authenticateToken,

  async (req, res) => {
    try {
      const procurementId =
        Number(
          req.params.procurementId
        );


      if (
        !Number.isInteger(
          procurementId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid procurement ID",
        });
      }


      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id: procurementId,

            OR: [
              {
                vendorId:
                  req.user.id,
              },

              {
                ngoId:
                  req.user.id,
              },
            ],
          },
        });


      if (!procurement) {
        return res.status(404).json({
          message:
            "Procurement not found",
        });
      }


      const documents =
        await prisma.document.findMany({
          where: {
            procurementId,
          },

          orderBy: {
            createdAt: "desc",
          },
        });


      res.json({
        documents,
      });

    } catch (error) {
      console.error(
        "Fetch documents error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch documents",
      });
    }
  }
);


module.exports = router;