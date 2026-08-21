const prisma = require('../prismaClient');
const { downloadFile } = require('./supabaseService');
const { extractPdfPages } = require('./pdfExtractionService');
const { chunkPages } = require('./chunkingService');
const { generateEmbeddingsBatch } = require('./embeddingService');

exports.processTender = async (tenderId) => {
  console.log(`[Tender Pipeline Start] Processing tender ${tenderId}...`);
  try {
    const tender = await prisma.tenderDocument.findUnique({ where: { id: tenderId } });
    if (!tender) throw new Error('Tender not found');

    // 1. Fetch PDF from Supabase Storage
    console.log(`[Tender Pipeline] Downloading file: ${tender.fileUrl}`);
    const fileBuffer = await downloadFile(tender.fileUrl);

    // 2. Extract Text Page by Page
    console.log(`[Tender Pipeline] Extracting text...`);
    const pages = await extractPdfPages(fileBuffer);
    console.log(`[Tender Pipeline] Extracted ${pages.length} pages.`);
    if (pages.length === 0) throw new Error('No readable text found in PDF');

    // 3. Chunk Text
    console.log(`[Tender Pipeline] Chunking text...`);
    let chunks = chunkPages(pages);
    console.log(`[Tender Pipeline] Generated ${chunks.length} chunks.`);

    // 4. Generate Embeddings
    console.log(`[Tender Pipeline] Generating embeddings for ${chunks.length} chunks...`);
    chunks = await generateEmbeddingsBatch(chunks);
    console.log(`[Tender Pipeline] Embeddings generated successfully.`);

    // 5. Clear old chunks (for retry logic safety) and Store in pgvector
    console.log(`[Tender Pipeline] Storing chunks in database...`);
    
    const queries = [];
    // Safely delete existing chunks for this tender if any
    queries.push(prisma.$executeRaw`DELETE FROM "TenderChunk" WHERE "tenderId" = ${tenderId}`);
    
    // We do this sequentially or in a transaction. Let's do a transaction array of raw queries.
    for (const chunk of chunks) {
      const vectorStr = `[${chunk.embedding.join(',')}]`;
      queries.push(prisma.$executeRaw`
        INSERT INTO "TenderChunk" (id, "tenderId", content, "pageNumber", "chunkIndex", embedding, "createdAt")
        VALUES (
          gen_random_uuid(),
          ${tenderId},
          ${chunk.chunkText},
          ${chunk.pageNumber},
          ${chunk.chunkIndex},
          ${vectorStr}::vector,
          NOW()
        )
      `);
    }
    
    await prisma.$transaction(queries);
    console.log(`[Tender Pipeline] Inserted ${chunks.length} chunks into database.`);

    // 6. Update Status to READY
    await prisma.tenderDocument.update({
      where: { id: tenderId },
      data: { status: 'READY', processingError: null }
    });
    console.log(`[Tender Pipeline Success] Tender ${tenderId} is now READY.`);

  } catch (err) {
    console.error(`[Tender Pipeline Error] Failed to process tender ${tenderId}:`, err);
    await prisma.tenderDocument.update({
      where: { id: tenderId },
      data: { 
        status: 'FAILED',
        processingError: err.message || 'Unknown processing error'
      }
    });
    // Attempt to delete any partial chunks just in case transaction wasn't completely atomic in a weird failure mode
    try {
      await prisma.$executeRaw`DELETE FROM "TenderChunk" WHERE "tenderId" = ${tenderId}`;
    } catch(e) {
      console.error(`[Tender Cleanup Error] Failed to delete chunks for ${tenderId}:`, e);
    }
  }
};
