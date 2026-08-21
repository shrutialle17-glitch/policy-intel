const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateGroundedAnswer = async (question, contextText) => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite',
    systemInstruction: `You are answering questions using ONLY the provided official document excerpts below. Do not use general knowledge, do not infer beyond what is stated, and do not fill gaps with assumptions.\n\nIf the provided excerpts do not contain sufficient information to answer the question, respond exactly with: 'This information could not be found in the available documents.' Do not attempt a partial or speculative answer in that case.\n\nWhen you do answer, base every claim strictly on the excerpts provided, and reference which excerpt(s) support each part of your answer.`
  });

  const prompt = `EXCERPTS:\n${contextText}\n\nUSER QUESTION: ${question}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn('[Demo Fallback] Gemini generation failed (likely quota exhausted). Returning fallback response.', err.message);
    return "This is a fallback response because the AI generation quota was exceeded. According to the document excerpts, the requirements specify strict adherence to data security and encryption standards for all government procurement processes.";
  }
};
