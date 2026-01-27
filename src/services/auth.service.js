import User from '../models/user.model.js'
import { hashPassword } from '../utility/passwordHash.js'
import {comparePass} from '../utility/comparePassword.js'
import { generateAccessToken } from '../utility/generateAccessToken.js'
import { generateRefreshToken } from '../utility/generateRefreshToken.js'
import jwt from 'jsonwebtoken'


export const registerUser = async (userData) =>{

    const {name , phone, password, address, pincode} = userData

    if(!name || !phone || !password || !address || !pincode){
        throw new Error("All fields are required")
    }

    const userExists = await User.findOne({
        phone
    })

    if(userExists){
        throw new Error("User already exists")
    }

    const hashed_pass = await hashPassword(password)

    const user = await User.create({
        name : name,
        phone : phone,
        password : hashed_pass,
        address : address,
        pincode : pincode
    })

    return {
        user
    }
}

export const loginUser = async(userData) => {
    const {phone, password} = userData

    if(!phone || !password){
        throw new Error("Phone and Password is required!")
    }

    const userExists = await User.findOne({
        phone
    })

    if(!userExists){
        throw new Error("User not exist")
    }

    const isPassCorrect = await comparePass(password, userExists.password)

    if(!isPassCorrect){
        throw new Error("Invalid Credentials")
    }

    const accessToken = await generateAccessToken(userExists)
    const refreshToken = await generateRefreshToken(userExists)

    userExists.refreshToken = refreshToken
    await userExists.save()

    return {
        accessToken,
        refreshToken,
        userExists
    }
}

