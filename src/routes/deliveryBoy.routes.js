import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { approveOrderRequestByDboy, approveRequestByOwner, checkDeliveryBoyPinMatchesUsersPinForOrder, getDeliveryBoyInfo, getDeliveryBoyRequestOfMess, getDeliveryBoysOfMessForOwner, getMessByPincodeForDeliveryBoy, joinMessForDelivery, registerDeliveryBoyByLoggedInUser, rejectOrderRequestByDboy, rejectRequestByOwner } from '../controllers/deliveryBoy.controllers.js'

const router = express.Router()

router.post('/register', verifyJWT, registerDeliveryBoyByLoggedInUser )
router.get('/get-messes', verifyJWT, allowedRoles('DELIVERY_BOY'), getMessByPincodeForDeliveryBoy)
router.post('/join/:messId/mess', verifyJWT, allowedRoles('DELIVERY_BOY'), joinMessForDelivery)
router.get('/get-delivery-boy', verifyJWT, allowedRoles('DELIVERY_BOY'), getDeliveryBoyInfo)
router.get('/get-delivery-boy/:messId/request', verifyJWT, allowedRoles('MESS_OWNER'), getDeliveryBoyRequestOfMess)
router.put('/approve/:reqId/request', verifyJWT, allowedRoles('MESS_OWNER'), approveRequestByOwner)
router.put('/reject/:reqId/request', verifyJWT, allowedRoles('MESS_OWNER'), rejectRequestByOwner)
router.get('/get-matching-dboy',verifyJWT, allowedRoles('MESS_OWNER'), checkDeliveryBoyPinMatchesUsersPinForOrder )
router.put('/approve-order-request', verifyJWT, allowedRoles('DELIVERY_BOY'), approveOrderRequestByDboy)
router.put('/reject-order-request', verifyJWT, allowedRoles('DELIVERY_BOY'), rejectOrderRequestByDboy)
router.get('/get-dboy-of-mess', verifyJWT, allowedRoles('MESS_OWNER'), getDeliveryBoysOfMessForOwner)

export default router