import { createWallet, getUserWallet } from "../services/wallet.services.js"

export const createWalletForUser = async (req,res) => {
    console.log("Request body data", req.body);
    
    try {
        const userId = req.user.id
        const data = await createWallet(userId, req.body)

        console.log(data);
        

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
        const data = await getUserWallet(userId)

        return res.status(200).json({
            success : true,
            message : "Successfully fetched wallet",
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