import dotenv from 'dotenv'
import { app } from './app.js'
import { connectDb } from './config/mongo.db.js'
import fs from "fs"


dotenv.config({
    path:".env"
})


if (!fs.existsSync("generated-projects")) {
    fs.mkdirSync("generated-projects", { recursive: true });
  console.log("Created root folder for generated projects ✅");
}

connectDb()

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Backend is running on the port ${port}`);
    
})