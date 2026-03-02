import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware'
import { createProjectForUser } from '../controllers/projects.controllers'
const router = express.Router()

router.post('/create', verifyJWT, createProjectForUser)

export default router