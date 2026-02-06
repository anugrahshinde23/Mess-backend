import cron from "node-cron"
import Subscription from "../models/subscription.model.js"

/* ========= IST HELPER ========= */

const getISTDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  )
}

/* ========= CRON ========= */

cron.schedule(
  "*/5 * * * *", // every 5 minutes (perfect)
  async () => {
    try {
      const now = getISTDate()

      console.log("⏰ Subscription cron running at", now.toLocaleString())

      /* 🔹 ACTIVATE PLANS */
      await Subscription.updateMany(
        {
          status: "PENDING",
          startDate: { $lte: now },
        },
        {
          $set: {
            status: "ACTIVE",
            activatedAt: now,
          },
        }
      )

      /* 🔹 EXPIRE PLANS */
      await Subscription.updateMany(
        {
          status: "ACTIVE",
          endDate: { $lt: now },
        },
        {
          $set: {
            status: "EXPIRED",
            expiredAt: now,
          },
        }
      )
    } catch (err) {
      console.error("❌ Subscription cron error:", err.message)
    }
  },
  {
    timezone: "Asia/Kolkata", // 🔥 MUST
  }
)
