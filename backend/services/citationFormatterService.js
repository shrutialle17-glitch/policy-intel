exports.formatResponse = (answer, chunks, source = 'policy') => {
  const grounded = chunks.length > 0;
  
  const isTender = source === 'tender';

  return {
    answer: grounded ? answer : (isTender ? "This information could not be found in the uploaded document." : "This information could not be found in the available documents."),
    grounded,
    citations: chunks.map(chunk => ({
      sourceId: chunk.sourceId,
      sourceTitle: chunk.sourceTitle,
      pageNumber: chunk.pageNumber,
      chunkText: chunk.content,
      similarityScore: chunk.similarity,
      citationType: isTender ? 'tender' : 'policy',
      sourceLabel: isTender ? 'Uploaded Tender' : chunk.sourceTitle
    }))
  };
};
