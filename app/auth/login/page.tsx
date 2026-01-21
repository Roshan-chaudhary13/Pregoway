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
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-50 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="z-10">
                    <Link href="/" className="flex items-center gap-2 text-brand-700 font-bold text-xl">
                        <Heart className="fill-brand-700" /> Pregoway
                    </Link>
                </div>

                <div className="z-10 max-w-lg">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Welcome back to your journey.</h2>
                    <p className="text-lg text-gray-600">Your health insights and daily tracker are ready for you. Let's see how baby is doing today.</p>
                </div>

                <div className="text-sm text-brand-800/60 z-10">
                    © 2026 Pregoway Inc.
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
