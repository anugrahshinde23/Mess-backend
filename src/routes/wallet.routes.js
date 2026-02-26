import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createWalletForUser, deleteWalletForUser, getWalletForUser, increaseWalletAmountForUser } from '../controllers/wallet.controllers.js'

const router = express.Router()

router.post('/create', verifyJWT, createWalletForUser)
router.get('/get-wallet', verifyJWT, getWalletForUser)
router.patch('/increase-amount', verifyJWT, increaseWalletAmountForUser)
router.delete('/delete-wallet', verifyJWT, deleteWalletForUser)

export default router