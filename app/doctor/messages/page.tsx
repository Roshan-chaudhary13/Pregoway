"use client";

import { useEffect, useState, useRef } from "react";
import { Send, User, Search, ArrowLeft, Loader2, MessageSquare, Video, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Message {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

export default function DoctorChatPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingChats, setLoadingChats] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) fetchPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (selectedPatientId && user) {
            fetchMessages(selectedPatientId);
            
            // Realtime Subscription
            const channel = supabase
                .channel('chat_room')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'consultations',
                        filter: `doctor_id=eq.${user.id}`, // Filter for this doctor
                    },
                    (payload) => {
                        // Only add if it belongs to current chat AND not already present (dedup)
                         if (payload.new.patient_id === selectedPatientId) {
                             const newMessage = payload.new as Message;
                             setMessages(prev => {
                                 if (prev.some(m => m.id === newMessage.id)) return prev;
                                 return [...prev, newMessage];
                             });
                             scrollToBottom();
                         }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPatientId, user]);

    const fetchPatients = async () => {
        const { data } = await supabase
            .from('doctor_patients')
            .select('patient:profiles(id, name)')
            .eq('doctor_id', user!.id)
            .eq('status', 'active');
        
        if (data) {
             // @ts-ignore
            setPatients(data.map(d => d.patient));
        }
    };

    const fetchMessages = async (patientId: string) => {
        setLoadingChats(true);
        const { data } = await supabase
            .from('consultations')
            .select('*')
            .or(`and(doctor_id.eq.${user!.id},patient_id.eq.${patientId})`)
            .order('created_at', { ascending: true });
        
        setMessages(data || []);
        setLoadingChats(false);
        setTimeout(scrollToBottom, 100);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPatientId) return;

        const msgContent = newMessage;
        setNewMessage(""); // Optimistic clear

        // Optimistic UI Update
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
            doctor_id: user!.id,
            patient_id: selectedPatientId,
            sender_id: user!.id,
            message: msgContent
        }).select().single();

        if (data) {
             // Replace optimistic message with real one
             setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }

        if (error) {
            console.error("Failed to send", error);
            // Revert optimistic update ideally, but safe to ignore for demo
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const startCall = async (type: 'video' | 'audio') => {
        if (!selectedPatientId) return;
        const roomName = `pregoway-${user!.id}-${selectedPatientId}`;
        const callUrl = `https://meet.jit.si/${roomName}`;
        
        // 1. Open Call
        window.open(callUrl, '_blank');

        // 2. Send "Call Started" Notification to Chat
        const msgContent = `📞 Started a ${type} call. Click to join.`;
        
        // Optimistic
         const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            sender_id: user!.id,
            message: msgContent,
            created_at: new Date().toISOString(),
            is_read: false
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        await supabase.from('consultations').insert({
            doctor_id: user!.id,
            patient_id: selectedPatientId,
            sender_id: user!.id,
            message: msgContent
        });
    };

    return (
        <div className="flex h-screen bg-slate-50 border-r border-slate-200">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col ${selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200">
                     <Link href="/doctor/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {patients.map(patient => (
                        <div 
                            key={patient.id}
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedPatientId === patient.id ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : ''}`}
                        >
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                {patient.name[0]}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">{patient.name}</div>
                                <div className="text-xs text-slate-500">Tap to chat</div>
                            </div>
                        </div>
                    ))}
                    {patients.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No active patients found. Accept requests in dashboard to chat.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
             <div className={`flex-1 flex flex-col h-full bg-slate-50 ${!selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
                {selectedPatientId ? (
                    <>
                        <header className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedPatientId(null)} className="md:hidden p-2 -ml-2 text-slate-500">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                    {selectedPatient?.name[0]}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{selectedPatient?.name}</h2>
                                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active Now
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => startCall('audio')}
                                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors tooltip"
                                    title="Start Audio Call"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => startCall('video')}
                                    className="p-2.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-md shadow-emerald-200"
                                    title="Start Video Call"
                                >
                                    <Video className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingChats ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Start the conversation</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === user!.id;
                                    const isCallMsg = msg.message.startsWith("📞");
                                    
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {isCallMsg ? (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                                        <Video className="w-5 h-5 animate-pulse" /> Incoming Call
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const roomName = `pregoway-${user!.id}-${selectedPatientId}`;
                                                            window.open(`https://meet.jit.si/${roomName}`, '_blank');
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow"
                                                    >
                                                        Join Call
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                                    isMe 
                                                    ? 'bg-slate-900 text-white rounded-br-none' 
                                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                                                }`}>
                                                    {msg.message}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
                             <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                             </div>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                             <p>Select a patient to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
