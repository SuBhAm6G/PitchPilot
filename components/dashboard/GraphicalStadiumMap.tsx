import { useMemo, memo } from "react";
import Card from "@/components/ui/Card";
import type { CrowdDensityReport } from "@/lib/types";

interface GraphicalStadiumMapProps {
  readonly crowdReport: readonly CrowdDensityReport[];
  readonly selectedZone?: string;
}

// Map each zone to a specific SVG path in a 500x500 viewBox
const ZONE_PATHS: Record<string, { d: string; name: string }> = {
  // North
  "north-upper": { d: "M 125 50 Q 250 10 375 50 L 335 110 Q 250 80 165 110 Z", name: "NORTH UPPER" },
  "north-lower": { d: "M 165 110 Q 250 80 335 110 L 315 150 Q 250 130 185 150 Z", name: "NORTH LOWER" },
  // South
  "south-upper": { d: "M 125 450 Q 250 490 375 450 L 335 390 Q 250 420 165 390 Z", name: "SOUTH UPPER" },
  "south-lower": { d: "M 165 390 Q 250 420 335 390 L 315 350 Q 250 370 185 350 Z", name: "SOUTH LOWER" },
  // East
  "east-upper": { d: "M 375 50 Q 450 150 450 250 Q 450 350 375 450 L 335 390 Q 390 300 390 250 Q 390 200 335 110 Z", name: "EAST UPPER" },
  "east-lower": { d: "M 335 110 Q 390 200 390 250 Q 390 300 335 390 L 315 350 Q 350 290 350 250 Q 350 210 315 150 Z", name: "EAST LOWER" },
  // West
  "west-upper": { d: "M 125 50 Q 50 150 50 250 Q 50 350 125 450 L 165 390 Q 110 300 110 250 Q 110 200 165 110 Z", name: "WEST UPPER" },
  "west-lower": { d: "M 165 110 Q 110 200 110 250 Q 110 300 165 390 L 185 350 Q 150 290 150 250 Q 150 210 185 150 Z", name: "WEST LOWER" },
  // VIP Suites (wrapping around corners)
  "vip-suites": { d: "M 90 90 L 115 115 M 410 90 L 385 115 M 90 410 L 115 385 M 410 410 L 385 385", name: "VIP" },
};

function getDensityColor(level: string): { fill: string; stroke: string } {
  switch (level) {
    case "critical":
      return { fill: "rgba(239, 68, 68, 0.7)", stroke: "rgba(248, 113, 113, 1)" }; // red
    case "high":
      return { fill: "rgba(249, 115, 22, 0.7)", stroke: "rgba(251, 146, 60, 1)" }; // orange
    case "moderate":
      return { fill: "rgba(245, 158, 11, 0.7)", stroke: "rgba(251, 191, 36, 1)" }; // amber
    default:
      return { fill: "rgba(16, 185, 129, 0.7)", stroke: "rgba(52, 211, 153, 1)" }; // emerald
  }
}

