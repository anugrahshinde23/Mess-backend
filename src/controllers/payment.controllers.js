import { createPayment, getPaymentHistoryUser } from "../services/payment.services.js"

export const createPaymentFromUser = async (req,res) => {
    try {
        const userId = req.user.id
        
        const data = await createPayment(userId, req.body)

        return res.status(200).json({
            success : true,
            message : "Payment Done",
            paymentData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getPaymentHistoryForUser = async (req, res) => {
    try {
        const userId = req.user.id
        const data = await getPaymentHistoryUser(userId)

        return res.status(200).json({
            success : true,
            message : "Payment history fetched successfully",
            paymentData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

