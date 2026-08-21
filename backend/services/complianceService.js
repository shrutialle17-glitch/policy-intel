const prisma = require('../prismaClient');
const { generateEmbedding } = require('./embeddingService');
const { retrieveRelevantChunks } = require('./vectorRetrievalService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseJSONWithRetry = async (model, prompt, retryPrompt, isArray = false) => {
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // basic cleanup
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Compliance] JSON parse failed, retrying...');
    try {
      const retryResult = await model.generateContent(prompt + "\n\n" + retryPrompt);
      let text = retryResult.response.text().trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      return JSON.parse(text);
    } catch (err2) {
      console.error('[Compliance] JSON retry failed');
      return null; // Return null to indicate failure
    }
  }
};

exports.runComplianceAnalysis = async (analysisId, tenderId, userId, policyScopeCategories) => {
  try {
    await prisma.complianceAnalysis.update({
      where: { id: analysisId },
      data: { status: 'ANALYZING' }
    });

    // Determine query
    const queryStr = `Procurement rules, requirements, and compliance guidelines for ${policyScopeCategories.join(', ')}`;
    const queryEmbedding = await generateEmbedding(queryStr);

    // STAGE A - Requirement Extraction
    const policyChunks = await retrieveRelevantChunks({
      queryEmbedding,
      source: 'policy',
      categories: policyScopeCategories,
      topK: 25,
      minSimilarity: 0.65 // Broad retrieval
    });

    const extractionModel = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite',
      systemInstruction: 'You are an expert policy analyst. Return ONLY valid JSON matching this exact schema, no markdown formatting, no extra text.' 
    });

    let allRequirements = [];

    // Process chunks to extract requirements
    for (const chunk of policyChunks) {
      const prompt = `From ONLY this policy excerpt, extract any discrete, checkable procurement requirements. Do not infer requirements not explicitly stated. Return an empty list if none exist.
Also assign each extracted requirement a short category label (e.g., "Vendor Eligibility", "Bid Evaluation", "Reporting Requirements", "Documentation").
Output must be structured JSON:
{
  "requirements": [
    { 
      "requirementText": "string", 
      "requirementCategory": "string",
      "policyPageNumber": number, 
      "policyExcerpt": "string" 
    }
  ]
}

Policy Title: ${chunk.sourceTitle}
Page: ${chunk.pageNumber}
Excerpt: ${chunk.content}`;

      const retryPrompt = `You must return ONLY valid JSON matching the exact schema above. No extra text or markdown formatting.`;
      
      const res = await parseJSONWithRetry(extractionModel, prompt, retryPrompt);
      if (res && res.requirements && Array.isArray(res.requirements)) {
        res.requirements.forEach(req => {
          allRequirements.push({
            ...req,
            sourcePolicyId: chunk.sourceId,
            sourcePolicyTitle: chunk.sourceTitle
          });
        });
      }
    }

    // Basic deduplication (exact text match for simplicity)
    const uniqueReqs = [];
    const seen = new Set();
    for (const req of allRequirements) {
      if (!seen.has(req.requirementText)) {
        seen.add(req.requirementText);
        uniqueReqs.push(req);
      }
    }

    let compliantCount = 0;
    let missingCount = 0;
    let needsReviewCount = 0;

    const evaluationModel = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: 'You are a compliance checker evaluating a tender document. Return ONLY valid JSON matching the exact schema provided. Do not use outside knowledge or make assumptions.'
    });

    // STAGE B - Evidence Matching
    for (const req of uniqueReqs) {
      const reqEmbedding = await generateEmbedding(req.requirementText);
      const tenderChunks = await retrieveRelevantChunks({
        queryEmbedding: reqEmbedding,
        source: 'tender',
        tenderId,
        userId,
        topK: 4,
        minSimilarity: 0.65 // We will check max similarity in results
      });

      let findingData = {
        analysisId,
        requirementText: req.requirementText,
        requirementCategory: req.requirementCategory || 'General Requirements',
        sourcePolicyId: req.sourcePolicyId,
        sourcePolicyTitle: req.sourcePolicyTitle,
        policyPageNumber: req.policyPageNumber || 1,
        policyExcerpt: req.policyExcerpt,
      };

      if (tenderChunks.length === 0) {
        // High confidence missing
        findingData = {
          ...findingData,
          tenderEvidenceText: null,
          tenderPageNumber: null,
          status: 'MISSING',
          explanation: 'No corresponding clause found in the tender.',
          recommendation: 'Update the tender document to explicitly include this requirement.',
          confidence: 'HIGH',
          confidenceScore: 0.0
        };
      } else {
        const topScore = tenderChunks[0].similarity;
        const excerptsText = tenderChunks.map(c => `Page ${c.pageNumber}: ${c.content}`).join('\n\n');

        const prompt = `You are comparing ONE specific procurement requirement against excerpts from a tender document. 
Requirement: ${req.requirementText} (Source: ${req.sourcePolicyTitle}, page ${req.policyPageNumber}).

Tender excerpts:
${excerptsText}

Based ONLY on these excerpts, determine:
- COMPLIANT: the tender excerpt(s) clearly and explicitly satisfy the requirement
- NEEDS_REVIEW: the tender contains related content but it does not clearly or fully satisfy the requirement, or satisfaction is ambiguous

Return structured JSON only:
{
  "status": "COMPLIANT" | "NEEDS_REVIEW",
  "tenderEvidenceText": "string (the exact excerpt used, or most relevant part)",
  "tenderPageNumber": number (the page it was found on),
  "explanation": "string",
  "recommendation": "string | null (required if NEEDS_REVIEW)",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`;
        
        const retryPrompt = `Return ONLY valid JSON matching this exact schema, no markdown formatting, no extra text.`;
        
        const evalRes = await parseJSONWithRetry(evaluationModel, prompt, retryPrompt);
        
        if (!evalRes || !['COMPLIANT', 'NEEDS_REVIEW'].includes(evalRes.status)) {
          // Soft failure
          findingData = {
            ...findingData,
            tenderEvidenceText: tenderChunks[0].content,
            tenderPageNumber: tenderChunks[0].pageNumber,
            status: 'NEEDS_REVIEW',
            explanation: 'Automated analysis could not confidently evaluate this requirement — manual review recommended.',
            recommendation: 'Manually review this requirement against the provided tender evidence.',
            confidence: 'LOW',
            confidenceScore: topScore
          };
        } else {
          // Adjust confidence based on prompt rules
          let finalConfidence = evalRes.confidence || 'MEDIUM';
          if (topScore >= 0.85 && evalRes.status === 'COMPLIANT') {
            finalConfidence = 'HIGH';
          } else if (topScore < 0.7) {
            finalConfidence = 'LOW';
          } else if (topScore >= 0.7 && topScore < 0.85 && finalConfidence === 'HIGH') {
            finalConfidence = 'MEDIUM';
          }

          findingData = {
            ...findingData,
            tenderEvidenceText: evalRes.tenderEvidenceText,
            tenderPageNumber: evalRes.tenderPageNumber || tenderChunks[0].pageNumber,
            status: evalRes.status,
            explanation: evalRes.explanation,
            recommendation: evalRes.recommendation || null,
            confidence: finalConfidence,
            confidenceScore: topScore
          };
        }
      }

      // Update counters
      if (findingData.status === 'COMPLIANT') compliantCount++;
      else if (findingData.status === 'MISSING') missingCount++;
      else needsReviewCount++;

      // Save finding
      await prisma.complianceFinding.create({ data: findingData });
    }

    const totalFindings = uniqueReqs.length;
    let overallScore = 0;
    if (totalFindings > 0) {
      overallScore = Math.round((compliantCount / totalFindings) * 100);
    }

    await prisma.complianceAnalysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        overallScore,
        compliantCount,
        missingCount,
        needsReviewCount,
        completedAt: new Date()
      }
    });

  } catch (err) {
    console.error('[Compliance Error] Systemic failure:', err);
    await prisma.complianceAnalysis.update({
      where: { id: analysisId },
      data: { status: 'FAILED' }
    });
  }
};
