import express from 'express'
import { generateNewAccessToken, getMe, login, logout, register, resetPasswordForUser, sendOTPtoUser, verifyOTPtoUser } from '../controllers/auth.controllers.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/generateNewAccessToken', generateNewAccessToken)
router.get('/me', verifyJWT, getMe)
router.put('/send/otp', sendOTPtoUser)
router.put('/verify/otp', verifyOTPtoUser)
router.put('/reset-pass', resetPasswordForUser)

export default router