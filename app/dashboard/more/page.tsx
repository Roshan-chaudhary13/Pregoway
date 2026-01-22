"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  User,
  Settings,
  PhoneCall,
  HeartHandshake,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
  Star,
  Bell
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { differenceInWeeks, parseISO } from "date-fns";

export default function MorePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchBrief() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('name, current_week, lmp').eq('id', user.id).single();
      if (data) {
        // Dynamic Calculation Fallback
        let displayWeek = data.current_week;
        if ((!displayWeek || displayWeek === 0) && data.lmp) {
          displayWeek = differenceInWeeks(new Date(), parseISO(data.lmp));
        }
        setProfile({ ...data, current_week: displayWeek });
      }
    }
    fetchBrief();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const menuItems = [
    { label: "My Profile", icon: User, href: "/dashboard/profile", color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Care Team", icon: HeartHandshake, href: "/dashboard/care-team", color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Health Vault", icon: FileText, href: "/dashboard/vault", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", color: "text-gray-600", bg: "bg-balck-50" },
  ];

  const supportItems = [
    { label: "Help Center", icon: PhoneCall, href: "/dashboard/help", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Privacy Policy", icon: Shield, href: "#", color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pb-28">
      {/* Header Profile Card */}
      <div className="bg-white p-6 pb-8 pt-12 sticky top-0 z-20 border-b border-gray-100/80 backdrop-blur-md bg-white/80">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="flex items-center gap-5 p-4 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100/50 shadow-lg shadow-sky-100/20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-brand-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <User className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{profile?.name || "Loading..."}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                {profile?.current_week ? `Week ${profile.current_week}` : "New Mom"}
              </span>
              <span className="text-xs text-gray-400 font-medium">Pregnancy Journey</span>
            </div>
          </div>
        </div>


      </div>

      <div className="p-6 space-y-8">
        {/* Menu List */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">General</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {menuItems.map((item, idx) => (
              <Link key={idx} href={item.href} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Support & Legal</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {supportItems.map((item, idx) => (
              <Link key={idx} href={item.href} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-50 border border-red-100 text-red-500 py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

        <div className="text-center text-xs text-gray-300 font-medium">
          Version 1.2.0 • Build 2026.01.22
        </div>
      </div>
    </div>
  )
}
