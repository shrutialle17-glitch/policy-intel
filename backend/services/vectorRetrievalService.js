const prisma = require('../prismaClient');

exports.retrieveRelevantChunks = async ({ queryEmbedding, source, tenderId, userId, categories, topK = 8, minSimilarity = 0.7 }) => {
  const vectorStr = `[${queryEmbedding.join(',')}]`;
  let results = [];

  if (source === 'policy') {
    if (categories && categories.length > 0) {
      results = await prisma.$queryRaw`
        SELECT pc.id, pc.content, pc."pageNumber", p.title as "sourceTitle", p.id as "sourceId",
               1 - (pc.embedding <=> ${vectorStr}::vector) as similarity
        FROM "PolicyChunk" pc
        JOIN "Policy" p ON pc."policyId" = p.id
        WHERE p.status = 'READY'
        AND p.category = ANY(${categories})
        AND 1 - (pc.embedding <=> ${vectorStr}::vector) >= ${minSimilarity}
        ORDER BY similarity DESC
        LIMIT ${topK}
      `;
    } else {
      results = await prisma.$queryRaw`
        SELECT pc.id, pc.content, pc."pageNumber", p.title as "sourceTitle", p.id as "sourceId",
               1 - (pc.embedding <=> ${vectorStr}::vector) as similarity
        FROM "PolicyChunk" pc
        JOIN "Policy" p ON pc."policyId" = p.id
        WHERE p.status = 'READY'
        AND 1 - (pc.embedding <=> ${vectorStr}::vector) >= ${minSimilarity}
        ORDER BY similarity DESC
        LIMIT ${topK}
      `;
    }
  } else if (source === 'tender') {
    if (!tenderId || !userId) {
      throw new Error('tenderId and userId are required for tender source');
    }
    
    // Ownership check
    const tender = await prisma.tenderDocument.findUnique({
      where: { id: tenderId }
    });
    if (!tender || tender.userId !== userId) {
      throw new Error('Unauthorized or tender not found');
    }

    results = await prisma.$queryRaw`
      SELECT tc.id, tc.content, tc."pageNumber", t.title as "sourceTitle", t.id as "sourceId",
             1 - (tc.embedding <=> ${vectorStr}::vector) as similarity
      FROM "TenderChunk" tc
      JOIN "TenderDocument" t ON tc."tenderId" = t.id
      WHERE tc."tenderId" = ${tenderId}
      AND 1 - (tc.embedding <=> ${vectorStr}::vector) >= 0.55
      ORDER BY similarity DESC
      LIMIT ${topK}
    `;
  } else {
    throw new Error(`Invalid source: ${source}`);
  }

  return results;
};
