import { GoogleGenerativeAI } from "@google/generative-ai";
import { QUANTUM_KNOWLEDGE } from "../knowledge_base";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function handleChat(req: any, res: any) {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                text: "I'm currently in basic mode because my API key is missing. Please add GEMINI_API_KEY to the .env file to enable my full quantum intelligence!"
            });
        }

        const systemPrompt = `You are Quantara, a specialized Quantum Computing Assistant. You help users understand quantum mechanics, superposition, entanglement, and how to use the Quantara application. 

Use the following specialized knowledge to answer user queries when relevant:

Applications of Quantum State Visualizers:
${QUANTUM_KNOWLEDGE.visualizer_applications.map(app => `- ${app}`).join('\n')}

Why Quantum Circuits are used:
${QUANTUM_KNOWLEDGE.circuits_importance.map(item => `- ${item}`).join('\n')}

About Quantum Gates:
${QUANTUM_KNOWLEDGE.gates_info.map(info => `- ${info}`).join('\n')}

Keep your responses concise, educational, and engaging. If the user asks non-quantum questions, kindly redirect them to quantum topics if possible, but still answer politely.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error: any) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to get response from AI assistant." });
    }
}
