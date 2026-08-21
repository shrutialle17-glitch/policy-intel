const prisma = require('../prismaClient');
const { downloadFile } = require('./supabaseService');
const { extractPdfPages } = require('./pdfExtractionService');
const { chunkPages } = require('./chunkingService');
const { generateEmbeddingsBatch } = require('./embeddingService');

exports.processPolicy = async (policyId) => {
  console.log(`[Pipeline Start] Processing policy ${policyId}...`);
  try {
    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) throw new Error('Policy not found');

    // 1. Fetch PDF from Supabase Storage
    console.log(`[Pipeline] Downloading file: ${policy.fileUrl}`);
    const fileBuffer = await downloadFile(policy.fileUrl);

    // 2. Extract Text Page by Page
    console.log(`[Pipeline] Extracting text...`);
    const pages = await extractPdfPages(fileBuffer);
    console.log(`[Pipeline] Extracted ${pages.length} pages.`);
    if (pages.length === 0) throw new Error('No readable text found in PDF');

    // 3. Chunk Text
    console.log(`[Pipeline] Chunking text...`);
    let chunks = chunkPages(pages);
    console.log(`[Pipeline] Generated ${chunks.length} chunks.`);

    // 4. Generate Embeddings
    console.log(`[Pipeline] Generating embeddings for ${chunks.length} chunks...`);
    chunks = await generateEmbeddingsBatch(chunks);
    console.log(`[Pipeline] Embeddings generated successfully.`);

    // 5. Store in pgvector (executeRaw for each chunk due to vector type)
    console.log(`[Pipeline] Storing chunks in database...`);
    
    // We do this sequentially or in a transaction. Let's do a transaction array of raw queries.
    const queries = chunks.map(chunk => {
      // Format vector array as string '[0.1, 0.2, ...]'
      const vectorStr = `[${chunk.embedding.join(',')}]`;
      return prisma.$executeRaw`
        INSERT INTO "PolicyChunk" (id, "policyId", content, "pageNumber", "chunkIndex", embedding, "createdAt")
        VALUES (
          gen_random_uuid(),
          ${policyId},
          ${chunk.chunkText},
          ${chunk.pageNumber},
          ${chunk.chunkIndex},
          ${vectorStr}::vector,
          NOW()
        )
      `;
    });
    
    await prisma.$transaction(queries);
    console.log(`[Pipeline] Inserted ${chunks.length} chunks into database.`);

    // 6. Update Status to READY
    await prisma.policy.update({
      where: { id: policyId },
      data: { status: 'READY', errorMessage: null }
    });
    console.log(`[Pipeline Success] Policy ${policyId} is now READY.`);

  } catch (err) {
    console.error(`[Pipeline Error] Failed to process policy ${policyId}:`, err);
    await prisma.policy.update({
      where: { id: policyId },
      data: { 
        status: 'FAILED',
        errorMessage: err.message || 'Unknown processing error'
      }
    });
  }
};
