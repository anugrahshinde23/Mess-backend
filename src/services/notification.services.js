import Notification from "../models/notification.model.js"

export const getUserNotification = async (userId) => {
    const notification = await Notification.find({
        user : userId
    }).sort({createdAt : -1})

    return notification
}

export const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({
        _id : notificationId,
        user : userId
    })

    if(!notification){
        throw new Error("Notification not found")
    }

    notification.isRead = true
    await notification.save()

    return notification
}