import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createWalletForUser, getWalletForUser } from '../controllers/wallet.controllers.js'

const router = express.Router()

router.post('/create',verifyJWT, createWalletForUser)
router.get('/get-wallet',verifyJWT, getWalletForUser )

export default router