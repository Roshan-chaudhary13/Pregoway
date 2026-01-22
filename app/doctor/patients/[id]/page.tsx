"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MessageCircle, FileText, Activity, AlertTriangle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from "@/context/AuthContext";

export default function PatientDetailsPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [riskLogs, setRiskLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
            setPatient(profile);

            // Fetch Metrics
            const { data: m } = await supabase.from('health_metrics').select('*').eq('user_id', id).order('created_at', { ascending: true });
            setMetrics(m || []);

            // Fetch Risks
            const { data: r } = await supabase.from('risk_logs').select('*').eq('user_id', id).order('created_at', { ascending: false });
            setRiskLogs(r || []);

            setLoading(false);
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Patient Data...</div>;
    if (!patient) return <div className="min-h-screen flex items-center justify-center">Patient not found</div>;

    // Process BP Data for Chart
    const bpData = metrics.filter(m => m.type === 'BP').map(m => ({
        date: new Date(m.created_at).toLocaleDateString(),
        value: m.value
    }));

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/doctor/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                            <p className="text-sm text-slate-500">Week {patient.current_week} • EDD: {new Date(patient.edd).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/doctor/messages" className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-medium transition-colors">
                            <MessageCircle className="w-4 h-4" /> Message
                        </Link>
                        <button 
                            onClick={() => window.open(`https://meet.jit.si/pregoway-${user!.id}-${id}`, '_blank')}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors tooltip"
                            title="Start Call"
                        >
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Risk Alert Banner */}
                {patient.risk_status !== 'low' && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800">High Risk Status Detected</h3>
                            <p className="text-sm text-red-700 mt-1">
                                Patient has flagged multiple high BP readings in the last 48 hours. Immediate consultation recommended.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Vitals Chart */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-500" /> Blood Pressure Trend
                                </h3>
                                <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-500">
                                    <option>Last 7 Days</option>
                                    <option>Last Month</option>
                                </select>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={bpData}>
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[80, 160]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-lg text-slate-900 mb-4">Pregnancy Timeline & Notes</h3>
                             <div className="space-y-4">
                                 {/* Mock Timeline Items */}
                                 <div className="flex gap-4">
                                     <div className="flex flex-col items-center">
                                         <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                         <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                                     </div>
                                     <div className="pb-4">
                                         <div className="text-sm font-bold text-slate-900">Routine Checkup</div>
                                         <div className="text-xs text-slate-400">Today, 10:00 AM</div>
                                         <p className="text-sm text-slate-600 mt-1">Vitals normal. Fetal heart rate 140bpm. Advised mild walking.</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Patient Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                                    <div className="font-medium">{patient.name}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Phone</label>
                                    <div className="font-medium text-blue-600">{patient.phone || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Age</label>
                                    <div className="font-medium">{patient.age || 'N/A'} Years</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Expected Delivery</label>
                                    <div className="font-medium">{new Date(patient.edd).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-sm uppercase text-slate-400 mb-4">Recent AI Alerts</h3>
                            <div className="space-y-3">
                                {riskLogs.slice(0, 3).map((log: any) => (
                                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold ${log.level === 'red' ? 'text-red-600' : 'text-orange-500'}`}>
                                                {log.level.toUpperCase()} RISK
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600">{log.insight}</p>
                                    </div>
                                ))}
                                {riskLogs.length === 0 && <div className="text-sm text-slate-400 italic">No recent alerts.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
