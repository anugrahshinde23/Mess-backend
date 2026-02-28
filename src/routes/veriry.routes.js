import express from 'express'
import { askVerityQuestion } from '../controllers/verity.controllers.js'
const router = express.Router()

router.post('/ask', askVerityQuestion)

export default router