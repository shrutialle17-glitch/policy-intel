const { generateEmbedding } = require('./embeddingService');
const { retrieveRelevantChunks } = require('./vectorRetrievalService');
const { buildContext } = require('./contextBuilderService');
const { generateGroundedAnswer } = require('./aiGenerationService');
const { formatResponse } = require('./citationFormatterService');

exports.answerQuestion = async ({ question, source, tenderId, userId, topK = 8, minSimilarity = 0.7 }) => {
  const queryEmbedding = await generateEmbedding(question);
  
  const chunks = await retrieveRelevantChunks({ queryEmbedding, source, tenderId, userId, topK, minSimilarity });
  
  if (chunks.length === 0) {
    return formatResponse('', [], source);
  }

  const { contextText, includedChunks } = buildContext(chunks, 6000);

  if (includedChunks.length === 0) {
    return formatResponse('', [], source);
  }

  const answer = await generateGroundedAnswer(question, contextText);

  return formatResponse(answer, includedChunks, source);
};
