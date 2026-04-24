import { Bed, statusLabels, type BedStatus } from "@/data/wardData";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface FloorPlanProps {
  beds: Bed[];
  onSelect: (bed: Bed) => void;
}

// Hex colors for each status (matching your statusColors from data)
const bgColors: Record<BedStatus, string> = {
  available: "#10b981",   // green
  occupied: "#3b82f6",    // blue
  cleaning: "#f59e0b",    // amber
  maintenance: "#6b7280", // gray
  reserved: "#8b5cf6",    // purple
};

export function FloorPlan({ beds, onSelect }: FloorPlanProps) {
  const [groupedBeds, setGroupedBeds] = useState<Record<string, Bed[]>>({});
  
  // Group beds by ward whenever beds change
  useEffect(() => {
    const grouped = beds.reduce((acc, bed) => {
      const ward = bed.ward || "Unassigned";
      if (!acc[ward]) {
        acc[ward] = [];
      }
      acc[ward].push(bed);
      return acc;
    }, {} as Record<string, Bed[]>);
    
    setGroupedBeds(grouped);
    console.log("Grouped beds:", grouped);
  }, [beds]);

  // Get unique ward names
  const wardNames = Object.keys(groupedBeds).sort();

  if (beds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No beds available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {wardNames.map((ward) => {
        const wardBeds = beds.filter((b) => b.ward === ward);
        return (
          <div key={ward} className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{ward}</h3>
            <div className="relative bg-muted/50 rounded-lg p-6 min-h-[140px]">
              {/* Corridor */}
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-2 rounded">
                Corridor
              </div>

              {/* Beds - East side */}
              <div className="flex gap-3 mb-10">
                {wardBeds.filter((_, i) => i < 4).map((bed) => (
                  <FloorBedIcon key={bed.id} bed={bed} onSelect={onSelect} />
                ))}
              </div>

              {/* Beds - West side */}
              <div className="flex gap-3">
                {wardBeds.filter((_, i) => i >= 4).map((bed) => (
                  <FloorBedIcon key={bed.id} bed={bed} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FloorBedIcon({ bed, onSelect }: { bed: Bed; onSelect: (bed: Bed) => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onSelect(bed)}
          className={cn(
            "relative flex flex-col items-center justify-center w-20 h-16 rounded-md border-2 border-background shadow-sm transition-transform hover:scale-105 cursor-pointer",
            bed.recentlyChanged && "animate-pulse-status"
          )}
          style={{ backgroundColor: bgColors[bed.status] }} // 👈 inline style for background
        >
          <span className="text-xs font-bold text-white drop-shadow">{bed.number}</span>
          {bed.patient && (
            <span className="text-[10px] text-white/80 drop-shadow">{bed.patient.initials}</span>
          )}
          {bed.vitals?.isAlert && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-background" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Bed {bed.number}</p>
        <p className="text-xs">{statusLabels[bed.status]} · {bed.type}</p>
        {bed.patient && <p className="text-xs">{bed.patient.name}</p>}
      </TooltipContent>
    </Tooltip>
  );
}