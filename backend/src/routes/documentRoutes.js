const express = require("express");
<<<<<<< HEAD
=======
const multer = require("multer");
const path = require("path");
const fs = require("fs");
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

const prisma = require("../db/prisma");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
<<<<<<< HEAD
// UPLOAD DOCUMENT
// =====================================================
//
// Vendor uploads a document for a procurement.
//
// For now we store the file URL/path.
// Actual file storage will be connected next.
=======
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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("VENDOR"),
<<<<<<< HEAD
=======
  upload.single("document"),
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

  async (req, res) => {
    try {
      const {
        procurementId,
        type,
<<<<<<< HEAD
        fileUrl,
=======
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      } = req.body;


      // -----------------------------------------------
      // Validate fields
      // -----------------------------------------------

      if (
        procurementId === undefined ||
<<<<<<< HEAD
        !type ||
        !fileUrl
      ) {
        return res.status(400).json({
          message:
            "Procurement ID, document type and file URL are required",
=======
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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
        });
      }


      const id =
        Number(procurementId);


      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
<<<<<<< HEAD
            "Invalid procurement ID",
=======
            "Invalid procurement ID.",
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
        });
      }


      // -----------------------------------------------
      // Find procurement
      // -----------------------------------------------

      const procurement =
        await prisma.procurement.findFirst({
          where: {
            id,

<<<<<<< HEAD
            // Only the assigned vendor
=======
            // Only assigned vendor
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
            // can upload documents.
            vendorId: req.user.id,

            // Documents are submitted
            // after delivery.
            status: "DELIVERED",
          },
        });


      if (!procurement) {
<<<<<<< HEAD
        return res.status(404).json({
          message:
            "Procurement not found or not available for document submission",
=======
        // Delete uploaded file because
        // the upload is not authorized.
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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
        });
      }


      // -----------------------------------------------
<<<<<<< HEAD
      // Create document
      // -----------------------------------------------

      const document =
        await prisma.document.create({
          data: {
            type: type.trim(),

            fileUrl:
              fileUrl.trim(),
=======
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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

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
<<<<<<< HEAD
      await prisma.verification.create({
  data: {
    procurementId: procurement.id,
    status: "PENDING",
  },
});

      res.status(201).json({
        message:
          "Document uploaded successfully",
=======


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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

        document,
      });

    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

<<<<<<< HEAD
      res.status(500).json({
        message:
          "Unable to upload document",
=======

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
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      });
    }
  }
);


// =====================================================
// GET PROCUREMENT DOCUMENTS
// =====================================================
//
<<<<<<< HEAD
// Vendor can view documents belonging to their
// procurements.
=======
// Vendor or NGO can view documents belonging
// to their procurements.
//
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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
<<<<<<< HEAD
            "Invalid procurement ID",
=======
            "Invalid procurement ID.",
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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
<<<<<<< HEAD
            "Procurement not found",
=======
            "Procurement not found.",
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
        });
      }


      const documents =
        await prisma.document.findMany({
          where: {
            procurementId,
          },

          orderBy: {
<<<<<<< HEAD
            createdAt: "desc",
=======
            createdAt:
              "desc",
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
          },
        });


<<<<<<< HEAD
      res.json({
=======
      return res.json({
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
        documents,
      });

    } catch (error) {
      console.error(
        "Fetch documents error:",
        error
      );

<<<<<<< HEAD
      res.status(500).json({
        message:
          "Unable to fetch documents",
=======

      return res.status(500).json({
        message:
          "Unable to fetch documents.",
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      });
    }
  }
);


<<<<<<< HEAD
=======
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


>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
module.exports = router;