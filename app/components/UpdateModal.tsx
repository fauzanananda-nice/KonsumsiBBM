import { X, Rocket, Wrench, Bug } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UpdateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUpdates();
    }
  }, [isOpen]);

  const fetchUpdates = async () => {
    setLoading(true);
    const { data } = await supabase.from('dev_updates').select('*').order('created_at', { ascending: false });
    if (data) setUpdates(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  const renderUpdates = (category: string, icon: any, title: string, color: string, bg: string) => {
    const filtered = updates.filter(u => u.category === category);
    if (filtered.length === 0) return null;
    return (
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
        <h3 className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-3 ${color}`}>
          {icon} {title}
        </h3>
        <div className="space-y-3">
          {filtered.map(u => (
            <div key={u.id} className={`border rounded-xl p-4 ${bg}`}>
               <h4 className="font-bold text-gray-900 text-sm mb-1">{u.title}</h4>
               <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{u.description}</p>
               <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                 {new Date(u.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(u.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
               </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition z-10">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-black text-blue-600 uppercase tracking-wider mb-1 pr-8">🛠️ Update Dev</h2>
        <p className="text-xs font-medium text-gray-500 mb-4 border-b border-gray-100 pb-4">Pantau terus perkembangan fitur dan perbaikan bug di markas EXUM.</p>
        
        <div className="overflow-y-auto pr-2 flex-1 scrollbar-hide">
          {loading ? (
             <div className="text-center text-sm font-bold text-gray-400 py-10 animate-pulse">Memuat log markas...</div>
          ) : updates.length === 0 ? (
             <div className="text-center text-sm font-medium text-gray-400 py-10">Belum ada catatan dari bengkel dev.</div>
          ) : (
            <>
              {renderUpdates('baru_rilis', <Rocket className="w-4 h-4" />, 'Baru Rilis', 'text-green-600', 'bg-green-50 border-green-100')}
              {renderUpdates('lagi_dikerjain', <Wrench className="w-4 h-4" />, 'Lagi Dikerjain', 'text-blue-600', 'bg-blue-50 border-blue-100')}
              {renderUpdates('known_issue', <Bug className="w-4 h-4" />, 'Known Issue', 'text-red-600', 'bg-red-50 border-red-100')}
            </>
          )}
        </div>
      </div>
    </div>
  );
}