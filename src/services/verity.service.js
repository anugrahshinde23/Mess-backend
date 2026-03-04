import Groq from "groq-sdk";
import VerityChat from "../models/verity/verity.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import Plan from "../models/plan.model.js";
import User from "../models/user.model.js";

const fetchContextData = async (intent, userId) => {
  let context = "";

  if (intent === "ORDER") {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    context += `User Orders:\n${JSON.stringify(orders, null, 2)}\n`;
  }

  if (intent === "WALLET") {
    const wallet = await Wallet.findOne({ user: userId });

    context += `Wallet Info:\n${JSON.stringify(wallet, null, 2)}\n`;
  }

  if (intent === "SUBSCRIPTION") {
    const subscription = await Subscription.findOne({ user: userId });

    context += `Subscription Info:\n${JSON.stringify(subscription, null, 2)}\n`;
  }

  if (intent === "MENU") {
    const menu = await Menu.find();

    context += `Menu:\n${JSON.stringify(menu, null, 2)}\n`;
  }

  if (intent === "PLAN") {
    const plans = await Plan.find();

    context += `Plans:\n${JSON.stringify(plans, null, 2)}\n`;
  }

  return context;
};

const detectIntent = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("order")) return "ORDER";
  if (msg.includes("subscription")) return "SUBSCRIPTION";
  if (msg.includes("menu")) return "MENU";
  if (msg.includes("plan")) return "PLAN";
  if (msg.includes("payment")) return "PAYMENT";

  return "GENERAL";
};

const groq_api_key = process.env.GROQ_API;
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {
  // 1. Get history from the request body
  const { history, user, contextData } = verityData;

  let systemPrompt = `You are Verity AI, created by Anugrah.
              You are a smart conversational assistant.

              You are the intelligent assistant of our messmate platform which is a multimess website.
              
              Rules:
              - Reply like ChatGPT.
              - Be short, clear, and conversational.
              - Avoid long blog-style answers.
              - Use simple structure.
              - Ask follow-up questions when useful.
              - Use database context if provided.
- Personalize responses using user details.
- If no data found, clearly say so.
- Keep replies short and conversational.


User Details:
${user ? JSON.stringify(user, null, 2) : ""}



Database Context:
${contextData || ""}
              `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        // 2. SPREAD the history here.
        // This inserts all previous messages into the prompt.
        ...history.filter(
          (m) =>
            m.role && typeof m.content === "string" && m.content.trim() !== ""
        ),
      ],
      model: "llama-3.1-8b-instant",
    });

    return completion;
  } catch (error) {
    throw new Error(`Groq API Error: ${error.message}`);
  }
};

export const createNewChat = async (userId) => {
  const chat = await VerityChat.create({
    user: userId,
    messages: [],
  });

  await chat.save();

  return chat;
};

export const sendMessage = async (verityData) => {
  const { chatId, message } = verityData;

  const chat = await VerityChat.findById(chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  const userId = chat.user;

  // Save user message
  chat.messages.push({
    role: "user",
    text: message,
  });

  const intent = detectIntent(message);

  const contextData = await fetchContextData(intent, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const history = chat.messages.map((m) => ({
    role: m.role,
    content: m.text,
  }));

  const response = await askVerity({
    history,
    user,
    contextData,
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
  const chat = await VerityChat.findById(chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  return chat;
};

export const getAllChats = async (userId) => {
  console.log(userId);

  const chats = await VerityChat.find({
    user: userId,
  });

  return chats;
};

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
    _id: chatId,
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return chat;
};
