import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
    model: "sentence-transformers/all-MiniLM-L6-v2",
});

export const createEmbeddingsAndSendToDB = async (chunks) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();
        const collection = client.db("multi_mess_db").collection("vector_search");
    
        // 1. Initial Sync (Full List)
        if (chunks.length > 1) {
            const count = await collection.countDocuments();
            if (count > 0) {
                console.log(`ℹ️ Skipping full sync. Count: ${count}`);
                return;
            }
        } 
        
        // 2. Live Update (Single Chunk)
        else if (chunks.length === 1) {
            // Hum extract kar rahe hain ID ko metadata se
            const docId = chunks[0].metadata.id; 
            
            if (docId) {
                // Pehle purana record delete karo
                const delResult = await collection.deleteMany({ "id": docId });
                console.log(`🧹 Deleted ${delResult.deletedCount} old doc(s) for ID: ${docId}`);
            }
        }

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection,
            indexName: "vector_index",
            textKey: "text", 
            embeddingKey: "embedding",
        });

        // 3. Naya version add karo
        await vectorStore.addDocuments(chunks);
        console.log("✅ Success! Vector Store updated.");

      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        await client.close();
      }
};



// Add this new export to your embeddings.js
export const deleteFromVectorDB = async (docId) => {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const collection = client.db("multi_mess_db").collection("vector_search");

        // We use a filter to find the document by its original ID in metadata
        // MongoDB Atlas Vector Search stores this in the 'metadata' field
        const result = await collection.deleteMany({ "metadata.id": docId });
        
        console.log(`🗑️ Deleted ${result.deletedCount} document(s) from Vector Store`);
    } catch (err) {
        console.error("❌ Error deleting from vector store:", err);
    } finally {
        await client.close();
    }
};

