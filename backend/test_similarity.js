require('dotenv').config();
const prisma = require('./prismaClient');
const { generateEmbedding } = require('./services/embeddingService');

async function test() {
  const question = "tell me Finance of tender";
  const queryEmbedding = await generateEmbedding(question);
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  const tenderId = "69ab00cd-0283-49a2-a1b2-e6519390e796";
  const results = await prisma.$queryRaw`
    SELECT tc.id, tc."pageNumber", LEFT(tc.content, 100) as content,
           1 - (tc.embedding <=> ${vectorStr}::vector) as similarity
    FROM "TenderChunk" tc
    WHERE tc."tenderId" = ${tenderId}
    ORDER BY similarity DESC
    LIMIT 5
  `;
  
  console.log("Similarity scores for tender:");
  results.forEach(r => {
    console.log(`Page ${r.pageNumber} - Sim: ${r.similarity.toFixed(4)} - ${r.content.replace(/\n/g, ' ')}`);
  });
}
test().catch(console.error).finally(() => prisma.$disconnect());
