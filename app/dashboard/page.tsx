"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Activity,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Plus,
  X,
  CalendarClock,
  Heart,
  Droplets,
  Scale,
  Baby
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import HealthTrends from "@/components/HealthTrends";
import LogVitalsModal from "@/components/LogVitalsModal";
import RiskDetailsModal from "@/components/RiskDetailsModal";

// Baby size analogies for emotional connection
const babySizes = [
  { week: 4, name: "Poppy Seed", size: "2mm" },
  { week: 8, name: "Raspberry", size: "1.6cm" },
  { week: 12, name: "Plum", size: "5.4cm" },
  { week: 16, name: "Avocado", size: "11.6cm" },
  { week: 20, name: "Banana", size: "16.4cm" },
  { week: 24, name: "Corn", size: "30cm" },
  { week: 28, name: "Eggplant", size: "37.6cm" },
  { week: 32, name: "Napa Cabbage", size: "42.4cm" },
  { week: 36, name: "Papaya", size: "47.4cm" },
  { week: 40, name: "Watermelon", size: "51.2cm" }
];

const getBabySize = (week: number) => {
  // Find closest size
  return babySizes.reduce((prev, curr) => {
    return (Math.abs(curr.week - week) < Math.abs(prev.week - week) ? curr : prev);
  });
};

