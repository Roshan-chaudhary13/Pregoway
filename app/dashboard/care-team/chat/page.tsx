"use client";

import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, Loader2, Stethoscope, Video, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

export default function PatientChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) checkDoctor();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const checkDoctor = async () => {
        const { data } = await supabase
            .from('doctor_patients')
            .select('status, doctor:doctors(*)')
            .eq('patient_id', user!.id)
            .eq('status', 'active')
            .single();
        
        if (!data) {
            // Redirect if no active doctor
            router.push('/dashboard/care-team');
            return;
        }

        // @ts-ignore
        setDoctor(data.doctor);
        // @ts-ignore
        fetchMessages(data.doctor.id);
        // @ts-ignore
        subscribeToMessages(data.doctor.id);
        setLoading(false);
    };

    const fetchMessages = async (doctorId: string) => {
        const { data } = await supabase
            .from('consultations')
            .select('*')
            .or(`and(doctor_id.eq.${doctorId},patient_id.eq.${user!.id})`)
            .order('created_at', { ascending: true });
        
        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
    };

    const subscribeToMessages = (doctorId: string) => {
        const channel = supabase
            .channel('patient_chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'consultations',
                    filter: `patient_id=eq.${user!.id}`,
                },
                (payload) => {
                    if (payload.new.doctor_id === doctorId) {
                        // @ts-ignore
                        setMessages(prev => {
                            // @ts-ignore
                            if (prev.some(m => m.id === payload.new.id)) return prev;
                            // @ts-ignore
                            return [...prev, payload.new];
                        });
                        scrollToBottom();
                    }
                }
            )
            .subscribe();
        return () => supabase.removeChannel(channel);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !doctor) return;

        const msgContent = newMessage;
        setNewMessage(""); 

        // Optimistic UI
        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            sender_id: user!.id,
            message: msgContent,
            created_at: new Date().toISOString(),
            is_read: false
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        const { data, error } = await supabase.from('consultations').insert({
            doctor_id: doctor.id,
            patient_id: user!.id,
            sender_id: user!.id,
            message: msgContent
        }).select().single();

        if (data) {
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/care-team" className="p-2 -ml-2 text-gray-400 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">{doctor.full_name}</h1>
                        <p className="text-xs text-gray-500">{doctor.specialization}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => window.open(`https://meet.jit.si/pregoway-${doctor.id}-${user!.id}`, '_blank')}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-full hover:text-brand-600 transition-colors"
                        title="Call Doctor"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => window.open(`https://meet.jit.si/pregoway-${doctor.id}-${user!.id}`, '_blank')}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-full hover:text-brand-600 transition-colors"
                        title="Video Call"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        <p>This is a secure consultation line.</p>
                        <p>Say hello to Dr. {doctor.full_name.split(' ')[1] || doctor.full_name}.</p>
                    </div>
                )}
                
                {messages.map(msg => {
                    const isMe = msg.sender_id === user!.id;
                    const isCallMsg = msg.message.startsWith("📞");

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             {isCallMsg ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm my-2">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                        <Video className="w-5 h-5 animate-pulse" /> {isMe ? 'You started a call' : 'Doctor started a call'}
                                    </div>
                                    {!isMe && (
                                        <button 
                                            onClick={() => {
                                                const roomName = `pregoway-${doctor.id}-${user!.id}`;
                                                window.open(`https://meet.jit.si/${roomName}`, '_blank');
                                            }}
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                                        >
                                            Join Video Call
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    isMe 
                                    ? 'bg-brand-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}>
                                    {msg.message}
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                    <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-lg shadow-brand-200"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
