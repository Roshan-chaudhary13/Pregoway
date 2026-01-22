"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2, User, Stethoscope, DollarSign, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorProfilePage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        full_name: "",
        specialization: "",
        experience_years: 0,
        consultation_fee: 0,
        bio: "",
        license_number: ""
    });

    useEffect(() => {
        if (!authLoading && (!user || role !== 'doctor')) {
            router.push("/doctor/auth/login");
            return;
        }

        if (user) fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, role]);

    const fetchProfile = async () => {
        try {
            // Fetch Profile (Name)
            const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', user!.id)
                .single();

            // Fetch Doctor Details
            const { data: doctor } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', user!.id)
                .single();

            setFormData({
                full_name: profile?.name || "",
                specialization: doctor?.specialization || "",
                experience_years: doctor?.experience_years || 0,
                consultation_fee: doctor?.consultation_fee || 0,
                bio: doctor?.bio || "",
                license_number: doctor?.license_number || ""
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'experience_years' || name === 'consultation_fee' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Update Profile Name
            await supabase.from('profiles').update({
                name: formData.full_name
            }).eq('id', user!.id);

            // Update Doctor Details
            const { error } = await supabase.from('doctors').update({
                specialization: formData.specialization,
                experience_years: formData.experience_years,
                consultation_fee: formData.consultation_fee,
                bio: formData.bio,
                // License number usually uneditable, but including for now
            }).eq('id', user!.id);

            if (error) throw error;
            
            // Show success (could add toast here)
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile.");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
             <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link href="/doctor/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User className="w-5 h-5 text-emerald-600" /> Personal Information
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                                    placeholder="Dr. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                                <input 
                                    type="text" 
                                    name="license_number"
                                    value={formData.license_number}
                                    disabled
                                    className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Stethoscope className="w-5 h-5 text-blue-600" /> Professional Details
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                                <input 
                                    type="text" 
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="e.g. Obstetrician"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Experience (Years)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number" 
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number" 
                                        name="consultation_fee"
                                        value={formData.consultation_fee}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bio / About Me</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea 
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-colors resize-none"
                                    placeholder="Brief description about your practice..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/doctor/dashboard" className="px-6 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
