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
    
        console.log(`📤 Sending ${chunks.length} chunk(s) to Hugging Face...`);
    
        // 1. Initialize the vector store connection
        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection,
            indexName: "vector_index",
            textKey: "text", 
            embeddingKey: "embedding",
        });

        // 2. Use addDocuments instead of fromDocuments for live updates
        await vectorStore.addDocuments(chunks);
    
        console.log("✅ Success! Vector Store updated.");
      } catch (err) {
        console.error("❌ Error saving to vector store:", err);
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

