"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Gauge, Swords, X } from "lucide-react";

// Import Logo & Komponen
import logo from "./logo.png";
import CarSelector from "./components/CarSelector";
import SingleResult from "./components/SingleResult";
import CompareResult from "./components/CompareResult";
import AboutModal from "./components/AboutModal"; // Import modal baru

export default function Home() {
  const [rawCars, setRawCars] = useState<any[]>([]);
  const [katalogHarga, setKatalogHarga] = useState<any[]>([]);

  // State Mobil 1
  const [makes, setMakes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTrans, setSelectedTrans] = useState("");

  // State Mobil 2
  const [types2, setTypes2] = useState<string[]>([]);
  const [years2, setYears2] = useState<string[]>([]);
  const [transmissions2, setTransmissions2] = useState<string[]>([]);

  const [selectedMake2, setSelectedMake2] = useState("");
  const [selectedType2, setSelectedType2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");
  const [selectedTrans2, setSelectedTrans2] = useState("");

  // State Hasil & Modal
  const [selectedCarData1, setSelectedCarData1] = useState<any>(null);
  const [selectedCarData2, setSelectedCarData2] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"none" | "single" | "compareSetup" | "compareResult">("none");
  const [dailyDistance, setDailyDistance] = useState(30);
  const [dbError, setDbError] = useState("");
  
  const [userBensin1, setUserBensin1] = useState({ spbu: 1, ron: 2 }); 
  const [userBensin2, setUserBensin2] = useState({ spbu: 1, ron: 2 }); 

  // State Buka/Tutup Modal About
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Tarik DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        let allData: any[] = [];
        let from = 0, to = 999, hasMore = true;
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
          setMakes(Array.from(new Set(allData.map((car) => car.Make))).sort());
        }
        const { data: hargaData } = await supabase.from("katalog_harga").select("*");
        if (hargaData) setKatalogHarga(hargaData);
      } catch (err) { setDbError(String(err)); }
    };
    fetchData();
  }, []);

  // Filter Logic 1
  useEffect(() => {
    if (selectedMake) {
      setTypes(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake).map(c => c.Type))).sort());
      setSelectedType(""); setSelectedYear(""); setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedMake, rawCars]);
  useEffect(() => {
    if (selectedType) {
      setYears(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake && c.Type === selectedType).map(c => c.Year))).sort());
      setSelectedYear(""); setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedType, selectedMake, rawCars]);
  useEffect(() => {
    if (selectedYear) {
      setTransmissions(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake && c.Type === selectedType && c.Year.toString() === selectedYear.toString()).map(c => c.Transmission))).sort());
      setSelectedTrans(""); setViewMode("none");
    }
  }, [selectedYear, selectedType, selectedMake, rawCars]);

  // Filter Logic 2
  useEffect(() => {
    if (selectedMake2) {
      setTypes2(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake2).map(c => c.Type))).sort());
      setSelectedType2(""); setSelectedYear2(""); setSelectedTrans2("");
    }
  }, [selectedMake2, rawCars]);
  useEffect(() => {
    if (selectedType2) {
      setYears2(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake2 && c.Type === selectedType2).map(c => c.Year))).sort());
      setSelectedYear2(""); setSelectedTrans2("");
    }
  }, [selectedType2, selectedMake2, rawCars]);
  useEffect(() => {
    if (selectedYear2) {
      setTransmissions2(Array.from(new Set(rawCars.filter(c => c.Make === selectedMake2 && c.Type === selectedType2 && c.Year.toString() === selectedYear2.toString()).map(c => c.Transmission))).sort());
      setSelectedTrans2("");
    }
  }, [selectedYear2, selectedType2, selectedMake2, rawCars]);

  // Actions
  const getCar = (mk: string, tp: string, yr: string, tr: string) => rawCars.find(c => c.Make === mk && c.Type === tp && c.Year.toString() === yr && c.Transmission === tr);
  const getRonId = (gas: string) => { if (!gas) return 1; if (gas.includes("98")) return 4; if (gas.includes("95")) return 3; if (gas.includes("92")) return 2; return 1; };

  const handleCek = () => {
    const car = getCar(selectedMake, selectedType, selectedYear, selectedTrans);
    if (car) { setSelectedCarData1(car); setUserBensin1({ spbu: 1, ron: getRonId(car['Gas Type']) }); setViewMode("single"); }
  };
  const handleVsSetup = () => {
    const car1 = getCar(selectedMake, selectedType, selectedYear, selectedTrans);
    if (car1) { setSelectedCarData1(car1); setViewMode("compareSetup"); }
  };
  const handleAdu = () => {
    const car2 = getCar(selectedMake2, selectedType2, selectedYear2, selectedTrans2);
    if (car2 && selectedCarData1) {
      setSelectedCarData2(car2);
      setUserBensin1({ spbu: 1, ron: getRonId(selectedCarData1['Gas Type']) });
      setUserBensin2({ spbu: 1, ron: getRonId(car2['Gas Type']) });
      setViewMode("compareResult");
    }
  };

  return (
    // Tambah flex-col biar teks footer ada di bawah box utama
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-6 relative">
        
        {/* HEADER */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src={logo} alt="Logo" className="h-16 w-auto object-contain" priority/>
          {dbError && <div className="bg-red-50 text-red-600 p-3 rounded-xl w-full text-xs font-mono text-center mt-4">🚨 Error DB: {dbError}</div>}
        </div>
        
        {/* MOBIL 1 */}
        <div className={`space-y-4 ${viewMode === "compareSetup" || viewMode === "compareResult" ? "opacity-50 pointer-events-none hidden" : ""}`}>
          <CarSelector makes={makes} types={types} years={years} transmissions={transmissions} selectedMake={selectedMake} setSelectedMake={setSelectedMake} selectedType={selectedType} setSelectedType={setSelectedType} selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedTrans={selectedTrans} setSelectedTrans={setSelectedTrans} placeholderMake="Merek Mobil" placeholderType="Model Mobil"/>
          {viewMode === "none" || viewMode === "single" ? (
            <div className="pt-4 flex gap-3">
              <button onClick={handleCek} disabled={!selectedTrans || katalogHarga.length === 0} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 transition active:scale-95"><Gauge className="w-5 h-5"/> Cek</button>
              <button onClick={handleVsSetup} disabled={!selectedTrans || katalogHarga.length === 0} className="flex-1 bg-white border text-gray-700 font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 transition active:scale-95"><Swords className="w-5 h-5"/> Vs</button>
            </div>
          ) : null}
        </div>

        {/* MOBIL 2 */}
        {(viewMode === "compareSetup" || viewMode === "compareResult") && (
          <div className="relative animate-in fade-in slide-in-from-top-4">
            <button onClick={() => {setViewMode("single"); setSelectedMake2(""); setSelectedType2(""); setSelectedYear2(""); setSelectedTrans2("");}} className="absolute -top-3 right-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-600 border border-gray-200 shadow-sm z-10"><X className="w-4 h-4"/></button>
            <h2 className="text-center font-black text-green-600 uppercase tracking-widest mb-4 flex justify-center items-center gap-2"><Swords className="w-5 h-5"/> Pilih Lawan</h2>
            
            {selectedCarData1 && viewMode === "compareSetup" && (
              <div className="bg-green-50 border-green-200 p-3 rounded-xl mb-4 text-center shadow-sm">
                <p className="text-[10px] text-green-700 uppercase font-bold tracking-wider mb-1">Mobil 1 (Andalan)</p>
                <p className="text-sm font-black text-gray-900">{selectedCarData1.Make} {selectedCarData1.Type}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{selectedCarData1.Year} • {selectedCarData1.Transmission}</p>
              </div>
            )}

            <div className={`space-y-4 ${viewMode === "compareResult" ? "hidden" : ""}`}>
              <CarSelector makes={makes} types={types2} years={years2} transmissions={transmissions2} selectedMake={selectedMake2} setSelectedMake={setSelectedMake2} selectedType={selectedType2} setSelectedType={setSelectedType2} selectedYear={selectedYear2} setSelectedYear={setSelectedYear2} selectedTrans={selectedTrans2} setSelectedTrans={setSelectedTrans2} placeholderMake="Merek Lawan" placeholderType="Model Lawan"/>
              {viewMode === "compareSetup" && (
                <button onClick={handleAdu} disabled={!selectedTrans2} className="w-full bg-green-600 text-white font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 transition active:scale-95 mt-4 shadow-lg shadow-green-600/20 flex justify-center items-center gap-2"><Swords className="w-5 h-5"/> Adu Mekanik!</button>
              )}
            </div>
          </div>
        )}

        {viewMode === "single" && selectedCarData1 && (
           <SingleResult selectedCarData={selectedCarData1} dailyDistance={dailyDistance} setDailyDistance={setDailyDistance} userBensin={userBensin1} setUserBensin={setUserBensin1} katalogHarga={katalogHarga} />
        )}

        {viewMode === "compareResult" && selectedCarData1 && selectedCarData2 && (
           <CompareResult selectedCarData1={selectedCarData1} selectedCarData2={selectedCarData2} dailyDistance={dailyDistance} setDailyDistance={setDailyDistance} userBensin1={userBensin1} setUserBensin1={setUserBensin1} userBensin2={userBensin2} setUserBensin2={setUserBensin2} katalogHarga={katalogHarga} />
        )}
      </div>

      {/* FOOTER LINK ABOUT */}
      <button 
        onClick={() => setIsAboutOpen(true)} 
        className="mt-6 text-xs text-gray-400 hover:text-gray-600 transition font-medium tracking-wide"
      >
        © 2026 BBM Tracker • Tentang & Disclaimer
      </button>

      {/* RENDER MODAL TENTANG & DISCLAIMER */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </main>
  );
}