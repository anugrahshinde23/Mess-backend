import Wallet from "../models/wallet.model.js"
import User from "../models/user.model.js"

export const createWallet = async (userId, walletDetails) => {
    const { upiId, bankAccount, ifsc } = walletDetails;

    if (!upiId || !bankAccount || !ifsc) {
        throw new Error("Required Bank Details");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

   
    const existingWallet = await Wallet.findOne({ user: userId });
    if (existingWallet) {
        throw new Error("Wallet already exists for this user");
    }

    const wallet = await Wallet.create({
        user: userId,
        walletDetails: {
            upiId,
            bankAccount,
            ifsc
        }
    });

    return wallet; 
};


export const getUserWallet = async (userId) => {
    const user = await User.findById(userId)

    if(!user){
        throw new Error("User not found")
    }

    const userWallet = await Wallet.findOne({
        user : userId,
        isActive : true
    })


    if(!userWallet){
        throw new Error("Wallet not exist for this user")
    }

    return userWallet
}

