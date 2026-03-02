import express from 'express'
import { askVerityQuestion, createNewChatForUser, getAllChatsOfUser, getChatForUser, sendMessageForUser } from '../controllers/verity.controllers.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
const router = express.Router()

router.post('/ask',verifyJWT ,askVerityQuestion)
router.post('/new-chat', verifyJWT, createNewChatForUser )
router.post('/send-msg', verifyJWT, sendMessageForUser)
router.get('/get-chat/:chatId', verifyJWT, getChatForUser)
router.get('/get-all-chats', verifyJWT, getAllChatsOfUser)

export default router