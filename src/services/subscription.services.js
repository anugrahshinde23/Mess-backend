import Mess from '../models/mess.model.js'
import Plan from '../models/plan.model.js'
import Subscription from '../models/subscription.model.js'
import Notification from '../models/notification.model.js'
import { expireSubscriptionsIfNeeded } from '../utility/expireSubscription.js'

export const createSubscription = async (userId, subscriptionData) => {

    const existingSubscription = await Subscription.findOne({
        user : userId,
        status : {$in : ["ACTIVE", "PENDING"]}
    }) 

    if(existingSubscription){
        throw new Error("You already have an active or pending subscription")
    }

    const { messId, planId } = subscriptionData
  
    if (!messId || !planId) {
      throw new Error("Required fields")
    }
  
    const mess = await Mess.findById(messId)
    if (!mess) throw new Error("Mess not found")
  
    const plan = await Plan.findById(planId)
    if (!plan) throw new Error("Plan not found")
  
    const messPlan = mess.plan.find(
      (p) => p.plan.toString() === planId
    )
  
    if (!messPlan) {
      throw new Error("Plan is not offered by this mess")
    }
  
    let startDate = null
    let endDate = null
    let status = "PENDING"
    let approvedAt = null
  
    // 🔥 ONE_TIME = auto active
    if (plan.type === "ONE_TIME") {
      startDate = new Date()
      startDate.setDate(startDate.getDate() + 1)
  
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + plan.durationInDays)
  
      status = "ACTIVE"
      approvedAt = new Date()
    }
  
    const subscription = await Subscription.create({
      user: userId,
      mess: messId,
      plan: planId,
      startDate,
      endDate,
      status,
      approvedAt
    })

    await Notification.create({
        user : mess.owner,
        title : "Subscription",
        message : "You have new customer"
    })
  
    return subscription
  }
  

export const getPendingSubscriptions = async(ownerId) => {
    
    await expireSubscriptionsIfNeeded()
    
    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }
    

    const messId = mess._id
    
    const pendingSubscription = await Subscription.find({
        status : "PENDING",
        mess : messId
    }).populate("user", "name phone")
    .populate("plan", "type mealsIncluded durationInDays")

    if(pendingSubscription.length === 0 ){
        return []
    }

    return pendingSubscription
}

export const approvedByOwner = async (subscriptionId, ownerId) => {

    const subscription = await Subscription.findById(subscriptionId)

    if(!subscription){
        throw new Error("Subscription not found")
    }

    // checking if already approved or not
    if(subscription.status !== "PENDING"){
        throw new Error("Subscription already processed")
    }

    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    if(subscription.mess.toString() !== mess._id.toString() ){

        throw new Error("Not Authorized to process this subscription")
    }

    const plan = await Plan.findById(subscription.plan)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.durationInDays)
    
    

    subscription.status = "ACTIVE"
    subscription.approvedBy = ownerId
    subscription.approvedAt = new Date()
    subscription.startDate = startDate
    subscription.endDate = endDate

    await Notification.create({
        user : subscription.user,
        title : "Approved Subscription",
        message : "Your plan has been approved and activated"
    })

    await subscription.save()

    return subscription
}

export const getUserSubscription = async (userId) => {

   await expireSubscriptionsIfNeeded()


    const subscription = await Subscription.find({
        user : userId,
        status : {$ne : "REJECTED"}
    })

    if(subscription.length === 0) {
        return []
    }

    return subscription
}

export const rejectedByOwner = async (subscriptionId, ownerId) => {
    const subscription = await Subscription.findById(subscriptionId)

    if(!subscription){
        throw new Error("Subscription not found")
    }

    const mess = await Mess.findOne({
        owner: ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    if(subscription.mess.toString() !== mess._id.toString()){
        throw new Error("Not Authorized")
    }


    subscription.status = "REJECTED"

    await Notification.create({
        user : subscription.user,
        title : "Reject Subscription",
        message : "Your plan was rejected by the mess owner"
    })

    await subscription.save()

    return subscription
}

export const getSubscriptionByStatus = async (ownerId, status) => {
    await expireSubscriptionsIfNeeded()

    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    const subs = await Subscription.find({
        mess : mess._id,
        status : status
    }).populate("user", "name phone")
    .populate("plan", "type durationInDays")


    if(subs.length === 0){
        return []
    }

    return subs

}