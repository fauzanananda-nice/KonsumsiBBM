import { useRef, useState } from "react";
import Image from "next/image";
import { Fuel, Map, Share2, Car } from "lucide-react";
import { toBlob } from "html-to-image";

import pertaminaLogo from "../pertamina.png";
import shellLogo from "../shell.png";
import bpLogo from "../bp.png";
import vivoLogo from "../vivo.png";
import mainLogo from "../logo.png"; // Import logo utama buat watermark

const spbuMap = [
  { id: 1, name: 'Pertamina', logo: pertaminaLogo },
  { id: 2, name: 'Shell', logo: shellLogo },
  { id: 3, name: 'BP', logo: bpLogo },
  { id: 4, name: 'Vivo', logo: vivoLogo },
];
const ronMap = [{ id: 1, val: 90 }, { id: 2, val: 92 }, { id: 3, val: 95 }, { id: 4, val: 98 }];

// Komponen helper buat narik logo brand mobil
const BrandLogo = ({ make }: { make: string }) => {
  const [hasError, setHasError] = useState(false);
  const safeMake = make ? make.toLowerCase().replace(/\s+/g, '-') : '';

  if (hasError || !safeMake) return <Car className="w-5 h-5 text-gray-400" />;

  return (
    <img
      src={`/logos/${safeMake}.png`}
      alt={make}
      className="w-full h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
};

export default function CompareResult({
  selectedCarData1, selectedCarData2, dailyDistance, setDailyDistance,
  userBensin1, setUserBensin1, userBensin2, setUserBensin2, katalogHarga
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
      const blob = await toBlob(captureRef.current, { backgroundColor: '#ffffff' });
      if (!blob) throw new Error('Gagal bikin gambar');

      const file = new File([blob], 'bbm-tracker-vs.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Adu Mekanik Konsumsi BBM',
          text: `Adu mekanik dalkot ${selectedCarData1.Type} vs ${selectedCarData2.Type}. Mana yang lebih irit? Cek di BBM Tracker!`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'bbm-tracker-vs.png';
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
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
      
      {/* KOTAK TARGET SCREENSHOT (Semua yang ada di dalem div ini bakal difoto) */}
      <div ref={captureRef} className="bg-white pb-4 pt-2">
        
        {/* UPDATE: Card Ringkasan Mobil 1 & 2 ditambah Logo Brand */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1.5 mb-2 shrink-0">
              <BrandLogo make={selectedCarData1.Make} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData1.Make} {selectedCarData1.Year}</p>
            <p className="text-sm font-black text-gray-900 truncate mt-0.5 w-full">{selectedCarData1.Type}</p>
            <p className="text-[10px] font-medium text-gray-400 mt-1">{selectedCarData1.Transmission} • {selectedCarData1['Engine Displacement']} cc</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1.5 mb-2 shrink-0">
              <BrandLogo make={selectedCarData2.Make} />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData2.Make} {selectedCarData2.Year}</p>
            <p className="text-sm font-black text-gray-900 truncate mt-0.5 w-full">{selectedCarData2.Type}</p>
            <p className="text-[10px] font-medium text-gray-400 mt-1">{selectedCarData2.Transmission} • {selectedCarData2['Engine Displacement']} cc</p>
          </div>
        </div>

        <p className="text-center text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest mt-6">Dalam Kota (km/l)</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={`p-4 rounded-xl text-center border ${parseFloat(selectedCarData1['City Fuel Consumption (km/l)']) > parseFloat(selectedCarData2['City Fuel Consumption (km/l)']) ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${parseFloat(selectedCarData1['City Fuel Consumption (km/l)']) > parseFloat(selectedCarData2['City Fuel Consumption (km/l)']) ? 'text-green-600' : 'text-red-600'}`}>
              {selectedCarData1['City Fuel Consumption (km/l)']}
            </p>
          </div>
          <div className={`p-4 rounded-xl text-center border ${parseFloat(selectedCarData2['City Fuel Consumption (km/l)']) > parseFloat(selectedCarData1['City Fuel Consumption (km/l)']) ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${parseFloat(selectedCarData2['City Fuel Consumption (km/l)']) > parseFloat(selectedCarData1['City Fuel Consumption (km/l)']) ? 'text-green-600' : 'text-red-600'}`}>
              {selectedCarData2['City Fuel Consumption (km/l)']}
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest mt-6">Luar Kota (km/l)</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className={`p-4 rounded-xl text-center border ${parseFloat(selectedCarData1['Highway Fuel Consumption (km/l)']) > parseFloat(selectedCarData2['Highway Fuel Consumption (km/l)']) ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${parseFloat(selectedCarData1['Highway Fuel Consumption (km/l)']) > parseFloat(selectedCarData2['Highway Fuel Consumption (km/l)']) ? 'text-green-600' : 'text-red-600'}`}>
              {selectedCarData1['Highway Fuel Consumption (km/l)']}
            </p>
          </div>
          <div className={`p-4 rounded-xl text-center border ${parseFloat(selectedCarData2['Highway Fuel Consumption (km/l)']) > parseFloat(selectedCarData1['Highway Fuel Consumption (km/l)']) ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${parseFloat(selectedCarData2['Highway Fuel Consumption (km/l)']) > parseFloat(selectedCarData1['Highway Fuel Consumption (km/l)']) ? 'text-green-600' : 'text-red-600'}`}>
              {selectedCarData2['Highway Fuel Consumption (km/l)']}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl">
            <Fuel className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold text-green-600/70">Min. BBM M1</span>
            <span className="font-black text-sm">{selectedCarData1['Gas Type']}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl">
            <Fuel className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase font-bold text-green-600/70">Min. BBM M2</span>
            <span className="font-black text-sm">{selectedCarData2['Gas Type']}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
          <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900"><Map className="w-5 h-5 text-green-600"/> Adu Biaya (30 Hari)</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2 font-bold text-gray-500">
              <span>Jarak Harian (Dalkot)</span>
              <span className="text-green-600">{dailyDistance} km</span>
            </div>
            <input type="range" min="5" max="150" step="5" value={dailyDistance} onChange={(e) => setDailyDistance(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-green-600"/>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Radio M1 */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">BBM M1</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex flex-col gap-1">
                  {spbuMap.map((spbu) => (
                    <button key={`vs1-spbu-${spbu.id}`} onClick={() => setUserBensin1({ ...userBensin1, spbu: spbu.id })}
                      className={`flex justify-center items-center h-8 rounded border transition ${userBensin1.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <Image src={spbu.logo} alt={spbu.name} className="h-4 w-auto object-contain" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {ronMap.map((ron) => {
                    const isAvailable = getHargaUserBensin(userBensin1.spbu, ron.id) > 0;
                    return (
                      <button key={`vs1-ron-${ron.id}`} disabled={!isAvailable} onClick={() => setUserBensin1({ ...userBensin1, ron: ron.id })}
                        className={`h-8 rounded border text-xs font-black transition ${!isAvailable ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : userBensin1.ron === ron.id ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {ron.val}
                      </button>
                    )
                  })}
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 text-center">Rp {getHargaUserBensin(userBensin1.spbu, userBensin1.ron).toLocaleString('id-ID')}/L</p>
            </div>

            {/* Radio M2 */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">BBM M2</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex flex-col gap-1">
                  {spbuMap.map((spbu) => (
                    <button key={`vs2-spbu-${spbu.id}`} onClick={() => setUserBensin2({ ...userBensin2, spbu: spbu.id })}
                      className={`flex justify-center items-center h-8 rounded border transition ${userBensin2.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <Image src={spbu.logo} alt={spbu.name} className="h-4 w-auto object-contain" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {ronMap.map((ron) => {
                    const isAvailable = getHargaUserBensin(userBensin2.spbu, ron.id) > 0;
                    return (
                      <button key={`vs2-ron-${ron.id}`} disabled={!isAvailable} onClick={() => setUserBensin2({ ...userBensin2, ron: ron.id })}
                        className={`h-8 rounded border text-xs font-black transition ${!isAvailable ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : userBensin2.ron === ron.id ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {ron.val}
                      </button>
                    )
                  })}
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 text-center">Rp {getHargaUserBensin(userBensin2.spbu, userBensin2.ron).toLocaleString('id-ID')}/L</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200/60">
            <div className="text-center flex flex-col justify-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 truncate">{selectedCarData1.Type}</p>
              <p className="text-base md:text-md font-black text-gray-900 break-words">
                Rp {Math.round((dailyDistance / parseFloat(selectedCarData1['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin1.spbu, userBensin1.ron) * 30).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 truncate">{selectedCarData2.Type}</p>
              <p className="text-base md:text-md font-black text-gray-900 break-words">
                Rp {Math.round((dailyDistance / parseFloat(selectedCarData2['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin2.spbu, userBensin2.ron) * 30).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
        
        {/* WATERMARK Bawah Pas Di-Share */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <Image src={mainLogo} alt="BBM Tracker" className="h-4 w-auto grayscale opacity-50" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BBM-Tracker.vercel.app</span>
        </div>

      </div>

      {/* Tombol Share (Diluar kotak capture, jadi gak ikut kefoto) */}
      <button 
        onClick={handleShare} 
        disabled={isSharing}
        className="w-full mt-4 bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition active:scale-95 shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
      >
        {isSharing ? "Memproses Gambar..." : <><Share2 className="w-5 h-5"/> Pamerin Hasilnya!</>}
      </button>

    </div>
  );
}