// // components/doctor/ClinicalInsights.tsx
// "use client";

// import React, { useState } from "react";
// import { Loader2, Sparkles, AlertCircle, Copy, X, RefreshCw } from "lucide-react";
// import toast from "react-hot-toast";

// interface VitalsData {
//   bp?: string;
//   hr?: string;
//   temp?: string;
//   weight?: string;
//   rr?: string;
//   spo2?: string;
// }

// interface ClinicalInsightsProps {
//   /** Primary diagnosis text */
//   diagnosis: string;
//   /** Clinical notes / assessment text */
//   clinicalNotes: string;
//   /** Vitals object (optional) */
//   vitals?: VitalsData;
//   /** Callback when insights are generated and user wants to copy to notes */
//   onCopyToNotes?: (insightsText: string) => void;
//   /** Callback to refresh parent data (e.g., refetch from DB) */
//   onRefresh?: () => void;
// }

// interface InsightsResponse {
//   deepAnalysis: string;
//   precautions: string[];
// }

// export default function ClinicalInsights({
//   diagnosis,
//   clinicalNotes,
//   vitals = {},
//   onCopyToNotes,
//   onRefresh,
// }: ClinicalInsightsProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [insights, setInsights] = useState<InsightsResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const generateInsights = async () => {
//     if (!diagnosis && !clinicalNotes) {
//       toast.error("Please provide a diagnosis or clinical notes first.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch("/api/doctors/ai/clinical-insights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           diagnosis,
//           clinicalNotes,
//           vitals: {
//             bp: vitals.bp || "",
//             hr: vitals.hr || "",
//             temp: vitals.temp || "",
//             weight: vitals.weight || "",
//             rr: vitals.rr || "",
//             spo2: vitals.spo2 || "",
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.error || "Failed to generate insights");
//       }

//       const data: InsightsResponse = await response.json();
//       setInsights(data);
//       setIsOpen(true);
//       toast.success("AI insights generated");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Could not generate insights");
//       toast.error(err.message || "Failed to generate insights");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopyToNotes = () => {
//     if (!insights) return;
//     const formatted = `--- AI Insights ---\nDeep Analysis:\n${insights.deepAnalysis}\n\nPrecautions:\n${insights.precautions.map(p => `- ${p}`).join("\n")}`;
//     if (onCopyToNotes) {
//       onCopyToNotes(formatted);
//     } else {
//       navigator.clipboard.writeText(formatted);
//       toast.success("Copied to clipboard");
//     }
//   };

//   const handleRefresh = () => {
//     if (onRefresh) {
//       onRefresh();
//       toast.success("Data refreshed from server");
//     } else {
//       toast.info("Refresh callback not configured");
//     }
//   };

//   const handleClose = () => {
//     setIsOpen(false);
//   };

//   return (
//     <div className="w-full">
//       <button
//         type="button"
//         onClick={generateInsights}
//         disabled={loading || (!diagnosis && !clinicalNotes)}
//         className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//       >
//         {loading ? (
//           <Loader2 className="w-4 h-4 animate-spin" />
//         ) : (
//           <Sparkles className="w-4 h-4" />
//         )}
//         {loading ? "Generating Insights..." : "AI Clinical Insights"}
//       </button>

//       {error && (
//         <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
//           <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
//           <span>{error}</span>
//         </div>
//       )}

//       {isOpen && insights && (
//         <div className="mt-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-100 bg-white/50">
//             <div className="flex items-center gap-2">
//               <Sparkles className="w-4 h-4 text-indigo-600" />
//               <h3 className="font-semibold text-slate-800">AI Clinical Insights</h3>
//             </div>
//             <div className="flex items-center gap-2">
//               {onRefresh && (
//                 <button
//                   onClick={handleRefresh}
//                   className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
//                   title="Refresh data from database"
//                 >
//                   <RefreshCw className="w-4 h-4" />
//                 </button>
//               )}
//               <button
//                 onClick={handleCopyToNotes}
//                 className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
//                 title="Copy to notes"
//               >
//                 <Copy className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={handleClose}
//                 className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           <div className="p-5 space-y-4">
//             {/* Deep Analysis */}
//             <div>
//               <h4 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
//                 <span className="material-symbols-outlined text-base">insight</span>
//                 Deep Analysis
//               </h4>
//               <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
//                 {insights.deepAnalysis}
//               </p>
//             </div>

