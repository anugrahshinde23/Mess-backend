import DeliveryBoy from "../models/deliveryBoy.model.js"
import DeliveryBoyRequest from "../models/deliveryBoyRequest.model.js"
import Mess from "../models/mess.model.js"
import Notification from "../models/notification.model.js"
import Order from "../models/order.model.js"
import OrderRequest from "../models/orderRequest.model.js"
import User from "../models/user.model.js"

export const registerDeliveryBoy = async (userId, deliveryBoyData) => {

    const deliveryBoyExist = await DeliveryBoy.findOne({ user: userId })
    if (deliveryBoyExist) {
      throw new Error("Already registered as delivery boy")
       
    }
  
    const { servicePinCodes } = deliveryBoyData
    if (!servicePinCodes || servicePinCodes.length === 0) {
      throw new Error("Pincodes are required")
    }
  
    const exist = await User.findById(userId)
    if (!exist) {
      throw new Error("User not found")
    }
  
    // add user's pincode if not present
    if (!servicePinCodes.includes(exist.pincode)) {
      servicePinCodes.push(exist.pincode)
    }
  
    exist.role = "DELIVERY_BOY"
    await exist.save()
  
    const dBoy = await DeliveryBoy.create({
      user: userId,
      servicePinCodes,
      availabilityStatus : "AVAILABLE"
    })
  
    return { deliveryBoy : dBoy, exist }
  }


  export const getDeliveryBoy = async (userId) => {
    const dBoy = await DeliveryBoy.findOne({
        user : userId
    }).populate({
        path : "workingMesses",
        select : "name address",

        populate : {
            path : "owner",
            select : "name"
        }
    })

    if(!dBoy){
        throw new Error("delivery boy not found")
    }

    return dBoy
  }
  

export const getMessByPincode = async (userId) => {
    const deliveryBoy = await DeliveryBoy.findOne({
        user : userId
    })

    if(!deliveryBoy){
        throw new Error("Delivery boy not found ")
    }

    const servicePinCodes = deliveryBoy.servicePinCodes

    const messes = await Mess.find({
        "pincode" : {$in : servicePinCodes},
        isActive : true
    }).select("name address owner")
    .populate("owner", "name")


    return messes

}

export const joinMess = async (userId, messId) => {
    const deliveryBoy = await DeliveryBoy.findOne({
        user : userId
    })   

    if(!deliveryBoy){
        throw new Error("Delivery boy not found")
    }

    const deliveryBoyId = deliveryBoy._id

    const deliveryBoyRequestExist = await DeliveryBoyRequest.findOne({
        deliveryBoy : deliveryBoyId,
        mess : messId,
        status : {$in : ["APPROVED", "PENDING"]}
    })

    if(deliveryBoyRequestExist){
        throw new Error(
            deliveryBoyRequestExist.status === "APPROVED" ?
            "You are already approved for this mess"
            : "Your request is pending"
        )
    }

    const deliveryBoyRequest = await DeliveryBoyRequest.create({
        deliveryBoy : deliveryBoyId,
        mess : messId
    })

    return deliveryBoyRequest
}

export const getDeliveryBoyRequests = async (messId) => {
    const dBoysRequests = await DeliveryBoyRequest.find({
        mess : messId
    }).populate({
        path : "deliveryBoy", 
        select : "availabilityStatus",
        populate : {
            path : "user",
            select : "name phone address pincode isActive"
        }
    })

    return dBoysRequests
}

