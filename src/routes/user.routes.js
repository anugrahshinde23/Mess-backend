import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getUser, updateUser, deleteUser } from '../controllers/user.controller.js'
const router = express.Router()

router.get('/getMe', verifyJWT, getUser)
router.put('/updateMe', verifyJWT, updateUser)
router.delete('/deleteMe', verifyJWT, deleteUser)


export default router