const GraphicalStadiumMap = memo(function GraphicalStadiumMap({ crowdReport, selectedZone }: GraphicalStadiumMapProps) {
  const renderedZones = useMemo(() => {
    // Render normal zones
    const normalZones = crowdReport.filter(z => z.zoneId !== "vip-suites").map((zone) => {
      const pathData = ZONE_PATHS[zone.zoneId];
      if (!pathData) return null;
      
      const { fill, stroke } = getDensityColor(zone.densityLevel);
      const isSelected = selectedZone === zone.zoneId;
      
      return (
        <g key={zone.zoneId} className="transition-all duration-300 hover:brightness-125 cursor-pointer">
          <path
            d={pathData.d}
            fill={fill}
            stroke={isSelected ? "#fff" : stroke}
            strokeWidth={isSelected ? 4 : 2}
            className={`transition-all duration-500 ${isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""}`}
            role="img"
            aria-label={`${zone.zoneName} is at ${zone.densityLevel} density`}
            tabIndex={0}
          />
        </g>
      );
    });

    // Render VIP suites separately since they are corners
    const vipZone = crowdReport.find(z => z.zoneId === "vip-suites");
    let vipRenders = null;
    if (vipZone && ZONE_PATHS["vip-suites"]) {
      const { stroke } = getDensityColor(vipZone.densityLevel);
      const isSelected = selectedZone === "vip-suites";
      
      vipRenders = (
        <g key="vip-suites" className="transition-all duration-300">
          <path 
             d={ZONE_PATHS["vip-suites"].d}
             stroke={isSelected ? "#fff" : stroke}
             strokeWidth={isSelected ? 8 : 4}
             strokeLinecap="round"
             className={isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""}
          />
        </g>
      );
    }

    return [...normalZones, vipRenders];
  }, [crowdReport, selectedZone]);

  return (
    <Card as="section" className="flex flex-col items-center justify-center w-full min-h-[400px]">
      <div className="w-full mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Stadium Operations Map
        </h2>
        {selectedZone && (
          <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
            Viewing: {selectedZone.replace("-", " ").toUpperCase()}
          </span>
        )}
      </div>
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-4 bg-slate-900/60 rounded-3xl border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
        {/* The Pitch */}
        <div className="absolute w-[130px] h-[200px] border-2 border-white/30 rounded-sm bg-gradient-to-br from-emerald-800/40 to-emerald-900/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center pointer-events-none">
          <div className="w-[80px] h-[40px] border border-white/20 absolute top-0"></div>
          <div className="w-full h-[2px] bg-white/30 absolute top-1/2"></div>
          <div className="w-[40px] h-[40px] border-2 border-white/30 rounded-full"></div>
          <div className="w-[80px] h-[40px] border border-white/20 absolute bottom-0"></div>
        </div>
        
        {/* The SVG Stadium Container */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-2xl z-10"
          role="img"
          aria-label="Interactive map of all 9 stadium zones colored by crowd density"
        >
          {renderedZones}
          
          {/* Labels Overlay */}
          <text x="250" y="70" textAnchor="middle" alignmentBaseline="middle" fill="white" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">NORTH UPPER</text>
          <text x="250" y="130" textAnchor="middle" alignmentBaseline="middle" fill="white" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">NORTH LOWER</text>
          
          <text x="250" y="430" textAnchor="middle" alignmentBaseline="middle" fill="white" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">SOUTH UPPER</text>
          <text x="250" y="370" textAnchor="middle" alignmentBaseline="middle" fill="white" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">SOUTH LOWER</text>
          
          <text x="405" y="250" textAnchor="middle" alignmentBaseline="middle" fill="white" transform="rotate(90 405 250)" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">EAST UPPER</text>
          <text x="350" y="250" textAnchor="middle" alignmentBaseline="middle" fill="white" transform="rotate(90 350 250)" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">EAST LOWER</text>
          
          <text x="95" y="250" textAnchor="middle" alignmentBaseline="middle" fill="white" transform="rotate(-90 95 250)" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">WEST UPPER</text>
          <text x="150" y="250" textAnchor="middle" alignmentBaseline="middle" fill="white" transform="rotate(-90 150 250)" className="text-[10px] font-bold tracking-widest opacity-90 pointer-events-none">WEST LOWER</text>
          
          <text x="110" y="100" textAnchor="middle" fill="#fcd34d" className="text-[9px] font-bold pointer-events-none" transform="rotate(-45 110 100)">VIP</text>
          <text x="390" y="100" textAnchor="middle" fill="#fcd34d" className="text-[9px] font-bold pointer-events-none" transform="rotate(45 390 100)">VIP</text>
          <text x="110" y="400" textAnchor="middle" fill="#fcd34d" className="text-[9px] font-bold pointer-events-none" transform="rotate(45 110 400)">VIP</text>
          <text x="390" y="400" textAnchor="middle" fill="#fcd34d" className="text-[9px] font-bold pointer-events-none" transform="rotate(-45 390 400)">VIP</text>
        </svg>
      </div>
    </Card>
  );
});

export default GraphicalStadiumMap;
