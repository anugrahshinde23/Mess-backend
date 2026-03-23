import Feedback from "../models/feedback.model.js"

export const createFeedback = async (feedbackData) => {
    const {name, email, phone, message} = feedbackData

    if(!name || !email || !phone || !message) {
        throw new Error("Required fields")
    }

    const feedback = await Feedback.create({
        name,
        email,
        phone,
        message
    })

    return feedback
}