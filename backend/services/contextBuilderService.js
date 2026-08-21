// Estimates token length (roughly 4 chars = 1 token for English text)
const estimateTokens = (text) => Math.ceil(text.length / 4);

exports.buildContext = (chunks, tokenBudget = 6000) => {
  let currentTokens = 0;
  let builtContext = '';
  const includedChunks = [];

  for (const chunk of chunks) {
    const chunkText = `[Excerpt — Source: ${chunk.sourceTitle}, Page ${chunk.pageNumber}]\n${chunk.content}\n\n`;
    const tokens = estimateTokens(chunkText);
    
    if (currentTokens + tokens > tokenBudget) {
      break;
    }

    builtContext += chunkText;
    currentTokens += tokens;
    includedChunks.push(chunk);
  }

  return { contextText: builtContext.trim(), includedChunks };
};
