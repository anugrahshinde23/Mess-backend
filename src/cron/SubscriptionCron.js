import cron from "node-cron"
import Subscription from "../models/subscription.model.js"

cron.schedule("* * * * *", async () => {
  const now = new Date()

  // 🔹 START PLANS
  await Subscription.updateMany(
    {
      status: "PENDING",
      startDate: { $lte: now }
    },
    {
      $set: {
        status: "ACTIVE",
        activatedAt: now
      }
    }
  )

  // 🔹 END PLANS
  await Subscription.updateMany(
    {
      status: "ACTIVE",
      endDate: { $lt: now }
    },
    {
      $set: { status: "EXPIRED" }
    }
  )
})
