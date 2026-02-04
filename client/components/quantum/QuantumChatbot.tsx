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

const KNOWLEDGE_BASE: Record<string, string> = {
    "hello": "Hello! I am your Quantum Assistant. I can help you understand quantum concepts like superposition, entanglement, and quantum gates.",
    "qubit": "A qubit (quantum bit) is the basic unit of quantum information. Unlike a classical bit, it can exist in a superposition of states |0⟩ and |1⟩.",
    "superposition": "Superposition is a fundamental principle of quantum mechanics that allows a physical system, such as an electron, to exist in multiple states simultaneously until it is measured.",
    "entanglement": "Entanglement is a phenomenon where two or more particles become connected in such a way that the state of one particle instantly influences the state of the other, even across vast distances.",
    "gate": "Quantum gates are basic quantum circuits operating on a small number of qubits. They are the building blocks of quantum algorithms, analogous to classical logic gates.",
    "hadamard": "The Hadamard gate (H) creates superposition. It transforms a definite state into a state where 0 and 1 are equally likely.",
    "bloch sphere": "The Bloch sphere is a geometrical representation of the pure state space of a two-level quantum mechanical system (qubit).",
    "shor": "Shor's algorithm is a quantum algorithm for integer factorization. It is famous because it could theoretically break most current encryption systems.",
    "grover": "Grover's algorithm is a quantum algorithm for unstructured search with a quadratic speedup over classical algorithms.",
    "default": "That's an interesting question! While I'm still learning, I recommend checking out our 'Education' tab for detailed lessons on that topic."
};

export function QuantumChatbot() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: t("chatbot.welcome") }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const normalizedInput = userMessage.toLowerCase();
            let response = KNOWLEDGE_BASE.default;

            for (const key in KNOWLEDGE_BASE) {
                if (normalizedInput.includes(key) && key !== "default") {
                    response = KNOWLEDGE_BASE[key];
                    break;
                }
            }

            setMessages(prev => [...prev, { role: "bot", content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4"
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
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110 shadow-cyan-500/20"}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </Button>
        </div>
    );
}
