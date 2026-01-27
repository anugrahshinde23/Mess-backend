import Notification from "../models/notification.model.js"
import Order from "../models/order.model.js"
import Payment from "../models/payment.model.js"

export const createPayment = async(userId, paymentData) => {
    const {messId,orderId, amount} = paymentData

    const paymentExist = await Payment.findOne({
        order : orderId,
        user : userId,
        messId : messId,
        status : "PAID"
    })

    if(paymentExist){
        throw new Error("Payment is already done successfully")
    }

    if(!messId ||!orderId || !amount){
        throw new Error("Required fields")
    }

    const payment = await Payment.create({
        user : userId,
        order : orderId,
        mess : messId,
        amount,
        status : "PAID"
    })

    const order = await Order.findById(orderId)

    if(!order){
        throw new Error("Order not exist")
    }

    order.payment = payment._id
    await order.save()

    await Notification.create({
        user : userId,
        title : "Payment",
        message : "Payment Successfull"
    })

    return payment
}

export const getPaymentHistoryUser = async (userId) => {
    const payments = await Payment.find({
        user : userId
    }).sort({createdAt : -1})
    .populate("order", "items")
    .populate("mess", "name")

    return payments
}

