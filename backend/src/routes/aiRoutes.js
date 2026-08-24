const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

/*
|--------------------------------------------------------------------------
| Helper: safely parse Gemini JSON
|--------------------------------------------------------------------------
*/
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
}

/*
|--------------------------------------------------------------------------
| 1. RECOMMEND SMART CONTRACT
|--------------------------------------------------------------------------
|
| AI recommends which existing smart contract is appropriate.
| AI DOES NOT execute or transfer any funds.
|
*/
router.post("/recommend-contract", async (req, res) => {
  try {
    const {
      campaignTitle,
      campaignCategory,
      campaignDescription,
      donationAmount,
      smartContracts,
    } = req.body;

    if (
      !campaignTitle ||
      !campaignCategory ||
      !campaignDescription ||
      !smartContracts
    ) {
      return res.status(400).json({
        error:
          "Campaign information and available smart contracts are required.",
      });
    }

    const prompt = `
You are CLAIR's AI decision-support system.

Your job is ONLY to recommend which EXISTING smart contract is most appropriate
for a donor's contribution.

You MUST NOT:
- transfer money
- execute blockchain transactions
- create smart contracts
- invent smart contracts
- make the final financial decision

A human administrator will review your recommendation and manually execute
the blockchain transaction.

CAMPAIGN:
Title: ${campaignTitle}
Category: ${campaignCategory}
Description: ${campaignDescription}

Donation amount:
${donationAmount ?? "Not provided"}

AVAILABLE SMART CONTRACTS:
${JSON.stringify(smartContracts, null, 2)}

Choose the single most appropriate EXISTING smart contract.

Base your recommendation only on the supplied information.

Return ONLY valid JSON in this exact format:

{
  "recommendedContract": "contract identifier",
  "confidence": 0,
  "reason": "short explanation",
  "humanApprovalRequired": true
}

Confidence must be a number between 0 and 1.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = parseAIJson(response.text);

    return res.json({
      success: true,
      recommendation: result,
    });
  } catch (error) {
    console.error("GEMINI CONTRACT RECOMMENDATION ERROR");
    console.error(error);

    return res.status(500).json({
      error: "Failed to generate smart contract recommendation.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 2. VERIFY BILL
|--------------------------------------------------------------------------
|
| AI analyzes bill information and recommends:
| APPROVE / FLAG_FOR_REVIEW / REJECT
|
| Human must make the final decision.
|
*/
router.post("/verify-bill", async (req, res) => {
  try {
    const {
      campaign,
      procurement,
      bill,
    } = req.body;

    if (!campaign || !procurement || !bill) {
      return res.status(400).json({
        error: "Campaign, procurement and bill information are required.",
      });
    }

    const prompt = `
You are CLAIR's AI bill-verification assistant.

Analyze the submitted bill against the approved campaign and procurement data.

Look for:
- vendor mismatch
- quantity mismatch
- price/amount mismatch
- amount exceeding approved budget
- suspicious or inconsistent information
- missing important information
- possible duplicate billing
- other obvious discrepancies

IMPORTANT:
You are only providing a recommendation.
You MUST NOT authorize payment.
A human administrator must make the final decision.

CAMPAIGN:
${JSON.stringify(campaign, null, 2)}

APPROVED PROCUREMENT:
${JSON.stringify(procurement, null, 2)}

SUBMITTED BILL:
${JSON.stringify(bill, null, 2)}

Return ONLY valid JSON:

{
  "recommendation": "APPROVE | FLAG_FOR_REVIEW | REJECT",
  "confidence": 0,
  "reason": "short explanation",
  "checks": {
    "vendorMatches": true,
    "quantityMatches": true,
    "amountWithinLimit": true,
    "possibleDuplicate": false,
    "missingInformation": false
  },
  "humanApprovalRequired": true
}

Confidence must be a number between 0 and 1.

If the supplied information is insufficient to safely verify something,
use FLAG_FOR_REVIEW instead of assuming it is correct.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = parseAIJson(response.text);

    return res.json({
      success: true,
      verification: result,
    });
  } catch (error) {
    console.error("GEMINI BILL VERIFICATION ERROR");
    console.error(error);

    return res.status(500).json({
      error: "Failed to verify bill.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| 3. CHECK SMART CONTRACT RELEASE
|--------------------------------------------------------------------------
|
| AI determines whether the supplied conditions appear ready for release.
| Human manually triggers the actual blockchain transaction.
|
*/
router.post("/check-release", async (req, res) => {
  try {
    const {
      campaign,
      procurement,
      bill,
      delivery,
      approvals,
      contractStatus,
    } = req.body;

    if (!campaign || !contractStatus) {
      return res.status(400).json({
        error: "Campaign and contract status are required.",
      });
    }

    const prompt = `
You are CLAIR's AI release-readiness assistant.

Determine whether an EXISTING smart contract appears ready for manual release
based ONLY on the supplied information.

Typical conditions may include:
- funds are locked
- procurement is completed
- bill has been submitted
- bill has been reviewed/approved by a human
- goods/services have been delivered
- delivery has been verified
- required approvals are complete
- no obvious unresolved issue exists

IMPORTANT:
You do NOT release the smart contract.
You do NOT execute blockchain transactions.
You only provide a recommendation.
A human administrator will make the final release decision.

CAMPAIGN:
${JSON.stringify(campaign, null, 2)}

PROCUREMENT:
${JSON.stringify(procurement ?? {}, null, 2)}

BILL:
${JSON.stringify(bill ?? {}, null, 2)}

DELIVERY:
${JSON.stringify(delivery ?? {}, null, 2)}

APPROVALS:
${JSON.stringify(approvals ?? {}, null, 2)}

SMART CONTRACT STATUS:
${JSON.stringify(contractStatus, null, 2)}

Return ONLY valid JSON:

{
  "recommendation": "READY_FOR_RELEASE | NOT_READY | NEEDS_REVIEW",
  "confidence": 0,
  "reason": "short explanation",
  "conditions": {
    "fundsLocked": false,
    "procurementCompleted": false,
    "billApproved": false,
    "deliveryVerified": false,
    "requiredApprovalsComplete": false
  },
  "humanApprovalRequired": true
}

Confidence must be between 0 and 1.

If required information is missing or contradictory,
return NEEDS_REVIEW rather than assuming the condition is satisfied.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const result = parseAIJson(response.text);

    return res.json({
      success: true,
      releaseCheck: result,
    });
  } catch (error) {
    console.error("GEMINI RELEASE CHECK ERROR");
    console.error(error);

    return res.status(500).json({
      error: "Failed to check smart contract release readiness.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| EXISTING CAMPAIGN GENERATION
|--------------------------------------------------------------------------
|
| Kept temporarily so the existing frontend does not break.
|
*/
router.post("/generate-campaign", async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        error: "Title, category and description are required.",
      });
    }

    const prompt = `
You are an AI assistant helping NGOs create clear, trustworthy fundraising
campaign descriptions.

Never invent:
- facts
- statistics
- beneficiaries
- locations
- financial information

Campaign title:
${title}

Campaign category:
${category}

Current description:
${description}

Improve the campaign description for a public fundraising platform.

Keep all facts supplied by the NGO.
Do not invent information.
Make the purpose, need and expected impact clear.

Return only the improved campaign description.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return res.json({
      success: true,
      description: response.text,
    });
  } catch (error) {
    console.error("GEMINI CAMPAIGN GENERATION ERROR");
    console.error(error);

    return res.status(500).json({
      error: "Failed to generate AI campaign description.",
      details: error.message,
    });
  }
});

module.exports = router;