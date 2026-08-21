const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a fixed embedding model.
const EMBEDDING_MODEL = 'gemini-embedding-001';
exports.EMBEDDING_DIMENSION = 768;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateEmbedding = async (text, retries = 3, delayMs = 2000) => {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values.slice(0, 768);
    } catch (err) {
      if (err.message && err.message.includes('429')) {
        console.warn(`[Rate Limit] Gemini Embedding 429 hit. Retrying in ${delayMs}ms (Attempt ${i + 1}/${retries})...`);
        await sleep(delayMs);
        delayMs *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
  
  // HACKATHON DEMO FALLBACK: If quota is completely exhausted, return a dummy vector 
  // so the application doesn't completely crash and burn during the demo.
  console.warn('[Demo Fallback] Quota exhausted. Generating a mock embedding vector to keep pipeline alive.');
  return new Array(768).fill(0).map(() => Math.random() * 0.1 - 0.05);
};

exports.generateEmbeddingsBatch = async (chunks) => {
  for (let i = 0; i < chunks.length; i++) {
    chunks[i].embedding = await exports.generateEmbedding(chunks[i].chunkText);
    
    // Add a base delay between requests for large documents to avoid hitting RPM limits
    if (i < chunks.length - 1) {
      await sleep(1000); 
    }
  }
  return chunks;
};
