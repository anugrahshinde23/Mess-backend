import { approveOrderRequest, approveRequest, checkDeliveryBoyPinMatchesUsersPin, getDeliveryBoy, getDeliveryBoyRequests, getMessByPincode, joinMess, registerDeliveryBoy, rejectOrderRequest, rejectRequest } from "../services/deliveryBoy.services.js"


export const registerDeliveryBoyByLoggedInUser = async (req,res ) => {
    try {
        const userId = req.user.id
        console.log(req.body);
        

        const data = await registerDeliveryBoy(userId, req.body)

        return res.status(200).json({
            success : true,
            message : "Delivery boy registered successfully",
            deliveryBoyData : data.deliveryBoy,
            extra : data.exist
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getDeliveryBoyInfo = async(req, res) => {
    try {
        const userId = req.user.id
        const data = await getDeliveryBoy(userId)
        
        return res.status(200).json({
            success : true,
            message : "Delivery boy fetched successfully",
            deliveryBoyData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getMessByPincodeForDeliveryBoy = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await getMessByPincode(userId)

        return res.status(200).json({
            success : true,
            message : "Messes fetched successfully",
            messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const joinMessForDelivery = async(req,res) => {
    try {
        const { messId } = req.params
    const userId = req.user.id

    const data = await joinMess(userId, messId)

    return res.status(200).json({
        success : true,
        message : "Join Mess request sent",
        data : data
    })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }


}

export const getDeliveryBoyRequestOfMess = async (req,res) => {

    try {
        const { messId } = req.params
        
        const data = await getDeliveryBoyRequests(messId)

        return res.status(200).json({
            success : true,
            message : "Delivery boy requests fetched successfully",
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

export const approveRequestByOwner = async(req,res) => {
    try {
        const { reqId } = req.params
        const data = await approveRequest(reqId)

        return res.status(200).json({
            success : true,
            message : "Request approved successfully",
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

export const rejectRequestByOwner = async (req,res) => {
    try {
        const { reqId } = req.params
        const data = await rejectRequest(reqId)

        return res.status(200).json({
            success : true,
            message : "Request rejected successfully",
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

export const checkDeliveryBoyPinMatchesUsersPinForOrder = async (req,res) => {
    
    
    try {
        const {userPin, messId} = req.query
        const data = await checkDeliveryBoyPinMatchesUsersPin(userPin, messId)

        return res.status(200).json({
            success : true,
            message : "Delivery Boys fecthed successfully",
            dBoyData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }


}


export const approveOrderRequestByDboy = async (req, res) => {
    try {

        const data = await approveOrderRequest(req.body)
        return res.status(200).json({
            success : true,
            message: "Order request approved successfully",
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

export const rejectOrderRequestByDboy = async (req,res) => {


   console.log(req.body);
   

    try {
        const data = await rejectOrderRequest(req.body)
        return res.status(200).json({
            success : true,
            message : "Order request rejected successfully",
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

