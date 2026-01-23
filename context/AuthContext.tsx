"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: 'doctor' | 'patient' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null }; error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: { user: User | null; session: Session | null }; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => { },
  resetPassword: async () => ({ data: null, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRole = async (userId: string) => {
    // Check if user is in doctors table
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', userId)
      .single();

    if (doctor) {
      setRole('doctor');
    } else {
      setRole('patient');
    }
  };

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id).then(() => setLoading(false));
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    router.push("/auth/login");
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
