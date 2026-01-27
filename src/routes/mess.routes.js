import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { activateOwnerMess, createOwnerMess, deleteOwnerMess, getAllOwnerMesses, getMessForCustomerById, getOwnerMess, updateOwnerMess } from '../controllers/mess.controller.js'
const router = express.Router()

router.post('/create-mess', verifyJWT,createOwnerMess )
router.get('/get-mess', verifyJWT, allowedRoles('MESS_OWNER'), getOwnerMess)
router.put('/update-mess', verifyJWT, allowedRoles('MESS_OWNER'), updateOwnerMess)
router.delete('/delete-mess', verifyJWT, allowedRoles('MESS_OWNER'), deleteOwnerMess)
router.get('/activate-mess', verifyJWT, allowedRoles('MESS_OWNER'), activateOwnerMess)
router.get('/get-all-messes', verifyJWT, getAllOwnerMesses)
router.get('/get-mess/:messId/details', verifyJWT, allowedRoles('CUSTOMER'), getMessForCustomerById)

export default router