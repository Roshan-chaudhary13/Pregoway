"use client";

import { Home, ClipboardCheck, Calendar, FileText, User, Sparkles, Grid } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AIChatBot from "@/components/AIChatBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (loading) return;

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('lmp')
        .eq('id', user.id)
        .single();

      // If no profile found or LMP not set, redirect to onboarding
      if (error || !data || !data.lmp) {
        router.push('/onboarding/profile');
      } else {
        setCheckingProfile(false);
      }
    }

    checkOnboarding();
  }, [user, loading, router, pathname]);

  if (loading || checkingProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <main className="flex-1">
        {children}
      </main>

      {/* Fixed Bottom Glass Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 pb-4 pt-3 lg:pb-3">
        <div className="flex justify-around items-center px-6 max-w-lg mx-auto w-full">
          <NavLink href="/dashboard" icon={<Home className="w-6 h-6" />} label="Home" active={pathname === '/dashboard'} />
          <NavLink href="/dashboard/checkin" icon={<ClipboardCheck className="w-6 h-6" />} label="Check-In" active={pathname.startsWith('/dashboard/checkin')} />
          <NavLink href="/dashboard/timeline" icon={<Calendar className="w-6 h-6" />} label="Timeline" active={pathname.startsWith('/dashboard/timeline')} />
          <NavLink href="/dashboard/vault" icon={<FileText className="w-6 h-6" />} label="Vault" active={pathname.startsWith('/dashboard/vault')} />
          <NavLink href="/dashboard/more" icon={<Grid className="w-6 h-6" />} label="More" active={pathname.startsWith('/dashboard/more')} />
        </div>
      </div>

      <AIChatBot />
    </div>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 ${active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {active && <div className="w-1 h-1 bg-brand-600 rounded-full"></div>}
    </Link>
  )
}
