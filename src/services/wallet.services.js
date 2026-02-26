import Wallet from "../models/wallet.model.js"
import User from "../models/user.model.js"

export const createWallet = async (userId) => {

  const userExist = await User.findById(userId)

  if(!userExist){
    throw new Error("User not found")
  }

  const wallet = await Wallet.create({
    user : userId,
  })

  return wallet
}

export const getWallet = async (userId) =>{
    const userExist = await User.findById(userId)

    if(!userExist){
        throw new Error("User not found")
    }

    const wallet = await Wallet.findOne({
        user : userId,
        isActive : true
    })

    if(!wallet){
        throw new Error("Wallet not found")
    }

    return wallet
}


export const increaseWalletAmount = async (userId) => {
    const userExist = await User.findById(userId)

    if(!userExist){
        throw new Error("User not found")
    }

    const wallet = await Wallet.findOne({
        user : userId
    })

    if(!wallet){
        throw new Error("Wallet not found")


    }

    wallet.amount = wallet.amount + 1000

    await wallet.save()
}

export const deleteWallet = async (userId) => {

 const userExist = await User.findById(userId)

 if(!userExist){
    throw new Error("User not fount")
 }

 const wallet = await Wallet.findOne({
    user : userId
 })

 if(!wallet){
    throw new Error("Wallet not found")
 }

 wallet.isActive = false
 await wallet.save()


}