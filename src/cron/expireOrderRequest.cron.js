import cron from 'node-cron'
import OrderRequest from '../models/orderRequest.model.js'
import DeliveryBoy from '../models/deliveryBoy.model.js'
import Order from '../models/order.model.js'


cron.schedule("*/5 * * * * *", async () => {
    try {
      const now = new Date()
  
      const expiredRequests = await OrderRequest.find({
        status: "PENDING",
        expiresAt: { $lte: now }
      })
  
      for (const req of expiredRequests) {

        if (req.status !== "PENDING") continue
  
        // expire request
        req.status = "EXPIRED"
        await req.save()
  
        // free delivery boy
        await DeliveryBoy.findByIdAndUpdate(req.dBoy, {
          availabilityStatus: "AVAILABLE",
          
        })
  
        // reset order (if still assigning)
        
      }
  
    } catch (err) {
      console.error("Cron error:", err.message)
    }
  })
