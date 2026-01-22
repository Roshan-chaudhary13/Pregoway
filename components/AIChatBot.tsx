"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
};

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'ai', text: "Hi mom! 👋 How are you feeling today? I can help answer questions or track your progress.", timestamp: new Date() }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Prepare history for context
            const history = messages.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: m.text
            })) as { role: 'model' | 'user', parts: string }[];

            // Dynamic import to avoid client-side issues with server actions if strictly typed or bundled weirdly
            // But usually, standard import works. Let's try standard import at top level if it were not client component.
            // Since it is client component, we can import server action.
            const { chatWithGemini } = await import("@/app/actions/ai");
            const responseText = await chatWithGemini(userText, history);

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: responseText, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: "Sorry, I'm having trouble connecting right now.", timestamp: new Date() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-brand-600 to-pink-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-in zoom-in slide-in-from-bottom-5"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed right-4 bottom-20 z-50 bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-brand-100",
            isMinimized ? "w-72 h-14 rounded-full bottom-24" : "w-[90vw] max-w-sm h-[500px] rounded-3xl"
        )}>
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-pink-500 p-4 flex justify-between items-center text-white shrink-0 cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-yellow-200" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Pregoway AI</h3>
                        {!isMinimized && <p className="text-[10px] text-brand-100 opacity-90 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isMinimized && (
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true) }} className="p-1 hover:bg-white/10 rounded-lg">
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false) }} className="p-1 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                    msg.role === 'user' ? "bg-brand-600 text-white rounded-br-none" : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"
                                )}>
                                    {msg.text}
                                    <div className={cn("text-[9px] mt-1 opacity-70", msg.role === 'user' ? "text-brand-100" : "text-gray-400")}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-gray-100 shadow-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask anything..."
                            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400"
                        />
                        <button disabled={!input.trim() || isTyping} className="p-2 bg-brand-600 rounded-xl text-white hover:bg-brand-700 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
