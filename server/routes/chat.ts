import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function handleChat(req: any, res: any) {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                text: "I'm currently in basic mode because my API key is missing. Please add GEMINI_API_KEY to the .env file to enable my full quantum intelligence!"
            });
        }

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const systemPrompt = "You are Quantara, a specialized Quantum Computing Assistant. You help users understand quantum mechanics, superposition, entanglement, and how to use the Quantara application. Keep your responses concise, educational, and engaging. If the user asks non-quantum questions, kindly redirect them to quantum topics if possible, but still answer politely.";

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error: any) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to get response from AI assistant." });
    }
}
