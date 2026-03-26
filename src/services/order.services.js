import Mess from "../models/mess.model.js";
import Menu from "../models/menu.model.js";
import Order from "../models/order.model.js";
import { getTodaysDay } from "../utility/getTodaysDay.js";
import Notification from "../models/notification.model.js";
import OrderRequest from "../models/orderRequest.model.js";
import DeliveryBoy from "../models/deliveryBoy.model.js";

export const oneTimeOrder = async (userId, orderData) => {
  const existingOrder = await Order.findOne({
    user: userId,
    status: { $in: ["PLACED"] },
    source : { $in: ["NORMAL"] }
  });

  if (existingOrder) {
    throw new Error(
      "You already placed an order! wait until it gets completes"
    );
  }

  const { messId, mealType, price } = orderData;

  if (!messId || !mealType) {
    throw new Error("Required fields");
  }

  const mess = await Mess.findById(messId);
  if (!mess) {
    throw new Error("Mess not found");
  }
  
 

  const today = getTodaysDay();

  const menu = await Menu.findOne({
    mess: messId,
    day: today,
  });

  if (!menu) {
    throw new Error("Menu not available today");
  }

  const meal = menu[mealType];
  if (!meal) {
    throw new Error(`${mealType} not available today`);
  }

  const getCurrentTimeIST = () => {
    return new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata"
    });
  };
  
  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  
  const nowMin = timeToMinutes(getCurrentTimeIST());
  const startMin = timeToMinutes(meal.startTime);
  const endMin = timeToMinutes(meal.endTime);
  
  if (nowMin < startMin) {
    throw new Error(`${mealType} ordering has not started yet`);
  }
  
  if (nowMin > endMin) {
    throw new Error(`${mealType} ordering time is over`);
  }
  


  const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  const order = await Order.create({
    mess: messId,
    user: userId,
    mealType,
    items: meal.items,
    price,
    orderCompleteCode : code,
    orderShippingType : mess.deliveryPartners.length === 0 ? "SELF_PICK" : "NOT_DECIDED"
  });

  return order;
};

export const getOrder = async (ownerId) => {
  const mess = await Mess.findOne({
    owner: ownerId,
  });

  if (!mess) {
    throw new Error("Mess not found");
  }

  const messId = mess._id;

  const orders = await Order.find({
    mess: messId,
  })
    .populate("user", "name phone address pincode")
    .populate("payment", "status");

  return orders;
};

export const getOrderHistory = async (userId) => {
  const orders = await Order.find({ user: userId })
    .populate("mess", "name")
    .sort({ createdAt: -1 });

  return orders; // empty array auto return
};

export const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  const orderReq = await OrderRequest.findOne({
    order : orderId
  })

  if(!orderReq){
    throw new Error("Order has not yet assigned")
    return
  }


  console.log("this is order request",orderReq);

  if(orderReq.status === "ACCEPTED"){
    throw new Error("Order is assigned cannot be cancelled")
  }

  if (!order) {
    throw new Error("Order not exist");
  }

  order.status = "CANCELLED";
  await order.save();

  return order;
};

export const assignOrderToDeliveryBoy = async (data) => {
  const { dBoyId, messId, orderId } = data;

  if (!dBoyId || !messId || !orderId) {
    throw new Error("Required things not provided");
  }

  const existingRequest = await OrderRequest.findOne({
    order: orderId,
    status: { $in: ["PENDING", "ACCEPTED"] },
  });

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      throw new Error("Request is already pending");
    }
    if (existingRequest.status === "ACCEPTED") {
      throw new Error("Order already assigned");
    }
  }

  const dBoy = await DeliveryBoy.findById(dBoyId);

  if (!dBoy || dBoy.availabilityStatus !== "AVAILABLE") {
    throw new Error("Delivery boy not available");
  }

  const userId = dBoy.user;

  const expiresAt = new Date(Date.now() + 45 * 1000);

  const request = await OrderRequest.create({
    dBoy: dBoyId,
    mess: messId,
    order: orderId,
    expiresAt,
  });

  (dBoy.availabilityStatus = "BUSY"), await dBoy.save();

  await Notification.create({
    user: userId,
    title: "Order Request",
    message: "You have a Order request",
  });

  return request;
};


