"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If returning from email verification (Magic Link)
    const code = searchParams.get('code');
    if (code) {
      router.push(`/auth/login?${searchParams.toString()}`);
      return;
    }

    // If already logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-50 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-md w-full">
        {/* Logo Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand-200 blur-xl rounded-full opacity-50"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl">
            <Heart className="w-16 h-16 text-brand-500 animate-pulse fill-brand-500" />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Pregoway
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-Powered Pregnancy Companion
          </p>
          <p className="text-sm text-gray-500">
            Predictive care for a safer journey.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4 pt-8">
          <Link
            href="/auth/signup"
            className="w-full flex items-center justify-center py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
          >
            Get Started
          </Link>

          <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
            <span>Already have an account?</span>
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>

        {/* Language Preview */}
        <div className="pt-8 flex gap-3 opacity-60">
          <span className="text-xs border border-gray-300 rounded px-2 py-1">English</span>
          <span className="text-xs border border-gray-300 rounded px-2 py-1">हिन्दी</span>
          <span className="text-xs border border-gray-300 rounded px-2 py-1">தமிழ்</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  )
}
