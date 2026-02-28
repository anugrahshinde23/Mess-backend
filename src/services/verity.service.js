import Groq from 'groq-sdk';

const groq_api_key = process.env.GROQ_API;
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {
    // 1. Get history from the request body
    const { history } = verityData;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `
              You are Verity AI, created by Anugrah.
              You are a smart conversational assistant.
              
              Rules:
              - Reply like ChatGPT.
              - Be short, clear, and conversational.
              - Avoid long blog-style answers.
              - Use simple structure.
              - Ask follow-up questions when useful.
              `
                },
                // 2. SPREAD the history here. 
                // This inserts all previous messages into the prompt.
                ...history.filter(
      m => m.role && typeof m.content === "string" && m.content.trim() !== ""
                )
            ],
            model: "llama-3.1-8b-instant",
        });

        return completion;
    } catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
};