import dotenv from 'dotenv'
import { app } from './app.js'
import { connectDb } from './config/mongo.db.js'


dotenv.config({
    path:".env"
})

connectDb()

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Backend is running on the port ${port}`);
    
})