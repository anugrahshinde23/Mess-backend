import { oneTimeOrder, getOrder, getOrderHistory, cancelOrder, assignOrderToDeliveryBoy, getOrderRequests } from "../services/order.services.js"

export const oneTimeOrderForUser = async(req,res) => {
    
    
    try {

        const userId = req.user.id
        const data = await oneTimeOrder(userId, req.body)

        return res.status(200).json({
            success : true,
            message : "Order placed successfully",
            orderData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getOrderForOwner = async(req,res) => {
    try {
        const ownerId = req.user.id
        const data = await getOrder(ownerId)

        return res.status(200).json({
            success : true,
            message : "Orders fetched successfully",
            orderData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Orders"
        })
    }
}

export const getUserOrderHistory = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await getOrderHistory(userId)

        return res.status(200).json({
            success : true,
            message : "Fetched order history successfully",
            orderHistory : data
        })
    } catch (error) {
       console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const cancelOrderFromUser = async (req,res) => {
    try {

        const {orderId} = req.params
        const data = await cancelOrder(orderId)

        return res.status(200).json({
            success : true,
            message : "Order Cancelled successfully",
            orderData : data
        })
        
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const assignOrderToDeliveryBoyRequest = async (req, res) => {
    try {
        const data = await assignOrderToDeliveryBoy(req.body)
        return res.status(200).json({
            success : true,
            message : "Order assigned successfully",
            reqData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getOrderRequestForDboy = async (req, res) => {
    try {
        const { dBoyId } = req.params
        const data = await getOrderRequests(dBoyId)

        return res.status(200).json({
            success : true,
            message : "Order request fetched successfully",
            reqData : data
        })

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
} 