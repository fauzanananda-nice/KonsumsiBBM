import { useRef, useState } from "react";
import Image from "next/image";
import { Fuel, Map, Share2, Car } from "lucide-react";
import { toBlob } from "html-to-image";

import pertaminaLogo from "../pertamina.png";
import shellLogo from "../shell.png";
import bpLogo from "../bp.png";
import vivoLogo from "../vivo.png";
import mainLogo from "../logo.png"; 

const spbuMap = [
  { id: 1, name: 'Pertamina', logo: pertaminaLogo },
  { id: 2, name: 'Shell', logo: shellLogo },
  { id: 3, name: 'BP', logo: bpLogo },
  { id: 4, name: 'Vivo', logo: vivoLogo },
];
const ronMap = [{ id: 1, val: 90 }, { id: 2, val: 92 }, { id: 3, val: 95 }, { id: 4, val: 98 }];

const BrandLogo = ({ make, className }: { make: string, className?: string }) => {
  const [hasError, setHasError] = useState(false);
  const safeMake = make ? make.toLowerCase().replace(/\s+/g, '-') : '';

  if (hasError || !safeMake) return <Car className={`text-gray-400 ${className || 'w-5 h-5'}`} />;

  return (
    <img
      src={`/logos/${safeMake}.png`}
      alt={make}
      className={`object-contain ${className || 'w-full h-full'}`}
      onError={() => setHasError(true)}
      crossOrigin="anonymous" 
    />
  );
};

