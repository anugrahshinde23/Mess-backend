import { loginUser, registerUser, sendOTP, verifyOTP } from "../services/auth.service.js"
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { generateAccessToken } from "../utility/generateAccessToken.js"

export const register = async(req,res) => {
    try {
        const data = await registerUser(req.body)
        return res.status(200).json({
            success : true,
            message : "User registered",
            data : data.user
        })
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const login = async(req,res) => {
    try {
        const data = await loginUser(req.body)
        const accessToken = data.accessToken
        const refreshToken = data.refreshToken

        res.cookie('accessToken', accessToken, {
            httpOnly : true,
            secure:true,
            sameSite:'none',
            maxAge : 3600000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly : true,
            secure:true,
            sameSite:'none',
            maxAge:7*24*60*60*1000
    
         })

         return res.status(200).json({
            success : true,
            message : "User logged in successfully",
            data : data.userExists,
            accessToken : accessToken,
            refreshToken : refreshToken
         })
   
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const logout = async (req,res) => {
    try {
        const token = req.cookies.refreshToken
        
        if(!token){
            return res.status(400).json({
                success : false,
                message : "Token not provided"
            })
        }

        const decoded_token = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded_token.id)

        if(user){
            user.refreshToken = null,
            await user.save()
        }

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          });
          
          res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          });

        return res.status(200).json({
            sucess : true,
            message : "User logout successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : "Failed to logout User"
        })
    }
}

export const generateNewAccessToken = async (req,res) =>{
    try {
        const token = req.cookies?.refreshToken || req.headers.authorization?.replace("Bearer ","")

        if(!token){
            return res.status(400).json({
                success : false,
                message : "Refresh Token not Provided"
            })
        }

        const decoded_refresh_token = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded_refresh_token.id)

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Unauthorized: User not found"
            })
        }

        const newAccessToken = await generateAccessToken(user)

        res.cookie('accessToken', newAccessToken, {
            httpOnly : true,
            secure:true,
            sameSite:'none',
            maxAge : 3600000
        })

        return res.status(200).json({
            success : true,
            message : "New Access token Created successfully",
            newAccessToken : newAccessToken
        })

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to create new Access token"
        })
        
    }
}


export const getMe = async(req,res) => {
    res.status(200).json({
        success: true,
        user : req.user
    })
}

export const sendOTPtoUser = async (req,res) =>{
    try {
        const {phone} = req.body
    const getOTP = await sendOTP(phone)

    return res.status(200).json({
        success : true,
        message : "Successfully get OTP",
        isOTP : getOTP
    })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const verifyOTPtoUser = async (req,res) => {
    try {
        const {phone, otp} = req.body
        const isCorrect = await verifyOTP(phone, otp)

        return res.status(200).json({
            success : true,
            message : "Successfully verified otp",
            isOTPverified : isCorrect
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const resetPasswordForUser = async (req,res) => {
    try {
        const {phone, newPassword} = req.body
        const isPasswordReset = await resetPassword(phone, newPassword)

        return res.status(200).json({
            success : true,
            message : "Successfully reseted password",
            passReset : isPasswordReset
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}
