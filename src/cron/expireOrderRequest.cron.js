import cron from "node-cron"
import OrderRequest from "../models/orderRequest.model.js"
import DeliveryBoy from "../models/deliveryBoy.model.js"
import Order from "../models/order.model.js"

/* ================= IST HELPER ================= */

const getISTDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  )
}

/* ================= CRON ================= */

cron.schedule(
  "*/5 * * * * *", // every 5 seconds
  async () => {
    try {
      const now = getISTDate()

      const expiredRequests = await OrderRequest.find({
        status: "PENDING",
        expiresAt: { $lte: now },
      })

      for (const req of expiredRequests) {

        // 🛑 extra safety
        if (req.status !== "PENDING") continue

        /* 1️⃣ EXPIRE REQUEST */
        req.status = "EXPIRED"
        await req.save()

        /* 2️⃣ FREE DELIVERY BOY */
        await DeliveryBoy.findByIdAndUpdate(req.dBoy, {
          availabilityStatus: "AVAILABLE",
        })

        /* 3️⃣ RESET ORDER */
        await Order.findByIdAndUpdate(req.order, {
          status: "PLACED", // ready for reassignment
          assignedTo: null,
        })

        console.log(
          `⏳ OrderRequest expired | Order: ${req.order} | DBoy: ${req.dBoy}`
        )
      }
    } catch (err) {
      console.error("❌ OrderRequest cron error:", err.message)
    }
  },
  {
    timezone: "Asia/Kolkata", // 🔥 VERY IMPORTANT
  }
)
