// // app/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Menu, X, History, Eye, Trash2, Calendar, User as UserIcon, Activity, Heart, ShieldAlert } from 'lucide-react';
// import HealthForm from '@/components/patient/HealthForm';
// import Sidebar from '@/components/patient/Sidebar';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';

// // ============================================
// // TYPES DEFINED IN SAME FILE
// // ============================================

// export interface PatientData {
//   name: string;
//   age: number;
//   gender: string;
//   bloodPressure: string;
//   heartRate: number;
//   respiratoryRate: number;
//   temperature: number;
//   oxygenSaturation: number;
//   chronicConditions: string[];
//   allergies: string[];
//   currentMedications: string[];
//   symptoms: string[];
//   symptomDuration: string;
//   symptomSeverity: 'mild' | 'moderate' | 'severe';
//   smokingStatus: 'never' | 'former' | 'current';
//   alcoholConsumption: string;
//   exerciseFrequency: string;
//   chiefComplaint: string;
//   additionalNotes?: string;
// }

// export interface RiskAssessment {
//   condition: string;
//   riskLevel: 'Low' | 'Medium' | 'High';
//   reason: string;
//   prevention: string;
// }

// export interface DietRecommendations {
//   focus: string;
//   recommendations: string[];
//   foodsToAvoid: string[];
// }

// export interface ExercisePlan {
//   type: string;
//   frequency: string;
//   routine: string[];
//   safetyPrecautions: string[];
// }

// export interface MentalWellness {
//   assessment: string;
//   advice: string[];
// }

// export interface HealthAnalysisResponse {
//   status: string;
//   summary: string;
//   deepAnalysis: string;
//   riskAssessment: RiskAssessment[];
//   dietRecommendations: DietRecommendations;
//   exercisePlan: ExercisePlan;
//   mentalWellness: MentalWellness;
//   preventiveCare: string[];
//   criticalAlert: string | null;
//   _saved?: boolean;
//   _savedId?: number;
// }

// interface HistoryItem {
//   id: number;
//   patient_name: string;
//   patient_age: number;
//   patient_gender: string;
//   summary: string;
//   risk_level: string;
//   created_at: string;
//   analysis_report: HealthAnalysisResponse;
// }

// // ============================================
// // MAIN COMPONENT
// // ============================================

// export default function HomePage() {
//   const [report, setReport] = useState<HealthAnalysisResponse | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [userId, setUserId] = useState<number | null>(null);

//   // Get user ID from localStorage on mount
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user') || 'null');
//     if (user) {
//       setUserId(user.id || user.patient_id);
//     }
//   }, []);

//   // Load history when showing history panel
//   const loadHistory = async () => {
//     if (!userId) {
//       toast.error('Please login to view history');
//       return;
//     }

//     setLoadingHistory(true);
//     try {
//       const response = await fetch(`/api/patient/healthplan/history?userId=${userId}&limit=20`);
//       const data = await response.json();
//       if (data.success) {
//         setHistory(data.data);
//       }
//     } catch (error) {
//       console.error('Failed to load history:', error);
//       toast.error('Failed to load history');
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const generateReport = async (patientData: PatientData) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('/api/patient/healthplan', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ patientData, userId, saveToHistory: true }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.details || errorData.error || 'Failed to analyze health data.');
//       }

//       const data = await response.json();
//       setReport(data);
      
//       if (data._saved) {
//         toast.success('Analysis saved to history');
//       }
//     } catch (err: any) {
//       setError(err.message);
//       toast.error('Analysis failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadFromHistory = (item: HistoryItem) => {
//     setReport(item.analysis_report);
//     setShowHistory(false);
//     toast.success('Loaded from history');
//   };

//   const deleteHistoryItem = async (id: number) => {
//     if (!confirm('Delete this analysis?')) return;
//     try {
//       const response = await fetch(`/api/patient/healthplan/history/${id}?userId=${userId}`, {
//         method: 'DELETE',
//       });
//       if (response.ok) {
//         loadHistory();
//         toast.success('Deleted successfully');
//       }
//     } catch (error) {
//       console.error('Delete failed:', error);
//       toast.error('Failed to delete');
//     }
//   };

//   const getRiskColor = (riskLevel: string) => {
//     switch (riskLevel) {
//       case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
//       case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
//       default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
//         @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
//         @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
//         :root { --font-inter: "Inter", sans-serif; }
//         body { font-family: var(--font-inter); }
//       `}</style>

