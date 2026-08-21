const pdf = require('pdf-parse');

exports.extractPdfPages = async (buffer) => {
  const pages = [];
  
  const render_page = async (pageData) => {
    // Disable normalization to preserve raw text flow if desired,
    // but normalizeWhitespace: true usually helps with clean chunking.
    const render_options = {
      normalizeWhitespace: true,
      disableCombineTextItems: false
    };
    
    const textContent = await pageData.getTextContent(render_options);
    const text = textContent.items.map(item => item.str).join(' ');
    pages.push(text);
    return text;
  };

  await pdf(buffer, { pagerender: render_page });
  
  return pages.map((text, idx) => ({
    pageNumber: idx + 1,
    text: text.replace(/\s+/g, ' ').trim()
  })).filter(p => p.text.length > 0);
};
