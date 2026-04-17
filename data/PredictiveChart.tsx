// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";

// interface PredictiveChartProps {
//   forecast: Array<{ hour: string; occupancy: number }>;
//   beds?: Array<any>; // optional, not used but accepted
// }

// export function PredictiveChart({ forecast }: PredictiveChartProps) {
//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base">
//             Predicted Occupancy — Next 24h
//           </CardTitle>
//           <CardDescription>
//             Based on historical ADT patterns. Peak expected at 6 PM (~82%)
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={260}>
//             <AreaChart data={forecast}>
//               <defs>
//                 <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="hsl(210,65%,50%)"
//                     stopOpacity={0.3}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="hsl(210,65%,50%)"
//                     stopOpacity={0}
//                   />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
//               <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
//               <YAxis
//                 domain={[0, 100]}
//                 tick={{ fontSize: 12 }}
//                 tickFormatter={(v) => `${v}%`}
//               />
//               <Tooltip
//                 formatter={(val: number | undefined) => {
//                   if (val === undefined) return ["0%", "Occupancy"];
//                   return [`${val}%`, "Occupancy"];
//                 }}
//               />
//               <ReferenceLine
//                 y={85}
//                 stroke="hsl(0,72%,51%)"
//                 strokeDasharray="4 4"
//                 label={{
//                   value: "Capacity warning",
//                   fill: "hsl(0,72%,51%)",
//                   fontSize: 11,
//                 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="occupancy"
//                 stroke="hsl(210,65%,50%)"
//                 fill="url(#occGrad)"
//                 strokeWidth={2}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base">What-If Scenario</CardTitle>
//           <CardDescription>
//             If 5 emergency admissions occur, available beds drop to ~3
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-3 gap-4 text-center">
//             <div className="p-3 bg-muted rounded-lg">
//               <p className="text-2xl font-bold text-foreground">8</p>
//               <p className="text-xs text-muted-foreground">Current Available</p>
//             </div>
//             <div className="p-3 bg-status-cleaning/20 rounded-lg">
//               <p className="text-2xl font-bold text-foreground">−5</p>
//               <p className="text-xs text-muted-foreground">Emergency Admits</p>
//             </div>
//             <div className="p-3 bg-destructive/10 rounded-lg">
//               <p className="text-2xl font-bold text-destructive">3</p>
//               <p className="text-xs text-muted-foreground">Remaining Beds</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface PredictiveChartProps {
  forecast: Array<{ hour: string; occupancy: number }>;
  beds?: Array<any>; // optional, not used but accepted
}

export function PredictiveChart({ forecast }: PredictiveChartProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Predicted Occupancy — Next 24h
          </CardTitle>
          <CardDescription>
            Based on historical ADT patterns. Peak expected at 6 PM (~82%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(210,65%,50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(210,65%,50%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value, name) => {
                  // Handle undefined or null values
                  if (value === undefined || value === null) {
                    return ["0%", "Occupancy"];
                  }
                  // Convert to number
                  const numVal = typeof value === 'number' ? value : parseFloat(String(value));
                  if (isNaN(numVal)) {
                    return ["0%", "Occupancy"];
                  }
                  return [`${numVal}%`, "Occupancy"];
                }}
              />
              <ReferenceLine
                y={85}
                stroke="hsl(0,72%,51%)"
                strokeDasharray="4 4"
                label={{
                  value: "Capacity warning",
                  fill: "hsl(0,72%,51%)",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="hsl(210,65%,50%)"
                fill="url(#occGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What-If Scenario</CardTitle>
          <CardDescription>
            If 5 emergency admissions occur, available beds drop to ~3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Current Available</p>
            </div>
            <div className="p-3 bg-status-cleaning/20 rounded-lg">
              <p className="text-2xl font-bold text-foreground">−5</p>
              <p className="text-xs text-muted-foreground">Emergency Admits</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-2xl font-bold text-destructive">3</p>
              <p className="text-xs text-muted-foreground">Remaining Beds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}