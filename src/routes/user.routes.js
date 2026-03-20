import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getUser, updateUser, deleteUser, getAllUsersForAdmin } from '../controllers/user.controller.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
const router = express.Router()

router.get('/getMe', verifyJWT, getUser)
router.put('/updateMe', verifyJWT, updateUser)
router.delete('/deleteMe', verifyJWT, deleteUser)
router.get('/all-users', verifyJWT, allowedRoles('ADMIN'), getAllUsersForAdmin)


export default router