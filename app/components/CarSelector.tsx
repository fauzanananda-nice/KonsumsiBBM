import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Car, X, Fuel } from "lucide-react";
import comingSoonImg from "../../public/comingsoon.png"; 

// Komponen helper buat nampilin logo secara dinamis & aman dari error
const BrandLogo = ({ make }: { make: string }) => {
  const [hasError, setHasError] = useState(false);
  const safeMake = make ? make.toLowerCase().replace(/\s+/g, '-') : '';

  if (hasError || !safeMake) {
    return <Car className="w-5 h-5 text-gray-400" />;
  }

  return (
    <img
      src={`/logos/${safeMake}.png`}
      alt={make}
      className="w-6 h-6 object-contain"
      onError={() => setHasError(true)} 
    />
  );
};

export default function CarSelector({
  makes, types, years, transmissions,
  selectedMake, setSelectedMake,
  selectedType, setSelectedType,
  selectedYear, setSelectedYear,
  selectedTrans, setSelectedTrans,
  placeholderMake = "Merek Mobil",
  placeholderType = "Model Mobil"
}: any) {
  const [searchMake, setSearchMake] = useState("");
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [searchType, setSearchType] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  
  // State Engine buat masing-masing CarSelector
  const [engineType, setEngineType] = useState<"BENSIN" | "DIESEL">("BENSIN");

  // Sync internal state kalo ada reset dari tombol X di luar
  useEffect(() => { setSearchMake(selectedMake); }, [selectedMake]);
  useEffect(() => { setSearchType(selectedType); }, [selectedType]);

  const clearMake = () => {
    setSelectedMake("");
    setSearchMake("");
    setSelectedType("");
    setSearchType("");
    setSelectedYear("");
    setSelectedTrans("");
  };

  const clearType = () => {
    setSelectedType("");
    setSearchType("");
    setSelectedYear("");
    setSelectedTrans("");
  };

  // Fungsi ganti tipe mesin, otomatis nge-clear form
  const handleEngineChange = (type: "BENSIN" | "DIESEL") => {
    setEngineType(type);
    clearMake();
  };

  return (
    <div className="space-y-4">
      
      {/* RADIO BUTTON BENSIN VS DIESEL */}
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => handleEngineChange("BENSIN")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition ${
            engineType === "BENSIN" 
              ? "bg-green-500 text-white border-green-500 shadow-sm" 
              : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Bensin
        </button>
        <button 
          onClick={() => handleEngineChange("DIESEL")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition ${
            engineType === "DIESEL" 
              ? "bg-gray-800 text-white border-gray-800 shadow-sm" 
              : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Diesel
        </button>
      </div>

      {/* KONDISI: KALO DIESEL, MUNCULIN GAMBAR COMING SOON */}
      {engineType === "DIESEL" ? (
        <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center justify-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Image src={comingSoonImg} alt="Diesel Coming Soon" className="w-32 h-auto object-contain mb-4 drop-shadow-sm opacity-80" priority/>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Dataset Diesel</p>
          <p className="text-[10px] font-medium text-gray-400 text-center mt-1">Sabar yak, lagi dikerjain secepatnya.</p>
        </div>
      ) : (

      /* KONDISI: KALO BENSIN, MUNCULIN FORM NORMAL */
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Autocomplete Merek */}
        <div className="relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 pointer-events-none">
              <BrandLogo make={selectedMake} />
            </div>
            
            <input 
              type="text" placeholder={placeholderMake}
              className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-10 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider outline-none focus:ring-2 focus:ring-green-500"
              value={searchMake}
              onChange={(e) => {
                setSearchMake(e.target.value);
                setSelectedMake(""); 
                setIsMakeOpen(true);
              }}
              onFocus={() => setIsMakeOpen(true)}
              onBlur={() => setTimeout(() => setIsMakeOpen(false), 200)} 
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
               {searchMake && (
                 <button onClick={clearMake} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition">
                   <X className="w-4 h-4" />
                 </button>
               )}
               <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {isMakeOpen && makes.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {makes.filter((m: string) => m.toLowerCase().includes(searchMake.toLowerCase())).map((m: string, idx: number) => (
                <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors flex items-center gap-3"
                  onClick={() => { setSelectedMake(m); setIsMakeOpen(false); }}>
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1">
                    <BrandLogo make={m} />
                  </div>
                  <span className="text-sm font-bold text-gray-800">{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Autocomplete Model */}
        <div className="relative">
          <div className="relative">
            <input 
              type="text" placeholder={placeholderType}
              className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider disabled:opacity-50 disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-green-500 pr-10"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSelectedType(""); 
                setIsTypeOpen(true);
              }}
              onFocus={() => setIsTypeOpen(true)}
              onBlur={() => setTimeout(() => setIsTypeOpen(false), 200)} 
              disabled={!selectedMake}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
               {searchType && (
                 <button onClick={clearType} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition">
                   <X className="w-4 h-4" />
                 </button>
               )}
               <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {isTypeOpen && types.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {types.filter((t: string) => t.toLowerCase().includes(searchType.toLowerCase())).map((t: string, idx: number) => (
                <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer text-sm text-gray-800 transition-colors"
                  onClick={() => { setSelectedType(t); setIsTypeOpen(false); }}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tahun & Transmisi */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <select 
              className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
              value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={!selectedType}>
              <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TAHUN</option>
              {years.map((y: string, i: number) => <option key={i} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
              value={selectedTrans} onChange={(e) => setSelectedTrans(e.target.value)} disabled={!selectedYear}>
              <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TRANSMISI</option>
              {transmissions.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}