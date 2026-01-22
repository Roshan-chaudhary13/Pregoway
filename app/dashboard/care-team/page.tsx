"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowLeft, Mail, MapPin, Plus, X, Loader2, Trash2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Contact = {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string | null;
    address: string | null;
};

export default function CareTeamPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        phone: "",
        email: "",
        address: ""
    });

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("care_team")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error: any) {
            console.error("Error fetching contacts:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from("care_team").insert([
                {
                    user_id: user.id,
                    name: formData.name,
                    role: formData.role,
                    phone: formData.phone,
                    email: formData.email || null,
                    address: formData.address || null
                }
            ]);

            if (error) throw error;

            setFormData({ name: "", role: "", phone: "", email: "", address: "" });
            setIsModalOpen(false);
            fetchContacts();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (!confirm("Are you sure you want to remove this contact?")) return;

        try {
            const { error } = await supabase
                .from("care_team")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setContacts(contacts.filter(c => c.id !== id));
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col relative text-gray-900">
            <div className="bg-white p-6 sticky top-0 z-20 border-b border-gray-100/80 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Care Team</h1>
                </div>
                <p className="text-gray-500 text-sm pl-10">
                    Your trusted circle of medical support.
                </p>
            </div>

            <div className="p-6 max-w-2xl mx-auto w-full flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                        <p className="text-gray-500 font-medium">Loading your care team...</p>
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="grid gap-4 mb-8">
                        {contacts.map(contact => (
                            <div key={contact.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[4rem] -mr-8 -mt-8 z-0"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-purple-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
                                                <Heart className="w-6 h-6 fill-brand-200" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{contact.name}</h3>
                                                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-md mt-1">
                                                    {contact.role}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteContact(contact.id)}
                                                className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`tel:${contact.phone}`}
                                                className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Phone className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pl-1">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-700">{contact.phone}</span>
                                        </div>
                                        {contact.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact.address && (
                                            <div className="flex items-start gap-3 border-t border-gray-50 pt-3 mt-3">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <span className="text-sm text-gray-500 leading-relaxed">{contact.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-8 bg-white rounded-[2.5rem] border border-dashed border-gray-200 mb-8">
                        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Plus className="w-8 h-8 text-brand-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Build Your Support Circle</h2>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                            Add your doctor, midwife, or doula here for one-tap access during emergencies or regular checkups.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-5 border-2 border-dashed border-gray-300 rounded-3xl text-gray-500 font-bold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5" />
                    </div>
                    Add New Care Provider
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add Provider</h2>
                                <p className="text-gray-500 text-sm">Keep your care team details in one place</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddContact} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-medium"
                                    placeholder="e.g. Dr. Sarah Smith"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Specialty / Role</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-medium"
                                    placeholder="e.g. OB-GYN, Midwife"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-medium"
                                        placeholder="+1..."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-medium"
                                        placeholder="Optional"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Clinic Address</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-medium"
                                    placeholder="Optional"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 disabled:bg-gray-400 hover:opacity-90 text-white rounded-2xl shadow-lg shadow-brand-100/50 transition-all font-bold text-lg flex items-center justify-center gap-2 mt-4 active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-6 h-6" />
                                        <span>Save Provider</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
