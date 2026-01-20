"use client";

import { useState } from "react";
import { ArrowRight, Calendar, User, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { addDays, format, differenceInWeeks } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    lmp: "",
    isFirstPregnancy: true,
  });

  const [edd, setEdd] = useState<Date | null>(null);
  const [week, setWeek] = useState<number | null>(null);

  const handleLmpChange = (dateStr: string) => {
    setFormData({ ...formData, lmp: dateStr });
    if (dateStr) {
      const lmpDate = new Date(dateStr);
      // Naegele's rule: +1 year -3 months +7 days (approx 280 days)
      const estimatedDueDate = addDays(lmpDate, 280);
      setEdd(estimatedDueDate);

      const weeks = differenceInWeeks(new Date(), lmpDate);
      setWeek(weeks);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Tell us about yourself
          </h1>
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-500 mb-8">
          This helps our AI personalize your journey.
        </p>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none"
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none"
              placeholder="Years"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
            />
          </div>

          {/* LMP */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First day of Last Period (LMP)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none"
                value={formData.lmp}
                onChange={e => handleLmpChange(e.target.value)}
              />
            </div>
          </div>

          {/* Calculated Info Card */}
          {edd && (
            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-brand-600 font-medium uppercase tracking-wide">Estimated Due Date</div>
                <div className="text-lg font-bold text-brand-900">{format(edd, 'd MMM yyyy')}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-brand-600 font-medium uppercase tracking-wide">Current Week</div>
                <div className="text-lg font-bold text-brand-900">{week} Weeks</div>
              </div>
            </div>
          )}

          {/* Pregnancy Type */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-gray-700">Is this your first pregnancy?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, isFirstPregnancy: true })}
                className={`py-3 rounded-xl font-medium border-2 ${formData.isFirstPregnancy ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600'}`}
              >
                Yes
              </button>
              <button
                onClick={() => setFormData({ ...formData, isFirstPregnancy: false })}
                className={`py-3 rounded-xl font-medium border-2 ${!formData.isFirstPregnancy ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600'}`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!user) return;
            setLoading(true);
            try {
              const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                name: formData.name,
                email: user.email,
                age: Number(formData.age),
                lmp: formData.lmp,
                edd: edd?.toISOString(),
                current_week: week,
                ...(user.phone ? { phone: user.phone } : {})
              });

              if (error) throw error;
              router.push("/dashboard");
            } catch (err: any) {
              alert(err.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || !formData.name || !formData.lmp}
          className="w-full mt-10 flex items-center justify-center gap-2 py-4 bg-gray-900 disabled:bg-gray-400 hover:bg-black text-white rounded-xl shadow-lg transition-all font-semibold text-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Complete Profile</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
