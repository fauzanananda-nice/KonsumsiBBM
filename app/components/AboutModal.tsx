import { X } from "lucide-react";

export default function AboutModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Gelap (Backdrop) */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Kotak Konten Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-black text-green-600 uppercase tracking-wider mb-4">Tentang & Disclaimer</h2>
        
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>
            <strong>🎯 Tujuan:</strong><br/>
            BBM Tracker adalah alat bantu hitung estimasi biaya bahan bakar bulanan untuk mempermudah perbandingan efisiensi antar kendaraan.
          </p>
          <p>
            <strong>📊 Akurasi Data:</strong><br/>
            Data konsumsi (km/l) diambil dari dataset publik dan hasil uji pihak ketiga. Angka ini bisa berbeda dengan klaim brosur resmi pabrikan.
          </p>
          <p>
            <strong>⚠️ Estimasi Matematis:</strong><br/>
            Hasil perhitungan adalah kalkulasi matematis murni (Jarak Harian ÷ Konsumsi BBM × Harga per Liter).
          </p>
          <p>
            <strong>🚦 Faktor X di Jalanan:</strong><br/>
            Di dunia nyata, konsumsi bensin sangat bergantung pada "sekolah kaki kanan" (cara injek gas), tingkat kemacetan lalu lintas, tekanan angin ban, kondisi mesin, hingga beban muatan. Angka di web ini bukan patokan mutlak.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Developed for Portfolio
          </p>
        </div>
      </div>
    </div>
  );
}