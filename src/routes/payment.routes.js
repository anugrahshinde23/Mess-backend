import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { createPaymentFromUser, fetchPendingPaymentsForAdmin, getPaymentHistoryForUser, verifyPaymentByAdminForUser } from '../controllers/payment.controllers.js'

const router = express.Router()

router.post('/create-payment', verifyJWT, allowedRoles('CUSTOMER'), createPaymentFromUser)
router.get('/get-payment-history-user', verifyJWT, allowedRoles('CUSTOMER'), getPaymentHistoryForUser)
router.patch('/verify-payment/:paymentId', verifyJWT, allowedRoles('ADMIN'),verifyPaymentByAdminForUser)
router.get('/get-pending-payments', verifyJWT, allowedRoles('ADMIN') ,fetchPendingPaymentsForAdmin)

export default router