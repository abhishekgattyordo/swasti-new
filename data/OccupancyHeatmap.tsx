

interface OccupancyHeatmapProps {
  wards: Array<{
    id: string;
    name: string;
    floor: number;
    wing: string;
    totalBeds: number;
    occupiedBeds: number;
  }>;
}

export function OccupancyHeatmap({ wards }: OccupancyHeatmapProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Color intensity represents occupancy density across wards.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wards.map((ward) => {
          const pct = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
          const hue = pct > 80 ? 0 : pct > 50 ? 40 : 145;
          return (
            <div
              key={ward.id}
              className="rounded-lg border p-6 text-center transition-colors"
              style={{ backgroundColor: `hsl(${hue}, 70%, ${90 - pct * 0.3}%)` }}
            >
              <h3 className="font-semibold text-foreground">{ward.name}</h3>
              <p className="text-3xl font-bold mt-2" style={{ color: `hsl(${hue}, 70%, 30%)` }}>{pct}%</p>
              <p className="text-sm text-muted-foreground mt-1">{ward.occupiedBeds}/{ward.totalBeds} beds occupied</p>
              <p className="text-xs text-muted-foreground">Floor {ward.floor} · {ward.wing}</p>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground mt-4">
        <div className="flex items-center gap-1"><div className="h-3 w-8 rounded" style={{ backgroundColor: "hsl(145, 70%, 75%)" }} /> Low</div>
        <div className="flex items-center gap-1"><div className="h-3 w-8 rounded" style={{ backgroundColor: "hsl(40, 70%, 70%)" }} /> Medium</div>
        <div className="flex items-center gap-1"><div className="h-3 w-8 rounded" style={{ backgroundColor: "hsl(0, 70%, 70%)" }} /> High</div>
      </div>
    </div>
  );
}