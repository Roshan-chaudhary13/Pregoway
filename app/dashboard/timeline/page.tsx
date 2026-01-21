"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { addDays, format, differenceInWeeks, addWeeks } from "date-fns";

type TimelineEvent = {
  week: number;
  title: string;
  type: "scan" | "visit" | "lab" | "birth";
};

const BASE_EVENTS: TimelineEvent[] = [
  { week: 8, title: "First Ultrasound", type: "scan" },
  { week: 12, title: "NT Scan & Blood Tests", type: "scan" },
  { week: 20, title: "Anomaly Scan", type: "scan" },
  { week: 24, title: "Routine Check-up", type: "visit" },
  { week: 28, title: "Glucose Tolerance Test", type: "lab" },
  { week: 32, title: "Growth Scan", type: "scan" },
  { week: 36, title: "GBS Swab & Position Check", type: "lab" },
  { week: 40, title: "Estimated Due Date", type: "birth" },
];

export default function TimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    async function loadTimeline() {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('lmp, edd')
          .eq('id', user.id)
          .single();

        if (profile?.lmp) {
          const lmpDate = new Date(profile.lmp);
          const now = new Date();
          const calculatedWeek = differenceInWeeks(now, lmpDate);
          setCurrentWeek(calculatedWeek);

          const dynamicEvents = BASE_EVENTS.map(event => {
            const eventDate = addWeeks(lmpDate, event.week);
            let status = 'future';
            if (calculatedWeek > event.week) status = 'completed';
            else if (calculatedWeek === event.week || calculatedWeek === event.week - 1) status = 'upcoming';

            return {
              ...event,
              date: format(eventDate, "MMM d, yyyy"),
              status,
              isNext: calculatedWeek < event.week && (calculatedWeek >= event.week - 2) // Flag for next immediate action
            };
          });

          setEvents(dynamicEvents);
        } else {
            // Fallback if no LMP found (user might just be browsing)
            setEvents(BASE_EVENTS.map(e => ({...e, date: "Date TBD", status: 'future'})));
        }
      } catch (error) {
        console.error("Error loading timeline:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [user]);

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
         <h1 className="text-2xl font-bold text-gray-900">Your Journey</h1>
         <p className="text-gray-500">
            {currentWeek > 0 ? `You are in Week ${currentWeek}` : "Timeline of tests and milestones"}
         </p>
      </div>

      <div className="p-6">
        <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8 my-4">
           {events.map((event, idx) => (
             <div key={idx} className="relative pl-8">
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-[9px] top-1 w-5 h-5 rounded-full border-4 bg-white",
                  event.status === "completed" ? "border-green-500" :
                  event.status === "upcoming" ? "border-brand-500" : "border-gray-200"
                )}></div>

                {/* Content Card */}
                <div className={cn(
                  "rounded-2xl p-4 border transition-all",
                  event.status === "upcoming" 
                    ? "bg-brand-50 border-brand-200 shadow-sm" 
                    : event.status === "completed"
                    ? "bg-white border-gray-100 opacity-70"
                    : "bg-white border-gray-100 opacity-60"
                )}>
                   <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                        event.status === "upcoming" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                      )}>
                        Week {event.week}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{event.date}</span>
                   </div>
                   <h3 className={cn("font-bold text-lg mb-1", event.status === "upcoming" ? "text-brand-900" : "text-gray-900")}>
                     {event.title}
                   </h3>
                   
                   {event.status === "upcoming" && (
                     <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-brand-700 transition-colors">
                           Prepare
                        </button>
                        <button className="flex-1 bg-white text-brand-700 border border-brand-200 py-2 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors">
                           Reschedule
                        </button>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