export const autoAssignSubscriptionOrder = async ({orderId, messId}) => {
  if(!orderId || !messId){
    throw new Error("Required fields")
  }

  const order = await Order.findById(orderId)
  if(!order){
    throw new Error("Order not found")
  }

  const dBoys = await DeliveryBoy.find({
    workingMesses : messId,
    availabilityStatus : "AVAILABLE"
  }).sort({"subscriptionOrders.length" : 1})

  if(!dBoys.length){
    throw new Error("No Delivery boy found")
    return null
  }

  const selectedDboy = dBoys[0]

  await Order.findByIdAndUpdate(orderId, {
    orderShippingType : "DELIVERY"
  })

  await DeliveryBoy.findByIdAndUpdate(selectedDboy._id, {
    $push: {subscriptionOrders : orderId}
  })

  await Notification.create({
    user: selectedDboy.user,
    title: "New Subscription Order",
    message: "A subscription order has been assigned to you",
  });

  console.log(`✅ Order ${orderId} auto assigned to ${selectedDboy._id}`);

  return selectedDboy
}



export const getOrderRequests = async (dBoyId) => {
  const orderReq = await OrderRequest.find({
    dBoy: dBoyId,
  })
    .populate("mess", "name")
    .populate({
      path: "order",
      select: "mealType status items payment",
      populate: [
        {
          path: "user",
          select: "name phone address",
        },
        {
          path: "payment",
          select: "status amount",
        },
      ],
    })
    .sort({ createAt: -1 });

  return orderReq;
}

export const getDboyByActiveOrder = async (orderId) => {

  const dBoy = await DeliveryBoy.findOne({
    activeOrder : orderId || null
  })

  return dBoy

 

}


export const assignOrderAsSelfPick = async (orderId) => {

  const order = await Order.findById(orderId)

  if(!order){
    throw new Error("Order not found")
  }

  if(order.orderShippingType === "SELF_PICK"){
    throw new Error("Order already placed as self pick")
  }
  
  order.orderShippingType = "SELF_PICK"
  await order.save()


  return order
  
}

export const completeOrder = async (code, orderId) => {
  const order = await Order.findById(orderId)

  if(order.status === "COMPLETED"){
    throw new Error("Order already completed")
  }

  if(!order){
    throw new Error("Order not found")
  }

  const orderCode = order.orderCompleteCode

  
  
   
  if(!orderCode){
    throw new Error("No code provided for this order")
  }


  if(orderCode !== code){
    throw new Error("Invalid or wrong code")
  }else if(orderCode === code){
    order.status = "COMPLETED"
    await order.save()
  }

  return order
}

export const completeOrderByDboy = async (code, orderId, dBoyId) => {
  const order = await Order.findById(orderId)  

  if(!order){
    throw new Error("Order not found")
  }

  if(order.status === "COMPLETED"){
    throw new Error("Order already completed")
  }

  const orderCode = order.orderCompleteCode

  if(!orderCode){
    throw new Error("No code provided ")
  }

  if(orderCode !== code){
    throw new Error("Inavlid or wrong code") 
  } else if (orderCode === code){
    order.status = "COMPLETED"
    await order.save()
  }

  const dBoy = await DeliveryBoy.findById(dBoyId)

  if(!dBoy){
    throw new Error("Delivery boy not found")
  }

  dBoy.availabilityStatus = "AVAILABLE"
  dBoy.activeOrder = null
  await dBoy.save()

  return order
}


export const getSubscriptionOrders = async (dBoyId) => {
  const dBoy = await DeliveryBoy.findById(dBoyId)
    .populate({
      path: "subscriptionOrders",
      select: "mess user payment mealType items source status orderDate",
      populate: [
        { path: "user", select: "name phone address" },
        { path: "mess", select: "name" },
        { path: "payment", select: "status" }
      ]
    })

  if (!dBoy) {
    throw new Error("Delivery boy not found")
  }

  return dBoy.subscriptionOrders
}


export const completeSubsOrder = async ( code, dBoyId, orderId) => {
  const order = await Order.findById(orderId)

  if(!order){
    throw new Error("Order not found")
  }

  const orderCode = order.orderCompleteCode

  if(order.status === "COMPLETED"){
    throw new Error("Order already completed")
  }

  if(orderCode !== code){
    throw new Error("Invalid or wrong code")
  } else {
    order.status = "COMPLETED"
    await order.save()
  }

  await DeliveryBoy.findByIdAndUpdate(dBoyId, {
    $pull : {
      subscriptionOrders : orderId
    }
  })

  return order
}



