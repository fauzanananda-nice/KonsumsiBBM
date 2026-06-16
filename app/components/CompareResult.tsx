import { useRef, useState } from "react";
import Image from "next/image";
import { Fuel, Map, Share2, Car, Swords } from "lucide-react";
import { domToBlob } from "modern-screenshot"; 

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
      const el = captureRef.current;
      
      const blob = await domToBlob(el, { 
        scale: 2,
        backgroundColor: '#f3f4f6', 
      });

      if (!blob) throw new Error('Gagal bikin gambar');

      const file = new File([blob], 'exum-tracker-vs.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Adu Mekanik Konsumsi BBM',
          text: `Adu mekanik dalkot ${selectedCarData1.Type} vs ${selectedCarData2.Type}. Mana yang lebih irit? Cek di EXUM Calculator!`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'exum-tracker-vs.png';
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

  const dalkot1 = parseFloat(selectedCarData1['City Fuel Consumption (km/l)']);
  const dalkot2 = parseFloat(selectedCarData2['City Fuel Consumption (km/l)']);
  const lukot1 = parseFloat(selectedCarData1['Highway Fuel Consumption (km/l)']);
  const lukot2 = parseFloat(selectedCarData2['Highway Fuel Consumption (km/l)']);
  
  const cost1 = Math.round((dailyDistance / dalkot1) * getHargaUserBensin(userBensin1.spbu, userBensin1.ron) * 30);
  const cost2 = Math.round((dailyDistance / dalkot2) * getHargaUserBensin(userBensin2.spbu, userBensin2.ron) * 30);

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
      
      {/* UI UTAMA */}
      <div className="bg-white pb-4 pt-2">
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
          <div className={`p-4 rounded-xl text-center border ${dalkot1 > dalkot2 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${dalkot1 > dalkot2 ? 'text-green-600' : 'text-red-600'}`}>
              {dalkot1} <span className="text-sm font-normal text-gray-500">km/l</span>
            </p>
          </div>
          <div className={`p-4 rounded-xl text-center border ${dalkot2 > dalkot1 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${dalkot2 > dalkot1 ? 'text-green-600' : 'text-red-600'}`}>
              {dalkot2} <span className="text-sm font-normal text-gray-500">km/l</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest mt-6">Luar Kota (km/l)</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className={`p-4 rounded-xl text-center border ${lukot1 > lukot2 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${lukot1 > lukot2 ? 'text-green-600' : 'text-red-600'}`}>
              {lukot1} <span className="text-sm font-normal text-gray-500">km/l</span>
            </p>
          </div>
          <div className={`p-4 rounded-xl text-center border ${lukot2 > lukot1 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-300'}`}>
            <p className={`text-2xl font-black ${lukot2 > lukot1 ? 'text-green-600' : 'text-red-600'}`}>
              {lukot2} <span className="text-sm font-normal text-gray-500">km/l</span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
          <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900"><Map className="w-5 h-5 text-green-600"/> Komparasi Biaya (30 Hari)</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2 font-bold text-gray-500">
              <span>Jarak Harian (Dalam Kota)</span>
              <span className="text-green-600">{dailyDistance} km</span>
            </div>
            <input type="range" min="5" max="150" step="5" value={dailyDistance} onChange={(e) => setDailyDistance(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-green-600"/>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
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
                Rp {cost1.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-center flex flex-col justify-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 truncate">{selectedCarData2.Type}</p>
              <p className="text-base md:text-md font-black text-gray-900 break-words">
                Rp {cost2.toLocaleString('id-ID')}
              </p>
            </div>
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
        <div ref={captureRef} 
             className="w-[405px] h-[720px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6 relative font-sans">
          
          <h2 className="text-2xl font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-20">
            <Swords className="w-6 h-6"/> Adu Mekanik
          </h2>

          <div className="bg-white w-full rounded-3xl border border-gray-200 p-5 flex flex-col gap-4 relative z-10 shadow-sm">
            
            {/* Mobil 1 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-[0.15] w-28 h-28 pointer-events-none">
                  <BrandLogo make={selectedCarData1.Make} />
               </div>

               <div className="relative z-10 flex flex-col gap-1">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData1.Make} {selectedCarData1.Year}</p>
                 <p className="text-lg font-black text-gray-900 leading-tight w-full pr-4">{selectedCarData1.Type}</p>
                 <p className="text-[10px] font-medium text-gray-500 mt-1">{selectedCarData1.Transmission} • {selectedCarData1['Engine Displacement']} cc</p>
               </div>

               {/* GRID DALKOT & LUKOT */}
               <div className="relative z-10 grid grid-cols-2 gap-2 mt-1">
                 <div className={`rounded-lg p-2 text-center border shadow-sm ${dalkot1 > dalkot2 ? 'bg-green-50 border-green-200' : dalkot1 < dalkot2 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${dalkot1 > dalkot2 ? 'text-green-700' : dalkot1 < dalkot2 ? 'text-red-700' : 'text-gray-500'}`}>Dalkot</p>
                    <p className={`text-sm font-black ${dalkot1 > dalkot2 ? 'text-green-700' : dalkot1 < dalkot2 ? 'text-red-700' : 'text-gray-900'}`}>{dalkot1} <span className="text-[9px] font-normal opacity-70">km/l</span></p>
                 </div>
                 <div className={`rounded-lg p-2 text-center border shadow-sm ${lukot1 > lukot2 ? 'bg-green-50 border-green-200' : lukot1 < lukot2 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${lukot1 > lukot2 ? 'text-green-700' : lukot1 < lukot2 ? 'text-red-700' : 'text-gray-500'}`}>Luar Kota</p>
                    <p className={`text-sm font-black ${lukot1 > lukot2 ? 'text-green-700' : lukot1 < lukot2 ? 'text-red-700' : 'text-gray-900'}`}>{lukot1} <span className="text-[9px] font-normal opacity-70">km/l</span></p>
                 </div>
               </div>

               <div className="relative z-10 flex items-end justify-between border-t border-gray-200 pt-2.5 mt-1">
                 <div>
                   <div className="flex items-center gap-1.5 mb-1">
                     <img src={spbuMap.find(s => s.id === userBensin1.spbu)?.logo.src} className="h-4 object-contain" />
                     <span className="text-xs font-black text-gray-700">RON {ronMap.find(r => r.id === userBensin1.ron)?.val}</span>
                   </div>
                   <p className="text-[9px] text-gray-500 font-bold">Rp {getHargaUserBensin(userBensin1.spbu, userBensin1.ron).toLocaleString('id-ID')}/L</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">30 Hari ({dailyDistance}km/h)</p>
                   <p className={`text-base font-black ${cost1 < cost2 ? 'text-green-600' : cost1 > cost2 ? 'text-red-600' : 'text-gray-900'}`}>Rp {cost1.toLocaleString('id-ID')}</p>
                 </div>
               </div>
            </div>

            <div className="flex items-center justify-center -my-5 relative z-20">
               <span className="bg-gray-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border-[3px] border-white shadow-sm">VS</span>
            </div>

            {/* Mobil 2 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-[0.15] w-28 h-28 pointer-events-none">
                  <BrandLogo make={selectedCarData2.Make} />
               </div>

               <div className="relative z-10 flex flex-col gap-1">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData2.Make} {selectedCarData2.Year}</p>
                 <p className="text-lg font-black text-gray-900 leading-tight w-full pr-4">{selectedCarData2.Type}</p>
                 <p className="text-[10px] font-medium text-gray-500 mt-1">{selectedCarData2.Transmission} • {selectedCarData2['Engine Displacement']} cc</p>
               </div>

               {/* GRID DALKOT & LUKOT */}
               <div className="relative z-10 grid grid-cols-2 gap-2 mt-1">
                 <div className={`rounded-lg p-2 text-center border shadow-sm ${dalkot2 > dalkot1 ? 'bg-green-50 border-green-200' : dalkot2 < dalkot1 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${dalkot2 > dalkot1 ? 'text-green-700' : dalkot2 < dalkot1 ? 'text-red-700' : 'text-gray-500'}`}>Dalkot</p>
                    <p className={`text-sm font-black ${dalkot2 > dalkot1 ? 'text-green-700' : dalkot2 < dalkot1 ? 'text-red-700' : 'text-gray-900'}`}>{dalkot2} <span className="text-[9px] font-normal opacity-70">km/l</span></p>
                 </div>
                 <div className={`rounded-lg p-2 text-center border shadow-sm ${lukot2 > lukot1 ? 'bg-green-50 border-green-200' : lukot2 < lukot1 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${lukot2 > lukot1 ? 'text-green-700' : lukot2 < lukot1 ? 'text-red-700' : 'text-gray-500'}`}>Luar Kota</p>
                    <p className={`text-sm font-black ${lukot2 > lukot1 ? 'text-green-700' : lukot2 < lukot1 ? 'text-red-700' : 'text-gray-900'}`}>{lukot2} <span className="text-[9px] font-normal opacity-70">km/l</span></p>
                 </div>
               </div>

               <div className="relative z-10 flex items-end justify-between border-t border-gray-200 pt-2.5 mt-1">
                 <div>
                   <div className="flex items-center gap-1.5 mb-1">
                     <img src={spbuMap.find(s => s.id === userBensin2.spbu)?.logo.src} className="h-4 object-contain" />
                     <span className="text-xs font-black text-gray-700">RON {ronMap.find(r => r.id === userBensin2.ron)?.val}</span>
                   </div>
                   <p className="text-[9px] text-gray-500 font-bold">Rp {getHargaUserBensin(userBensin2.spbu, userBensin2.ron).toLocaleString('id-ID')}/L</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">30 Hari ({dailyDistance}km/h)</p>
                   <p className={`text-base font-black ${cost2 < cost1 ? 'text-green-600' : cost2 > cost1 ? 'text-red-600' : 'text-gray-900'}`}>Rp {cost2.toLocaleString('id-ID')}</p>
                 </div>
               </div>
            </div>

          </div>

          {/* WATERMARK BAWAH RATA TENGAH */}
          <div className="absolute bottom-6 flex flex-col items-center justify-center w-full gap-2 opacity-90 relative z-20 mt-10">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-gray-500 tracking-wide">Hasil kalkulasi BBM di</span>
              <img src={mainLogo.src} className="h-7" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">exum-bbm.site</span>
          </div>

        </div>
      </div>

    </div>
  );
}