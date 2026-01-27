import express from 'express'
import { generateNewAccessToken, getMe, login, logout, register } from '../controllers/auth.controllers.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', verifyJWT, logout)
router.post('/generateNewAccessToken', generateNewAccessToken)
router.get('/me', verifyJWT, getMe)

export default router