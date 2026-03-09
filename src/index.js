import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDb } from './config/mongo.db.js';

// 1. Add RAG imports
import { createDocuments } from "../rag/createDocuments.js";
import { splitIntoChunks } from "../rag/splitter.js";
import { createEmbeddingsAndSendToDB } from "../rag/embeddings.js";

dotenv.config({
    path: ".env"
});

const startServer = async () => {
    try {
        // 2. Connect to MongoDB
        await connectDb();
        console.log("✅ Database Connected");

        // 3. Initial RAG Sync (Important for Render)
        // This ensures your AI always has the latest mess data on startup
        console.log("🔄 Syncing Vector Store... Please wait.");
        const docs = await createDocuments();
        const chunks = await splitIntoChunks(docs);
        await createEmbeddingsAndSendToDB(chunks);
        console.log("✅ Vector Store is now 100% in sync.");

        // 4. Start the Server
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`🚀 Backend is running on the port ${port}`);
        });

    } catch (error) {
        console.error("❌ Server Startup Error:", error);
        process.exit(1); 
    }
};

startServer();
