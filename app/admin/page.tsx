"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Fuel, Inbox, LogOut, Save } from "lucide-react";

// Import Logo SPBU 
import pertaminaLogo from "../pertamina.png";
import shellLogo from "../shell.png";
import bpLogo from "../bp.png";
import vivoLogo from "../vivo.png";

const spbuLogos: Record<number, any> = { 
  1: pertaminaLogo, 
  2: shellLogo, 
  3: bpLogo, 
  4: vivoLogo 
};
const ronMap: Record<number, string> = { 1: 'RON 90', 2: 'RON 92', 3: 'RON 95', 4: 'RON 98' };

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState<"harga" | "inbox">("harga");
  const [prices, setPrices] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<{ id: number, status: "saving" | "success" | "" }>({ id: 0, status: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPrices();
      fetchFeedbacks();
    }
  }, [session]);

  const fetchPrices = async () => {
    const { data } = await supabase.from("katalog_harga").select("*").order("spbu_id", { ascending: true }).order("ron_id", { ascending: true });
    if (data) setPrices(data);
  };

  const fetchFeedbacks = async () => {
    const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
    if (data) setFeedbacks(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  const handlePriceChange = (id: number, newVal: string) => {
    setPrices(prices.map(p => p.id === id ? { ...p, harga: Number(newVal) } : p));
  };

  const savePrice = async (id: number, newPrice: number) => {
    setSaveStatus({ id, status: "saving" });
    const { error } = await supabase.from("katalog_harga").update({ harga: newPrice }).eq("id", id);
    if (!error) {
      setSaveStatus({ id, status: "success" });
      setTimeout(() => setSaveStatus({ id: 0, status: "" }), 2000);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-center text-gray-900 mb-6 uppercase tracking-widest">Admin Portal</h1>
          {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{errorMsg}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-green-700 transition">
            {loading ? "Memeriksa..." : "Masuk Kandang"}
          </button>
        </form>
      </div>
    );
  }

  const groupedPrices = prices.reduce((acc: any, curr) => {
    if (!acc[curr.spbu_id]) acc[curr.spbu_id] = [];
    acc[curr.spbu_id].push(curr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[80vh] flex flex-col">
        
        <div className="bg-gray-900 p-6 flex flex-col md:flex-row gap-4 justify-between items-center text-white">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest">Command Center</h1>
            <p className="text-xs text-gray-400 font-medium">Log: {session.user.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("harga")} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === "harga" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}><Fuel className="w-4 h-4"/> Harga BBM</button>
            <button onClick={() => setActiveTab("inbox")} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === "inbox" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}><Inbox className="w-4 h-4"/> Inbox Laporan</button>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition" title="Logout"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 bg-gray-50">
          
          {/* TAB HARGA BBM */}
          {activeTab === "harga" && (
            <div className="animate-in fade-in">
              <h2 className="text-lg font-black mb-6 text-gray-800">Update Harga Katalog BBM</h2>
              
              <div className="space-y-6">
                {[1, 2, 3, 4].map((spbuId) => {
                  const spbuItems = groupedPrices[spbuId];
                  if (!spbuItems) return null;

                  return (
                    <div key={spbuId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                      
                      {/* Logo SPBU */}
                      <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-2">
                         <Image src={spbuLogos[spbuId]} alt="Logo SPBU" className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* Grid 4 Kolom Statis (RON 90, 92, 95, 98) */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((ronId) => {
                          
                          // Syarat khusus: Kalo SPBU Shell (2) dan RON 90 (1), sembunyiin total (bikin kotak kosong).
                          if (spbuId === 2 && ronId === 1) {
                            return <div key={`empty-${spbuId}-${ronId}`}></div>;
                          }

                          const p = spbuItems.find((item: any) => item.ron_id === ronId);
                          
                          // Kalo data ga ada di DB (contoh: BP RON 90/98), kasih kotak kosong biar sejajar
                          if (!p) {
                            return <div key={`empty-${spbuId}-${ronId}`}></div>;
                          }

                          return (
                            <div key={p.id} className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ronMap[ronId]}</span>
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5 border border-gray-200">
                                 <span className="text-gray-500 text-xs font-bold pl-1">Rp</span>
                                 <input 
                                   type="number" 
                                   value={p.harga} 
                                   onChange={(e) => handlePriceChange(p.id, e.target.value)}
                                   className="w-full bg-transparent text-sm font-black text-gray-900 outline-none text-right" 
                                 />
                                 <button onClick={() => savePrice(p.id, p.harga)} disabled={saveStatus.id === p.id}
                                   className={`p-1.5 rounded-md transition ${saveStatus.id === p.id && saveStatus.status === "success" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white"}`}>
                                   {saveStatus.id === p.id && saveStatus.status === "success" ? "✔" : <Save className="w-4 h-4"/>}
                                 </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB INBOX Laporan */}
          {activeTab === "inbox" && (
            <div className="animate-in fade-in">
               <h2 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2">
                 Inbox Laporan User <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{feedbacks.length}</span>
               </h2>
               
               {feedbacks.length === 0 ? (
                 <div className="text-center text-gray-400 font-medium py-10">Belum ada surat masuk dari tongkrongan.</div>
               ) : (
                 <div className="space-y-4">
                   {feedbacks.map((fb) => (
                     <div key={fb.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-black text-gray-900">{fb.name}</h3>
                         <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                           {new Date(fb.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       <p className="text-sm text-gray-600 whitespace-pre-wrap">{fb.message}</p>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}