//       {/* Mobile Menu Button */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//       </button>

//       {/* Sidebar */}
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
//       {/* Mobile Sidebar Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
         

      
//           {showHistory && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
//             >
//               <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
//                 <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                   <History className="w-4 h-4" />
//                   Previous Analyses
//                 </h3>
//               </div>
//               <div className="max-h-96 overflow-y-auto">
//                 {loadingHistory ? (
//                   <div className="p-8 text-center">
//                     <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-r-transparent"></div>
//                     <p className="mt-2 text-sm text-gray-500">Loading...</p>
//                   </div>
//                 ) : history.length === 0 ? (
//                   <div className="p-8 text-center text-gray-500">
//                     <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                     <p>No history yet</p>
//                     <p className="text-sm">Generate your first analysis to see it here</p>
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-gray-200 dark:divide-gray-700">
//                     {history.map((item) => (
//                       <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1 cursor-pointer" onClick={() => loadFromHistory(item)}>
//                             <div className="flex items-center gap-3 mb-2">
//                               <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(item.risk_level)}`}>
//                                 {item.risk_level} Risk
//                               </span>
//                               <span className="text-xs text-gray-500 flex items-center gap-1">
//                                 <Calendar className="w-3 h-3" />
//                                 {new Date(item.created_at).toLocaleDateString()}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-4 text-sm mb-2">
//                               <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
//                                 <UserIcon className="w-3 h-3" />
//                                 {item.patient_name}, {item.patient_age}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
//                               {item.summary.substring(0, 150)}...
//                             </p>
//                           </div>
//                           <div className="flex gap-2 ml-4">
//                             <button
//                               onClick={() => loadFromHistory(item)}
//                               className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
//                               title="View Report"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => deleteHistoryItem(item.id)}
//                               className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           <AnimatePresence mode="wait">
//             {!report ? (
//               <motion.div
//                 key="form"
//                 initial={{ opacity: 0, scale: 0.98 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 1.02 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <HealthForm onSubmit={generateReport} isLoading={isLoading} />
//                 {error && (
//                   <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-center font-medium">
//                     {error}
//                   </div>
//                 )}
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="dashboard"
//                 initial={{ opacity: 0, y: 40 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -40 }}
//                 transition={{ duration: 0.5, ease: 'easeOut' }}
//               >
//                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                   <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">Health Analysis Report</h2>
//                     <div className="flex gap-3">
//                       {report._savedId && (
//                         <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1">
//                           Saved ✓
//                         </span>
//                       )}
//                       <button
//                         onClick={() => setReport(null)}
//                         className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
//                       >
//                         New Analysis
//                       </button>
//                     </div>
//                   </div>
//                   <div className="space-y-6">
//                     {/* Summary */}
//                     <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
//                       <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summary</h3>
//                       <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
//                     </div>

//                     {/* Deep Analysis */}
//                     <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
//                       <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Deep Analysis</h3>
//                       <p className="text-gray-700 dark:text-gray-300">{report.deepAnalysis}</p>
//                     </div>

//                     {/* Risk Assessment */}
//                     {report.riskAssessment && report.riskAssessment.length > 0 && (
//                       <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
//                         <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Risk Assessment</h3>
//                         <div className="space-y-3">
//                           {report.riskAssessment.map((risk, idx) => (
//                             <div key={idx} className="border-b border-red-200 dark:border-red-800 pb-2 last:border-0">
//                               <div className="flex justify-between items-center mb-1">
//                                 <span className="font-medium">{risk.condition}</span>
//                                 <span className={`text-xs px-2 py-1 rounded ${
//                                   risk.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
//                                   risk.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
//                                   'bg-green-200 text-green-800'
//                                 }`}>{risk.riskLevel}</span>
//                               </div>
//                               <p className="text-sm text-gray-600 dark:text-gray-400">{risk.reason}</p>
//                               <p className="text-sm text-green-700 dark:text-green-400 mt-1">Prevention: {risk.prevention}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Diet Recommendations */}
//                     <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
//                       <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Diet Recommendations</h3>
//                       <p className="text-sm font-medium mb-2">Focus: {report.dietRecommendations.focus}</p>
//                       <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
//                         {report.dietRecommendations.recommendations.map((rec, idx) => (
//                           <li key={idx}>{rec}</li>
//                         ))}
//                       </ul>
//                     </div>

