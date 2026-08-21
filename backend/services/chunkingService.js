/**
 * Chunks a list of pages into smaller text segments.
 * Target chunk size: ~500-800 tokens (~2000-3000 chars)
 * Overlap: ~100 tokens (~400 chars)
 */
exports.chunkPages = (pages) => {
  const CHUNK_SIZE = 2500; // Target ~600 tokens
  const OVERLAP = 400;     // ~100 tokens

  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    let text = page.text;
    let pageNum = page.pageNumber;

    if (text.length <= CHUNK_SIZE) {
      chunks.push({
        chunkText: text,
        pageNumber: pageNum,
        chunkIndex: chunkIndex++
      });
      continue;
    }

    let startIndex = 0;
    while (startIndex < text.length) {
      // Find a good breaking point (e.g., end of sentence) near CHUNK_SIZE
      let endIndex = startIndex + CHUNK_SIZE;
      
      if (endIndex < text.length) {
        // Try to find a period or newline to split cleanly
        let nextPeriod = text.indexOf('. ', endIndex - 200);
        if (nextPeriod !== -1 && nextPeriod < endIndex + 200) {
          endIndex = nextPeriod + 1;
        } else {
          let lastSpace = text.lastIndexOf(' ', endIndex);
          if (lastSpace > startIndex + OVERLAP) {
            endIndex = lastSpace;
          }
        }
      } else {
        endIndex = text.length;
      }

      chunks.push({
        chunkText: text.substring(startIndex, endIndex).trim(),
        pageNumber: pageNum,
        chunkIndex: chunkIndex++
      });

      startIndex = endIndex - OVERLAP;
      if (endIndex >= text.length) break;
      // Prevent infinite loops if OVERLAP is somehow larger than the text advancement
      if (startIndex >= text.length || endIndex <= startIndex + OVERLAP / 2) break; 
    }
  }

  return chunks;
};
