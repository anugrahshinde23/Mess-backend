import Mess from "../models/mess.model.js"
import Notification from "../models/notification.model.js"
import Order from "../models/order.model.js"
import Payment from "../models/payment.model.js"
import Wallet from "../models/wallet.model.js"
import DeliveryBoy from "../models/deliveryBoy.model.js"

export const createPayment = async(userId, paymentData) => {
    const {messId,orderId, amount, utrNumber} = paymentData

    if(!messId || !orderId || !amount || !utrNumber){
        throw new Error("All fields including UTR number is required")
    }

    const utrExists = await Payment.findOne({ utrNumber });
    if (utrExists) {
        throw new Error("This Transaction ID/UTR has already been submitted.");
    }

    const paymentExist = await Payment.findOne({
        order : orderId,
        user : userId,
        mess : messId,
        status : "PAID"
    })

    if(paymentExist){
        throw new Error("Payment is already done successfully")
    }

    const OWNER_SHARE=0.8
    const DBOY_SHARE=0.15
    const ADMIN_SHARE=0.05

    const split = {
        ownerShare : Math.round(amount * OWNER_SHARE),
        deliveryShare : Math.round(amount * DBOY_SHARE),
        adminShare : Math.round(amount * ADMIN_SHARE)
    }

    

    const payment = await Payment.create({
        user : userId,
        order : orderId,
        mess : messId,
        amount,
        utrNumber,
        status : "PENDING",
        split
    })

    const order = await Order.findById(orderId)

    if(!order){
        throw new Error("Order not exist")
    }

    order.payment = payment._id
    await order.save()

    await Notification.create({
        user: userId,
        title: "Payment Submitted",
        message: "Your payment is under verification. It will be updated soon."
    });

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


export const verifyPaymentByAdmin = async (paymentId) => {
    const payment = await Payment.findById(paymentId)

    if (!payment) {
        throw new Error("Payment not found")
    }


    const order = await Order.findOne({
        payment : paymentId
    })

    if(!order){
        throw new Error("Order not found")
    }

    const messId = order.mess
    const dBoyId = order.dBoy

    const mess = await Mess.findById(messId)

    if(!mess){
        throw new Error("Mess not found")
    }

    const messOwner =  mess.owner

    const dBoy = await DeliveryBoy.findById(dBoyId)

    if(!dBoy){
        throw new Error("Delivery boy not found")
    }

    const dBoyUser = dBoy.user

    const messOwnerWallet = await Wallet.findOne({
        user : messOwner
    })

    if(!messOwnerWallet){
        throw new Error("Wallet not found for mess owner")
    }

    messOwnerWallet.balance = messOwnerWallet.balance + payment.split.ownerShare


    await messOwnerWallet.save()

    const dBoyUserWallet = await Wallet.findOne({
        user : dBoyUser
    })

    if(!dBoyUserWallet){
        throw new Error("Wallet not found for dboy user")

    }

    dBoyUserWallet.balance = dBoyUserWallet.balance + payment.split.deliveryShare

    await dBoyUserWallet.save()


    payment.status = "PAID"
    await payment.save()

    await Notification.create({
        user: payment.user,
        title : "Payment verified",
        message : "Your payment is verified successfully"
    })

    return payment
}


export const fetchPendingPayments = async () => {
    const payments = await Payment.find({
        status : "PENDING"
    }).sort({createdAt : -1})
    .populate("user", "name")

    return payments
}


