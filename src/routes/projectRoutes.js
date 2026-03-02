import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createProjectForUser } from '../controllers/projects.controllers.js'
const router = express.Router()

router.post('/create', verifyJWT, createProjectForUser)

export default router