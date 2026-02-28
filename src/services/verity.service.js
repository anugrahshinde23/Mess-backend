import Groq from 'groq-sdk';

const groq_api_key = process.env.GROQ_API;
// Instance ko bahar rakhein (Re-usable)
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {


   const {message} = verityData

    try {
        const completion = await groq.chat.completions.create({ // Fixed: completions
            messages: [{ role: "user", content: message }],
            model: "llama-3.1-8b-instant",
        });

        return completion;
    } catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
};
