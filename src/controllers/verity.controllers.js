import { askVerity } from "../services/verity.service.js";

export const askVerityQuestion = async (req, res) => {
    try {
        
        
        // Basic Validation
        if (!msg) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const data = await askVerity(req.body);

        return res.status(200).json({
            success: true,
            message: "Successfully asked question",
            reply: data.choices[0]?.message?.content || "No response from AI"
        });
    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ // Changed to 500 for Server Error
            success: false,
            message: error.message
        });
    }
};
