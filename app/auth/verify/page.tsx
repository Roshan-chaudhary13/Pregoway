"use client";

import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function VerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || "your number";

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const code = otp.join("");
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: code,
        type: 'sms',
      });

      if (error) {
        alert(error.message);
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      alert("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify your number
        </h1>
        <p className="text-gray-500 mb-8">
          Enter the 6-digit code sent to <span className="text-gray-900 font-medium">+91 {phone}</span>
        </p>

        <div className="grid grid-cols-6 gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full aspect-square text-center text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-lg focus:border-brand-500 outline-none transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.some(d => !d) || isVerifying}
          className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-brand-700 text-white rounded-xl shadow-lg transition-all font-semibold text-lg"
        >
          {isVerifying ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>

        <div className="text-center mt-6">
          <button className="text-brand-600 font-medium text-sm">
            Resend Code in 25s
          </button>
        </div>
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-8">
      <Link href="/auth" className="mb-8 inline-block p-2 -ml-2 text-gray-600">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      <Suspense fallback={<div className="flex justify-center mt-10"><Loader2 className="animate-spin text-brand-600" /></div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
