import { createMenu, getTodaysMenu, getTodaysMenuById } from "../services/menu.services.js"

export const createAndUpdateOwnerMenu = async(req,res) => {
    try {
        const ownerId = req.user.id

        const data = await createMenu(ownerId, req.body)

        return res.status(200).json({
            success : true,
            message : "Menu created successfully",
            menuData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to create Menu"
        })
        
    }
}

export const getTodaysOwnerMenu = async(req,res) => {
    try {
        const ownerId = req.user.id

        const data = await getTodaysMenu(ownerId)

        return res.status(200).json({
            success : true,
            message : "Menu fetched successfully",
            menuData : data
        })
    } catch (error) {
        console.log(error.message);

        return res.status(400).json({
            success : false,
            message : "Failed to fetch the Menu"
        })
        
    }
}

export const getTodaysMenuForCustomerById = async (req,res) => {
    try {
        const {messId} = req.params

        const data = await getTodaysMenuById(messId)
        
        return res.status(200).json({
            success : true,
            message : "Menu Fetched successfully",
            menuData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Menu"
        })
        
    }
}