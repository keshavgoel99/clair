const express = require("express");

const prisma = require("../db/prisma");
<<<<<<< HEAD
=======
const { GoogleGenAI } = require("@google/genai");
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

<<<<<<< HEAD
=======
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

function parseAIJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      throw new Error("Gemini returned invalid JSON.");
    }
  }
};

>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

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
<<<<<<< HEAD
// START VERIFICATION
// =====================================================
//
// For now this is a placeholder.
// Later this endpoint will call the AI.
=======
// START AI VERIFICATION
// =====================================================
//
// NGO starts verification for a delivered procurement.
//
// Gemini:
//   - analyzes procurement data
//   - analyzes submitted bill data
//   - recommends APPROVE / FLAG_FOR_REVIEW / REJECT
//
// Gemini DOES NOT make the final approval.
// Human approval remains required.
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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
<<<<<<< HEAD
=======

          include: {
            campaign: true,
            vendor: true,
            documents: true,
            verification: true,
          },
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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


<<<<<<< HEAD
      // -----------------------------------------------
      // TEMPORARY AI PLACEHOLDER
      // -----------------------------------------------

      const aiScore = 0;

      const aiResult =
        "AI verification has not been connected yet.";


=======
      // -------------------------------------------------
      // BILL DATA
      // -------------------------------------------------
      //
      // The frontend can send structured bill information.
      //
      // Example:
      //
      // {
      //   "bill": {
      //      "vendor": "ABC Foods",
      //      "quantity": 200,
      //      "amount": 38500,
      //      "item": "Meal packages",
      //      "invoiceNumber": "INV-001"
      //   }
      // }
      //
      // -------------------------------------------------

      const bill = req.body?.bill;

      if (!bill) {
        return res.status(400).json({
          message:
            "Bill information is required for AI verification.",
        });
      }


      // -------------------------------------------------
      // BUILD DATA FOR GEMINI
      // -------------------------------------------------

      const campaignData = {
        id: procurement.campaign.id,
        title: procurement.campaign.title,
        description: procurement.campaign.description,
        category: procurement.campaign.category,
        target: procurement.campaign.target,
      };

      const procurementData = {
        id: procurement.id,
        title: procurement.title,
        description: procurement.description,
        approvedAmount: procurement.amount,
        status: procurement.status,
        vendorId: procurement.vendorId,
        vendorName: procurement.vendor
          ? procurement.vendor.name
          : null,
      };

      const documentsData =
        procurement.documents.map((document) => ({
          id: document.id,
          type: document.type,
          fileUrl: document.fileUrl,
          documentHash: document.documentHash,
        }));


      // -------------------------------------------------
      // GEMINI PROMPT
      // -------------------------------------------------

      const prompt = `
You are CLAIR's AI bill-verification assistant.

Your task is to analyze a submitted bill against the
approved campaign and procurement information.

Check for:

1. Vendor mismatch
2. Quantity mismatch
3. Amount mismatch
4. Amount exceeding the approved procurement amount
5. Item mismatch
6. Missing information
7. Possible duplicate invoice
8. Other obvious inconsistencies

IMPORTANT RULES:

- Do NOT authorize payment.
- Do NOT release funds.
- Do NOT execute blockchain transactions.
- Do NOT make the final human approval decision.
- Only provide an AI recommendation.
- If information is insufficient, use FLAG_FOR_REVIEW.
- Never invent missing information.

CAMPAIGN:
${JSON.stringify(campaignData, null, 2)}

APPROVED PROCUREMENT:
${JSON.stringify(procurementData, null, 2)}

ASSOCIATED DOCUMENTS:
${JSON.stringify(documentsData, null, 2)}

SUBMITTED BILL:
${JSON.stringify(bill, null, 2)}

Return ONLY valid JSON in this exact structure:

{
  "recommendation": "APPROVE | FLAG_FOR_REVIEW | REJECT",
  "confidence": 0,
  "reason": "short explanation",
  "checks": {
    "vendorMatches": false,
    "quantityMatches": false,
    "amountWithinLimit": false,
    "itemMatches": false,
    "possibleDuplicate": false,
    "missingInformation": false
  },
  "humanApprovalRequired": true
}

Confidence must be between 0 and 1.

If there is any important unresolved discrepancy,
prefer FLAG_FOR_REVIEW rather than assuming the bill is valid.
`;


      // -------------------------------------------------
      // CALL GEMINI
      // -------------------------------------------------

      const response =
        await ai.models.generateContent({
          model: MODEL,
          contents: prompt,

          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });


      const aiResult =
        parseAIJson(response.text);


      // -------------------------------------------------
      // SAVE AI RESULT
      // -------------------------------------------------

      const recommendation =
        aiResult.recommendation;

      const aiScore =
        Number(aiResult.confidence) || 0;

>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      const updatedVerification =
        await prisma.verification.update({
          where: {
            procurementId,
          },

          data: {
<<<<<<< HEAD
            status: "PENDING_AI",
            aiScore,
            aiResult,
=======
            status: recommendation,
            aiScore,
            aiResult: JSON.stringify(aiResult),
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
          },
        });


<<<<<<< HEAD
      res.json({
        message:
          "Verification started",

        verification:
          updatedVerification,
=======
      // -------------------------------------------------
      // RETURN RESULT
      // -------------------------------------------------

      return res.json({
        message:
          "AI verification completed",

        verification:
          updatedVerification,

        aiRecommendation:
          aiResult,

        humanApprovalRequired:
          true,
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      });

    } catch (error) {
      console.error(
<<<<<<< HEAD
        "Verification error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to start verification",
=======
        "AI verification error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to complete AI verification",

        error:
          error.message,
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
      });
    }
  }
);


module.exports = router;