export const approveRequest = async(reqId) => {
    const dBoyReq = await DeliveryBoyRequest.findById(reqId)

    if(!dBoyReq){
        throw new Error("Delivery boy Request not found")
    }

    if(dBoyReq.status === "APPROVED"){
        throw new Error("Already approved")
    }

    dBoyReq.status = "APPROVED"
    await dBoyReq.save()

    const messId = dBoyReq.mess

    const dBoyId = dBoyReq.deliveryBoy

    const dBoy = await DeliveryBoy.findById(dBoyId)

    if(!dBoy){
        throw new Error("Delivery boy not found")
    }

    if(!dBoy.workingMesses.includes(messId)){
    dBoy.workingMesses.push(messId)
    }

    const mess = await Mess.findById(messId)

    if(!mess){
        throw new Error('Mess not found')
    }

    if(!mess.deliveryPartners.includes(dBoyId)){
        mess.deliveryPartners.push(dBoyId)
    }

    if(mess.deliveryPartners.length !== 0){
        mess.deliveryType = "DELIVERY"
    }else{
        mess.deliveryType = "SELF_PICK"
    }

    await mess.save()

    dBoy.availabilityStatus = "AVAILABLE"
    await dBoy.save()

    await Notification.create({
        user : dBoy.user,
        title : "Approval",
        message : "Youre request is approved as a delivery boy",

    })

    return dBoyReq


}


export const rejectRequest = async (reqId) => {
    const dBoyReq = await DeliveryBoyRequest.findById(reqId)

    if(!dBoyReq){
        throw new Error("Delivery boy request not found")
    }

    if(dBoyReq.status === "APPROVED"){
        throw new Error("Approved already cannot be reject")
    }

    if(dBoyReq.status === "REJECTED"){
        throw new Error("Already rejected")
    }

    dBoyReq.status = "REJECTED"
    await dBoyReq.save()

    await Notification.create({
        user : dBoyId,
        title : "Rejection",
        message : "Youre request is rejected as a delivery boy",
        
    })

    return dBoyReq
}

export const checkDeliveryBoyPinMatchesUsersPin = async (userPin, messId) => {
    const mess = await Mess.findById(messId)

    if(!mess){
        throw new Error("Mess not found")
    }

    const matchingDboy = await DeliveryBoy.find({
        _id : {$in: mess.deliveryPartners },
        servicePinCodes : userPin,
        workingMesses : messId,
        availabilityStatus : "AVAILABLE",
         
    }).populate("user", "name phone address")

    return matchingDboy
}


export const approveOrderRequest = async (data) => {
    const { orderReqId, dBoyId, orderId } = data

    if(!orderReqId || !dBoyId || !orderId){
        throw new Error("Required fields")
    }

    const orderReq = await OrderRequest.findById(orderReqId)

    if(!orderReq){
        throw new Error("No order request found")
    }

    orderReq.status = "ACCEPTED"
    await orderReq.save()

    const dBoy = await DeliveryBoy.findById(dBoyId)

    if(!dBoy){
        throw new Error("Delivery boy not found")
    }

    dBoy.availabilityStatus = "BUSY"
    dBoy.activeOrder = orderId
    await dBoy.save()

    const order = await Order.findById(orderId)

    if(!order){
        throw new Error("Order not found")
    }

    order.orderShippingType = "DELIVERY"
    order.dBoy = dBoyId
    await order.save()

    return orderReq


}

export const rejectOrderRequest = async (data) => {
    const { orderReqId , dBoyId, orderId} = data

    const orderReq = await OrderRequest.findById(orderReqId)

    if(!orderReq){
        throw new Error("No Order request found")
    }

    orderReq.status = "REJECTED"
    await orderReq.save()

    const dBoy = await DeliveryBoy.findById(dBoyId)

    if(!dBoy){
        throw new Error("Delivery boy not found")
    }

    dBoy.availabilityStatus = "AVAILABLE"
    await dBoy.save()

    const order = await Order.findById(orderId)

    if(!order){
        throw new Error("Order not found")

    }

    order.orderShippingType = "SELF_PICK"
    await order.save()

    
    
    return orderReq
}


export const getDeliveryBoysOfMess = async (ownerId) => {

    const mess = await Mess.findOne({ owner: ownerId });
  
    if (!mess) {
      throw new Error("Mess not found");
    }
  
    const dBoys = await DeliveryBoy.find({
      workingMesses: mess._id
    }).populate("user");
  
    return dBoys;
  };


