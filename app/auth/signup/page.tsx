"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Heart, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await signUp(email, password, {
                full_name: name,
                joined_at: new Date().toISOString()
            });

            if (error) {
                // Handle "User already registered" explicitly
                if (error.message.includes("registered") || error.message.includes("exists")) {
                    alert("This email is already registered. Please Log In.");
                    router.push("/auth/login");
                    return;
                }
                throw error;
            }

            if (data.user && !data.session) {
                // Email confirmation required (or existing user resend)
                alert("Confirmation email sent! Please check your inbox (and spam folder) to verify your account.");
                router.push("/auth/login");
                return;
            }

            // Success & Session Active - Redirect to onboarding profile setup
            router.push("/onboarding/profile");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
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
                        src="/images/rural.png"
                        alt="Rural healthcare connection"
                        className="w-full h-full object-cover brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-gray-900/30"></div>
                </div>

                <div className="z-10 relative">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-brand-200 transition-colors">
                        <Heart className="fill-brand-500 text-brand-500" /> Pregoway
                    </Link>
                </div>

                <div className="z-10 relative max-w-lg mb-8">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-300 text-xs font-bold tracking-wide">
                        JOIN THE MOVEMENT
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">No distance is too far for care.</h2>
                    <p className="text-lg text-gray-300 font-light">
                        Join thousands of mothers connecting to life-saving insights.
                        Whether in a city or a village, your safe journey starts here.
                    </p>
                </div>

                <div className="text-xs text-white/40 z-10 relative">
                    © 2026 Pregoway Inc. • Saving Lives, Two at a Time.
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
                        <p className="mt-2 text-gray-500">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
                                Log in
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
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
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

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Create Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-500 leading-relaxed">
                        By creating an account, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
