"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Search, Eye, Loader2, Trash2, X, CheckCircle2, Sparkles, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Doc = {
   id: string;
   title: string;
   file_type: string;
   uploaded_at: string;
   status: string;
   file_url: string;
   ocr_data?: any;
};

const CATEGORIES = [
   { id: 'Lab Reports', label: 'Lab Report', icon: '🧪', color: 'bg-sky-50 text-sky-700 border-sky-100' },
   { id: 'Scans', label: 'Scan / Imaging', icon: '🩻', color: 'bg-slate-50 text-slate-700 border-slate-200' },
   { id: 'Prescriptions', label: 'Prescription', icon: '💊', color: 'bg-teal-50 text-teal-700 border-teal-100' },
   { id: 'Other', label: 'Other', icon: '📄', color: 'bg-gray-50 text-gray-700 border-gray-200' }
];

export default function VaultPage() {
   const { user } = useAuth();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [docs, setDocs] = useState<Doc[]>([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [activeTab, setActiveTab] = useState("All");

   // Modal state
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Analysis state
   const [analyzing, setAnalyzing] = useState(false);
   const [analysisStep, setAnalysisStep] = useState(0);
   const [showInsights, setShowInsights] = useState<Doc | null>(null);

   async function loadDocs() {
      if (!user) {
         setLoading(false);
         return;
      }

      try {
         const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false });

         if (error) console.error("Load Error:", error);
         if (data) setDocs(data);
      } catch (err) {
         console.error("Critical Load Error:", err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadDocs();
   }, [user]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      setSelectedFile(e.target.files[0]);
      setIsModalOpen(true);
   };

   // Simulation: AI Scanning
   const analyzeDocument = async (docId: string, category: string) => {
      setAnalyzing(true);
      const steps = ["Reading document structure...", "Identifying key values...", "Validating health markers...", "Syncing with dashboard..."];

      for (let i = 0; i < steps.length; i++) {
         setAnalysisStep(i);
         await new Promise(r => setTimeout(r, 800));
      }

      // Mock OCR Data based on category
      let ocrData: any = {
         timestamp: new Date().toISOString(),
         summary: "Health markers successfully extracted.",
         values: []
      };

      if (category === 'Lab Reports') {
         const hbValue = (Math.random() * (14 - 10) + 10).toFixed(1);
         ocrData.values.push({ label: 'Hemoglobin (HB)', value: hbValue, unit: 'g/dL', type: 'HB' });
         // Automatically log metric
         await supabase.from('health_metrics').insert({ user_id: user?.id, type: 'HB', value: parseFloat(hbValue), unit: 'g/dL' });
      } else if (category === 'Scans' || category === 'Prescriptions') {
         const bpSys = Math.floor(Math.random() * (135 - 110) + 110);
         ocrData.values.push({ label: 'Systolic BP', value: bpSys, unit: 'mmHg', type: 'BP' });
         // Automatically log metric
         await supabase.from('health_metrics').insert({ user_id: user?.id, type: 'BP', value: bpSys, unit: 'mmHg' });
      }

      // Update doc with OCR data
      await supabase.from('documents').update({ ocr_data: ocrData, status: 'AI Analyzed' }).eq('id', docId);

      setAnalyzing(false);
      loadDocs();
   };

   const confirmUpload = async () => {
      if (!selectedFile || !selectedCategory || !user) return;

      setUploading(true);
      setIsModalOpen(false);

      try {
         const fileExt = selectedFile.name.split('.').pop();
         const fileName = `${user.id}/${Date.now()}.${fileExt}`;

         const { data: storageData, error: storageError } = await supabase.storage
            .from('vault')
            .upload(fileName, selectedFile);

         if (storageError) throw storageError;

         const { data: dbData, error: dbError } = await supabase.from('documents').insert({
            user_id: user.id,
            title: selectedFile.name,
            file_url: storageData.path,
            file_type: selectedCategory,
            status: 'Processing'
         }).select().single();

         if (dbError) throw dbError;

         // Trigger Simulated Analysis
         await analyzeDocument(dbData.id, selectedCategory);

         setSelectedFile(null);
         setSelectedCategory(null);
      } catch (err: any) {
         alert(`Upload failed: ${err.message}`);
      } finally {
         setUploading(false);
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };

   const handleView = async (path: string) => {
      const { data } = await supabase.storage.from('vault').createSignedUrl(path, 60);
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
   };

   const handleDelete = async (id: string, path: string) => {
      if (!confirm("Remove this document and its data?")) return;
      try {
         await supabase.from('documents').delete().eq('id', id);
         await supabase.storage.from('vault').remove([path]);
         setDocs(docs.filter(d => d.id !== id));
      } catch (err) {
         console.error("Delete failed", err);
      }
   };

   const filteredDocs = docs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || doc.file_type === activeTab;
      return matchesSearch && matchesTab;
   });

   if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>;

   return (
      <div className="flex flex-col min-h-screen bg-gray-50/50 pb-20 font-outfit text-gray-900">
         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />

         <div className="bg-white p-6 sticky top-0 z-20 border-b border-gray-100/80 backdrop-blur-md bg-white/80">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
                     <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900">Health Vault</h1>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 fill-sky-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700">AI Active</span>
               </div>
            </div>

            <div className="relative mb-6">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
               <input
                  type="text"
                  placeholder="Search your records..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-white focus:shadow-md transition-all font-medium text-gray-700 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <button
               onClick={() => fileInputRef.current?.click()}
               disabled={uploading || analyzing}
               className="w-full bg-gradient-to-r from-sky-600 to-brand-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-sky-200/50 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
               {(uploading || analyzing) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
               <span>{(uploading || analyzing) ? 'Processing Record...' : 'Upload Medical Report'}</span>
            </button>

         </div>

         <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
               {['All', 'Lab Reports', 'Scans', 'Prescriptions', 'Other'].map((cat) => (
                  <button
                     key={cat}
                     onClick={() => setActiveTab(cat)}
                     className={cn(
                        "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border",
                        activeTab === cat
                           ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-100'
                           : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                     )}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            <div className="space-y-4">
               {filteredDocs.length === 0 ? (
                  <div className="text-center py-20 px-8 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                     <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-gray-200" />
                     </div>
                     <h2 className="text-xl font-bold text-gray-900 mb-2">No records found</h2>
                     <p className="text-gray-500 text-sm max-w-[240px] mx-auto">Upload reports to see AI-powered insights and tracking.</p>
                  </div>
               ) : (
                  filteredDocs.map((doc) => (
                     <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200 group relative">
                        <div className="flex items-start gap-4 mb-4">
                           <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                              doc.file_type === 'Lab Reports' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                 doc.file_type === 'Scans' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                                    doc.file_type === 'Prescriptions' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                           )}>
                              <FileText className="w-7 h-7" />
                           </div>
                           <div className="flex-1 min-w-0 pt-1">
                              <h4 className="font-bold text-gray-900 truncate leading-tight text-lg mb-1">{doc.title}</h4>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">{doc.file_type || 'Other'}</span>
                                 <span className="text-[10px] text-gray-400 font-bold">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>

                        {doc.ocr_data && (
                           <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-green-700 flex items-center gap-1.5">
                                 <Sparkles className="w-3.5 h-3.5" /> AI Insights Available
                              </span>
                              <button
                                 onClick={() => setShowInsights(doc)}
                                 className="text-[10px] font-black bg-white text-green-700 px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform"
                              >
                                 VIEW
                              </button>
                           </div>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${doc.status === 'AI Analyzed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-400 animate-pulse'}`}></div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{doc.status || 'Reported'}</span>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => handleView(doc.file_url)} className="w-10 h-10 bg-gray-50 hover:bg-brand-600 hover:text-white rounded-xl flex items-center justify-center text-gray-400 transition-colors">
                                 <Eye className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(doc.id, doc.file_url)} className="w-10 h-10 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {analyzing && (
            <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in transition-all">
               <div className="relative w-64 h-80 bg-gray-100 rounded-3xl border-4 border-gray-200 overflow-hidden shadow-2xl mb-12">
                  <div className="absolute inset-0 p-8 flex flex-col gap-4 opacity-20">
                     <div className="h-4 bg-gray-400 rounded-full w-3/4"></div>
                     <div className="h-4 bg-gray-400 rounded-full w-1/2"></div>
                     <div className="h-32 bg-gray-400 rounded-2xl w-full"></div>
                     <div className="h-4 bg-gray-400 rounded-full w-5/6"></div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 shadow-[0_0_15px_rgba(219,39,119,0.8)] animate-ocr-scan"></div>
               </div>

               <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">AI Analysis in Progress</h2>
               <p className="text-gray-500 font-bold text-lg mb-8 h-8">
                  {["Reading document structure...", "Identifying key values...", "Validating health markers...", "Syncing with dashboard..."][analysisStep]}
               </p>
               <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full transition-all duration-500" style={{ width: `${(analysisStep + 1) * 25}%` }}></div>
               </div>
            </div>
         )}

         {showInsights && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in transition-all">
               <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Sparkles className="w-5 h-5 text-brand-500" />
                           <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Report Insights</h2>
                        </div>
                        <p className="text-gray-500 font-bold truncate max-w-[280px] text-sm">{showInsights.title}</p>
                     </div>
                     <button onClick={() => setShowInsights(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="space-y-4 mb-8">
                     {showInsights.ocr_data?.values?.length > 0 ? (
                        showInsights.ocr_data.values.map((v: any, i: number) => (
                           <div key={i} className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{v.label}</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-gray-900">{v.value}</span>
                                    <span className="text-xs font-bold text-gray-500">{v.unit}</span>
                                 </div>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                 <CheckCircle2 className="w-6 h-6 text-green-500" />
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-3xl border border-gray-100">
                           <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-sm font-bold text-gray-500">No specific markers detected for this category.</p>
                        </div>
                     )}
                  </div>

                  <div className="bg-brand-50 p-5 rounded-3xl mb-8 border border-brand-100">
                     <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">AI Summary</span>
                     </div>
                     <p className="text-sm font-bold text-brand-900 leading-relaxed">
                        {showInsights.ocr_data?.summary || "Record analyzed. Category-specific mapping applied."}
                     </p>
                  </div>

                  <button
                     onClick={() => setShowInsights(null)}
                     className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] shadow-xl shadow-brand-100 transition-all font-black text-lg active:scale-95"
                  >
                     Close Insights
                  </button>
               </div>
            </div>
         )}

         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in transition-all">
               <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Record Type</h2>
                        <p className="text-gray-500 font-bold text-sm">Better categories lead to better AI insights</p>
                     </div>
                     <button onClick={() => { setIsModalOpen(false); setSelectedFile(null); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     {CATEGORIES.map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => setSelectedCategory(cat.id)}
                           className={cn(
                              "p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all border-4",
                              selectedCategory === cat.id ? 'border-brand-500 bg-brand-50 shadow-xl shadow-brand-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                           )}
                        >
                           <span className="text-4xl">{cat.icon}</span>
                           <span className={cn("text-xs font-black uppercase tracking-widest", selectedCategory === cat.id ? 'text-brand-700' : 'text-gray-400')}>
                              {cat.label}
                           </span>
                        </button>
                     ))}
                  </div>

                  <button
                     onClick={confirmUpload}
                     disabled={!selectedCategory || uploading}
                     className="w-full py-5 bg-brand-600 disabled:bg-gray-400 hover:bg-brand-700 text-white rounded-[1.5rem] shadow-xl shadow-brand-100 transition-all font-black text-lg active:scale-95"
                  >
                     Start AI Scan
                  </button>
               </div>
            </div>
         )}

         <style jsx global>{`
            @keyframes ocr-scan {
               0% { top: 0; }
               50% { top: 100%; opacity: 0.8; }
               100% { top: 0; }
            }
            .animate-ocr-scan {
               animation: ocr-scan 2.5s ease-in-out infinite;
            }
         `}</style>
      </div>
   );
}
