
// import {
//   Bed,
//   statusColors,
//   statusLabels,
//   type BedStatus,
// } from "@/data/wardData";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import {
//   Heart,
//   Thermometer,
//   Droplets,
//   Activity,
//   User,
//   Clock,
//   AlertTriangle,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { FaBed } from "react-icons/fa6";
// import Image from "next/image";
// import { TbBedOff } from "react-icons/tb";
// import { GiBroom } from "react-icons/gi";

// interface BedCardProps {
//   bed: Bed;
//   onSelect: (bed: Bed) => void;
//   onAssign: (bed: Bed) => void;
//   onDischarge: (bed: Bed) => void;
//   onTransfer: (bed: Bed) => void;
//   onMarkCleaning: (bed: Bed) => void;
// }

// const statusColorsHex: Record<BedStatus, string> = {
//   available: "#10b981",
//   occupied: "#3b82f6",
//   cleaning: "#f59e0b",
//   maintenance: "#6b7280",
//   reserved: "#8b5cf6",
// };

// export function BedCard({
//   bed,
//   onSelect,
//   onAssign,
//   onDischarge,
//   onTransfer,
//   onMarkCleaning,
// }: BedCardProps) {
//   return (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <Card
//           className={cn(
//             "cursor-pointer border-l-4 transition-all hover:shadow-md overflow-hidden",
//             bed.recentlyChanged && "animate-pulse-status",
//             "!py-3",
//           )}
//           style={{ borderLeftColor: statusColorsHex[bed.status] }}
//           onClick={() => onSelect(bed)}
//         >
//           <CardContent className="px-3 py-0">
//             {/* Header: flex layout with icon centered - no vertical margin */}
//             <div className="flex items-center justify-between gap-2">
//               {/* Left: bed number + type */}
//               <div className="flex items-center gap-2 min-w-fit">
//                 <span className="text-lg font-bold text-foreground whitespace-nowrap">
//                   {bed.number}
//                 </span>
//                 <Badge variant="outline" className="text-xs whitespace-nowrap">
//                   {bed.type}
//                 </Badge>
//               </div>

//               {/* Center: icon/image - flex-1 to take available space */}
//               <div className="flex-1 flex justify-end min-w-0">
//                 {bed.status === "occupied" && (
//                   <FaBed
//                     size={50}
//                     style={{ color: statusColorsHex[bed.status] }}
//                     className="flex-shrink-0"
//                   />
//                 )}
//                 {bed.status === "available" && (
//                   <img
//                     src="/bed-management/furniture.png"
//                     alt="Available bed"
//                     className="w-[50px] h-auto object-contain flex-shrink-0"
//                     style={{
//                       filter:
//                         "invert(45%) sepia(85%) saturate(400%) hue-rotate(95deg)",
//                     }}
//                   />
//                 )}
//                 {bed.status === "maintenance" && (
//                   <div className="flex ml-3">
//                     <TbBedOff
//                       size={50}
//                       style={{ color: statusColorsHex[bed.status] }}
//                       className="flex-shrink-0"
//                     />
//                   </div>
//                 )}
//                 {bed.status === "cleaning" && (
//                   <img
//                     src="/bed-management/cleaner.png"
//                     alt="Cleaning bed"
//                     className="w-[50px] h-auto object-contain flex-shrink-0"
//                     style={{
//                       filter:
//                         "invert(69%) sepia(94%) saturate(749%) hue-rotate(358deg) brightness(101%) contrast(95%)",
//                     }}
//                   />
//                 )}
//               {bed.status === "reserved" && (
//   <div className="flex justify-end w-full">
//     <span className="px-2 py-1 text-xs font-medium rounded-md bg-violet-100 text-black">
//       Reserved
//     </span>
//   </div>
// )}

//               </div>

//               {/* Right: status badge - min-w-fit to prevent shrinking */}
//               <Badge
//                 className={cn(
//                   "text-xs text-white border-0 min-w-fit",
//                   statusColors[bed.status],
//                 )}
//               >
//                 {statusLabels[bed.status]}
//               </Badge>
//             </div>

//             {/* Patient info (if occupied) - no top margin */}
//             {bed.patient && (
//               <div className="py-1">
//                 <div className="flex items-center gap-2">
//                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
//                     {bed.patient.initials}
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium leading-tight truncate">
//                       {bed.patient.name}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       {bed.patient.gender}, {bed.patient.age}y
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Vitals (if available) - with minimal padding */}
//             {/*  */}

//             {/* Action buttons - no top margin */}
//             <div className="py-1 flex flex-wrap gap-1">
//               {/* {bed.status === "available" && (
//                 <Button
//                   size="sm"
//                   variant="default"
//                   className="h-7 px-2 text-xs"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onAssign(bed);
//                   }}
//                 >
//                   Assign
//                 </Button>
//               )} */}

//               {bed.status === "occupied" && (
//                 <div className="flex w-full gap-1">
//                   {" "}
//                   {/* Add this wrapper div */}
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="flex-1 h-7 px-2 text-xs" // flex-1 for equal width
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onSelect(bed);
//                     }}
//                   >
//                     View
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="flex-1 h-7 px-2 text-xs" // flex-1 for equal width
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDischarge(bed);
//                     }}
//                   >
//                     Discharge
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="flex-1 h-7 px-2 text-xs" // flex-1 for equal width
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onTransfer(bed);
//                     }}
//                   >
//                     Transfer
//                   </Button>
//                 </div>
//               )}

