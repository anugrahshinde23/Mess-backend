// rag/retriever.js
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export const getVectorStore = async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const collection = client.db("multi_mess_db").collection("vector_search");

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
        model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });

    return { vectorStore, client };
};