//                     {/* Exercise Plan */}
//                     <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
//                       <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Exercise Plan</h3>
//                       <p className="text-sm mb-1">Type: {report.exercisePlan.type}</p>
//                       <p className="text-sm mb-2">Frequency: {report.exercisePlan.frequency}</p>
//                       <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
//                         {report.exercisePlan.routine.map((ex, idx) => (
//                           <li key={idx}>{ex}</li>
//                         ))}
//                       </ul>
//                     </div>

//                     {/* Mental Wellness */}
//                     {report.mentalWellness && (
//                       <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
//                         <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">Mental Wellness</h3>
//                         <p className="text-sm mb-2">{report.mentalWellness.assessment}</p>
//                         <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
//                           {report.mentalWellness.advice.map((advice, idx) => (
//                             <li key={idx}>{advice}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}

//                     {/* Preventive Care */}
//                     {report.preventiveCare && report.preventiveCare.length > 0 && (
//                       <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
//                         <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Preventive Care</h3>
//                         <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
//                           {report.preventiveCare.map((care, idx) => (
//                             <li key={idx}>{care}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}

//                     {/* Critical Alert */}
//                     {report.criticalAlert && (
//                       <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl">
//                         <h3 className="font-bold text-red-800 dark:text-red-300 mb-1">⚠️ Critical Alert</h3>
//                         <p className="text-red-700 dark:text-red-400">{report.criticalAlert}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </main>
//     </div>
//   );
// }




// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, History, Eye, Trash2, Calendar, User as UserIcon, Activity, Heart, ShieldAlert } from 'lucide-react';

import Sidebar from '@/components/patient/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import HealthForm, { PatientData as FormPatientData } from '@/components/patient/HealthForm';

// ============================================
// TYPES DEFINED IN SAME FILE
// ============================================

export interface PatientDataForAnalysis{
  name: string;
  age: number;
  gender: string;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: 'mild' | 'moderate' | 'severe';
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: string;
  exerciseFrequency: string;
  chiefComplaint: string;
  additionalNotes?: string;
}

export interface RiskAssessment {
  condition: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
  prevention: string;
}

export interface DietRecommendations {
  focus: string;
  recommendations: string[];
  foodsToAvoid: string[];
}

export interface ExercisePlan {
  type: string;
  frequency: string;
  routine: string[];
  safetyPrecautions: string[];
}

export interface MentalWellness {
  assessment: string;
  advice: string[];
}

export interface HealthAnalysisResponse {
  status: string;
  summary: string;
  deepAnalysis: string;
  riskAssessment: RiskAssessment[];
  dietRecommendations: DietRecommendations;
  exercisePlan: ExercisePlan;
  mentalWellness: MentalWellness;
  preventiveCare: string[];
  criticalAlert: string | null;
  _saved?: boolean;
  _savedId?: number;
}

