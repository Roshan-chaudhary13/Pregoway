"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Mic, Check, Calendar, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { calculateAndLogRisk } from "@/lib/risk_service";
import Link from "next/link";

// Mock Questions based on doc
const questions = [
  {
    id: "energy",
    type: "scale",
    text: "How are you feeling today, mama?",
    helper: "Your energy levels tell us a lot.",
    options: ["😫", "😟", "😐", "🙂", "😄"]
  },
  {
    id: "headache",
    type: "yes_no",
    text: "Have you had any headaches recently?",
    followUp: {
      ifYes: {
        id: "headache_severity",
        type: "scale_10",
        text: "On a scale of 1-10, how severe is it?"
      }
    }
  },
  {
    id: "kicks",
    type: "numeric",
    text: "How many times did baby kick?",
    helper: "Count movements in the last 2 hours."
  },
  {
    id: "symptoms",
    type: "multi",
    text: "Noticed anything unusual?",
    options: [
      "Swelling in hands/feet",
      "Vision changes",
      "Severe abdominal pain",
      "Vaginal bleeding",
      "Shortness of breath",
      "None of the above"
    ]
  }
];

export default function CheckInPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  // State
  const [questionQueue, setQuestionQueue] = useState<any[]>(questions);
  const [step, setStep] = useState(0); // 0 = Intro, 1 = Q1, etc.
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Derived
  const currentQuestion = step > 0 ? questionQueue[step - 1] : null;
  const progress = step > 0 ? ((step - 1) / questionQueue.length) * 100 : 0;

  const handleAnswer = (val: any) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: val });
  };

  const handleNext = async () => {
    // 1. Check Follow Up Logic
    if (currentQuestion && currentQuestion.followUp) {
      const userAns = answers[currentQuestion.id];
      if (currentQuestion.followUp.ifYes && userAns === true) {
        const nextQ = currentQuestion.followUp.ifYes;
        // Insert next question if not already there
        if (questionQueue[step]?.id !== nextQ.id) {
          const newQueue = [...questionQueue];
          newQueue.splice(step, 0, nextQ);
          setQuestionQueue(newQueue);
        }
      }
    }

    // 2. Advance / Submit
    if (step < questionQueue.length) {
      setStep(step + 1);
    } else {
      await submitData();
    }
  };

  const submitData = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      // 1. Daily Checkin
      const { error: checkinError } = await supabase.from('daily_checkins').insert({
        user_id: authUser.id,
        data: answers,
        date: new Date().toISOString().split('T')[0]
      });
      if (checkinError) throw checkinError;

      // 2. Metrics (Kicks)
      const metricsToSave = [];
      if (answers.kicks) metricsToSave.push({ user_id: authUser.id, type: 'KICKS', value: String(answers.kicks), unit: 'kicks' });

      if (metricsToSave.length > 0) {
        await supabase.from('health_metrics').insert(metricsToSave);
      }

      // 3. Risk Analysis
      await calculateAndLogRisk(authUser.id, answers);

      setStep(step + 1); // Move to success logic
      setTimeout(() => router.push('/dashboard'), 2500);

    } catch (err) {
      console.error(err);
      alert("Something went wrong saving your data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkDailyStatus() {
      if (!authUser) return;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('date', today)
        .single();

      if (data) {
        setStep(100); // Already done today
      }
    }
    checkDailyStatus();
  }, [authUser]);

  // RENDER: Intro
  if (step === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2"></div>

        <div className="p-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
          <div className="w-40 h-40 bg-gradient-to-tr from-brand-100 to-purple-100 rounded-full flex items-center justify-center mb-8 relative shadow-lg shadow-brand-100/50">
            <div className="absolute inset-0 border-4 border-white rounded-full"></div>
            <span className="text-6xl animate-bounce-subtle">🌸</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Your Daily Check-In</h1>
          <p className="text-gray-500 mb-10 max-w-xs text-lg leading-relaxed">
            A few moments for you and baby. Just a couple of questions to keep your journey safe.
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full max-w-sm bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Start Check-In <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Success
  if (step > questionQueue.length || step >= 100) {
    return (
      <div className="flex flex-col min-h-screen bg-green-50 p-6 items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-lg shadow-green-100 animate-in zoom-in duration-500">
          <Check className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">All Caught Up!</h2>
        <p className="text-gray-600 mb-8 max-w-xs">Great job prioritizing your health today. We've updated your insights.</p>

        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  // RENDER: Question Flow
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setStep(step - 1)} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
          Question {step} / {questionQueue.length}
        </span>
        <button onClick={() => router.push('/dashboard')} className="p-2 text-gray-400 hover:text-gray-600 font-medium text-sm">Esc</button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-10 overflow-hidden mx-2">
        <div
          className="h-full bg-brand-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentQuestion?.text}
        </h2>
        {currentQuestion?.helper && (
          <p className="text-gray-500 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">{currentQuestion.helper}</p>
        )}
        {!currentQuestion?.helper && <div className="mb-8"></div>}

        {/* Dynamic Inputs */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          {currentQuestion?.type === 'scale' && (
            <div className="flex justify-between items-center text-4xl bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              {currentQuestion.options?.map((emoji: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx + 1)}
                  className={cn(
                    "p-3 rounded-2xl transition-all hover:bg-gray-50 scale-100 hover:scale-125 focus:scale-125 outline-none",
                    answers[currentQuestion.id] === idx + 1 ? "bg-brand-100 ring-4 ring-brand-100 scale-125 grayscale-0" : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className={cn("py-8 rounded-2xl border-2 font-bold text-xl transition-all active:scale-95", answers[currentQuestion.id] === true ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md" : "border-gray-100 bg-white text-gray-600 hover:border-gray-200")}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={cn("py-8 rounded-2xl border-2 font-bold text-xl transition-all active:scale-95", answers[currentQuestion.id] === false ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md" : "border-gray-100 bg-white text-gray-600 hover:border-gray-200")}
              >
                No
              </button>
            </div>
          )}

          {currentQuestion?.type === 'scale_10' && (
            <div className="grid grid-cols-5 gap-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={cn(
                    "aspect-square rounded-xl font-bold text-lg border-2 transition-all",
                    answers[currentQuestion.id] === num
                      ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-200"
                      : "border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'numeric' && (
            <div className="flex flex-col items-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
              <input
                type="number"
                placeholder="0"
                className="w-full text-center text-7xl font-bold text-brand-900 border-none focus:ring-0 outline-none p-0 bg-transparent placeholder-gray-200"
                autoFocus
                onChange={(e) => handleAnswer(e.target.value)}
                value={answers[currentQuestion.id] || ''}
              />
            </div>
          )}

          {currentQuestion?.type === 'multi' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => {
                    const current = answers[currentQuestion.id] || [];
                    const updated = current.includes(opt)
                      ? current.filter((i: string) => i !== opt)
                      : [...current, opt];
                    handleAnswer(updated);
                  }}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center group",
                    (answers[currentQuestion.id] || []).includes(opt)
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                      : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <span className="font-medium text-lg">{opt}</span>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", (answers[currentQuestion.id] || []).includes(opt) ? "border-brand-500 bg-brand-500 text-white" : "border-gray-200 group-hover:border-gray-300")}>
                    {(answers[currentQuestion.id] || []).includes(opt) && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-auto max-w-lg mx-auto w-full">
        {/* Voice Input Placeholder - Future Feature */}
        <button className="p-4 bg-white rounded-2xl text-gray-400 border border-gray-200 hover:text-brand-500 hover:border-brand-200 transition-colors shadow-sm">
          <Mic className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQuestion?.id] === undefined && currentQuestion?.type !== 'multi'}
          className="flex-1 bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
        >
          {loading ? "Saving..." : "Continue"} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
