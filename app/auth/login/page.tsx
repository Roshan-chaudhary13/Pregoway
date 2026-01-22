"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Heart, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Visual Side (Hidden on Mobile) */}
            {/* Visual Side (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden text-white p-12">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero.png"
                        alt="Hopeful pregnant woman"
                        className="w-full h-full object-cover brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                </div>

                <div className="z-10 relative">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-brand-200 transition-colors">
                        <Heart className="fill-brand-500 text-brand-500" /> Pregoway
                    </Link>
                </div>

                <div className="z-10 relative max-w-lg mb-8">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-medium tracking-wide">
                        WELCOME BACK
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">Hope is waking up to a new possibility.</h2>
                    <p className="text-lg text-gray-200 font-light">Continue your journey with us. Every day is a step closer to meeting your little miracle.</p>
                </div>

                <div className="text-xs text-white/40 z-10 relative">
                    © 2026 Pregoway Inc. • Saving Lives, Two at a Time.
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h1>
                        <p className="mt-2 text-gray-500">
                            New to Pregoway?{" "}
                            <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                    <Link href="#" className="text-xs font-semibold text-brand-600 hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-600 transition-colors">
                            <span className="mr-2">G</span> Google
                        </button>
                        <button className="flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-600 transition-colors">
                            <span className="mr-2"></span> Apple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
