import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { createAndUpdateOwnerMenu, getTodaysMenuForCustomerById, getTodaysOwnerMenu } from '../controllers/menu.controllers.js'
const router = express.Router()

router.post('/today-menu', verifyJWT, allowedRoles('MESS_OWNER'), createAndUpdateOwnerMenu)
router.get('/get-todays-menu', verifyJWT, allowedRoles('MESS_OWNER'), getTodaysOwnerMenu)
router.get('/get-menu/:messId/details', verifyJWT, allowedRoles('CUSTOMER'), getTodaysMenuForCustomerById)


export default router