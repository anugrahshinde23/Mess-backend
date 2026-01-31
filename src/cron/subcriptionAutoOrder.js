import cron from "node-cron"
import Menu from "../models/menu.model.js"
import Subscription from "../models/subscription.model.js"
import Order from "../models/order.model.js"

/* ---------- HELPERS ---------- */

// start of today (00:00)
const getStartOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// end of today (23:59)
const getEndOfToday = () => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

// Friday, Monday etc
const getDay = () => {
  return new Date().toLocaleString("en-US", { weekday: "long" })
}

// HH:mm (24 hr format)
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// convert HH:mm → minutes
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

    // 1️⃣ get today's menus
    const menus = await Menu.find({ day })

    for (const menu of menus) {

      for (const mealType of ["breakfast", "lunch", "dinner"]) {

        const slot = menu[mealType]
        if (!slot || !slot.startTime || slot.items.length === 0) continue

        const startMin = timeToMinutes(slot.startTime)
        const endMin = timeToMinutes(slot.endTime)

        // 2️⃣ check time window
        if (nowMin < startMin || nowMin > endMin) continue

        // 3️⃣ get active subscriptions
        const subscriptions = await Subscription.find({
          mess: menu.mess,
          status: "ACTIVE",
          startDate: { $lte: todayStart },
          endDate: { $gte: todayStart }
        })

        for (const sub of subscriptions) {

          // 4️⃣ prevent duplicate order
          const alreadyExists = await Order.findOne({
            subscription: sub._id,
            mealType,
            orderDate: {
              $gte: todayStart,
              $lte: todayEnd
            }
          })

          if (alreadyExists) continue

          // 5️⃣ create order
          await Order.create({
            mess: sub.mess,
            user: sub.user,
            mealType,
            items: slot.items,
            source: "SUBSCRIPTION",
            subscription: sub._id,
            status: "PLACED"
          })

          console.log(`✅ ${mealType.toUpperCase()} order created for subscription ${sub._id}`)
        }
      }
    }

  } catch (error) {
    console.error("❌ Subscription cron error:", error.message)
  }
})
