import cron from "node-cron"
import Menu from "../models/menu.model.js"
import Subscription from "../models/subscription.model.js"
import Order from "../models/order.model.js"
import { autoAssignSubscriptionOrder } from "../services/order.services.js"

/* =====================================================
   IST DATE HELPERS  (🔥 MOST IMPORTANT PART)
===================================================== */

const getISTDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  )
}

const getStartOfToday = () => {
  const d = getISTDate()
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfToday = () => {
  const d = getISTDate()
  d.setHours(23, 59, 59, 999)
  return d
}

const getDay = () => {
  return getISTDate().toLocaleString("en-US", { weekday: "long" })
}

const getCurrentTime = () => {
  return getISTDate().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/* =====================================================
   CRON JOB (RUNS EVERY MINUTE – IST SAFE)
===================================================== */

cron.schedule(
  "* * * * *",
  async () => {
    try {
      const todayStart = getStartOfToday()
      const todayEnd = getEndOfToday()
      const day = getDay()
      const now = getCurrentTime()
      const nowMin = timeToMinutes(now)

      console.log(
        "⏰ Subscription cron",
        "| Day:", day,
        "| Time (IST):", now
      )

      const menus = await Menu.find({ day })

      for (const menu of menus) {
        for (const mealType of ["breakfast", "lunch", "dinner"]) {

          const slot = menu[mealType]

          if (
            !slot ||
            !slot.startTime ||
            !slot.endTime ||
            !slot.items ||
            slot.items.length === 0
          ) continue

          const startMin = timeToMinutes(slot.startTime)
          const endMin = timeToMinutes(slot.endTime)

          // ❌ Not in meal time window
          if (nowMin < startMin || nowMin > endMin) continue

          const subscriptions = await Subscription.find({
            mess: menu.mess,
            status: "ACTIVE",
            startDate: { $lte: todayStart },
            endDate: { $gte: todayEnd }, // 🔥 IMPORTANT FIX
          })

          for (const sub of subscriptions) {

            const alreadyExists = await Order.findOne({
              subscription: sub._id,
              mealType,
              orderDate: { $gte: todayStart, $lte: todayEnd },
            })

            if (alreadyExists) continue

            const code = Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")


            

            /* ================= CREATE ORDER ================= */

            const order = await Order.create({
              mess: sub.mess,
              user: sub.user,
              mealType,
              items: slot.items,

              orderCompleteCode: code,
              source: "SUBSCRIPTION",
              subscription: sub._id,
              status: "PLACED",
              orderDate: getISTDate(), // 🔥 IST SAFE
            })

            console.log(`✅ ${mealType.toUpperCase()} order created`, order._id)

            /* ================= AUTO ASSIGN ================= */

            await autoAssignSubscriptionOrder({
              orderId: order._id,
              messId: sub.mess,
            })

            console.log(`🚚 Auto assigned order`, order._id)
          }
        }
      }
    } catch (error) {
      console.error("❌ Subscription cron error:", error.message)
    }
  },
  {
    timezone: "Asia/Kolkata", // 🔥 FINAL FIX
  }
)
