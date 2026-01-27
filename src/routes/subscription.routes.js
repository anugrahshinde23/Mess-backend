import express from 'express'

import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { createUserSubscription, getPendingOwnerSubscription, approveSubscriptionByOwner, getUserSubscriptionForCustomer, rejectedSubscriptionByOwner, getSubscriptionForOwnerByStatus } from '../controllers/subscription.controllers.js'

const router = express.Router()

router.post('/create-subscription', verifyJWT, allowedRoles('CUSTOMER'), createUserSubscription)
router.get('/get-pending-subscription', verifyJWT, allowedRoles('MESS_OWNER'), getPendingOwnerSubscription)
router.patch('/:subscriptionId/approve', verifyJWT, allowedRoles('MESS_OWNER'), approveSubscriptionByOwner)
router.get('/get-user-subscription', verifyJWT, allowedRoles('CUSTOMER'), getUserSubscriptionForCustomer)
router.patch('/:subscriptionId/reject', verifyJWT, allowedRoles('MESS_OWNER'), rejectedSubscriptionByOwner)
router.get('/get-owner-subscription', verifyJWT, allowedRoles('MESS_OWNER'), getSubscriptionForOwnerByStatus)

export default router