//               {bed.status === "cleaning" && (
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   className="w-full h-7 px-2 text-xs flex items-center justify-center gap-1"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onMarkCleaning(bed);
//                   }}
//                 >
//                   Cleaning • Mark Available
//                 </Button>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </TooltipTrigger>
//       <TooltipContent side="top" className="max-w-xs">
//         <p className="font-medium">
//           Bed {bed.number} – {bed.type}
//         </p>
//         {bed.patient && (
//           <>
//             <p className="text-xs">Diagnosis: {bed.patient.diagnosis}</p>
//             {bed.patient.specialRequirements && (
//               <p className="text-xs">
//                 Special: {bed.patient.specialRequirements}
//               </p>
//             )}
//             {bed.notes.length > 0 && (
//               <p className="text-xs mt-1 italic">
//                 "{bed.notes[0].text.slice(0, 60)}…"
//               </p>
//             )}
//           </>
//         )}
//       </TooltipContent>
//     </Tooltip>
//   );
// }



import {
  Bed,
  statusColors,
  statusLabels,
  type BedStatus,
} from "@/data/wardData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Thermometer,
  Droplets,
  Activity,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FaBed } from "react-icons/fa6";
import Image from "next/image";
import { TbBedOff } from "react-icons/tb";
import { GiBroom } from "react-icons/gi";

interface BedCardProps {
  bed: Bed;
  onSelect: (bed: Bed) => void;
  onAssign: (bed: Bed) => void;
  onDischarge: (bed: Bed) => void;
  onTransfer: (bed: Bed) => void;
  onMarkCleaning: (bed: Bed) => void;
}

const statusColorsHex: Record<BedStatus, string> = {
  available: "#10b981",
  occupied: "#3b82f6",
  cleaning: "#f59e0b",
  maintenance: "#6b7280",
  reserved: "#8b5cf6",
};

export function BedCard({
  bed,
  onSelect,
  onAssign,
  onDischarge,
  onTransfer,
  onMarkCleaning,
}: BedCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            "cursor-pointer border-l-4 transition-all hover:shadow-md overflow-hidden",
            bed.recentlyChanged && "animate-pulse-status",
            "!py-3",
          )}
          style={{ borderLeftColor: statusColorsHex[bed.status] }}
          onClick={() => onSelect(bed)}
        >
          <CardContent className="px-3 py-0">
            {/* Header: flex layout with icon centered - no vertical margin */}
            <div className="flex items-center justify-between gap-2">
              {/* Left: bed number + type */}
              <div className="flex items-center gap-2 min-w-fit">
                <span className="text-lg font-bold text-foreground whitespace-nowrap">
                  {bed.number}
                </span>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {bed.type}
                </Badge>
              </div>

              {/* Center: icon/image - flex-1 to take available space */}
              <div className="flex-1 flex justify-end min-w-0">
                {bed.status === "occupied" && (
                  <FaBed
                    size={50}
                    style={{ color: statusColorsHex[bed.status] }}
                    className="flex-shrink-0"
                  />
                )}
                {bed.status === "available" && (
                  <img
                    src="/bed-management/furniture.png"
                    alt="Available bed"
                    className="w-[50px] h-auto object-contain flex-shrink-0"
                    style={{
                      filter:
                        "invert(45%) sepia(85%) saturate(400%) hue-rotate(95deg)",
                    }}
                  />
                )}
                {bed.status === "maintenance" && (
                  <div className="flex ml-3">
                    <TbBedOff
                      size={50}
                      style={{ color: statusColorsHex[bed.status] }}
                      className="flex-shrink-0"
                    />
                  </div>
                )}
                {bed.status === "cleaning" && (
                  <img
                    src="/bed-management/cleaner.png"
                    alt="Cleaning bed"
                    className="w-[50px] h-auto object-contain flex-shrink-0"
                    style={{
                      filter:
                        "invert(69%) sepia(94%) saturate(749%) hue-rotate(358deg) brightness(101%) contrast(95%)",
                    }}
                  />
                )}
              {bed.status === "reserved" && (
                <div className="flex justify-end w-full">
                  <span className="px-2 py-1 text-xs font-medium rounded-md bg-violet-100 text-black">
                    Reserved
                  </span>
                </div>
              )}
              </div>

              {/* Right: status badge - min-w-fit to prevent shrinking */}
              <Badge
                className={cn(
                  "text-xs text-white border-0 min-w-fit",
                  statusColors[bed.status],
                )}
              >
                {statusLabels[bed.status]}
              </Badge>
            </div>

            {/* Patient info (if occupied) - no top margin */}
            {bed.patient && (
              <div className="py-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {bed.patient.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {bed.patient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bed.patient.gender}, {bed.patient.age}y
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons - no top margin */}
            <div className="py-1 flex flex-wrap gap-1">
              {bed.status === "occupied" && (
                <div className="flex w-full gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(bed);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDischarge(bed);
                    }}
                  >
                    Discharge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransfer(bed);
                    }}
                  >
                    Transfer
                  </Button>
                </div>
              )}

              {bed.status === "cleaning" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full h-7 px-2 text-xs flex items-center justify-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Mark bed ${bed.number} as available?`)) {
                      onMarkCleaning(bed);
                    }
                  }}
                >
                  Cleaning • Mark Available
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">
          Bed {bed.number} – {bed.type}
        </p>
        {bed.patient && (
          <>
            <p className="text-xs">Diagnosis: {bed.patient.diagnosis}</p>
            {bed.patient.specialRequirements && (
              <p className="text-xs">
                Special: {bed.patient.specialRequirements}
              </p>
            )}
            {bed.notes.length > 0 && (
              <p className="text-xs mt-1 italic">
                "{bed.notes[0].text.slice(0, 60)}…"
              </p>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}