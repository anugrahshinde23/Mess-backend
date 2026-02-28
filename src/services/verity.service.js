import Groq from 'groq-sdk';

const groq_api_key = process.env.GROQ_API;
// Instance ko bahar rakhein (Re-usable)
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {


   const {msg} = verityData

    try {
        const completion = await groq.chat.completions.create({ // Fixed: completions
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
                { role: "user", content: msg }
              ],
            model: "llama-3.1-8b-instant",
        });

        return completion;
    } catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
};
