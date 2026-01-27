import jwt from 'jsonwebtoken'

export const generateAccessToken = async (userData) => {
    return await jwt.sign(
        {
            id : userData.id,
            phone : userData.phone,
            role : userData.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : '1h'
        }
    )
}