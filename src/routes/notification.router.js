import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getUserNotificationForUser, markAsReadForUsers } from '../controllers/notification.controllers.js'

const router = express.Router()

router.get('/get-notification', verifyJWT, getUserNotificationForUser)
router.patch('/mark-as-read/:notificationId/notification', verifyJWT, markAsReadForUsers)

export default router