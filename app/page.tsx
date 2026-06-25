"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

const THEMES = [
  { id: "gamedev", name: "Indie Gamedev", currency: "Redstone", rate: 4, colorClass: "text-red-500", borderClass: "border-red-500/30" },
  { id: "no_internet", name: "No Internet", currency: "Glowstone", rate: 4.5, colorClass: "text-amber-500", borderClass: "border-amber-500/30" },
  { id: "endless", name: "Endless", currency: "Aqua Regia", rate: 5, colorClass: "text-blue-500", borderClass: "border-blue-500/30" }
];

interface Project {
  id: number;
  name: string;
  themeId: string;
  hours: number;
}

interface Totals {
  [key: string]: number;
  potionMix: number;
}

const IconSlot = ({ type }: { type: string }) => {
  const getIconPath = () => {
    switch (type) {
      case "RED": return "/icons/redstone.png";
      case "GLW": return "/icons/glowstone.png";
      case "AQA": return "/icons/aqua-regia.png";
      case "MIX": return "/icons/potion-mix.png";
      default: return "";
    }
  };

  return (
    <div 
      className="w-10 h-10 rounded bg-[#0a0000] border border-red-950/50 flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative"
      title={`${type} Icon`}
    >
      <Image 
        src={getIconPath()} 
        alt={`${type} icon`} 
        fill 
        sizes="40px"
        className="object-contain p-1.5 drop-shadow-md" 
      />
    </div>
  );
};

export default function AlchemizeCalculator() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [themeId, setThemeId] = useState("gamedev");
  const [hours, setHours] = useState("");

  const handleAddProject = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hours || isNaN(Number(hours))) return;

    setProjects([...projects, {
      id: Date.now(),
      name: name.trim(),
      themeId,
      hours: parseInt(hours, 10)
    }]);

    setName("");
    setHours("");
  };

  const getTheme = (id: string) => THEMES.find(t => t.id === id)!;

  const totals = projects.reduce(
    (acc: Totals, proj) => {
      const theme = getTheme(proj.themeId);
      acc[proj.themeId] += proj.hours;
      acc.potionMix += proj.hours * theme.rate;
      return acc;
    },
    { gamedev: 0, no_internet: 0, endless: 0, potionMix: 0 }
  );

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-10">
      
      <header className="border-b border-red-950 pb-6">
        <p className="text-red-900 text-xs font-bold tracking-[0.2em] mb-3 uppercase">■ Season 1</p>
        <h1 className="text-4xl md:text-6xl font-black text-[#b3002d] tracking-tighter uppercase">Alchemize Calculator</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b3002d] to-transparent opacity-50"></div>
            
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-8 uppercase">Log Project</h2>
            
            <form onSubmit={handleAddProject} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Theme</label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  className="bg-[#050000] border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] appearance-none font-mono text-sm cursor-pointer"
                >
                  {THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Hours Spent (Integer)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                className="mt-6 border border-[#b3002d]/50 bg-[#b3002d]/10 text-[#b3002d] p-3 hover:bg-[#b3002d] hover:text-white transition-all uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-2 group"
              >
                <span>Compile</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col gap-8">
          
          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)]">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase">Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-red-950/40 p-5 flex flex-col gap-3 bg-black/40 hover:bg-black/60 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase">Redstone</p>
                  <IconSlot type="RED" />
                </div>
                <p className="text-3xl font-black text-gray-200">{totals.gamedev}</p>
              </div>

              <div className="border border-red-950/40 p-5 flex flex-col gap-3 bg-black/40 hover:bg-black/60 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase">Glowstone</p>
                  <IconSlot type="GLW" />
                </div>
                <p className="text-3xl font-black text-gray-200">{totals.no_internet}</p>
              </div>

              <div className="border border-red-950/40 p-5 flex flex-col gap-3 bg-black/40 hover:bg-black/60 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase">Aqua Regia</p>
                  <IconSlot type="AQA" />
                </div>
                <p className="text-3xl font-black text-gray-200">{totals.endless}</p>
              </div>

              <div className="border border-[#b3002d]/30 p-5 flex flex-col gap-3 bg-[#b3002d]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#b3002d] opacity-5 blur-2xl rounded-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[10px] text-[#b3002d] tracking-widest uppercase font-bold">Potion Mix</p>
                  <IconSlot type="MIX" />
                </div>
                <p className="text-3xl font-black text-[#b3002d] relative z-10">{totals.potionMix}</p>
              </div>
            </div>
          </div>

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)] min-h-[350px] flex flex-col">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase flex items-center justify-between">
              <span>Recent Mixes</span>
              <span className="text-[10px] text-red-900/50">{projects.length} LOGGED</span>
            </h2>
            
            {projects.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-red-950/30">
                <p className="text-[10px] text-red-900/40 tracking-[0.2em] uppercase">No projects synthesized yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((proj) => {
                  const theme = getTheme(proj.themeId);
                  return (
                    <div key={proj.id} className={`border-l-2 ${theme.borderClass} bg-black/40 p-4 flex items-center justify-between hover:bg-black/80 transition-colors`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-200 font-bold text-sm tracking-wide">{proj.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.colorClass.replace('text-', 'bg-')}`}></span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{theme.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right flex flex-col gap-1 hidden md:flex">
                          <span className="text-gray-500 text-[10px] uppercase tracking-widest">Base</span>
                          <span className="text-gray-300 text-xs font-mono">{proj.hours} {theme.currency}</span>
                        </div>
                        
                        <div className="h-8 w-px bg-red-950/50 hidden md:block"></div>
                        
                        <div className="text-right flex flex-col gap-1">
                          <span className="text-red-900 text-[10px] uppercase tracking-widest">Yield</span>
                          <span className="text-[#b3002d] text-sm font-bold font-mono">+{proj.hours * theme.rate} MIX</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
