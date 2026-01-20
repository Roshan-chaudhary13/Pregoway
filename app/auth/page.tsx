"use client";

import { useState } from "react";
import { ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await signIn(email);
      setSent(true);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6 pt-12 items-center justify-center text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-brand-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          We've sent a magic link to <span className="font-semibold text-gray-900">{email}</span>.
          Click the link to sign in instantly.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-brand-600 font-semibold hover:underline"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-12">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Pregoway
          </h1>
          <p className="text-gray-500">
            Securely sign in or create an account with your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!email || loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-900 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-black text-white rounded-xl shadow-lg transition-all font-semibold text-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Send Magic Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
