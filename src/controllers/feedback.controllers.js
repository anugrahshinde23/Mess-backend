import { createFeedback, getAllFeedback } from "../services/feedback.services.js"

export const createFeedBackByUser = async (req,res) => {
    try {
        const userId = req.user?.id
        const data = await createFeedback(req.body, userId)
        return res.status(200).json({
            success : true,
            message : "Feedback sent successfully",
            feedbackData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}


export const getAllFeedBackForAdmin = async (req,res) => {
    try {
        const data = await getAllFeedback()

        return res.status(200).json({
            success : true,
            message : "Successfully fetched the Feedbacks",
            fbData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}