export default function SingleResult({
  selectedCarData, dailyDistance, setDailyDistance,
  userBensin, setUserBensin, katalogHarga
}: any) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const getHargaUserBensin = (spbu_id: number, ron_id: number) => {
    const bensin = katalogHarga.find((b: any) => b.spbu_id === spbu_id && b.ron_id === ron_id);
    return bensin ? bensin.harga : 0; 
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    setIsSharing(true);
    try {
      const blob = await toBlob(captureRef.current, { 
        cacheBust: true, 
        pixelRatio: 2 
      });
      if (!blob) throw new Error('Gagal bikin gambar');

      const file = new File([blob], 'bbm-tracker-single.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Hasil Cek Konsumsi BBM',
          text: `Gila! Estimasi dalkot ${selectedCarData.Make} ${selectedCarData.Type} tembus segini. Cek di BBM Tracker!`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'bbm-tracker-single.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        alert('Gambar berhasil di-download! Tinggal ente upload manual ke IG Story/Twitter.');
      }
    } catch (err) {
      console.error('Share failed', err);
      alert('Waduh gagal share bro, coba lagi deh!');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      
      {/* UI UTAMA (TETAP SAMA) */}
      <div className="bg-white pb-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1.5 shrink-0">
            <BrandLogo make={selectedCarData.Make} />
          </div>
          <div className="text-left flex-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData.Make} {selectedCarData.Year}</p>
            <p className="text-sm font-black text-gray-900 truncate">{selectedCarData.Type}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">
              {selectedCarData.Transmission} • {selectedCarData['Engine Displacement']} cc
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Dalam Kota</p>
            <p className="text-3xl font-black text-gray-900">{selectedCarData['City Fuel Consumption (km/l)']} <span className="text-sm font-normal text-gray-500">km/l</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Luar Kota</p>
            <p className="text-3xl font-black text-gray-900">{selectedCarData['Highway Fuel Consumption (km/l)']} <span className="text-sm font-normal text-gray-500">km/l</span></p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl mb-6">
          <Fuel className="w-5 h-5" />
          <span className="font-semibold text-sm">Min. BBM: <span className="font-black">{selectedCarData['Gas Type']}</span></span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
          <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900"><Map className="w-5 h-5 text-green-600"/> Kalkulator Biaya</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2 font-bold text-gray-500">
              <span>Jarak Harian</span>
              <span className="text-green-600">{dailyDistance} km</span>
            </div>
            <input type="range" min="5" max="150" step="5" value={dailyDistance} onChange={(e) => setDailyDistance(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-green-600"/>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih SPBU & RON</p>
            <div className="flex gap-2 mb-2">
              {spbuMap.map((spbu) => (
                <button key={`spbu-${spbu.id}`} onClick={() => setUserBensin({ ...userBensin, spbu: spbu.id })}
                  className={`flex-1 flex justify-center items-center p-2 rounded-lg border transition ${userBensin.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <Image src={spbu.logo} alt={spbu.name} className="h-6 w-auto object-contain" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {ronMap.map((ron) => {
                const isAvailable = getHargaUserBensin(userBensin.spbu, ron.id) > 0;
                return (
                  <button key={`ron-${ron.id}`} disabled={!isAvailable} onClick={() => setUserBensin({ ...userBensin, ron: ron.id })}
                    className={`flex-1 p-2 rounded-lg border text-sm font-black transition ${!isAvailable ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : userBensin.ron === ron.id ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                    {ron.val}
                  </button>
                )
              })}
            </div>
            <div className="text-right mt-1">
              <span className="text-[10px] text-gray-400 font-medium">Harga: </span>
              <span className="text-xs font-bold text-gray-700">Rp {getHargaUserBensin(userBensin.spbu, userBensin.ron).toLocaleString('id-ID')}/L</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estimasi Dalkot (30 Hari)</p>
            <p className="text-3xl font-black text-green-700">
              Rp {Math.round((dailyDistance / parseFloat(selectedCarData['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin.spbu, userBensin.ron) * 30).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      <button onClick={handleShare} disabled={isSharing}
        className="w-full mt-4 bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition active:scale-95 shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2">
        {isSharing ? "Memproses Gambar..." : <><Share2 className="w-5 h-5"/> Pamerin Hasilnya!</>}
      </button>


      {/* ========================================== */}
      {/* STUDIO GAIB KHUSUS SCREENSHOT (9:16)       */}
      {/* ========================================== */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div ref={captureRef} className="w-[405px] h-[720px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6 relative font-sans">
          
          <h2 className="text-2xl font-black text-green-600 tracking-widest uppercase mb-6 flex items-center gap-2 relative z-20">
            <Map className="w-6 h-6"/> Hasil Kalkulasi
          </h2>

          <div className="bg-white w-full rounded-3xl border border-gray-200 p-6 flex flex-col gap-6 relative z-10 overflow-hidden shadow-sm">
            
            {/* BACKGROUND FADING LOGO KAYA DI COMPARE */}
            <div className="absolute -right-8 -top-8 opacity-[0.06] w-64 h-64 pointer-events-none">
               <BrandLogo make={selectedCarData.Make} />
            </div>

            {/* HEADER MOBIL YANG DI-MAXIMIZE */}
            <div className="relative z-10">
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{selectedCarData.Make} {selectedCarData.Year}</p>
               {/* Ini yang bikin teksnya bisa wrapping rapi ke bawah mengisi space kosong */}
               <p className="text-3xl font-black text-gray-900 leading-tight pr-6">{selectedCarData.Type}</p>
               <p className="text-xs font-medium text-gray-500 mt-2">{selectedCarData.Transmission} • {selectedCarData['Engine Displacement']} cc</p>
            </div>
            
            {/* GRID DALKOT & LUKOT */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
               <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Dalam Kota</p>
                  <p className="text-3xl font-black text-gray-900">{selectedCarData['City Fuel Consumption (km/l)']}</p>
               </div>
               <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Luar Kota</p>
                  <p className="text-3xl font-black text-gray-900">{selectedCarData['Highway Fuel Consumption (km/l)']}</p>
               </div>
            </div>

            {/* BOX BIAYA */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-center relative z-10">
               <p className="text-[10px] font-bold text-green-700 uppercase mb-2 tracking-widest">Estimasi Biaya ({dailyDistance}km/hari)</p>
               <div className="flex items-center justify-center gap-2 mb-2">
                  <img src={spbuMap.find(s => s.id === userBensin.spbu)?.logo.src} crossOrigin="anonymous" className="h-5 object-contain" />
                  <span className="text-sm font-black text-green-800">{ronMap.find(r => r.id === userBensin.ron)?.val}</span>
               </div>
               <p className="text-4xl font-black text-green-700 my-3">
                 Rp {Math.round((dailyDistance / parseFloat(selectedCarData['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin.spbu, userBensin.ron) * 30).toLocaleString('id-ID')}
               </p>
               <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-widest">Total per 30 Hari</p>
            </div>

          </div>

          {/* Watermark Margin */}
          <div className="absolute bottom-8 flex items-center justify-center gap-2 opacity-50 relative z-20 mt-6">
            <img src={mainLogo.src} crossOrigin="anonymous" className="h-4 grayscale" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">bbm-tracker.vercel.app</span>
          </div>

        </div>
      </div>

    </div>
  );
}