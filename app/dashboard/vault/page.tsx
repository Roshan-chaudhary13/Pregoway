"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Search, Eye, Loader2, Trash2, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Doc = {
   id: string;
   title: string;
   file_type: string;
   uploaded_at: string;
   status: string;
   file_url: string;
};

const CATEGORIES = [
   { id: 'Lab Reports', label: 'Lab Report', icon: '🧪' },
   { id: 'Scans', label: 'Scan / Imaging', icon: '🩻' },
   { id: 'Prescriptions', label: 'Prescription', icon: '💊' },
   { id: 'Other', label: 'Other', icon: '📄' }
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

         if (error) {
            console.error("Load Error Details:", error);
         }

         if (data) {
            setDocs(data);
         }
      } catch (err) {
         console.error("Critical Load Error:", err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadDocs();
   }, [user]);

   const handleUploadClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      setSelectedFile(e.target.files[0]);
      setIsModalOpen(true);
   };

   const confirmUpload = async () => {
      if (!selectedFile || !selectedCategory || !user) return;

      setUploading(true);
      setIsModalOpen(false);

      try {
         // 1. Upload to Storage
         const fileExt = selectedFile.name.split('.').pop();
         const fileName = `${user.id}/${Date.now()}.${fileExt}`;

         const { data: storageData, error: storageError } = await supabase.storage
            .from('vault')
            .upload(fileName, selectedFile);

         if (storageError) {
            alert(`Storage Upload Failed: ${storageError.message}`);
            throw storageError;
         }

         // 2. Insert Metadata
         const { error: dbError } = await supabase.from('documents').insert({
            user_id: user.id,
            title: selectedFile.name,
            file_url: storageData.path,
            file_type: selectedCategory,
            status: 'Analyzed'
         });

         if (dbError) {
            alert(`Database Save Failed: ${dbError.message}`);
            throw dbError;
         }

         // 3. Refresh
         await loadDocs();
         setSelectedFile(null);
         setSelectedCategory(null);

      } catch (err: any) {
         console.error("Upload process failed:", err);
      } finally {
         setUploading(false);
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };

   const handleView = async (path: string) => {
      const { data, error } = await supabase.storage.from('vault').createSignedUrl(path, 60);
      if (data?.signedUrl) {
         window.open(data.signedUrl, '_blank');
      }
   };

   const handleDelete = async (id: string, path: string) => {
      if (!confirm("Are you sure you want to delete this document?")) return;

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
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
         <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
         />

         <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900 font-outfit">Health Records</h1>
               <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-100">
                  {docs.length} Records
               </div>
            </div>

            <div className="relative mb-6">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
               <input
                  type="text"
                  placeholder="Search reports..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <button
               onClick={handleUploadClick}
               disabled={uploading}
               className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black shadow-lg transition-all active:scale-95 disabled:bg-gray-400"
            >
               {uploading ? (
                  <>
                     <Loader2 className="w-6 h-6 animate-spin" />
                     <span>Uploading...</span>
                  </>
               ) : (
                  <>
                     <Upload className="w-6 h-6" />
                     <span>Upload New Report</span>
                  </>
               )}
            </button>
         </div>

         <div className="p-4 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {['All', 'Lab Reports', 'Scans', 'Prescriptions', 'Other'].map((cat) => (
                  <button
                     key={cat}
                     onClick={() => setActiveTab(cat)}
                     className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${activeTab === cat ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100' : 'bg-white border-gray-200 text-gray-500 hover:border-brand-300'}`}
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
                     <h2 className="text-xl font-bold text-gray-900 mb-2">No documents found</h2>
                     <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                        {searchQuery ? "No results match your search." : "Your health vault is empty. Upload your first scan or report."}
                     </p>
                  </div>
               ) : (
                  filteredDocs.map((doc) => (
                     <div key={doc.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${doc.file_type === 'Lab Reports' ? 'bg-blue-50 text-blue-500' :
                              doc.file_type === 'Scans' ? 'bg-purple-50 text-purple-500' :
                                 doc.file_type === 'Prescriptions' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500'
                           }`}>
                           <FileText className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 truncate flex-1">{doc.title}</h4>
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">{doc.file_type || 'Other'}</span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="font-medium bg-gray-50 px-2 py-0.5 rounded-md">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                              <div className="flex items-center gap-1.5 text-green-600 font-bold">
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                                 <span>{doc.status || 'Analyzed'}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleView(doc.file_url)} className="w-10 h-10 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl flex items-center justify-center text-gray-400 transition-colors">
                              <Eye className="w-5 h-5" />
                           </button>
                           <button onClick={() => handleDelete(doc.id, doc.file_url)} className="w-10 h-10 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Categorization Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900">What is this report?</h2>
                        <p className="text-gray-500 text-sm mt-1">Select a category for better organization</p>
                     </div>
                     <button
                        onClick={() => { setIsModalOpen(false); setSelectedFile(null); }}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-500"
                     >
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     {CATEGORIES.map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => setSelectedCategory(cat.id)}
                           className={`p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all border-2 ${selectedCategory === cat.id
                                 ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-100'
                                 : 'border-gray-50 bg-gray-50 hover:border-brand-200'
                              }`}
                        >
                           <span className="text-3xl">{cat.icon}</span>
                           <span className={`text-sm font-bold ${selectedCategory === cat.id ? 'text-brand-700' : 'text-gray-600'}`}>
                              {cat.label}
                           </span>
                        </button>
                     ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 mb-8 border border-gray-100">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <FileText className="w-5 h-5 text-gray-400" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected File</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedFile?.name}</p>
                     </div>
                  </div>

                  <button
                     onClick={confirmUpload}
                     disabled={!selectedCategory || uploading}
                     className="w-full py-5 bg-gray-900 disabled:bg-gray-400 hover:bg-brand-600 text-white rounded-[1.5rem] shadow-xl transition-all font-black text-lg active:scale-95"
                  >
                     Upload to Vault
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
