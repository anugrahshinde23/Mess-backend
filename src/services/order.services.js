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
  });

  if (existingOrder) {
    throw new Error(
      "You already placed an order! wait until it gets completes"
    );
  }

  const { messId, mealType } = orderData;

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

  // ✅ TIME VALIDATION (FINAL)
  const now = new Date();

  const [startHour, startMinute] = meal.startTime.split(":");
  const startTime = new Date();
  startTime.setHours(startHour, startMinute, 0, 0);

  const [endHour, endMinute] = meal.endTime.split(":");
  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  if (now < startTime) {
    throw new Error(`${mealType} ordering has not started yet`);
  }

  if (now > endTime) {
    throw new Error(`${mealType} ordering time is over`);

    
  }


  const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  const order = await Order.create({
    mess: messId,
    user: userId,
    mealType,
    items: meal.items,
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

  const expiresAt = new Date(Date.now() + 30 * 1000);

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


