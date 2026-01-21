"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowLeft, Mail, MapPin, Plus, X, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4 shadow-sm">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 font-outfit">Your Care Team</h1>
            </div>

            <div className="p-6 space-y-4 flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                        <p className="text-gray-500 font-medium">Loading your care team...</p>
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="grid gap-4">
                        {contacts.map(contact => (
                            <div key={contact.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{contact.name}</h3>
                                        <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider rounded-lg mt-1.5 shadow-sm border border-brand-100">
                                            {contact.role}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={`tel:${contact.phone}`}
                                            className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <Phone className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span className="font-medium">{contact.phone}</span>
                                    </div>
                                    {contact.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span>{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.address && (
                                        <div className="flex items-center gap-3 border-t border-gray-50 pt-2 text-[13px] leading-relaxed">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span>{contact.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-8 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-brand-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">No contacts yet</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">Add your primary care doctor, OB-GYN, or midwife to your care team for quick access.</p>
                    </div>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5" />
                    </div>
                    Add New Care Provider
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add Provider</h2>
                                <p className="text-gray-500 text-sm">Keep your care team details in one place</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddContact} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Dr. Sarah Smith"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Specialty / Role</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. OB-GYN, Midwife"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="+1..."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="dr@clinic.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Clinic Address (Optional)</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. City Hospital, Suite 402"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-gray-900 disabled:bg-gray-400 hover:bg-brand-600 text-white rounded-2xl shadow-xl shadow-gray-100 transition-all font-bold text-lg flex items-center justify-center gap-2 mt-4 active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-6 h-6" />
                                        <span>Add Provider</span>
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
