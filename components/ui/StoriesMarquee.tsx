"use client";

import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

type Story = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

const STORIES: Story[] = [
  {
    name: "Riya Sharma",
    role: "Mother of 6-month-old",
    quote: "I didn't know I had high BP until Pregoway alerted me. It saved us.",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    name: "Dr. Anjali Gupta",
    role: "Rural Health Officer",
    quote: "This tool bridges the gap between our PHCs and city hospitals.",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    name: "Sunita Devi",
    role: "Expecting Mother",
    quote: "The weekly timeline tells me exactly what to eat and when to scan.",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026703d"
  },
  {
    name: "Priya K.",
    role: "New Mom",
    quote: "I felt so alone in my first pregnancy. This time, I felt guided.",
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d"
  },
  {
    name: "Lakshmi",
    role: "ASHA Worker",
    quote: "Explaining risks to families is easier with these visual charts.",
    image: "https://i.pravatar.cc/150?u=a042581f4e25026704d"
  },
];

export function StoriesMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-10 bg-white">
      {/* Gradients to hide edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

      <div className="flex gap-6 animate-marquee w-max">
        {[...STORIES, ...STORIES].map((story, i) => (
          <div
            key={i}
            className="w-[85vw] md:w-[350px] flex-shrink-0 bg-gray-50 border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-brand-100 group-hover:text-brand-200 transition-colors" />

            <p className="text-gray-600 italic mb-6 leading-relaxed relative z-10">
              "{story.quote}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 text-lg border-2 border-white shadow-sm overflow-hidden">
                {/* Fallback to Initial if image fails or for simplicity */}
                {story.image.includes('png') ? (
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : null}
                <span className={story.image.includes('png') ? 'hidden' : ''}>{story.name[0]}</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{story.name}</h4>
                <p className="text-xs text-brand-600 font-medium uppercase tracking-wide">{story.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
