"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Lock, Unlock } from "lucide-react";

export default function AdminDashboard() {
  // State Keamanan
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // State Data
  const [katalog, setKatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Logic Login Sederhana
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "adminbensin123") { 
      setIsAuthenticated(true);
      fetchKatalog();
    } else {
      setMsg("Password salah bro!");
    }
  };

  // Logic Narik Data + Join Tabel
  const fetchKatalog = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("katalog_harga")
      .select(`
        id,
        harga,
        spbu ( brand ),
        jenis_ron ( ron )
      `)
      .order('spbu_id', { ascending: true })
      .order('ron_id', { ascending: true });

    if (error) {
      setMsg(error.message);
    } else if (data) {
      setKatalog(data);
    }
    setLoading(false);
  };

  // Logic Update Harga ke Database
  const handleUpdateHarga = async (id: number, newHarga: number) => {
    const { error } = await supabase
      .from("katalog_harga")
      .update({ harga: newHarga })
      .eq("id", id);

    if (error) {
      setMsg(`Gagal update: ${error.message}`);
    } else {
      setMsg("✅ Harga berhasil diperbarui!");
      setTimeout(() => setMsg(""), 3000); // Pesan sukses ilang dalam 3 detik
    }
  };

  // Logic ngubah angka di input layar (belum ke-save ke DB)
  const handleHargaChange = (id: number, val: string) => {
    setKatalog((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, harga: Number(val) } : item
      )
    );
  };

  // Tampilan Layar Kunci (Kalo Belum Login)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <h1 className="text-2xl font-black text-green-600 mb-6 text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6"/> Akses Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Masukkan Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
            />
            <button type="submit" className="w-full bg-green-600 text-white font-bold p-3 rounded-xl hover:bg-green-700 transition active:scale-95">
              Buka Brankas
            </button>
          </form>
          {msg && <p className="text-red-500 text-sm mt-4 text-center font-bold">{msg}</p>}
        </div>
      </main>
    );
  }

  // Tampilan Dashboard (Kalo Sukses Login)
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl p-6 mt-6">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-green-600 flex items-center gap-2">
            <Unlock className="w-6 h-6"/> Data Harga BBM
          </h1>
          <button onClick={() => {setIsAuthenticated(false); setPassword("");}} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition">
            Keluar
          </button>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl mb-6 text-center text-sm font-bold border ${msg.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {msg}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 font-bold my-10">Memuat data dari database...</p>
        ) : (
          <div className="space-y-3">
            {katalog.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl hover:shadow-md transition">
                <div>
                  <p className="font-black text-lg text-gray-900">{item.spbu?.brand || "Brand Meleset"}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">RON {item.jenis_ron?.ron || "?"}</p>
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className="font-bold text-gray-400">Rp</span>
                  <input 
                    type="number" 
                    value={item.harga} 
                    onChange={(e) => handleHargaChange(item.id, e.target.value)}
                    className="w-28 border border-gray-300 rounded-lg p-2 font-black text-gray-900 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                  <button 
                    onClick={() => handleUpdateHarga(item.id, item.harga)}
                    className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition active:scale-90 shadow-sm"
                    title="Simpan Harga Baru"
                  >
                    <Save className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}