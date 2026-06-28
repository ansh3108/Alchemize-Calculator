"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
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

interface Goal {
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
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
  const [isLoaded, setIsLoaded] = useState(false);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalAmount, setGoalAmount] = useState("");
  const [goalCurrency, setGoalCurrency] = useState("potionMix");
  const [goalStartDate, setGoalStartDate] = useState("");
  const [goalEndDate, setGoalEndDate] = useState("");

  const [grantTarget, setGrantTarget] = useState("");
  const [grantValue, setGrantValue] = useState("");
  const [grantPrice, setGrantPrice] = useState("");
  const [grantCurrency, setGrantCurrency] = useState("potionMix");

  const [optimizerTarget, setOptimizerTarget] = useState("");

  useEffect(() => {
    const savedProjects = localStorage.getItem("alchemize_projects");
    const savedGoal = localStorage.getItem("alchemize_goal");
    const savedGrant = localStorage.getItem("alchemize_grant");
    
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {}
    }
    
    if (savedGoal) {
      try {
        const parsedGoal = JSON.parse(savedGoal);
        setGoal(parsedGoal);
        setGoalAmount(parsedGoal.amount.toString());
        setGoalCurrency(parsedGoal.currency);
        setGoalStartDate(parsedGoal.startDate);
        setGoalEndDate(parsedGoal.endDate);
      } catch (e) {}
    }

    if (savedGrant) {
      try {
        const parsedGrant = JSON.parse(savedGrant);
        setGrantTarget(parsedGrant.grantTarget || "");
        setGrantValue(parsedGrant.grantValue || "");
        setGrantPrice(parsedGrant.grantPrice || "");
        setGrantCurrency(parsedGrant.grantCurrency || "potionMix");
      } catch (e) {}
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("alchemize_projects", JSON.stringify(projects));
      localStorage.setItem("alchemize_grant", JSON.stringify({ grantTarget, grantValue, grantPrice, grantCurrency }));
      
      if (goal) {
        localStorage.setItem("alchemize_goal", JSON.stringify(goal));
      } else {
        localStorage.removeItem("alchemize_goal");
      }
    }
  }, [projects, goal, grantTarget, grantValue, grantPrice, grantCurrency, isLoaded]);

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

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter(proj => proj.id !== id));
  };

  const handleSetGoal = (e: FormEvent) => {
    e.preventDefault();
    const amt = parseInt(goalAmount, 10);
    if (!amt || isNaN(amt) || !goalStartDate || !goalEndDate) return;
    
    setGoal({
      amount: amt,
      currency: goalCurrency,
      startDate: goalStartDate,
      endDate: goalEndDate
    });
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

  let expectedPct = 0;
  let actualPct = 0;
  
  if (goal) {
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.endDate).getTime();
    const now = new Date().getTime();
    
    const totalTime = end - start;
    const elapsedTime = now - start;
    
    if (totalTime > 0) {
      expectedPct = (elapsedTime / totalTime) * 100;
    } else if (totalTime === 0) {
      expectedPct = 100; 
    }
    
    expectedPct = Math.max(0, Math.min(100, expectedPct));
    
    const currentAmount = totals[goal.currency as keyof Totals];
    if (goal.amount > 0) {
      actualPct = (currentAmount / goal.amount) * 100;
    }
    
    actualPct = Math.max(0, Math.min(100, actualPct));
  }

  const getCurrencyColor = (curr: string) => {
    switch(curr) {
      case 'gamedev': return 'bg-red-500';
      case 'no_internet': return 'bg-amber-500';
      case 'endless': return 'bg-blue-500';
      case 'potionMix': return 'bg-[#b3002d]';
      default: return 'bg-gray-500';
    }
  };

  const getCurrencyName = (curr: string) => {
    switch(curr) {
      case 'gamedev': return 'Redstone';
      case 'no_internet': return 'Glowstone';
      case 'endless': return 'Aqua Regia';
      case 'potionMix': return 'Potion Mix';
      default: return '';
    }
  };

  const targetNum = parseFloat(grantTarget);
  const valueNum = parseFloat(grantValue);
  const priceNum = parseFloat(grantPrice);
  
  let grantItemsNeeded = 0;
  let totalGrantCurrencyNeeded = 0;
  
  if (!isNaN(targetNum) && !isNaN(valueNum) && valueNum > 0) {
    grantItemsNeeded = Math.ceil(targetNum / valueNum);
    if (!isNaN(priceNum)) {
      totalGrantCurrencyNeeded = grantItemsNeeded * priceNum;
    }
  }

  const optimizedMixes = useMemo(() => {
    const t = parseFloat(optimizerTarget);
    if (isNaN(t) || t <= 0) return null;

    const calculateYield = (r: number, g: number, a: number) => {
      let remaining_a = a;
      let remaining_g = g;

      let r_to_a = Math.min(r, remaining_a);
      let r_after_a = r - r_to_a;
      remaining_a -= r_to_a;

      let g_to_a = Math.min(g, remaining_a);
      let g_after_a = g - g_to_a;
      remaining_a -= g_to_a;

      let r_to_g = Math.min(r_after_a, remaining_g);
      let r_final = r_after_a - r_to_g;

      return (r_to_a * 5) + (r_to_g * 4.5) + (r_final * 4) +
             (g_to_a * 5) + (g_after_a * 4.5) +
             (a * 5);
    };

    const minHours = Math.ceil(t / 5);
    
    let balanced = null;
    for (let a = 0; a <= minHours; a++) {
      let remainder = minHours - a;
      let r = Math.floor(remainder / 2);
      let g = remainder - r;
      
      let yield1 = calculateYield(r, g, a);
      if (yield1 >= t) {
        balanced = { r, g, a, yield: yield1 };
        break;
      }
      
      let yield2 = calculateYield(g, r, a);
      if (yield2 >= t) {
        balanced = { r: g, g: r, a, yield: yield2 };
        break;
      }
    }

    const minHoursNoA = Math.ceil(t / 4.5);
    let noA = null;
    for (let g = 0; g <= minHoursNoA; g++) {
      let r = minHoursNoA - g;
      let y = calculateYield(r, g, 0);
      if (y >= t) {
        noA = { r, g, a: 0, yield: y, minHours: minHoursNoA };
        break;
      }
    }

    return {
      minHours,
      pureA: { r: 0, g: 0, a: minHours, yield: minHours * 5 },
      balanced,
      noA
    };
  }, [optimizerTarget]);

  if (!isLoaded) {
    return <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-10 bg-[#050000]"></main>;
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-10">
      
      <header className="border-b border-red-950 pb-6">
        <h1 className="text-4xl md:text-6xl font-black text-[#b3002d] tracking-tighter uppercase mt-2">Alchemize Calculator</h1>
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
                <span>Calculate</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b3002d] to-transparent opacity-50"></div>
            
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-8 uppercase">Set Target Goal</h2>
            
            <form onSubmit={handleSetGoal} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Target Amount</label>
                <input
                  type="number"
                  min="1"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Target Currency</label>
                <select
                  value={goalCurrency}
                  onChange={(e) => setGoalCurrency(e.target.value)}
                  className="bg-[#050000] border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] appearance-none font-mono text-sm cursor-pointer"
                >
                  <option value="potionMix">Potion Mix</option>
                  <option value="gamedev">Redstone (Indie Gamedev)</option>
                  <option value="no_internet">Glowstone (No Internet)</option>
                  <option value="endless">Aqua Regia (Endless)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Start Date</label>
                <input
                  type="date"
                  value={goalStartDate}
                  onChange={(e) => setGoalStartDate(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-400 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm uppercase"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">End Date</label>
                <input
                  type="date"
                  value={goalEndDate}
                  onChange={(e) => setGoalEndDate(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-400 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm uppercase"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <button
                type="submit"
                className="mt-6 border border-[#b3002d]/50 bg-[#b3002d]/10 text-[#b3002d] p-3 hover:bg-[#b3002d] hover:text-white transition-all uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-2 group"
              >
                <span>Calculate</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>
        </div>


        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {goal && (
            <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)]">
              <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase flex items-center justify-between">
                <span>Your Progress</span>
                <button 
                  onClick={() => setGoal(null)} 
                  className="text-xs text-red-700/80 hover:text-red-500 transition-colors"
                >
                  CLEAR GOAL ✕
                </button>
              </h2>
              
              <div className="w-full h-8 flex overflow-hidden border border-red-950">
                {actualPct >= expectedPct ? (
                  <>
                    <div style={{ width: `${expectedPct}%` }} className="bg-[#8c3a1c] border-r border-black/50" />
                    <div style={{ width: `${actualPct - expectedPct}%` }} className={getCurrencyColor(goal.currency)} />
                    <div style={{ width: `${100 - actualPct}%` }} className="bg-[#111]" />
                  </>
                ) : (
                  <>
                    <div style={{ width: `${actualPct}%` }} className={getCurrencyColor(goal.currency)} />
                    <div style={{ width: `${expectedPct - actualPct}%` }} className="bg-[#8c3a1c]" />
                    <div style={{ width: `${100 - expectedPct}%` }} className="bg-[#111]" />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-5">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-sm ${getCurrencyColor(goal.currency)} shadow-sm`}></div>
                  <span className="text-gray-300 text-sm font-mono tracking-wide">
                    You are <span className="text-white font-bold">{actualPct.toFixed(1)}%</span> complete to your goal of {goal.amount} {getCurrencyName(goal.currency)}.
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-[#8c3a1c] shadow-sm"></div>
                  <span className="text-gray-300 text-sm font-mono tracking-wide">
                    You should be <span className="text-white font-bold">{expectedPct.toFixed(1)}%</span> complete.
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-[#111] border border-red-950"></div>
                  <span className="text-gray-400 text-sm font-mono tracking-wide">
                    {(100 - actualPct).toFixed(1)}% left until you reach your goal!
                  </span>
                </div>
              </div>
            </div>
          )}

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

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)]">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase">Exchange Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEMES.map(theme => (
                <div key={theme.id} className={`border border-red-950/40 p-4 flex flex-col gap-2 bg-black/40 hover:bg-black/60 transition-colors ${theme.borderClass}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${theme.colorClass}`}>{theme.name}</span>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-gray-300 text-sm font-mono">1 Hour = 1 {theme.currency}</span>
                    <span className="text-[#b3002d] text-sm font-mono font-bold">1 Hour = {theme.rate} Potion Mix</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)]">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase">Trade Portal Optimizer</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Target Potion Mix Needed</label>
                <input
                  type="number"
                  min="1"
                  value={optimizerTarget}
                  onChange={(e) => setOptimizerTarget(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm max-w-xs"
                  placeholder="e.g. 34"
                />
              </div>

              {optimizedMixes && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-[#b3002d]/10 border-l-2 border-[#b3002d] p-4 text-sm font-mono flex items-center gap-3">
                    <span className="text-gray-400">Absolute Minimum Time Required:</span>
                    <span className="text-white font-bold text-lg">{optimizedMixes.minHours} HOURS</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    
                    {optimizedMixes.balanced && (
                      <div className="border border-red-950/30 bg-black/40 p-4 flex flex-col gap-4">
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Balanced Path (Max Variety)</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-red-500">R (Indie Gamedev)</span>
                            <span className="text-gray-300 font-mono text-sm">{optimizedMixes.balanced.r}h</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-amber-500">G (No Internet)</span>
                            <span className="text-gray-300 font-mono text-sm">{optimizedMixes.balanced.g}h</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-blue-500">A (Endless)</span>
                            <span className="text-gray-300 font-mono text-sm">{optimizedMixes.balanced.a}h</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-2 text-right">
                          <span className="text-[10px] text-gray-500 uppercase">Yields</span>
                          <span className="text-[#b3002d] font-bold font-mono ml-2">{optimizedMixes.balanced.yield} MIX</span>
                        </div>
                      </div>
                    )}

                    <div className="border border-red-950/30 bg-black/40 p-4 flex flex-col gap-4 opacity-75 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Pure Speed</span>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                          <span className="text-xs text-red-500">R</span>
                          <span className="text-gray-500 font-mono text-sm">0h</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                          <span className="text-xs text-amber-500">G</span>
                          <span className="text-gray-500 font-mono text-sm">0h</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                          <span className="text-xs text-blue-500 font-bold">A (Endless)</span>
                          <span className="text-gray-300 font-mono text-sm">{optimizedMixes.pureA.a}h</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-2 text-right">
                        <span className="text-[10px] text-gray-500 uppercase">Yields</span>
                        <span className="text-[#b3002d] font-bold font-mono ml-2">{optimizedMixes.pureA.yield} MIX</span>
                      </div>
                    </div>

                    {optimizedMixes.noA && (
                      <div className="border border-red-950/30 bg-black/40 p-4 flex flex-col gap-4 opacity-75 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Without Endless ({optimizedMixes.noA.minHours}H)</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-red-500">R (Indie Gamedev)</span>
                            <span className="text-gray-300 font-mono text-sm">{optimizedMixes.noA.r}h</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-amber-500">G (No Internet)</span>
                            <span className="text-gray-300 font-mono text-sm">{optimizedMixes.noA.g}h</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                            <span className="text-xs text-blue-500">A</span>
                            <span className="text-gray-500 font-mono text-sm">0h</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-2 text-right">
                          <span className="text-[10px] text-gray-500 uppercase">Yields</span>
                          <span className="text-[#b3002d] font-bold font-mono ml-2">{optimizedMixes.noA.yield} MIX</span>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)]">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-4 uppercase">Grant Calculator</h2>
            
            <div className="mb-6 border-l-2 border-[#b3002d]/50 bg-[#b3002d]/10 p-4 text-xs font-mono">
              <span className="text-[#b3002d] font-bold tracking-widest uppercase mb-2 block">Example: $100 Phone Grant</span>
              <div className="text-gray-300 flex flex-col gap-1">
                <p>Goal Target ($): <span className="text-white font-bold">100</span></p>
                <p>Grant Item Value ($): <span className="text-white font-bold">5</span></p>
                <p>Item Price (Currencies): <span className="text-white font-bold">5</span></p>
                <p>Currency Type: <span className="text-white font-bold">Potion Mix</span></p>
                <p className="mt-2 text-[#b3002d] font-bold">Grind Needed: 25h Redstone | 23h Glowstone | 20h Aqua Regia</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Goal Target ($)</label>
                <input
                  type="number"
                  min="0"
                  value={grantTarget}
                  onChange={(e) => setGrantTarget(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Grant Item Value ($)</label>
                <input
                  type="number"
                  min="1"
                  value={grantValue}
                  onChange={(e) => setGrantValue(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Item Price</label>
                <input
                  type="number"
                  min="0"
                  value={grantPrice}
                  onChange={(e) => setGrantPrice(e.target.value)}
                  className="bg-transparent border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] transition-colors font-mono text-sm"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-red-700 tracking-[0.15em] uppercase font-bold">Currency Type</label>
                <select
                  value={grantCurrency}
                  onChange={(e) => setGrantCurrency(e.target.value)}
                  className="bg-[#050000] border-b border-red-950 p-2 text-gray-200 outline-none focus:border-[#b3002d] appearance-none font-mono text-sm cursor-pointer"
                >
                  <option value="potionMix">Potion Mix</option>
                  <option value="gamedev">Redstone (Gamedev)</option>
                  <option value="no_internet">Glowstone (No Internet)</option>
                  <option value="endless">Aqua Regia (Endless)</option>
                </select>
              </div>
            </div>

            {grantItemsNeeded > 0 && (
              <div className="mt-6 border-t border-red-950/30 pt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-300 text-sm font-mono tracking-wide">
                    You need to purchase <span className="text-white font-bold">{grantItemsNeeded}</span> items.
                  </p>
                  {totalGrantCurrencyNeeded > 0 && (
                    <p className="text-gray-300 text-sm font-mono tracking-wide">
                      Total cost to reach target: <span className="text-[#b3002d] font-bold">{totalGrantCurrencyNeeded}</span> {getCurrencyName(grantCurrency)}.
                    </p>
                  )}
                </div>

                {totalGrantCurrencyNeeded > 0 && (
                  <div className="flex flex-col gap-2 bg-black/40 p-4 border border-red-950/20">
                    <span className="text-[10px] text-gray-500 tracking-widest uppercase mb-1">Time Investment Required</span>
                    
                    {grantCurrency === 'potionMix' ? (
                      THEMES.map(theme => (
                        <div key={theme.id} className="flex justify-between items-center border-b border-red-950/20 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.colorClass.replace('text-', 'bg-')}`}></span>
                            <span className={`text-xs ${theme.colorClass} uppercase tracking-wider`}>{theme.name}</span>
                          </div>
                          <span className="text-gray-300 text-sm font-mono font-bold">{Math.ceil(totalGrantCurrencyNeeded / theme.rate)} HRS</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${getTheme(grantCurrency).colorClass.replace('text-', 'bg-')}`}></span>
                          <span className={`text-xs ${getTheme(grantCurrency).colorClass} uppercase tracking-wider`}>{getTheme(grantCurrency).name}</span>
                        </div>
                        <span className="text-gray-300 text-sm font-mono font-bold">{totalGrantCurrencyNeeded} HRS</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-red-950/60 bg-[#050000] p-6 shadow-[0_0_30px_rgba(50,0,0,0.2)] min-h-[350px] flex flex-col">
            <h2 className="text-[#b3002d] font-bold tracking-widest text-sm mb-6 uppercase flex items-center justify-between">
              <span>Recent Mixes</span>
              <span className="text-xs text-red-700/80">{projects.length} LOGGED</span>
            </h2>
            
            {projects.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-red-950/30">
                <p className="text-xs text-red-700/60 tracking-[0.2em] uppercase">No projects synthesized yet</p>
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
                        
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="ml-2 w-6 h-6 flex items-center justify-center rounded text-red-800 hover:text-red-500 hover:bg-red-950/30 transition-all text-sm"
                          title="Delete mix"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <footer className="mt-auto pt-8 pb-4 border-t border-red-950/30 text-center text-xs md:text-sm text-gray-400 font-mono tracking-[0.2em] uppercase">
        Made with 💖 and open source{' '}
        <a 
          href="https://github.com/ansh3108/alchemize-calculator" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#b3002d] hover:text-red-500 underline underline-offset-4 transition-colors font-bold"
        >
          here
        </a>
      </footer>
    </main>
  );
}

