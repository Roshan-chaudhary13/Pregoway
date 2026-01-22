"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, MessageSquare, Activity, Calendar, Search, Filter, CheckCircle, XCircle, Video, ArrowRight, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface Patient {
    id: string;
    name: string;
    current_week: number;
    risk_status: string;
    edd: string;
}

interface Request {
    id: string; // relationship id
    patient: {
        id: string;
        name: string;
         // @ts-ignore
        risk_status: string;
    }
}

export default function DoctorDashboard() {
    const { user, role, loading, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        activePatients: 0,
        pendingRequests: 0,
        criticalAlerts: 0,
        todaysAppointments: 2
    });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'doctor')) {
            router.push("/doctor/auth/login");
            return;
        }

        if (user) {
            fetchDashboardData();
        }
    }, [user, role, loading]);

    const fetchDashboardData = async () => {
        setIsLoadingData(true);
        const { data: relations } = await supabase
            .from('doctor_patients')
            .select(`
                id,
                status,
                patient:profiles!inner (
                    id, name, current_week, risk_status, edd
                )
            `)
            .eq('doctor_id', user!.id);

        if (relations) {
            const active = relations.filter(r => r.status === 'active');
            const pending = relations.filter(r => r.status === 'pending');
            
            // Calculate Risk Counts
            // @ts-ignore
            const critical = active.filter(r => r.patient.risk_status === 'high' || r.patient.risk_status === 'critical').length;

            setStats(prev => ({
                ...prev,
                activePatients: active.length,
                pendingRequests: pending.length,
                criticalAlerts: critical
            }));

            // @ts-ignore
            setPatients(active.map(r => r.patient));
            // @ts-ignore
            setRequests(pending.map(r => ({ id: r.id, patient: r.patient })));
        }
        setIsLoadingData(false);
    };

    const handleRequest = async (relationId: string, action: 'accept' | 'reject') => {
        if (action === 'accept') {
            await supabase.from('doctor_patients').update({ status: 'active' }).eq('id', relationId);
        } else {
            await supabase.from('doctor_patients').delete().eq('id', relationId);
        }
        fetchDashboardData(); // Refresh to move from Pending to Active
    };

    // Prepare Chart Data
    const riskData = [
        { name: 'Low Risk', value: patients.filter(p => p.risk_status === 'low' || !p.risk_status).length, color: '#10b981' }, // Emerald
        { name: 'Moderate', value: patients.filter(p => p.risk_status === 'moderate').length, color: '#facc15' }, // Yellow
        { name: 'High', value: patients.filter(p => p.risk_status === 'high').length, color: '#f97316' }, // Orange
        { name: 'Critical', value: patients.filter(p => p.risk_status === 'critical').length, color: '#ef4444' }, // Red
    ].filter(d => d.value > 0);

    if (loading || isLoadingData) return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Activity className="w-10 h-10 text-emerald-600 animate-bounce mb-4" />
            <p className="text-slate-500 font-medium">Loading Dashboard...</p>
         </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                    <Activity className="text-emerald-600" /> 
                    <span>Doctor<span className="text-emerald-600">Portal</span></span>
                </div>
                <div className="flex items-center gap-4">
                     <Link href="/doctor/messages" className="p-2 hover:bg-slate-100 rounded-full relative">
                        <MessageSquare className="w-5 h-5 text-slate-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 relative group">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-900 leading-tight">{user?.user_metadata.full_name}</div>
                            <div className="text-xs text-slate-500">{user?.user_metadata.specialization || 'Specialist'}</div>
                        </div>
                         
                         {/* User Menu Trigger */}
                         <button className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold hover:bg-emerald-200 transition-colors focus:ring-2 focus:ring-emerald-500/20 outline-none">
                            {user?.user_metadata.full_name?.[0] || 'D'}
                        </button>

                        {/* Dropdown Menu - Fixed Hover Tunnel with Padding Bridge */}
                        <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                            <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in slide-in-from-top-2">
                                <Link href="/doctor/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    <User className="w-4 h-4" /> Edit Profile
                                </Link>
                                <button 
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, Doctor. Here is what's happening today.</p>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        label="Active Patients"
                        value={stats.activePatients}
                        color="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <StatCard 
                        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                        label="Critical Alerts"
                        value={stats.criticalAlerts}
                        color="bg-white border-red-100 shadow-sm hover:shadow-md transition-shadow"
                        highlight={stats.criticalAlerts > 0}
                    />
                    <StatCard 
                        icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
                        label="Pending Requests"
                        value={stats.pendingRequests}
                        color="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <StatCard 
                        icon={<Calendar className="w-6 h-6 text-emerald-600" />}
                        label="Today's Appointments"
                        value={stats.todaysAppointments}
                        color="bg-white border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Patients & Requests */}
                    <div className="lg:col-span-2 space-y-8">
                        
                         {/* Pending Requests Section */}
                         {requests.length > 0 && (
                            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden mb-8">
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 flex justify-between items-center">
                                    <h2 className="font-bold text-purple-900 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> New Patient Requests
                                    </h2>
                                    <span className="px-2 py-0.5 bg-white rounded text-xs font-bold text-purple-600 border border-purple-200 shadow-sm">{requests.length} new</span>
                                </div>
                                <div className="divide-y divide-purple-50">
                                    {requests.map(req => (
                                        <div key={req.id} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                    {req.patient.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{req.patient.name}</div>
                                                    <div className="text-xs text-slate-500">Requesting connection</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleRequest(req.id, 'accept')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" /> Accept
                                                </button>
                                                <button 
                                                     onClick={() => handleRequest(req.id, 'reject')}
                                                    className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}

                        {/* Active Patient List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900">My Patients</h2>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider font-semibold text-xs text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Patient Name</th>
                                            <th className="px-6 py-4">Stage</th>
                                            <th className="px-6 py-4">Risk Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                    No active patients. Share your profile to get requests.
                                                </td>
                                            </tr>
                                        ) : (
                                            patients.map((patient) => (
                                                <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                                                    <td className="px-6 py-4">Week {patient.current_week}</td>
                                                    <td className="px-6 py-4">
                                                        <RiskBadge status={patient.risk_status} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href={`/doctor/patients/${patient.id}`} className="text-emerald-600 font-medium hover:underline">
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Analytics & Schedule */}
                    <div className="space-y-6">
                         {/* Upcoming Appointments (New Feature) */}
                         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                                <span>Upcoming Schedule</span>
                                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">Today</span>
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { time: "10:00 AM", name: "Anjali Sharma", type: "Regular Checkup", status: "completed" },
                                    { time: "02:30 PM", name: "Priya Singh", type: "Urgent Consultation", status: "upcoming" }
                                ].map((apt, i) => (
                                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-500">{apt.time.split(' ')[0]}</span>
                                            <span className="text-[10px] text-slate-400">{apt.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 text-sm">{apt.name}</div>
                                            <div className="text-xs text-slate-500">{apt.type}</div>
                                        </div>
                                        {apt.status === 'upcoming' ? (
                                            <button className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors" title="Join Call">
                                                <Video className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <CheckCircle className="w-4 h-4 text-slate-300" />
                                        )}
                                    </div>
                                ))}
                                <button className="w-full py-2 text-xs font-bold text-slate-500 flex items-center justify-center gap-1 hover:text-slate-800 transition-colors">
                                    View Full Calendar <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                         </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Patient Risk Distribution</h3>
                            <div className="h-48 w-full">
                                {patients.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={riskData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {riskData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '12px' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                        Not enough data
                                    </div>
                                )}
                            </div>
                        </div>
                        
                         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white relative overflow-hidden">
                             <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Connect with Patients</h3>
                                <p className="text-slate-300 text-sm mb-4">You have active patients waiting. Start a consultation.</p>
                                <Link href="/doctor/messages" className="inline-block w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-center hover:bg-emerald-50 transition-colors shadow-lg">
                                    Open Consultations
                                </Link>
                             </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, color, highlight = false }: { icon: React.ReactNode; label: string; value: number; color: string; highlight?: boolean }) {
    return (
        <div className={`p-6 rounded-2xl border ${color} ${highlight ? 'ring-2 ring-red-200 shadow-md' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
                {highlight && <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
}

function RiskBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        critical: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status.toLowerCase()] || colors.low} uppercase tracking-wide`}>
            {status}
        </span>
    );
}
