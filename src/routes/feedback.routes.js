import express from 'express'
import { createFeedBackByUser, getAllFeedBackForAdmin } from '../controllers/feedback.controllers.js'
const router = express.Router()

router.post('/create', createFeedBackByUser)
router.get('/get', getAllFeedBackForAdmin)

export default router