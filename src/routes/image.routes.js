import express from 'express'
import { generateImageFromPrompt } from '../controllers/image.controller.js'
const router = express.Router()


router.post('/generate', generateImageFromPrompt)

export default router