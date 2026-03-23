import { createFeedback } from "../services/feedback.services.js"

export const createFeedBackByUser = async (req,res) => {
    try {
        const data = await createFeedback(req.body)
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