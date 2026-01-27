import User from '../models/user.model.js'

export const getUser = async(req,res) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "User fetched successfully",
            data : user
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch the User"
        })
    }
}

export const updateUser = async(req,res) => {
    try {
        const userId = req.user.id

        const {name, phone, address} = req.body

        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        if(!(name || phone || address)){
            return res.status(400).json({
                success : false,
                message : "Nothing to update"
            })
        }

        if(name) user.name = name
        if(phone) user.phone = phone
        if(address) user.address = address

        await user.save()

        return res.status(200).json({
            success : true,
            message : "User updated successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to update the User"
        })
        
    }
}


export const deleteUser = async(req,res) => {
    try {
        const userId = req.user.id

        const user = await User.findByIdAndDelete(userId)

        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "User deleted successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : "false",
            message : "ERROR while deleting the User"
        })
    }
}