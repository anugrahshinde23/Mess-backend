import Groq from 'groq-sdk';

const groq_api_key = process.env.GROQ_API;
// Instance ko bahar rakhein (Re-usable)
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {


   const {msg} = verityData

    try {
        const completion = await groq.chat.completions.create({ // Fixed: completions
            messages: [{ role: "user", content: msg }, {
                role : "system",
                content : ` You are Verity AI, created by Anugrah a smart conversational assistant.
  - Respond naturally like ChatGPT.
  - Keep answers structured but not like a blog.
  - Avoid long introductions.
  - Be helpful, friendly, and human-like.
  - Use short paragraphs.
  - Ask follow-up questions when useful.
  `
            }],
            model: "llama-3.1-8b-instant",
        });

        return completion;
    } catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
};
