import { useState } from "react";
import { X, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("feedback").insert([{ name, message }]);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setMessage("");
        onClose();
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-black text-green-600 uppercase tracking-wider mb-1">Kritik & Saran</h2>
        <p className="text-xs text-gray-500 mb-4 font-medium">Nemu bug atau punya ide fitur baru? Laporin ke dev-nya di sini!</p>
        
        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold animate-in fade-in">
            🚀 Laporan ente udah meluncur ke markas!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" placeholder="Nama / Panggilan Ente" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" />
            </div>
            <div>
              <textarea placeholder="Tulis keluhan atau saran ente di sini..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
                className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? "Mengirim..." : <><Send className="w-4 h-4"/> Kirim Pesan</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}