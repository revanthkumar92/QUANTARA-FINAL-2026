import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "bot";
    content: string;
}

const QUANTUM_KNOWLEDGE_BASE: Record<string, string> = {
    // Real-world Applications of Quantum State Visualizer
    "visualizer": "A Quantum State Visualizer helps us see how qubits evolve. It's used for:\n• Education & Training - visualizing probability amplitudes\n• Debugging Quantum Circuits - testing algorithms before running on real hardware\n• Algorithm Development - designing QFT, Grover's Search, Shor's Factoring\n• Industry Optimization - pharma (molecules), finance (portfolios), material science (electron states)",

    // Quantum Circuits
    "circuit": "Quantum circuits are the core framework for quantum computing. They provide step-by-step qubit transformations using quantum gates. Just like classical computers use logic circuits, quantum computers use quantum circuits to design and run algorithms. Any complex algorithm like Shor's is broken into smaller circuit operations.",

    // Quantum Gates - Enhanced
    "gate": "Quantum gates are the building blocks of quantum circuits. Key gates include:\n• Hadamard (H) - creates superposition\n• Pauli-X - quantum NOT gate\n• CNOT - creates entanglement\n• Toffoli - quantum AND gate\n\nThey enable cryptography, drug discovery, optimization, and quantum ML.",

    // Original knowledge base entries
    "hello": "Hello! I'm Quantara, your Quantum Assistant. I can help you understand quantum mechanics, superposition, entanglement, quantum gates, and real-world applications!",
    "qubit": "A qubit (quantum bit) is the basic unit of quantum information. Unlike a classical bit, it can exist in a superposition of states |0⟩ and |1⟩ simultaneously.",
    "superposition": "Superposition is a fundamental principle where a quantum system exists in multiple states at once until measured. The Hadamard gate creates superposition, allowing quantum computers to explore many solutions simultaneously - this is why Grover's algorithm can search √N times faster!",
    "entanglement": "Entanglement is when particles become connected so the state of one instantly influences the other, even at a distance. CNOT and controlled gates create entanglement, which is essential for Quantum Key Distribution (QKD) for unbreakable encryption.",
    "hadamard": "The Hadamard gate (H) creates superposition, transforming |0⟩ into a state where 0 and 1 are equally likely. This enables quantum parallelism - the ability to explore many possible solutions at once!",
    "bloch sphere": "The Bloch sphere is a 3D geometrical representation of a qubit's state space. It helps visualize quantum states and transformations.",
    "shor": "Shor's algorithm efficiently factors large integers, posing a threat to classical RSA encryption. It's a prime example of quantum advantage in cryptography.",
    "grover": "Grover's algorithm provides a quadratic speedup for searching unstructured databases - √N times faster than classical methods!",
    "teleportation": "Quantum teleportation transmits quantum information from one location to another using entanglement - without physically moving the particle!",
    "interference": "Quantum interference occurs when probability amplitudes combine to reinforce or cancel each other, enabling quantum algorithms to amplify correct answers.",
    "measurement": "Measurement collapses a quantum state from superposition into one of the basis states (|0⟩ or |1⟩). This is irreversible!",
    "bell": "Bell states are specific highly entangled quantum states of two qubits, fundamental to quantum communication and teleportation.",
    "qiskit": "Qiskit is an open-source SDK for working with quantum computers at the level of circuits, pulses, and algorithms.",
    "application": "Quantum computing applications include:\n• Cryptography - breaking RSA & creating secure encryption\n• Drug Discovery - simulating molecular interactions\n• Optimization - logistics, finance, traffic management\n• AI/ML - quantum machine learning for faster classification",
    "cnot": "CNOT (Controlled-NOT) is a two-qubit gate that creates entanglement. It flips the target qubit only if the control qubit is |1⟩.",
    "pauli": "Pauli gates (X, Y, Z) are fundamental single-qubit gates. Pauli-X is like a classical NOT gate, flipping |0⟩↔|1⟩.",
    "toffoli": "The Toffoli gate is a three-qubit gate (also called CCNOT). It's universal for classical computation and important for quantum error correction.",
    "reversible": "Quantum gates are reversible, unlike classical logic gates. This reversibility is essential for simulating physical systems like molecules and materials.",
    "default": "That's an interesting question! I can help you with quantum computing concepts. Try asking me about qubits, superposition, entanglement, quantum gates, circuits, visualizers, or real-world applications!"
};

function findBestMatch(input: string): string {
    const normalizedInput = input.toLowerCase();

    // Check for exact or partial matches
    for (const [key, value] of Object.entries(QUANTUM_KNOWLEDGE_BASE)) {
        if (key !== "default" && normalizedInput.includes(key)) {
            return value;
        }
    }

    // Check for related terms
    if (normalizedInput.includes("why") && normalizedInput.includes("circuit")) {
        return QUANTUM_KNOWLEDGE_BASE.circuit;
    }
    if (normalizedInput.includes("real") || normalizedInput.includes("world") || normalizedInput.includes("use")) {
        if (normalizedInput.includes("visualiz")) return QUANTUM_KNOWLEDGE_BASE.visualizer;
        if (normalizedInput.includes("gate")) return QUANTUM_KNOWLEDGE_BASE.gate;
        return QUANTUM_KNOWLEDGE_BASE.application;
    }
    if (normalizedInput.includes("what") && (normalizedInput.includes("gate") || normalizedInput.includes("important"))) {
        return QUANTUM_KNOWLEDGE_BASE.gate;
    }

    return QUANTUM_KNOWLEDGE_BASE.default;
}

export function QuantumChatbot() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: "bot", content: t("chatbot.welcome") }]);
        }
    }, [t, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            // Prepare history for Gemini (max 10 messages)
            const history = messages.slice(-10).map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, history })
            });

            if (!response.ok) {
                // Fallback to enhanced local knowledge base if API fails
                const localResponse = findBestMatch(userMessage);
                setMessages(prev => [...prev, { role: "bot", content: localResponse }]);

            } else {
                const data = await response.json();
                setMessages(prev => [...prev, { role: "bot", content: data.text }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to my quantum core. Please check your internet or try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-end justify-end p-6">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 pointer-events-auto"
                    >
                        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col bg-slate-900/95 border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-500/20">
                            <CardHeader className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                <CardTitle className="text-lg flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                                            <Sparkles className="h-5 w-5 text-cyan-400" />
                                        </div>
                                        <span>{t("chatbot.title")}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-gray-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                >
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-blue-600/20" : "bg-cyan-600/20"}`}>
                                                    {msg.role === "user" ? <User className="h-4 w-4 text-blue-400" /> : <Bot className="h-4 w-4 text-cyan-400" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/5 text-gray-200 rounded-tl-none border border-white/5"}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-2 max-w-[80%]">
                                                <div className="mt-1 h-8 w-8 rounded-full bg-cyan-600/20 flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                                                </div>
                                                <div className="p-3 rounded-2xl bg-white/5 text-gray-400 text-sm italic">
                                                    Quantum thinking...
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                        placeholder={t("chatbot.placeholder")}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500"
                                    />
                                    <Button onClick={handleSend} size="icon" className="bg-cyan-600 hover:bg-cyan-500 shrink-0">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 pointer-events-auto ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110 shadow-cyan-500/20"}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </Button>
        </div>
    );
}
