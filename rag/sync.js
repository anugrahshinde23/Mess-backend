// rag/sync.js
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
    model: "sentence-transformers/all-MiniLM-L6-v2",
});

export const autoSyncToVector = async (langchainDocs) => {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const collection = client.db("multi_mess_db").collection("vector_search");

        await MongoDBAtlasVectorSearch.fromDocuments(langchainDocs, embeddings, {
            collection,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        });
        console.log("🚀 Vector DB Auto-Synced successfully");
    } catch (err) {
        console.error("Auto-Sync Error:", err);
    } finally {
        await client.close();
    }
};
