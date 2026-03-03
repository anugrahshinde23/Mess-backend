import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'



const app = express()

app.set("trust proxy",1)

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://mess-frontend-seven.vercel.app"
    ],
    credentials: true
}))


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/api/', (req,res) =>{
    res.json([{
        message : "Hi from backend",
        name : "Anugrah"
    }])
})

import './cron/expireSubscription.cron.js'
import './cron/expireOrderRequest.cron.js'
import './cron/subcriptionAutoOrder.js'
import './cron/SubscriptionCron.js'

import authRoutes from './routes/auth.routes.js'
app.use('/api/v1/auth', authRoutes)

import userRoutes from './routes/user.routes.js'
app.use('/api/v1/user', userRoutes)

import messRoutes from './routes/mess.routes.js'
app.use('/api/v1/mess', messRoutes)

import planRoutes from './routes/plan.routes.js'
app.use('/api/v1/plan', planRoutes)

import menuRoutes from './routes/menu.routes.js'
app.use('/api/v1/menu', menuRoutes)

import subscriptionRoutes from './routes/subscription.routes.js'
app.use('/api/v1/subscription', subscriptionRoutes)

import orderRoutes from "./routes/order.routes.js"
app.use('/api/v1/order', orderRoutes)

import notificationRoutes from './routes/notification.router.js'
app.use('/api/v1/notification', notificationRoutes)

import paymentRoutes from './routes/payment.routes.js'
app.use('/api/v1/payment', paymentRoutes)

import deliveryBoyRoutes from './routes/deliveryBoy.routes.js'
app.use('/api/v1/deliveryboy', deliveryBoyRoutes)

import walletRoutes from './routes/wallet.routes.js'
app.use('/api/v1/wallet', walletRoutes)

import verityRoutes from './routes/verity.routes.js'
app.use('/api/v1/verity', verityRoutes)

import projectRoutes from './routes/projectRoutes.js'
app.use('/api/v1/project', projectRoutes)



import { createProxyMiddleware } from "http-proxy-middleware";
import Project from "./models/verity/projects.model.js";

app.use("/preview/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !project.execution || !project.execution.frontendPort) {
      return res.status(404).send("Project not running");
    }

    const target = `http://localhost:${project.execution.frontendPort}`;

    // Proxy the request to the frontend process
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true, // if your frontend uses WebSockets / HMR
    })(req, res, next);
  } catch (error) {
    console.error("Preview Error:", error);
    res.status(500).send("Error accessing project preview");
  }
});


export {app}