export default function DashboardPage() {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState({ name: "Loading...", week: 0, daysToGo: 0 });
  const [risk, setRisk] = useState({ score: 0, level: 'green', label: 'Low Risk', trend: 'stable' });
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [appointment, setAppointment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (authLoading || !authUser) return;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          name: profile.name,
          week: profile.current_week,
          daysToGo: 280 - (profile.current_week * 7)
        });
      }

      // 2. Fetch Latest Risk Log
      const { data: riskLog } = await supabase
        .from('risk_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (riskLog) {
        setRisk({
          score: riskLog.score,
          level: (riskLog.level || 'green').toLowerCase(),
          label: riskLog.insight || 'Risk Alert',
          trend: 'stable'
        });
      }

      // 3. Fetch Latest Metrics
      const { data: latestMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (latestMetrics) {
        const latestByType = latestMetrics.reduce((acc: any, m: any) => {
          if (!acc[m.type]) acc[m.type] = m;
          return acc;
        }, {});
        setMetrics(latestByType);
      }

      // 4. Fetch Checkin Streak
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('date')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });

      if (checkins && checkins.length > 0) {
        // Simplified streak logic for UI demo
        setCheckinStreak(checkins.length);
      }

      // 5. Fetch Upcoming Appointment
      const { data: nextAppt } = await supabase
        .from('health_timeline')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('status', 'pending')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

      setAppointment(nextAppt);
    }

    fetchData();

    const handleFocus = () => setRefreshKey(k => k + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [authUser, authLoading, refreshKey]);

  const babyInfo = getBabySize(user.week);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* Top Header with Gradient */}
      <header className="px-6 pt-12 pb-6 sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Good Morning,</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
          </div>
          <div className="flex gap-3 items-center">
            {/* Language Switcher Target */}
            <div id="language-switcher-target" className="flex items-center justify-center h-10"></div>

            <div className="relative flex items-center">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 relative hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
              >
                <Bell className="w-6 h-6 text-gray-400" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-400 border-2 border-white rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-white/50 p-5 z-50 animate-in slide-in-from-top-5 fade-in duration-200 ring-1 ring-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <button onClick={() => setNotificationsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <div className="flex gap-4 items-start p-3 hover:bg-gray-50/80 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Check your BP</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Daily check-in required</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Glass Progress Card */}
        <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-100/50 p-6 rounded-3xl shadow-sm relative overflow-hidden mt-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm ring-1 ring-gray-100">
                👶
              </div>
              <div>
                <span className="inline-block bg-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-1.5">Week {user.week}</span>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{babyInfo.name} Size</h2>
                <p className="text-sm text-gray-500 font-medium">{babyInfo.size} long approx.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{user.daysToGo}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Days Left</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 flex-1 pb-32">

        {/* Risk Card */}
        {risk.level !== 'green' && (
          <div className="bg-white rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl shadow-orange-100/50 border border-orange-50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-black text-gray-900">Action Required</h3>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide border border-orange-100">Attention</span>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed font-medium">
                  {risk.label || "Potential health risks detected based on your recent vitals."}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowRiskModal(true)} className="flex-1 bg-brand-600 text-white py-3 rounded-2xl text-sm font-bold shadow-lg shadow-brand-200 active:scale-95 transition-all">
                    View Analysis
                  </button>
                  <button onClick={() => router.push('/dashboard/care-team')} className="flex-1 bg-white text-gray-900 border border-gray-100 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-colors">
                    Contact Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Log Vitals Button (Primary Action) - New Style */}
          <button
            onClick={() => setShowLogModal(true)}
            className="col-span-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 rounded-3xl shadow-lg shadow-brand-100/50 flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-left relative z-10">
              <div className="font-bold text-xl mb-1">Log Vitals</div>
              <div className="text-gray-400 text-sm font-medium">Update measurements</div>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 relative z-10 group-hover:bg-white/20 transition-all">
              <Plus className="w-6 h-6" />
            </div>
          </button>

          {/* Daily Check-In */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{checkinStreak}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Day Streak</div>
            </div>
          </div>

          {/* Appointment */}
          <Link href={appointment ? "/dashboard/timeline" : "#"} className={cn("p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-40 transition-all hover:shadow-md group", appointment ? "bg-white border-brand-100" : "bg-white border-dashed border-gray-200")}>
            {appointment ? (
              <>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <span className="font-black text-lg">{new Date(appointment.event_date).getDate()}</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm truncate leading-tight">{appointment.title}</div>
                  <div className="text-xs text-blue-500 font-bold mt-1 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                    {new Date(appointment.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Add Visit</span>
              </div>
            )}
          </Link>
        </div>

        {/* Health Snapshot */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-gray-900 text-lg">Health Snapshot</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('cards')} className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", viewMode === 'cards' ? "bg-white shadow-sm text-gray-900" : "text-gray-400")}>Cards</button>
              <button onClick={() => setViewMode('charts')} className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", viewMode === 'charts' ? "bg-white shadow-sm text-gray-900" : "text-gray-400")}>Trends</button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className="space-y-3">
              <HealthRow
                label="Blood Pressure"
                value={metrics['BP']?.value || '--'}
                unit="mmHg"
                icon={<Activity className="w-5 h-5 text-pink-500" />}
                color="bg-pink-50 text-pink-700"
                date={metrics['BP'] ? new Date(metrics['BP'].created_at).toLocaleDateString() : ''}
              />
              <HealthRow
                label="Weight"
                value={metrics['WEIGHT']?.value || '--'}
                unit="kg"
                icon={<Scale className="w-5 h-5 text-indigo-500" />}
                color="bg-indigo-50 text-indigo-700"
                date={metrics['WEIGHT'] ? new Date(metrics['WEIGHT'].created_at).toLocaleDateString() : ''}
              />
              <HealthRow
                label="Hemoglobin"
                value={metrics['HB']?.value || '--'}
                unit="g/dL"
                icon={<Droplets className="w-5 h-5 text-red-500" />}
                color="bg-red-50 text-red-700"
                isWarning={metrics['HB']?.value < 11}
                date={metrics['HB'] ? new Date(metrics['HB'].created_at).toLocaleDateString() : ''}
              />
              <HealthRow
                label="Kick Count"
                value={metrics['KICKS']?.value || '--'}
                unit="kicks/hr"
                icon={<Baby className="w-5 h-5 text-emerald-500" />}
                color="bg-emerald-50 text-emerald-700"
                date={metrics['KICKS'] ? new Date(metrics['KICKS'].created_at).toLocaleDateString() : ''}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Weight Trend</h4>
                <HealthTrends type="WEIGHT" />
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">BP Trend</h4>
                <HealthTrends type="BP" />
              </div>
            </div>
          )}
        </div>

      </div>

      <LogVitalsModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        userId={authUser?.id || ''}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />

      <RiskDetailsModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        riskData={risk}
      />
    </div>
  );
}

function HealthRow({ label, value, unit, icon, color, date, isWarning }: any) {
  return (
    <div className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md bg-white", isWarning ? "border-red-200 bg-red-50/50" : "border-gray-100")}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 font-medium">{label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-400">{unit}</span>
          </div>
        </div>
      </div>
      {date && <div className="text-xs text-gray-300 font-medium">{date}</div>}
    </div>
  )
}
