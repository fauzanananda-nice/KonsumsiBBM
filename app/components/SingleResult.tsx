import Image from "next/image";
import { Fuel, Map } from "lucide-react";
import pertaminaLogo from "../pertamina.png";
import shellLogo from "../shell.png";
import bpLogo from "../bp.png";
import vivoLogo from "../vivo.png";

const spbuMap = [
  { id: 1, name: 'Pertamina', logo: pertaminaLogo },
  { id: 2, name: 'Shell', logo: shellLogo },
  { id: 3, name: 'BP', logo: bpLogo },
  { id: 4, name: 'Vivo', logo: vivoLogo },
];
const ronMap = [{ id: 1, val: 90 }, { id: 2, val: 92 }, { id: 3, val: 95 }, { id: 4, val: 98 }];

export default function SingleResult({
  selectedCarData, dailyDistance, setDailyDistance,
  userBensin, setUserBensin, katalogHarga
}: any) {
  const getHargaUserBensin = (spbu_id: number, ron_id: number) => {
    const bensin = katalogHarga.find((b: any) => b.spbu_id === spbu_id && b.ron_id === ron_id);
    return bensin ? bensin.harga : 0; 
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center mb-4">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData.Make} {selectedCarData.Year}</p>
        <p className="text-sm font-black text-gray-900 truncate">{selectedCarData.Type}</p>
        <p className="text-[11px] font-medium text-gray-500 mt-0.5">{selectedCarData.Transmission}</p>
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
  );
}