"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Globe,
  Map,
  ShieldCheck,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Phone,
  ArrowRight,
  Heart
} from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CrisisSection } from "@/components/CrisisSection";
import { StoriesMarquee } from "@/components/ui/StoriesMarquee";

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      router.push(`/auth/login?${searchParams.toString()}`);
      return;
    }
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white overflow-x-hidden">

      {/* Hero Section */}
      <Hero />

      {/* --- MISSION SECTION --- */}
      {/* --- CRISIS SECTION (Replaces old Report) --- */}
      <CrisisSection />

      {/* --- FEATURES / SOLUTION (Bento Grid) --- */}
      <section className="py-24 bg-gray-50 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4d5d53_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <ScrollReveal animation="fade">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">A Complete Ecosystem of Care</h2>
              <p className="text-gray-600">We don&apos;t just track dates. We manage health, predict risks, and connect hearts.</p>
            </div>
          </ScrollReveal>

          <BentoGrid>
            <BentoGridItem
              title="The Proper Roadmap"
              description="Confusion is dangerous. We provide a week-by-week, step-by-step medical and nutritional roadmap tailored to your specific needs."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50"><Map className="w-16 h-16 text-brand-500 opacity-60" /></div>}
              icon={<Map className="h-6 w-6 text-brand-600" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="AI Risk Detection"
              description="Early detection saves lives. Our AI analyzes your vitals to flag potential complications weeks before they become emergencies."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] items-center justify-center rounded-xl bg-gradient-to-br from-accent-100 to-accent-50"><Activity className="w-16 h-16 text-accent-500 opacity-60" /></div>}
              icon={<Activity className="h-6 w-6 text-accent-600" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="Universal Access"
              description="Language shouldn&apos;t be a barrier. Available in all major Indian languages, making expert care accessible to every mother."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-50"><Globe className="w-16 h-16 text-purple-500 opacity-60" /></div>}
              icon={<Globe className="h-6 w-6 text-purple-600" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="Community Support"
              description="Connect with other mothers and experts. Share stories, get advice, and feel supported."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50"><Heart className="w-16 h-16 text-orange-500 opacity-60" /></div>}
              icon={<Heart className="h-6 w-6 text-orange-600" />}
              className="md:col-span-3"
            />
          </BentoGrid>
        </div>
      </section>

      {/* --- REAL STORIES --- */}
      {/* --- REAL STORIES MARQUEE --- */}
      <section className="py-24 bg-white overflow-hidden">
        <ScrollReveal width="100%" animation="scale">
          <div className="max-w-6xl mx-auto mb-12 px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Stories of Hope</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">See how Pregoway is changing lives across the country, from rural villages to metro cities.</p>
          </div>
          <StoriesMarquee />
        </ScrollReveal>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-8 h-8 text-brand-500 fill-brand-500" />
              <span className="text-2xl font-bold text-white">Pregoway</span>
            </div>
            <p className="max-w-sm mb-8 text-gray-500">
              A mission-driven initiative to reduce maternal mortality rates in India through technology, education, and accessibility.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Doctors</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Safety Guide</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>+91 1800-PREG-WAY</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>help@pregoway.org</span>
              </li>
              <li className="flex items-center gap-3">
                <Map className="w-4 h-4" />
                <span>Arctic X Labs, India</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-16 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Pregoway Foundation. Saving lives, one journey at a time.
        </div>
      </footer>
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
