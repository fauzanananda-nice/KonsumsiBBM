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

// Helper: Mesin Pengubah Gambar ke Teks (Base64) buat ngibulin Safari
const getBase64FromUrl = async (url: string) => {
  if (!url) return '';
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Gagal convert base64:", url);
    return "";
  }
};

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
  
  // State khusus buat nampung gambar Base64 sebelum ngefoto
  const [base64Images, setBase64Images] = useState<any>(null);

  const getHargaUserBensin = (spbu_id: number, ron_id: number) => {
    const bensin = katalogHarga.find((b: any) => b.spbu_id === spbu_id && b.ron_id === ron_id);
    return bensin ? bensin.harga : 0; 
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    setIsSharing(true);
    try {
      // 1. Ambil semua link gambar yang butuh di-convert
      const safeMake = selectedCarData.Make ? selectedCarData.Make.toLowerCase().replace(/\s+/g, '-') : '';
      const brandUrl = `/logos/${safeMake}.png`;
      const spbuUrl = spbuMap.find(s => s.id === userBensin.spbu)?.logo.src || '';
      
      // 2. Convert barengan jadi Base64 (Jurus Kawan Ente)
      const b64Brand = await getBase64FromUrl(brandUrl);
      const b64Spbu = await getBase64FromUrl(spbuUrl);
      const b64Main = await getBase64FromUrl(mainLogo.src);

      // 3. Suntik ke State biar div screenshot me-render ulang pake Base64
      setBase64Images({ brand: b64Brand, spbu: b64Spbu, main: b64Main });
      
      // Kasih nafas dikit biar React kelar nge-render state baru
      await new Promise(resolve => setTimeout(resolve, 300));

      const el = captureRef.current;
      
      // 4. THE REAL CAPTURE (Sekarang Safari gabisa ngeblok)
      const blob = await toBlob(el, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#f3f4f6', 
      });

      if (!blob) throw new Error('Gagal bikin gambar');

      const file = new File([blob], 'exum-tracker-single.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Hasil Cek Konsumsi BBM',
          text: `Gila! Estimasi dalkot ${selectedCarData.Make} ${selectedCarData.Type} tembus segini. Cek di EXUM Calculator!`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'exum-tracker-single.png';
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
      
      {/* UI UTAMA (TETAP SAMA, GAK DISENTUH SCREENSHOT) */}
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
            
            {/* BACKGROUND FADING LOGO - Pakai Base64 kalo udah siap */}
            <div className="absolute -right-8 -top-8 opacity-[0.15] w-64 h-64 pointer-events-none">
               {base64Images?.brand ? (
                 <img src={base64Images.brand} className="w-full h-full object-contain" />
               ) : (
                 <BrandLogo make={selectedCarData.Make} />
               )}
            </div>

            {/* HEADER MOBIL */}
            <div className="relative z-10">
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{selectedCarData.Make} {selectedCarData.Year}</p>
               <p className="text-3xl font-black text-gray-900 leading-tight pr-6">{selectedCarData.Type}</p>
               <p className="text-xs font-medium text-gray-500 mt-2">{selectedCarData.Transmission} • {selectedCarData['Engine Displacement']} cc</p>
            </div>
            
            {/* GRID DALKOT & LUKOT */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
               <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Dalam Kota</p>
                  <p className="text-3xl font-black text-gray-900">{selectedCarData['City Fuel Consumption (km/l)']} <span className="text-[10px] font-normal text-gray-500">km/l</span></p>
               </div>
               <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Luar Kota</p>
                  <p className="text-3xl font-black text-gray-900">{selectedCarData['Highway Fuel Consumption (km/l)']} <span className="text-[10px] font-normal text-gray-500">km/l</span></p>
               </div>
            </div>

            {/* BOX BIAYA */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-center relative z-10">
               <p className="text-[10px] font-bold text-green-700 uppercase mb-2 tracking-widest">Estimasi Biaya ({dailyDistance}km/hari)</p>
               
               {/* TAMPILAN BENSIN & HARGA (Base64 SPBU Logo) */}
               <div className="flex items-center justify-center gap-2 mb-1">
                  <img 
                    src={base64Images?.spbu || spbuMap.find(s => s.id === userBensin.spbu)?.logo.src} 
                    crossOrigin={base64Images?.spbu ? undefined : "anonymous"} 
                    className="h-5 object-contain" 
                  />
                  <span className="text-sm font-black text-green-800">RON {ronMap.find(r => r.id === userBensin.ron)?.val}</span>
               </div>
               <p className="text-[10px] font-medium text-green-700 mb-2">Rp {getHargaUserBensin(userBensin.spbu, userBensin.ron).toLocaleString('id-ID')}/L</p>

               <p className="text-4xl font-black text-green-700 mt-2 mb-3">
                 Rp {Math.round((dailyDistance / parseFloat(selectedCarData['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin.spbu, userBensin.ron) * 30).toLocaleString('id-ID')}
               </p>
               <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-widest">Total per 30 Hari</p>
            </div>

          </div>

          {/* WATERMARK BAWAH RATA TENGAH (Base64 Main Logo) */}
          <div className="absolute bottom-6 flex flex-col items-center justify-center w-full gap-2 opacity-90 relative z-20 mt-10">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-gray-500 tracking-wide">Hasil kalkulasi BBM di</span>
              <img 
                src={base64Images?.main || mainLogo.src} 
                crossOrigin={base64Images?.main ? undefined : "anonymous"} 
                className="h-7" 
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">exum-bbm.site</span>
          </div>

        </div>
      </div>

    </div>
  );
}