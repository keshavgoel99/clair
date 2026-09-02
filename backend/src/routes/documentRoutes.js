const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const safeName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}${extension}`;

    cb(null, safeName);
  },
});


const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];


const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, JPG, JPEG and PNG files are allowed."
        )
      );
    }
  },
});


// =====================================================
// UPLOAD DOCUMENT
// =====================================================
//
// Vendor uploads a real PDF/image for a procurement.
//
// The file is stored locally in /uploads.
// The database stores its relative URL/path.
//
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("VENDOR"),
  upload.single("document"),

  async (req, res) => {
    try {
      const {
        procurementId,
        type,
      } = req.body;


      // -----------------------------------------------
      // Validate fields
      // -----------------------------------------------

      if (
        procurementId === undefined ||
        !type
      ) {
        return res.status(400).json({
          message:
            "Procurement ID and document type are required.",
        });
      }


      if (!req.file) {
        return res.status(400).json({
          message:
            "A document file is required.",
        });
      }


      const id =
        Number(procurementId);


      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
            "Invalid procurement ID.",
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
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch (deleteError) {
          console.error(
            "Unable to delete unauthorized upload:",
            deleteError
          );
        }

        return res.status(404).json({
          message:
            "Procurement not found or not available for document submission.",
        });
      }


      // -----------------------------------------------
      // Store document
      // -----------------------------------------------

      const fileUrl =
        `/uploads/${req.file.filename}`;


      const document =
        await prisma.document.create({
          data: {
            type:
              type.trim(),

            fileUrl,

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

      // -----------------------------------------------
      // Create verification record
      // -----------------------------------------------

      const existingVerification =
        await prisma.verification.findUnique({
          where: {
            procurementId:
              procurement.id,
          },
        });


      if (!existingVerification) {
        await prisma.verification.create({
          data: {
            procurementId:
              procurement.id,

            status:
              "PENDING",
          },
        });
      }


      return res.status(201).json({
        message:
          "Document uploaded successfully.",

        document,
      });

    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      // Delete file if database
      // operation failed.
      if (req.file) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch (deleteError) {
          console.error(
            "Unable to clean up uploaded file:",
            deleteError
          );
        }
      }


      return res.status(500).json({
        message:
          "Unable to upload document.",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// GET PROCUREMENT DOCUMENTS
// =====================================================
//
// Vendor or NGO can view documents belonging
// to their procurements.
//
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
            "Invalid procurement ID.",
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
            "Procurement not found.",
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

      return res.json({
        documents,
      });

    } catch (error) {
      console.error(
        "Fetch documents error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to fetch documents.",
      });
    }
  }
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      return res.status(400).json({
        message:
          `Upload error: ${error.message}`,
      });
    }


    if (error) {
      return res.status(400).json({
        message:
          error.message,
      });
    }


    next();
  }
);

module.exports = router;