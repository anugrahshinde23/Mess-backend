import { getUserNotification, markAsRead } from "../services/notification.services.js"

export const getUserNotificationForUser = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await getUserNotification(userId)

        return res.status(200).json({
            success : true,
            message : "Notification fetched successfully",
            notificationData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const markAsReadForUsers = async (req,res) => {
    try {
        const userId = req.user.id
        const {notificationId} = req.params

        const data = await markAsRead(notificationId, userId)

        return res.status(200).json({
            success : true,
            message : "Notification marked as read"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}