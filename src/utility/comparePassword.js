import bcrypt from 'bcrypt'

export const comparePass = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword)
}