interface HistoryItem {
  id: number;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  summary: string;
  risk_level: string;
  created_at: string;
  analysis_report: HealthAnalysisResponse;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomePage() {
  const [report, setReport] = useState<HealthAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'lifestyle' | 'alert'>('overview');

  // Get user ID from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      setUserId(user.id || user.patient_id);
    }
  }, []);

  // Load history when showing history panel
  const loadHistory = async () => {
    if (!userId) {
      toast.error('Please login to view history');
      return;
    }

    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/patient/healthplan/history?userId=${userId}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateReport = (formData: FormPatientData) => {
  (async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Map the form data to the shape your API expects
      const patientDataForApi: PatientDataForAnalysis = {
        name: "",  // Not in form – you could add a name field to the form or use a default
        age: formData.age,
        gender: formData.gender,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        respiratoryRate: 16,   // Default – add to form if needed
        temperature: 36.6,     // Default – add to form if needed
        oxygenSaturation: 98,  // Default – add to form if needed
        chronicConditions: formData.diseases || [],
        allergies: formData.allergies || [],
        currentMedications: formData.medications || [],
        symptoms: formData.currentProblems ? [formData.currentProblems] : [],
        symptomDuration: "",   // Not in form – you can add or leave empty
        symptomSeverity: "moderate",
        smokingStatus: formData.smoking ? "current" : "never",
        alcoholConsumption: formData.alcohol ? "occasional" : "none",
        exerciseFrequency: formData.exerciseFrequency,
        chiefComplaint: formData.currentProblems,
        additionalNotes: "",
      };

      const response = await fetch('/api/patient/healthplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData: patientDataForApi, userId, saveToHistory: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to analyze health data.');
      }

      const data = await response.json();
      setReport(data);
      
      if (data._saved) {
        toast.success('Analysis saved to history');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  })();
};

  const loadFromHistory = (item: HistoryItem) => {
    setReport(item.analysis_report);
    setShowHistory(false);
    toast.success('Loaded from history');
  };

  const deleteHistoryItem = async (id: number) => {
    if (!confirm('Delete this analysis?')) return;
    try {
      const response = await fetch(`/api/patient/healthplan/history/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        loadHistory();
        toast.success('Deleted successfully');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
        :root { --font-inter: "Inter", sans-serif; }
        body { font-family: var(--font-inter); }
      `}</style>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
      
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Previous Analyses
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loadingHistory ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No history yet</p>
                    <p className="text-sm">Generate your first analysis to see it here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 cursor-pointer" onClick={() => loadFromHistory(item)}>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(item.risk_level)}`}>
                                {item.risk_level} Risk
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm mb-2">
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <UserIcon className="w-3 h-3" />
                                {item.patient_name}, {item.patient_age}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.summary.substring(0, 150)}...
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => loadFromHistory(item)}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteHistoryItem(item.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!report ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <HealthForm onSubmit={generateReport} isLoading={isLoading} />
                {error && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-center font-medium">
                    {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Health Analysis Report</h2>
                    <div className="flex gap-3">
                      {report._savedId && (
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                        
                        </span>
                      )}
                      <button
                        onClick={() => setReport(null)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        New Analysis
                      </button>
                    </div>
                  </div>

                  {/* Tab Bar */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex gap-1 overflow-x-auto pb-0.5">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                          activeTab === 'overview'
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-b-2 border-green-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        📋 Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('risks')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                          activeTab === 'risks'
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-b-2 border-red-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        ⚠️ Risk Assessment
                      </button>
                      <button
                        onClick={() => setActiveTab('lifestyle')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                          activeTab === 'lifestyle'
                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-b-2 border-amber-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        🍎 Lifestyle & Prevention
                      </button>
                      {report.criticalAlert && (
                        <button
                          onClick={() => setActiveTab('alert')}
                          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                            activeTab === 'alert'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-b-2 border-red-700'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          🚨 Critical Alert
                        </button>
                      )}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summary</h3>
                          <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                          <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Deep Analysis</h3>
                          <p className="text-gray-700 dark:text-gray-300">{report.deepAnalysis}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'risks' && report.riskAssessment && report.riskAssessment.length > 0 && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                        <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Risk Assessment</h3>
                        <div className="space-y-3">
                          {report.riskAssessment.map((risk, idx) => (
                            <div key={idx} className="border-b border-red-200 dark:border-red-800 pb-2 last:border-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{risk.condition}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  risk.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
                                  risk.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-green-200 text-green-800'
                                }`}>{risk.riskLevel}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{risk.reason}</p>
                              <p className="text-sm text-green-700 dark:text-green-400 mt-1">Prevention: {risk.prevention}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'lifestyle' && (
                      <div className="space-y-4">
                        {/* Diet */}
                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">🥗 Diet Recommendations</h3>
                          <p className="text-sm font-medium mb-2">Focus: {report.dietRecommendations.focus}</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {report.dietRecommendations.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Exercise */}
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                          <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">🏃 Exercise Plan</h3>
                          <p className="text-sm mb-1">Type: {report.exercisePlan.type}</p>
                          <p className="text-sm mb-2">Frequency: {report.exercisePlan.frequency}</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {report.exercisePlan.routine.map((ex, idx) => (
                              <li key={idx}>{ex}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Mental Wellness */}
                        {report.mentalWellness && (
                          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                            <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">🧠 Mental Wellness</h3>
                            <p className="text-sm mb-2">{report.mentalWellness.assessment}</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {report.mentalWellness.advice.map((advice, idx) => (
                                <li key={idx}>{advice}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Preventive Care */}
                        {report.preventiveCare && report.preventiveCare.length > 0 && (
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                            <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">🛡️ Preventive Care</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {report.preventiveCare.map((care, idx) => (
                                <li key={idx}>{care}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'alert' && report.criticalAlert && (
                      <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl">
                        <h3 className="font-bold text-red-800 dark:text-red-300 mb-1">⚠️ Critical Alert</h3>
                        <p className="text-red-700 dark:text-red-400">{report.criticalAlert}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}