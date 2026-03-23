import express from 'express'
import { createFeedBackByUser } from '../controllers/feedback.controllers.js'
const router = express.Router()

router.post('/create', createFeedBackByUser)


export default router