"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

export function Hero() {
  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-50/50">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 shadow-sm text-brand-700 text-sm font-medium">
            <Heart className="w-4 h-4 fill-brand-500 text-brand-500" />
            <span>Saving Two Lives at Once</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Every Mother <br />
            Deserves a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
              Safe Journey.
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
            Bridging the gap between rural challenges and modern care.
            Improper management shouldn&apos;t cost a life. We provide the roadmap, resources, and hope you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/auth/signup"
              className="inline-flex justify-center items-center px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex justify-center items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-lg font-medium transition-colors"
            >
              Log In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-gray-200/60">
            <p className="text-sm text-gray-500 mb-4">Trusted by mothers across the nation</p>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-center bg-cover`}>
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                +2k
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
        >
          <img
            src="/images/hero.png"
            alt="Hopeful pregnant woman"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <p className="font-medium text-lg mb-2">&quot;Pregoway gave me the confidence I needed.&quot;</p>
              <p className="text-sm opacity-80">- Gestational Health Tracking</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
