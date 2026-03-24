import Feedback from "../models/feedback.model.js"

export const createFeedback = async (feedbackData, userId) => {
    const {name, email, phone, message} = feedbackData

    if(!name || !email || !phone || !message) {
        throw new Error("Required fields")
    }

    const feedback = await Feedback.create({
        user : userId,
        name,
        email,
        phone,
        message
    })

    return feedback
}


export const getAllFeedback = async () => {
    const feedBacks = await Feedback.find()

    return feedBacks
}