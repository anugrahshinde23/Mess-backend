import { createWallet, deleteWallet, getWallet, increaseWalletAmount } from "../services/wallet.services.js"

export const createWalletForUser = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await createWallet(userId)

        return res.status(200).json({
            success : true,
            message : "Successfully created wallet",
            walletData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getWalletForUser = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await getWallet(userId)

        return res.status(200).json({
            success : true,
            message : 'Wallet fetched Successfully',
            walletData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const increaseWalletAmountForUser = async (req,res) => {
    try {
        const userId = req.user.id

        await increaseWalletAmount(userId)

        return res.status(200).json({
            success : true,
            message : "Successfully increased the wallet amount"
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const deleteWalletForUser = async (req,res) => {
    try {
        const userId = req.user.id
        await deleteWallet(userId)

        return res.status(200).json({
            success : true,
            message : "Wallet deleted successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}