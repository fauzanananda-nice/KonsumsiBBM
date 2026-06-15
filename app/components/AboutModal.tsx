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
      
      {/* Kotak Konten Modal (Dilebarin dikit jadi max-w-lg biar enak bacanya) */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-black text-green-600 uppercase tracking-wider mb-4">Tentang & Disclaimer</h2>
        
        <div className="space-y-5 text-sm text-gray-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          
          <div>
            <strong className="text-gray-900 block mb-1 text-base">About Us:</strong>
            <p>EXUM (diambil dari 'Expensive Petroleum'), merupakan sebuah platform digital yang menyediakan database konsumsi bahan bakar mobil terutama untuk pasar Indonesia. Sekaligus menyampaikan rasa terima kasih kami, database yang kami gunakan bersumber dari akun Instagram <strong>@wheelsaroundme</strong> beserta followers-followersnya yang bahu membahu membangun database konsumsi bahan bakar mobil ini.</p>
          </div>

          <div>
            <strong className="text-gray-900 block mb-1 text-base">Tujuan:</strong>
            <p>Saya dan banyak orang di luar sana, merasa terbantu dengan adanya database konsumsi bahan bakar mobil di Indonesia yang dipelopori oleh akun instagram @wheelsaroundme. Berkaitan dengan hal tersebut, platform ini dibuat dengan beberapa tujuan:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Memberikan platform baru di Indonesia yang menyediakan informasi konsumsi bahan bakar mobil.</li>
              <li>Memperluas jangkauan akses terhadap sumber database.</li>
              <li>Mempermudah akses bagi user yang membutuhkan informasi konsumsi bahan bakar mobil.</li>
            </ol>
          </div>

          <div>
            <strong className="text-gray-900 block mb-1 text-base">Kalkulasi:</strong>
            <p>Perhitungan pada bagian pengeluaran bulanan (30 hari) bersifat perhitungan kasar dengan rumus: <em>Jarak Harian ÷ Konsumsi BBM × Harga per Liter</em>.</p>
          </div>

          <div>
            <strong className="text-gray-900 block mb-1 text-base">Validitas, akurasi data, dan disclaimer:</strong>
            <p>Data yang tertera merupakan gambaran besar dan tidak terjamin 100% akurat, karena sumber data pada database ini merupakan hasil user experience oleh pemilik mobil yang tertera dan telah melewati kalkulasi saat proses pre-processing data. Berkaitan dengan hal tersebut, angka tepat konsumsi bbm kemungkinan besar akan berbeda pada setiap user, karena angka tersebut amat sangat bergantung kepada banyak variable (contoh: cara menginjak gas, kondisi mobil, kondisi jalan, dan lain-lain). Oleh karena itu, angka pada web ini bukan patokan mutlak dan sangat kami sarankan untuk memperkaya referensi.</p>
          </div>

          <div>
            <strong className="text-gray-900 block mb-1 text-base">Kritik dan saran:</strong>
            <p>Kami sangat terbuka terhadap aspirasi dan masukan-masukan membangun untuk perkembangan platform ini yang dapat kalian akses di halaman kritik dan saran. Terima kasih telah menggunakan platform kami! Mari kita bersama-sama menghadapi Expensive Petroleum dengan EXUM.</p>
          </div>

        </div>

      </div>
    </div>
  );
}