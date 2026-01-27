import { activateMess, createMess, deleteMess, getAllMesses, getMess, getMessById, updateMess } from "../services/mess.services.js"

export const createOwnerMess = async (req,res) =>{
    try {
        const ownerId = req.user.id
        const data = await createMess(req.body, ownerId)

        return res.status(200).json({
            success : true,
            message : "Mess created successfully",
            messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Error while creating mess"
        })
        
    }
}

export const getOwnerMess = async(req,res) => {
    try {
        const ownerId = req.user.id

        const data = await getMess(ownerId)

        return res.status(200).json({
            success : true,
            message : "Mess fetched successfully",
            messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Mess"
        })
        
    }
}

export const updateOwnerMess = async(req,res) => {
    try {
        const ownerId = req.user.id
        await updateMess(req.body,ownerId )

        return res.status(200).json({
            success : true,
            message : "Mess updated successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to update Mess"
        })
        
    }
}

export const deleteOwnerMess = async(req,res) => {
    try {
        const ownerId = req.user.id

        await deleteMess(ownerId)

        return res.status(200).json({
            success : true,
            message : "Mess Deactivated successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to Deactivate the Mess"
        })
        
    }
}

export const activateOwnerMess = async(req,res) => {
    try {
        const ownerId = req.user.id

        await activateMess(ownerId)

        return res.status(200).json({
            success : true,
            message : "Mess Activated successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to Activate the Mess"
        })
        
    }
}

export const getAllOwnerMesses = async(req,res) => {
    try {
        const data = await getAllMesses()

        return res.status(200).json({
            success : true,
            message : "Messes fetches successfully",
            messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch the Messes"
        })
    }
}

export const getMessForCustomerById = async (req,res) => {
    try {
        const {messId} = req.params
        const data = await getMessById(messId)

        return res.status(200).json({
            success : true,
            message : "Mess fetched successfully",
            messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Mess"
        })
    }
}