//             {/* Precautions */}
//             {insights.precautions.length > 0 && (
//               <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
//                 <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
//                   <span className="material-symbols-outlined text-base">warning</span>
//                   Precautions
//                 </h4>
//                 <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
//                   {insights.precautions.map((item, idx) => (
//                     <li key={idx}>{item}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// components/doctor/ClinicalInsights.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, AlertCircle, Copy, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface VitalsData {
  bp?: string;
  hr?: string;
  temp?: string;
  weight?: string;
  rr?: string;
  spo2?: string;
}

interface ClinicalInsightsProps {
  diagnosis: string;
  clinicalNotes: string;
  vitals?: VitalsData;
  onCopyToNotes?: (insightsText: string) => void;
  onRefresh?: () => void;
}

interface InsightsResponse {
  deepAnalysis: string;
  precautions: string[];
}

export default function ClinicalInsights({
  diagnosis,
  clinicalNotes,
  vitals = {},
  onCopyToNotes,
  onRefresh,
}: ClinicalInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔍 DEBUG: Log props whenever they change
  useEffect(() => {
    console.log("🔍 ClinicalInsights props received:", {
      diagnosis: diagnosis || "(empty)",
      clinicalNotes: clinicalNotes ? `${clinicalNotes.substring(0, 50)}...` : "(empty)",
      vitals,
      hasDiagnosis: !!diagnosis,
      hasClinicalNotes: !!clinicalNotes,
    });
  }, [diagnosis, clinicalNotes, vitals]);

  // 🔍 DEBUG: Log when component mounts
  useEffect(() => {
    console.log("✅ ClinicalInsights component mounted");
  }, []);

  const generateInsights = async () => {
    console.log("🎯 Generate Insights clicked");
    if (!diagnosis && !clinicalNotes) {
      toast.error("Please provide a diagnosis or clinical notes first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/doctors/ai/clinical-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis,
          clinicalNotes,
          vitals: {
            bp: vitals.bp || "",
            hr: vitals.hr || "",
            temp: vitals.temp || "",
            weight: vitals.weight || "",
            rr: vitals.rr || "",
            spo2: vitals.spo2 || "",
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate insights");
      }

      const data: InsightsResponse = await response.json();
      setInsights(data);
      setIsOpen(true);
      toast.success("AI insights generated");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not generate insights");
      toast.error(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToNotes = () => {
    if (!insights) return;
    const formatted = `--- AI Insights ---\nDeep Analysis:\n${insights.deepAnalysis}\n\nPrecautions:\n${insights.precautions.map(p => `- ${p}`).join("\n")}`;
    if (onCopyToNotes) {
      onCopyToNotes(formatted);
    } else {
      navigator.clipboard.writeText(formatted);
      toast.success("Copied to clipboard");
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.success("Data refreshed from server");
    } else {
      toast("Refresh callback not configured", { icon: "ℹ️" });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 🔍 Temporary: Force enable button for testing (remove after debugging)
  const isButtonDisabled = false; // Change to false to force enable
  // const isButtonDisabled = loading || (!diagnosis && !clinicalNotes);

  console.log("🔘 Button disabled? ", isButtonDisabled, "| diagnosis:", !!diagnosis, "clinicalNotes:", !!clinicalNotes);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={generateInsights}
        disabled={isButtonDisabled}
        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? "Generating Insights..." : "AI Clinical Insights"}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isOpen && insights && (
        <div className="mt-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-100 bg-white/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">AI Clinical Insights</h3>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                  title="Refresh data from database"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleCopyToNotes}
                className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                title="Copy to notes"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">insight</span>
                Deep Analysis
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                {insights.deepAnalysis}
              </p>
            </div>

            {insights.precautions.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">warning</span>
                  Precautions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                  {insights.precautions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}