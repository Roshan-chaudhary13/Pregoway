"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Stethoscope, Lock, Mail, User, Building2, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function DoctorSignUpPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [hospital, setHospital] = useState("");
    const [license, setLicense] = useState("");
    const [experience, setExperience] = useState("");

    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Create Auth User
            // 1. Create Auth User with ALL Metadata for Trigger
            const { data, error: authError } = await signUp(email, password, {
                full_name: name,
                role: 'doctor',
                specialization: specialization,
                hospital_name: hospital,
                license_number: license,
                experience_years: experience
            });

            if (authError) throw authError;

            if (data.user) {
                // Success - Trigger handles DB insertion
                router.push("/doctor/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden text-white p-12 bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2670&auto=format&fit=crop"
                        alt="Medical Team"
                        className="w-full h-full object-cover brightness-[0.4]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/30"></div>
                </div>

                <div className="z-10 relative">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-slate-200 transition-colors">
                        <Stethoscope className="text-emerald-400" /> Pregoway <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20">PARTNER</span>
                    </Link>
                </div>

                <div className="z-10 relative max-w-lg mb-8">
                    <h2 className="text-4xl font-bold mb-4 leading-tight">Join the network saving lives.</h2>
                    <p className="text-lg text-slate-300 font-light">
                        We provide the tech. You provide the care. Together, we ensure every pregnancy is a safe journey.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative">
                <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span className="text-sm font-medium">Back</span>
                </Link>
                <div className="w-full max-w-md mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Partner Application</h1>
                        <p className="mt-2 text-slate-500">Already a partner? <Link href="/doctor/auth/login" className="text-emerald-600 font-semibold">Log in</Link></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="Dr. Jane Doe" suppressHydrationWarning />
                                </div>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="work@hospital.com" suppressHydrationWarning />
                                </div>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="••••••••" suppressHydrationWarning />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Specialization</label>
                                <input type="text" required value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="e.g. OBGYN" suppressHydrationWarning />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Experience (Yrs)</label>
                                <input type="number" required value={experience} onChange={e => setExperience(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="5" suppressHydrationWarning />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Medical License Number</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" required value={license} onChange={e => setLicense(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="MCI-12345-X" suppressHydrationWarning />
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Hospital / Clinic Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" required value={hospital} onChange={e => setHospital(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" placeholder="City General Hospital" suppressHydrationWarning />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
                            suppressHydrationWarning
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
