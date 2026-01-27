import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const verifyJWT = async (req,res,next) =>{
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ","")

        if(!token){
            return res.status(400).json({
                success : false,
                message : "Unauthorized: No Token Provided"
            })
        }

        const decoded_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded_token.id)

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Unauthorized: User Not Found"
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Unauthorized: Invalid Token"
        })
        
    }
}