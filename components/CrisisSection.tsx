"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, HeartPulse, Activity, ArrowUpRight } from "lucide-react";

const MMR_DATA = [
  { year: '2018', rate: 113 },
  { year: '2019', rate: 103 },
  { year: '2020', rate: 97 },
  { year: '2021', rate: 90 }, // Still too high
  { year: 'Target', rate: 70 },
];

const CAUSES_DATA = [
  { name: 'Hemorrhage', value: 38, color: '#ef4444' }, // Red
  { name: 'Hypertension', value: 21, color: '#f97316' }, // Orange
  { name: 'Sepsis', value: 11, color: '#eab308' }, // Yellow
  { name: 'Others', value: 30, color: '#64748b' }, // Gray
];

export function CrisisSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="bg-white py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background SVG Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad1)" />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgb(255,0,0)', stopOpacity: 0 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(255,0,0)', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="max-w-7xl mx-auto relative z-10 text-gray-900">

        {/* Header */}
        <div className="mb-12 md:mb-20 grid lg:grid-cols-2 gap-8 md:gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              Critical Attention Needed
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              The Silent Emergency: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                It's Not Just a Statistic.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              Every 2 minutes, a woman dies from preventable causes related to pregnancy. We are losing mothers to silence, distance, and lack of data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-4xl font-bold text-gray-900 mb-1">80%</div>
              <div className="text-sm text-gray-500">of maternal deaths are <span className="text-green-600 font-bold">preventable</span> with timely care.</div>
            </div>
            <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
              <div className="text-4xl font-bold text-red-500 mb-1">2x</div>
              <div className="text-sm text-red-700">Higher mortality risk in rural areas vs urban cities.</div>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Chart 1: The Problem (Trends) */}
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Maternal Mortality Ratio (MMR)
                </h3>
                <p className="text-sm text-gray-500 mt-1">Deaths per 100,000 live births (India)</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500 flex items-center justify-end gap-1">
                  <ArrowUpRight className="w-5 h-5 rotate-180" />
                  Declining
                </div>
                <div className="text-xs text-gray-400">But not fast enough</div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MMR_DATA}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: The Cause (Pie) */}
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                <HeartPulse className="w-5 h-5 text-red-500" />
                Top Contributors
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Hemorrhage and Hypertension dominate the causes.
                <strong className="text-gray-900 block mt-2">Pregoway's vitals tracker specifically targets these two killers.</strong>
              </p>

              <ul className="space-y-3">
                {CAUSES_DATA.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600 flex-1">{item.name}</span>
                    <span className="font-bold text-gray-900">{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-[240px] h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CAUSES_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {CAUSES_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">80%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Preventable</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
