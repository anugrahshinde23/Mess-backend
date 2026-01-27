import jwt from 'jsonwebtoken'

export const generateRefreshToken = async (userData) => {
    return await jwt.sign(
        {
            id : userData.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : '7d'
        }
    )
}