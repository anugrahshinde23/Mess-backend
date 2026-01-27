import { createSubscription, getPendingSubscriptions, approvedByOwner, getUserSubscription, rejectedByOwner, getSubscriptionByStatus } from '../services/subscription.services.js'

export const createUserSubscription = async(req,res) => {
    try {
        
        
        const userId = req.user.id
        const data = await createSubscription(userId, req.body)

        return res.status(200).json({
            success : true,
            message : "Subscription created successfully",
            subscriptionData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getPendingOwnerSubscription = async(req,res) => {
    try {

        const ownerId = req.user.id
        const data = await getPendingSubscriptions(ownerId)

        return res.status(200).json({
            success : true,
            message : "Pending subscription fetched successfully",
            pendingSubscriptionData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Pending subscription"
        })
    }
}

export const approveSubscriptionByOwner = async(req,res) => {
    try {
        const {subscriptionId} = req.params
        const ownerId = req.user.id

        const data = await approvedByOwner(subscriptionId, ownerId)

        return res.status(200).json({
            success : true,
            message : "Approved subscription successfully",
            subscriptionData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed approve subscription"
        })
    }
}

export const getUserSubscriptionForCustomer = async(req,res) => {
    try {
        const userId = req.user.id
        const data = await getUserSubscription(userId)

        return res.status(200).json({
            success : true,
            message : "Subscription fetched successfully",
            subscriptionData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch Subscriptions"
        })
        
    }
}

export const rejectedSubscriptionByOwner = async (req,res) => {
    try {
        const ownerId = req.user.id
        const { subscriptionId } = req.params
        const data = await rejectedByOwner(subscriptionId, ownerId)

        return res.status(200).json({
            success : true,
            message : "Rejected Subscription successfully",
            subscriptionData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to Reject Subscription"
        })
    }
}

export const getSubscriptionForOwnerByStatus = async (req,res) => {
    try {
        const ownerId = req.user.id
        const {status} = req.query

        const data = await getSubscriptionByStatus(ownerId, status)

        return res.status(200).json({
        success : true,
        message : "Status based subscription fetched successfully",
        subsData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
        success : false,
        message : "Failed to fetch status based subscription "
        })
    }
}