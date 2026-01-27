import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { oneTimeOrderForUser, getOrderForOwner, getUserOrderHistory, cancelOrderFromUser, assignOrderToDeliveryBoyRequest, getOrderRequestForDboy } from "../controllers/order.controllers.js"
const router = express.Router()


router.post('/oneTime-order', verifyJWT, allowedRoles('CUSTOMER'), oneTimeOrderForUser)
router.get('/get-orders', verifyJWT, allowedRoles('MESS_OWNER'), getOrderForOwner)
router.get('/get-order-history', verifyJWT, allowedRoles('CUSTOMER'), getUserOrderHistory)
router.patch('/cancel/:orderId/order', verifyJWT, allowedRoles('CUSTOMER'), cancelOrderFromUser)
router.post('/assign-order/request', verifyJWT, allowedRoles('MESS_OWNER'), assignOrderToDeliveryBoyRequest)
router.get('/get-order/:dBoyId/request', verifyJWT, allowedRoles('DELIVERY_BOY'), getOrderRequestForDboy)

export default router