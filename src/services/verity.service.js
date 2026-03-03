import Groq from 'groq-sdk';
import VerityChat from '../models/verity/verity.model.js';


const groq_api_key = process.env.GROQ_API;
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {
    // 1. Get history from the request body
    const { history } = verityData;

    let systemPrompt = `You are Verity AI, created by Anugrah.
              You are a smart conversational assistant.
              
              Rules:
              - Reply like ChatGPT.
              - Be short, clear, and conversational.
              - Avoid long blog-style answers.
              - Use simple structure.
              - Ask follow-up questions when useful.`

             

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
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

export const createNewChat = async (userId ) => {

  

    const chat = await VerityChat.create({
        user : userId,
        messages : []
    })

      await chat.save()

    return chat
}

export const sendMessage = async (verityData) => {
    const { chatId, message } = verityData;
  
    const chat = await VerityChat.findById(chatId);
  
    if (!chat) {
      throw new Error("Chat not found");
    }
  
    // Save user message
    chat.messages.push({
      role: "user",
      text: message,
    });
  
    const history = chat.messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));
  
    const response = await askVerity({
      history
    });
  
    const aiReply = response.choices[0].message.content;
  
    chat.messages.push({
      role: "assistant",
      text: aiReply,
    });
  
    await chat.save();
  
    return aiReply;
  };

export const getChat = async (chatId) => {
    const chat = await VerityChat.findById(chatId)

    if(!chat) {
        throw new Error("Chat not found")
    }

    return chat
}

export const getAllChats = async (userId) => {
    console.log(userId);
    
    const chats = await VerityChat.find({
        user : userId
    })

    return chats
}

export const updateChatTitle = async (chatId, title) => {


    console.log("Updating title for:", chatId);

    if (!chatId) {
      throw new Error("Chat ID missing");
    }
  
    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
  
    const chat = await VerityChat.findById(chatId);
  
    if (!chat) {
      throw new Error("Chat not found");
    }
  
    chat.title = title.trim();
    await chat.save();
  
    return chat;
  };


export const deleteChat = async (chatId) => {
    const chat = await VerityChat.findOneAndDelete({
        _id : chatId
    })

    if(!chat){
        throw new Error("Chat not found")
    }

    return chat


}