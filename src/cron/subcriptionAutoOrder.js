import cron from "node-cron"
import Menu from "../models/menu.model.js"
import Subscription from "../models/subscription.model.js"
import Order from "../models/order.model.js"
import { autoAssignSubscriptionOrder } from "../services/order.services.js"


/* ---------- HELPERS ---------- */

const getStartOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfToday = () => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

const getDay = () => {
  return new Date().toLocaleString("en-US", { weekday: "long" })
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/* ---------- CRON ---------- */

cron.schedule("* * * * *", async () => {
  try {
    const todayStart = getStartOfToday()
    const todayEnd = getEndOfToday()
    const day = getDay()
    const now = getCurrentTime()
    const nowMin = timeToMinutes(now)

    console.log("⏰ Subscription cron running", day, now)

    const menus = await Menu.find({ day })

    for (const menu of menus) {
      for (const mealType of ["breakfast", "lunch", "dinner"]) {

        const slot = menu[mealType]
        if (!slot || !slot.startTime || slot.items.length === 0) continue

        const startMin = timeToMinutes(slot.startTime)
        const endMin = timeToMinutes(slot.endTime)

        if (nowMin < startMin || nowMin > endMin) continue

        const subscriptions = await Subscription.find({
          mess: menu.mess,
          status: "ACTIVE",
          startDate: { $lte: todayStart },
          endDate: { $gte: todayStart },
        })

        for (const sub of subscriptions) {

          const alreadyExists = await Order.findOne({
            subscription: sub._id,
            mealType,
            orderDate: { $gte: todayStart, $lte: todayEnd },
          })

          if (alreadyExists) continue
          
          const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

          /* ✅ 1️⃣ CREATE ORDER */
          const order = await Order.create({
            mess: sub.mess,
            user: sub.user,
            mealType,
            items: slot.items,
            orderCompleteCode : code,
            source: "SUBSCRIPTION",
            subscription: sub._id,
            status: "PLACED",
            orderDate: new Date(),
          })

          console.log(`✅ ${mealType} order created`, order._id)

          /* ✅ 2️⃣ AUTO ASSIGN ORDER */
          await autoAssignSubscriptionOrder({
            orderId: order._id,
            messId: sub.mess,
          })

          console.log(`🚚 Auto assigned order ${order._id}`)
        }
      }
    }
  } catch (error) {
    console.error("❌ Subscription cron error:", error.message)
  }
})
