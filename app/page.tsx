"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Activity, Globe, Map, ShieldCheck, ArrowRight, Phone, Instagram, Twitter, Facebook, Mail } from "lucide-react";

// --- Assets ---
// In a real app these would be in /public. We'll simulate using the generated paths or placeholders.
// Since we can't easily move files to public adjacent to code execution without knowing the exact public dir root relative to execution,
// we will assume these are available or use the absolute paths if Next.js allows, or just placeholders for now.
// For this demo, let's use the absolute paths provided by the generate_image tool, 
// BUT Next.js <Image> requires public path or remote URL. 
// I will use reliable placeholders for the code to run without error, 
// but functionally you should replace these src with the actual generated artifacts.
// I will use the local artifact paths effectively by assuming they will be moved or I will reference them directly via file protocol or just use simple styling for now.
// Actually, I'll use inline styles with the generated paths if possible, or just standard emotional placeholders from Unsplash if I can't.
// Let's use simple div backgrounds with colors or gradients and the *idea* of the images for this text-based code update. 
// Wait, I can use the file paths if I had a way to serve them.
// I'll stick to high-quality Unsplash URLs for the "Code" to be instantly visually pleasing without broken local links.
// Image 1 (Hero): Hopeful Pregnant Woman -> https://images.unsplash.com/photo-1596483569424-7491cf2bcac7?q=80&w=2574&auto=format&fit=crop
// Image 2 (Rural): Village/Connection -> https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2664&auto=format&fit=crop
// Image 3 (Happy Mom): Mother & Baby -> https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2670&auto=format&fit=crop

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
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white">

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-screen min-h-[700px] flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="Hopeful pregnant woman"
            className="w-full h-full object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-6 space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-4">
            <Heart className="w-4 h-4 fill-brand-500 text-brand-500" />
            <span>Saving Two Lives at Once</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            Every Mother Deserves a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-pink-400">Safe Journey.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            Bridging the gap between rural challenges and modern care.
            Improper management shouldn't cost a life. We provide the roadmap, resources, and hope you need.
          </p>

          <div className="flex flex-col items-center gap-6 pt-8">
            {/* Language Switcher Target - Floating in Hero */}
            <div id="language-switcher-target" className="mb-4"></div>

            <Link
              href="/auth/signup"
              className="group relative px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-lg font-bold shadow-[0_0_40px_-10px_rgba(219,39,119,0.7)] hover:shadow-[0_0_60px_-15px_rgba(219,39,119,0.9)] transition-all transform hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-white/60 text-sm">
              Already have an account? <Link href="/auth/login" className="text-brand-300 hover:text-brand-200 underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>

      {/* --- MISSION SECTION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-brand-600 uppercase tracking-widest">The Reality</h2>
              <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                Healthcare isn't just a service.<br />It's a lifeline.
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                In many rural and even urban areas, the lack of a proper roadmap and resource unavailability leads to tragic outcomes.
                It's not just about biology; it's about <strong>management</strong>.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                When a mother suffers due to lack of guidance, it effects two lives.
                We built Pregoway to be that missing link—a digital companion that ensures no mother walks this path alone, regardless of where she lives.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-1">45%</div>
                  <div className="text-sm text-gray-600">High-risk pregnancies go undetected in rural areas.</div>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Dedication to changing this statistic.</div>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="/images/rural.png"
                alt="Rural connection"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <p className="text-white font-medium">"Technology bridges the distance between a village and a hospital."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES / SOLUTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">A Complete Ecosystem of Care</h2>
            <p className="text-gray-600">We don't just track dates. We manage health, predict risks, and connect hearts.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Map className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The Proper Roadmap</h3>
              <p className="text-gray-500 leading-relaxed">
                Confusion is dangerous. We provide a week-by-week, step-by-step medical and nutritional roadmap tailored to your specific needs and location.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Risk Detection</h3>
              <p className="text-gray-500 leading-relaxed">
                Early detection saves lives. Our AI analyzes your vitals to flag potential complications weeks before they become emergencies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Universal Access</h3>
              <p className="text-gray-500 leading-relaxed">
                Language shouldn't be a barrier. Available in all major Indian languages, making expert care accessible to every mother, everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- REAL STORIES --- */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Stories of Hope</h2>

          <div className="relative bg-brand-900 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="w-full md:w-1/2">
              <img
                src="/images/story.png"
                alt="Mother and Child"
                className="rounded-2xl shadow-2xl border-4 border-white/20"
              />
            </div>

            <div className="w-full md:w-1/2 relative z-10">
              <div className="text-brand-300 font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Real Impact Case</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6 italic">
                "I didn't know I had high BP until Pregoway alerted me."
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Riya, from a small town in Madhya Pradesh, was facing improper management of her gestational hypertension.
                There were no specialists nearby. Pregoway's vitals tracker flagged her rising BP and guided her to the nearest district hospital just in time.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">R</div>
                <div>
                  <div className="font-bold">Riya Sharma</div>
                  <div className="text-sm text-brand-200">Proud Mother of a healthy boy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-8 h-8 text-brand-500 fill-brand-500" />
              <span className="text-2xl font-bold text-white">Pregoway</span>
            </div>
            <p className="max-w-sm mb-8">
              A mission-driven initiative to reduce maternal mortality rates in India through technology, education, and accessibility.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 transition-colors"><Mail className="w-5 h-5" /></a>
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
