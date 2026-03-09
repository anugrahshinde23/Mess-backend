import { createDocuments } from "./createDocuments.js";
import { connectDb } from "../src/config/mongo.db.js"; // Import your connection function
import dotenv from "dotenv";
import { splitIntoChunks } from "./splitter.js";
import { createEmbeddingsAndSendToDB } from "./embeddings.js";

// Load env variables because test.js needs the MONGO_URI
dotenv.config({ path: "../.env" }); 

const test = async () => {
    try {
        // 1. You MUST connect the database in THIS specific process
        await connectDb();

        const docs = await createDocuments();

        console.log("Total Documents:", docs.length);
        if (docs.length > 0) {
            
            console.log("Sample Document:", docs[0]);
            
        }

        const chunks = await splitIntoChunks(docs)

        await createEmbeddingsAndSendToDB(chunks)
        
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

test();
