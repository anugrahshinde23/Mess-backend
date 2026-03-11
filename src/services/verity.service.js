import Groq from "groq-sdk";
import VerityChat from "../models/verity/verity.model.js";
import { getVectorStore } from "../../rag/retriever.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Order from "../models/order.model.js";
import Mess from "../models/mess.model.js";
import DeliveryBoy from "../models/deliveryBoy.model.js";
import Menu from "../models/menu.model.js";
import DeliveryBoyRequest from "../models/deliveryBoyRequest.model.js";



const groq_api_key = process.env.GROQ_API;
const groq = new Groq({ apiKey: groq_api_key });

export const askVerity = async (verityData) => {
  // 1. Get history from the request body
  const { history, context, privateContext } = verityData;

  const now = new Date();
  const dateOptions = { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };
  const dayOptions = { weekday: 'long', timeZone: 'Asia/Kolkata' };
  
  const formattedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(now);
  const currentDay = new Intl.DateTimeFormat('en-IN', dayOptions).format(now);
  const currentTime = now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });




  let systemPrompt = `You are Verity AI, created by Anugrah.
  You are a smart conversational assistant for the Messmate platform.
  
  PRIVATE CONTEXT:
  ${privateContext}
  
  REAL-TIME STATUS:
  - Today's Day: ${currentDay}
  - Today's Date: ${formattedDate}
  - Current Time: ${currentTime}
  
  CONTEXT FROM DATABASE:
  ${context || "No specific mess data found for this query."}
  
  CORE RULES:
  - Use the DATABASE CONTEXT above to answer questions about Messes, Menus, and Plans.
  - If a question is NOT about messes (like the T20 World Cup or general facts), use your INTERNAL KNOWLEDGE to answer.
  - Reply like ChatGPT: be short, clear, and conversational.
  - Personalize responses using user details from the private context.
  - Avoid long blog-style answers; use simple structures.
  - Always ask a follow-up question to keep the chat going.
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

  
   let contextText = "";
   let connection;
   try {
       const { vectorStore, client } = await getVectorStore();
       connection = client;
       const results = await vectorStore.similaritySearch(message, 10);
       contextText = results.map(r => r.pageContent).join("\n\n");
   } catch (err) {
       console.error("RAG Search Error:", err);
   } finally {
       if (connection) await connection.close(); // Important for Render RAM!
   }
 


  const user = await User.findById(chat.user);
  if(!user){
    throw new Error("User not found")
  }
  let privateContext = `User: ${user.name}, Role: ${user.role}\n`;

 
  if (user.role === 'CUSTOMER') {
    const sub = await Subscription.findOne({ user: user._id, status: 'ACTIVE' }).populate('plan mess approvedBy');
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).populate('mess payment');
    
    privateContext += `
    - Subscription: ${sub ? `${sub.plan.type} at ${sub.mess.name} (Approved by: ${sub.approvedBy?.name})` : "No active subscription"}
    - Recent Orders: ${orders.map(o => `${o.mess.name}: Status ${o.status}, Payment: ${o.payment?.status}`).join(" | ") || "No orders"}
    `;
  }

  if (user.role === 'MESS_OWNER') {
    const mess = await Mess.findOne({ owner: user._id }).populate('plan.plan deliveryPartners');
    if (mess) {
      const activeSubs = await Subscription.find({ mess: mess._id, status: 'ACTIVE' }).populate('user');
      const pendingOrders = await Order.find({ mess: mess._id, status: 'PLACED' });
      const dboys = await DeliveryBoy.find({ workingMesses: mess._id }).populate('user');
    
      privateContext += `
      - Your Mess: ${mess.name}, Address: ${mess.address}
      - Delivery Partners: ${dboys.map(d => `name: ${d.user.name}, phone: (${d.user.phone})`).join(', ') || 'None assigned'}
      - Current Business: ${activeSubs.length} active subscribers.
      - Pending Tasks: You have ${pendingOrders.length} orders placed.
      `;
    }
  }


  if (user.role === 'DELIVERY_BOY') {
    const dboy = await DeliveryBoy.findOne({ user: user._id }).populate('activeOrder subscriptionOrders');
    privateContext += `
    - Service Areas: ${dboy?.servicePinCodes?.join(", ") || "Not specified"}
    - Active Task: ${dboy?.activeOrder ? `Delivering Order ID: ${dboy.activeOrder._id}` : "No current active order."}
    - Subscription Deliveries: ${dboy?.subscriptionOrders?.length || 0} tasks assigned.
    `;
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
    history,
    context : contextText,
    privateContext
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
