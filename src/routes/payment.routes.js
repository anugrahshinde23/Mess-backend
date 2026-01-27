import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { createPaymentFromUser, getPaymentHistoryForUser } from '../controllers/payment.controllers.js'

const router = express.Router()

router.post('/create-payment', verifyJWT, allowedRoles('CUSTOMER'), createPaymentFromUser)
router.get('/get-payment-history-user', verifyJWT, allowedRoles('CUSTOMER'), getPaymentHistoryForUser)

export default router