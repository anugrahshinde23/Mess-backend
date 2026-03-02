import { askVerity, createNewChat, deleteChat, getAllChats, getChat, sendMessage, updateChatTitle } from "../services/verity.service.js";

export const askVerityQuestion = async (req, res) => {
    try {
        
        
    
        

        const data = await askVerity(req.body);

        return res.status(200).json({
            success: true,
            message: "Successfully asked question",
            reply: data.choices[0]?.message?.content || "No response from AI"
        });
    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ // Changed to 500 for Server Error
            success: false,
            message: error.message
        });
    }
};


export const createNewChatForUser = async (req,res) => {
    try {
        const userId = req.user.id
        
        const data = await createNewChat(userId)

        return res.status(200).json({
            success : true,
            message : "Successfully created new chat",
            chatData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const sendMessageForUser = async(req,res) => {
    try {
        const data = await sendMessage(req.body)

        return res.status(200).json({
            success : true,
            message : "Successfully sent message",
            reply : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}


export const getChatForUser = async(req,res) => {
    try {
        const chatId = req.params.chatId

        const data = await getChat(chatId)

        return res.status(200).json({
            success : true,
            message : "Successfully fetched the chats",
            chatData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getAllChatsOfUser = async (req,res) => {
    try {
        const userId = req.user.id
        console.log(userId);
        
        const data = await getAllChats(userId)

        return res.status(200).json( {
            success : true,
            message : "Successfully fetched all chats",
            chats : data

        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const updateChatTitleOfUser = async (req,res) => {
    try {
        console.log(req.body)
        console.log(req.params)
        const chatId = req.params.chatId
        const {title} = req.body

        console.log("chatId:", chatId);
console.log("title:", title);

        const data = await updateChatTitle(chatId, title)

        return res.status(200).json({
            success : true,
            message : "Successfully updated chat title",
            chatData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}


export const deleteChatOfUser = async (req,res) => {
    try {
        const chatId = req.params.chatId
        const data = await deleteChat(chatId)

        return res.status(200).json({
            success : true,
            message : "Successfully deleted chat",
            chatData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}