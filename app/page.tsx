"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Gauge, Fuel, Map, Swords, X, ChevronDown } from "lucide-react";

// Import Logo
import logo from "./logo.png";
import pertaminaLogo from "./pertamina.png";
import shellLogo from "./shell.png";
import bpLogo from "./bp.png";
import vivoLogo from "./vivo.png";

// Interface untuk data Katalog Harga dari Supabase
interface HargaBensin {
  spbu_id: number;
  ron_id: number;
  harga: number;
}

export default function Home() {
  const [rawCars, setRawCars] = useState<any[]>([]);
  
  // State untuk Harga Bensin
  const [katalogHarga, setKatalogHarga] = useState<HargaBensin[]>([]);

  // ==========================================
  // STATE DROPDOWN MOBIL 1
  // ==========================================
  const [makes, setMakes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTrans, setSelectedTrans] = useState("");

  const [searchMake1, setSearchMake1] = useState("");
  const [isMakeOpen1, setIsMakeOpen1] = useState(false);
  const [searchType1, setSearchType1] = useState("");
  const [isTypeOpen1, setIsTypeOpen1] = useState(false);

  // ==========================================
  // STATE DROPDOWN MOBIL 2 (BUAT VS)
  // ==========================================
  const [types2, setTypes2] = useState<string[]>([]);
  const [years2, setYears2] = useState<string[]>([]);
  const [transmissions2, setTransmissions2] = useState<string[]>([]);

  const [selectedMake2, setSelectedMake2] = useState("");
  const [selectedType2, setSelectedType2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");
  const [selectedTrans2, setSelectedTrans2] = useState("");

  const [searchMake2, setSearchMake2] = useState("");
  const [isMakeOpen2, setIsMakeOpen2] = useState(false);
  const [searchType2, setSearchType2] = useState("");
  const [isTypeOpen2, setIsTypeOpen2] = useState(false);

  // ==========================================
  // STATE HASIL & MODE TAMPILAN
  // ==========================================
  const [selectedCarData1, setSelectedCarData1] = useState<any>(null);
  const [selectedCarData2, setSelectedCarData2] = useState<any>(null);
  
  const [viewMode, setViewMode] = useState<"none" | "single" | "compareSetup" | "compareResult">("none");
  const [dailyDistance, setDailyDistance] = useState(30);
  const [dbError, setDbError] = useState("");

  // ==========================================
  // STATE PILIHAN BENSIN USER (SPBU & RON)
  // SPBU ID: 1=Pertamina, 2=Shell, 3=BP, 4=Vivo
  // RON ID: 1=90, 2=92, 3=95, 4=98
  // ==========================================
  const [userBensin1, setUserBensin1] = useState({ spbu: 1, ron: 2 }); 
  const [userBensin2, setUserBensin2] = useState({ spbu: 1, ron: 2 }); 

  // Mapping Helper untuk Label & Logo
  const spbuMap = [
    { id: 1, name: 'Pertamina', logo: pertaminaLogo },
    { id: 2, name: 'Shell', logo: shellLogo },
    { id: 3, name: 'BP', logo: bpLogo },
    { id: 4, name: 'Vivo', logo: vivoLogo },
  ];
  const ronMap = [
    { id: 1, val: 90 },
    { id: 2, val: 92 },
    { id: 3, val: 95 },
    { id: 4, val: 98 },
  ];

  // 1. Tarik Data Utama (Mobil & Harga Bensin)
  useEffect(() => {
    const fetchData = async () => {
      try {
        let allData: any[] = [];
        let from = 0;
        let to = 999;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase.from("data_bensin").select("*").range(from, to);
          if (error) { setDbError(error.message); break; }
          if (data) {
            allData = [...allData, ...data];
            if (data.length < 1000) hasMore = false;
            else { from += 1000; to += 1000; }
          }
        }

        if (allData.length > 0) {
          setRawCars(allData);
          const uniqueMakes = Array.from(new Set(allData.map((car) => car.Make)));
          setMakes(uniqueMakes.sort());
        }

        // Tarik Data Harga Bensin
        const { data: hargaData, error: hargaError } = await supabase.from("katalog_harga").select("*");
        if (hargaError) {
          setDbError("Gagal tarik harga bensin: " + hargaError.message);
        } else if (hargaData) {
          setKatalogHarga(hargaData);
        }

      } catch (err) {
        setDbError(String(err)); 
      }
    };
    fetchData();
  }, []);

  // 2. Logic Filter Mobil 1
  useEffect(() => {
    if (selectedMake) {
      const filteredTypes = rawCars.filter((car) => car.Make === selectedMake);
      setTypes(Array.from(new Set(filteredTypes.map((car) => car.Type))).sort());
      setSelectedType(""); setSearchType1(""); setSelectedYear(""); setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedMake, rawCars]);

  useEffect(() => {
    if (selectedType) {
      const filteredYears = rawCars.filter((car) => car.Make === selectedMake && car.Type === selectedType);
      setYears(Array.from(new Set(filteredYears.map((car) => car.Year))).sort());
      setSelectedYear(""); setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedType, selectedMake, rawCars]);

  useEffect(() => {
    if (selectedYear) {
      const filteredTrans = rawCars.filter((car) => car.Make === selectedMake && car.Type === selectedType && car.Year.toString() === selectedYear.toString());
      setTransmissions(Array.from(new Set(filteredTrans.map((car) => car.Transmission))).sort());
      setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedYear, selectedType, selectedMake, rawCars]);

  // 3. Logic Filter Mobil 2
  useEffect(() => {
    if (selectedMake2) {
      const filteredTypes = rawCars.filter((car) => car.Make === selectedMake2);
      setTypes2(Array.from(new Set(filteredTypes.map((car) => car.Type))).sort());
      setSelectedType2(""); setSearchType2(""); setSelectedYear2(""); setSelectedTrans2("");
    }
  }, [selectedMake2, rawCars]);

  useEffect(() => {
    if (selectedType2) {
      const filteredYears = rawCars.filter((car) => car.Make === selectedMake2 && car.Type === selectedType2);
      setYears2(Array.from(new Set(filteredYears.map((car) => car.Year))).sort());
      setSelectedYear2(""); setSelectedTrans2("");
    }
  }, [selectedType2, selectedMake2, rawCars]);

  useEffect(() => {
    if (selectedYear2) {
      const filteredTrans = rawCars.filter((car) => car.Make === selectedMake2 && car.Type === selectedType2 && car.Year.toString() === selectedYear2.toString());
      setTransmissions2(Array.from(new Set(filteredTrans.map((car) => car.Transmission))).sort());
      setSelectedTrans2("");
    }
  }, [selectedYear2, selectedType2, selectedMake2, rawCars]);


  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const getCarFromData = (mk: string, tp: string, yr: string, tr: string) => {
    return rawCars.find(c => c.Make === mk && c.Type === tp && c.Year.toString() === yr && c.Transmission === tr);
  };

  const getRonIdFromText = (gasType: string) => {
    if (!gasType) return 1; 
    if (gasType.includes("98")) return 4;
    if (gasType.includes("95")) return 3;
    if (gasType.includes("92")) return 2;
    return 1; 
  };

  const handleCekKonsumsi = () => {
    const car = getCarFromData(selectedMake, selectedType, selectedYear, selectedTrans);
    if (car) {
      setSelectedCarData1(car);
      setUserBensin1({ spbu: 1, ron: getRonIdFromText(car['Gas Type']) });
      setViewMode("single");
    }
  };

  const handleKlikVs = () => {
    const car1 = getCarFromData(selectedMake, selectedType, selectedYear, selectedTrans);
    if (car1) {
      setSelectedCarData1(car1);
      setViewMode("compareSetup");
    }
  };

  const handleAduMekanik = () => {
    const car2 = getCarFromData(selectedMake2, selectedType2, selectedYear2, selectedTrans2);
    if (car2 && selectedCarData1) {
      setSelectedCarData2(car2);
      setUserBensin1({ spbu: 1, ron: getRonIdFromText(selectedCarData1['Gas Type']) });
      setUserBensin2({ spbu: 1, ron: getRonIdFromText(car2['Gas Type']) });
      setViewMode("compareResult");
    }
  };

  const getHargaUserBensin = (spbu_id: number, ron_id: number) => {
    const bensin = katalogHarga.find(b => b.spbu_id === spbu_id && b.ron_id === ron_id);
    return bensin ? bensin.harga : 0; 
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900 flex justify-center items-center">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden p-6">
        
        {/* HEADER & LOGO */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-full">
            <Image src={logo} alt="Logo BBM Tracker" className="h-16 w-auto object-contain" priority/>
          </div>
          {dbError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl w-full text-xs font-mono text-center mt-4">
              🚨 Error DB: {dbError}
            </div>
          )}
        </div>
        
        {/* ========================================== */}
        {/* PANEL MOBIL 1 */}
        {/* ========================================== */}
        <div className={`space-y-4 ${viewMode === "compareSetup" || viewMode === "compareResult" ? "opacity-50 pointer-events-none hidden" : ""}`}>
          
          <div className="relative">
            <div className="relative">
              <input type="text" placeholder="Merek Mobil"
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider outline-none focus:ring-2 focus:ring-green-500 pr-10"
                value={searchMake1}
                onChange={(e) => {setSearchMake1(e.target.value); setSelectedMake(""); setIsMakeOpen1(true);}}
                onFocus={() => setIsMakeOpen1(true)} onBlur={() => setTimeout(() => setIsMakeOpen1(false), 200)} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {isMakeOpen1 && makes.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {makes.filter((m) => m.toLowerCase().includes(searchMake1.toLowerCase())).map((m, idx) => (
                    <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer text-sm text-gray-800 transition-colors"
                      onClick={() => { setSelectedMake(m); setSearchMake1(m); setIsMakeOpen1(false); }}>{m}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative">
              <input type="text" placeholder="Model Mobil"
                className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider disabled:opacity-50 disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-green-500 pr-10"
                value={searchType1}
                onChange={(e) => {setSearchType1(e.target.value); setSelectedType(""); setIsTypeOpen1(true);}}
                onFocus={() => setIsTypeOpen1(true)} onBlur={() => setTimeout(() => setIsTypeOpen1(false), 200)} disabled={!selectedMake}/>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {isTypeOpen1 && types.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {types.filter((t) => t.toLowerCase().includes(searchType1.toLowerCase())).map((t, idx) => (
                    <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer text-sm text-gray-800 transition-colors"
                      onClick={() => { setSelectedType(t); setSearchType1(t); setIsTypeOpen1(false); }}>{t}</div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
                value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={!selectedType}>
                <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TAHUN</option>
                {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
                value={selectedTrans} onChange={(e) => setSelectedTrans(e.target.value)} disabled={!selectedYear}>
                <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TRANSMISI</option>
                {transmissions.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Action Buttons */}
          {viewMode === "none" || viewMode === "single" ? (
            <div className="pt-4 flex gap-3">
              <button onClick={handleCekKonsumsi} disabled={!selectedTrans || katalogHarga.length === 0}
                className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:bg-gray-300 flex justify-center items-center gap-2 transition hover:bg-green-700 active:scale-95">
                <Gauge className="w-5 h-5"/> Cek
              </button>
              <button onClick={handleKlikVs} disabled={!selectedTrans || katalogHarga.length === 0}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 transition hover:bg-gray-50 active:scale-95">
                <Swords className="w-5 h-5"/> Bandingkan
              </button>
            </div>
          ) : null}
        </div>

        {/* ========================================== */}
        {/* PANEL MOBIL 2 (MUNCUL PAS KLIK VS) */}
        {/* ========================================== */}
        {(viewMode === "compareSetup" || viewMode === "compareResult") && (
          <div className="relative animate-in fade-in slide-in-from-top-4">
            <button onClick={() => {setViewMode("single"); setSelectedMake2(""); setSelectedType2(""); setSearchType2(""); setSearchMake2(""); setSelectedYear2(""); setSelectedTrans2("");}} 
              className="absolute -top-3 right-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-600 border border-gray-200 shadow-sm z-10">
              <X className="w-4 h-4"/>
            </button>

            <h2 className="text-center font-black text-green-600 uppercase tracking-widest mb-4 flex justify-center items-center gap-2">
              <Swords className="w-5 h-5"/> Pilih Lawan
            </h2>

            {selectedCarData1 && viewMode === "compareSetup" && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-4 text-center shadow-sm">
                <p className="text-[10px] text-green-700 uppercase font-bold tracking-wider mb-1">Mobil 1 (Andalan)</p>
                <p className="text-sm font-black text-gray-900">{selectedCarData1.Make} {selectedCarData1.Type}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{selectedCarData1.Year} • {selectedCarData1.Transmission}</p>
              </div>
            )}

            <div className={`space-y-4 ${viewMode === "compareResult" ? "hidden" : ""}`}>
              <div className="relative">
                <div className="relative">
                  <input type="text" placeholder="Merek Lawan"
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider outline-none focus:ring-2 focus:ring-green-500 pr-10"
                    value={searchMake2}
                    onChange={(e) => {setSearchMake2(e.target.value); setSelectedMake2(""); setIsMakeOpen2(true);}}
                    onFocus={() => setIsMakeOpen2(true)} onBlur={() => setTimeout(() => setIsMakeOpen2(false), 200)} />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {isMakeOpen2 && makes.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {makes.filter((m) => m.toLowerCase().includes(searchMake2.toLowerCase())).map((m, idx) => (
                        <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer text-sm text-gray-800 transition-colors"
                          onClick={() => { setSelectedMake2(m); setSearchMake2(m); setIsMakeOpen2(false); }}>{m}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <input type="text" placeholder="Model Lawan"
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-bold placeholder:text-xs placeholder:uppercase placeholder:tracking-wider disabled:opacity-50 disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-green-500 pr-10"
                    value={searchType2}
                    onChange={(e) => {setSearchType2(e.target.value); setSelectedType2(""); setIsTypeOpen2(true);}}
                    onFocus={() => setIsTypeOpen2(true)} onBlur={() => setTimeout(() => setIsTypeOpen2(false), 200)} disabled={!selectedMake2}/>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {isTypeOpen2 && types2.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {types2.filter((t) => t.toLowerCase().includes(searchType2.toLowerCase())).map((t, idx) => (
                        <div key={idx} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer text-sm text-gray-800 transition-colors"
                          onClick={() => { setSelectedType2(t); setSearchType2(t); setIsTypeOpen2(false); }}>{t}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
                    value={selectedYear2} onChange={(e) => setSelectedYear2(e.target.value)} disabled={!selectedType2}>
                    <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TAHUN</option>
                    {years2.map((y, i) => <option key={i} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:bg-gray-100 outline-none appearance-none focus:ring-2 focus:ring-green-500"
                    value={selectedTrans2} onChange={(e) => setSelectedTrans2(e.target.value)} disabled={!selectedYear2}>
                    <option value="" className="text-gray-400 font-bold text-xs uppercase tracking-wider">TRANSMISI</option>
                    {transmissions2.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {viewMode === "compareSetup" && (
                <button onClick={handleAduMekanik} disabled={!selectedTrans2}
                  className="w-full bg-green-600 text-white font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 disabled:bg-gray-300 transition hover:bg-green-700 active:scale-95 mt-4 shadow-lg shadow-green-600/20 flex justify-center items-center gap-2">
                  <Swords className="w-5 h-5"/> Adu Mekanik!
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* RESULT: SINGLE MODE */}
        {/* ========================================== */}
        {viewMode === "single" && selectedCarData1 && (
          <div className="mt-8 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4">
             
             {/* REVISI: CARD RINGKASAN MOBIL SINGLE MODE */}
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center mb-4">
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{selectedCarData1.Make} {selectedCarData1.Year}</p>
               <p className="text-sm font-black text-gray-900 truncate">{selectedCarData1.Type}</p>
               <p className="text-[11px] font-medium text-gray-500 mt-0.5">{selectedCarData1.Transmission}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Dalam Kota</p>
                <p className="text-3xl font-black text-gray-900">{selectedCarData1['City Fuel Consumption (km/l)']} <span className="text-sm font-normal text-gray-500">km/l</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Luar Kota</p>
                <p className="text-3xl font-black text-gray-900">{selectedCarData1['Highway Fuel Consumption (km/l)']} <span className="text-sm font-normal text-gray-500">km/l</span></p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl mb-6">
              <Fuel className="w-5 h-5" />
              <span className="font-semibold text-sm">Min. BBM: <span className="font-black">{selectedCarData1['Gas Type']}</span></span>
            </div>

            {/* KALKULATOR SINGLE MODE */}
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

              {/* DYNAMIC RADIO BENSIN - HORIZONTAL */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pilih SPBU & RON</p>
                
                {/* Baris SPBU */}
                <div className="flex gap-2 mb-2">
                  {spbuMap.map((spbu) => (
                    <button key={`spbu-${spbu.id}`}
                      onClick={() => setUserBensin1({ ...userBensin1, spbu: spbu.id })}
                      className={`flex-1 flex justify-center items-center p-2 rounded-lg border transition ${userBensin1.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Image src={spbu.logo} alt={spbu.name} className="h-6 w-auto object-contain" />
                    </button>
                  ))}
                </div>
                
                {/* Baris RON */}
                <div className="flex gap-2">
                  {ronMap.map((ron) => {
                    const harga = getHargaUserBensin(userBensin1.spbu, ron.id);
                    const isAvailable = harga > 0;
                    return (
                      <button key={`ron-${ron.id}`} disabled={!isAvailable}
                        onClick={() => setUserBensin1({ ...userBensin1, ron: ron.id })}
                        className={`flex-1 p-2 rounded-lg border text-sm font-black transition ${!isAvailable ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : userBensin1.ron === ron.id ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                        {ron.val}
                      </button>
                    )
                  })}
                </div>
                {/* Indikator Harga Terpilih */}
                <div className="text-right mt-1">
                  <span className="text-[10px] text-gray-400 font-medium">Harga: </span>
                  <span className="text-xs font-bold text-gray-700">Rp {getHargaUserBensin(userBensin1.spbu, userBensin1.ron).toLocaleString('id-ID')}/L</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200/60">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Estimasi Dalkot (30 Hari)</p>
                <p className="text-3xl font-black text-green-700">
                  Rp {Math.round((dailyDistance / parseFloat(selectedCarData1['City Fuel Consumption (km/l)'])) * getHargaUserBensin(userBensin1.spbu, userBensin1.ron) * 30).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* RESULT: COMPARE MODE (SIDE-BY-SIDE) */}
        {/* ========================================== */}
        {viewMode === "compareResult" && selectedCarData1 && selectedCarData2 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-center">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase font-bold">{selectedCarData1.Make} {selectedCarData1.Year}</p>
                <p className="text-sm font-black text-gray-900 truncate">{selectedCarData1.Type}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase font-bold">{selectedCarData2.Make} {selectedCarData2.Year}</p>
                <p className="text-sm font-black text-gray-900 truncate">{selectedCarData2.Type}</p>
              </div>
            </div>

            {/* ADU DALAM KOTA */}
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

            {/* ADU LUAR KOTA */}
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

            {/* REKOMENDASI BBM COMPARE MODE */}
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

            {/* KALKULATOR COMPARE MODE (DUEL RUPIAH) */}
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

              {/* DYNAMIC RADIO BENSIN - 2 KOLOM (COMPARE) */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                
                {/* Radio Mobil 1 */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">BBM M1</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Kolom SPBU */}
                    <div className="flex flex-col gap-1">
                      {spbuMap.map((spbu) => (
                        <button key={`vs1-spbu-${spbu.id}`}
                          onClick={() => setUserBensin1({ ...userBensin1, spbu: spbu.id })}
                          className={`flex justify-center items-center h-8 rounded border transition ${userBensin1.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                          <Image src={spbu.logo} alt={spbu.name} className="h-4 w-auto object-contain" />
                        </button>
                      ))}
                    </div>
                    {/* Kolom RON */}
                    <div className="flex flex-col gap-1">
                      {ronMap.map((ron) => {
                        const isAvailable = getHargaUserBensin(userBensin1.spbu, ron.id) > 0;
                        return (
                          <button key={`vs1-ron-${ron.id}`} disabled={!isAvailable}
                            onClick={() => setUserBensin1({ ...userBensin1, ron: ron.id })}
                            className={`h-8 rounded border text-xs font-black transition ${!isAvailable ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : userBensin1.ron === ron.id ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                            {ron.val}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-gray-400 text-center">Rp {getHargaUserBensin(userBensin1.spbu, userBensin1.ron).toLocaleString('id-ID')}/L</p>
                </div>

                {/* Radio Mobil 2 */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">BBM M2</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Kolom SPBU */}
                    <div className="flex flex-col gap-1">
                      {spbuMap.map((spbu) => (
                        <button key={`vs2-spbu-${spbu.id}`}
                          onClick={() => setUserBensin2({ ...userBensin2, spbu: spbu.id })}
                          className={`flex justify-center items-center h-8 rounded border transition ${userBensin2.spbu === spbu.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                          <Image src={spbu.logo} alt={spbu.name} className="h-4 w-auto object-contain" />
                        </button>
                      ))}
                    </div>
                    {/* Kolom RON */}
                    <div className="flex flex-col gap-1">
                      {ronMap.map((ron) => {
                        const isAvailable = getHargaUserBensin(userBensin2.spbu, ron.id) > 0;
                        return (
                          <button key={`vs2-ron-${ron.id}`} disabled={!isAvailable}
                            onClick={() => setUserBensin2({ ...userBensin2, ron: ron.id })}
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

              {/* HASIL ADU RUPIAH */}
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

          </div>
        )}

      </div>
    </main>
  );
}