

// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useCases } from '@/context/CasesContext';
// import { 
//   Search, 
//   Plus, 
//   ChevronRight, 
//   Filter, 
//   X, 
//   Sparkles,
//   CheckCircle
// } from 'lucide-react';
// import { SurgeryCase, SurgeryType, PriorityLevel } from '../types';

// export default function CasesDirectory() {
//   const router = useRouter();
//   const { cases, addCase, updateCase } = useCases();

//   const [search, setSearch] = useState('');
//   const [viewTab, setViewTab] = useState<'Active' | 'Discharged' | 'All'>('Active');
//   const [statusFilter, setStatusFilter] = useState<string>('All');
//   const [priorityFilter, setPriorityFilter] = useState<string>('All');
//   const [patientSearch, setPatientSearch] = useState('');
//   const [caseIdSearch, setCaseIdSearch] = useState('');
//   const [procedureSearch, setProcedureSearch] = useState('');
//   const [surgeonSearch, setSurgeonSearch] = useState('');
//   const [showModal, setShowModal] = useState(false);

//   const [activeFilters, setActiveFilters] = useState<{ [key: string]: boolean }>({
//     patient: false,
//     caseId: false,
//     procedure: false,
//     priority: false,
//     status: false,
//     surgeon: false,
//   });

//   const toggleFilter = (key: string) => {
//     setActiveFilters(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   // Form states for new case
//   const [formName, setFormName] = useState('');
//   const [formAge, setFormAge] = useState('45');
//   const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
//   const [formBlood, setFormBlood] = useState('O Positive');
//   const [formBed, setFormBed] = useState('Ward B, Bed 14');
//   const [formPhone, setFormPhone] = useState('+91 98765 00000');
  
//   const [formSurgery, setFormSurgery] = useState('');
//   const [formDiagnosis, setFormDiagnosis] = useState('');
//   const [formType, setFormType] = useState<SurgeryType>('Elective');
//   const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
//   const [formDate, setFormDate] = useState('2026-06-28');
//   const [formDuration, setFormDuration] = useState('60');
//   const [formNotes, setFormNotes] = useState('');
//   const [formDoctor, setFormDoctor] = useState('Dr. Devendra Mehta');
//   const [doctorsList, setDoctorsList] = useState<any[]>([]);

//   useEffect(() => {
//     async function fetchDoctors() {
//       try {
//         const response = await fetch('/ot/api/doctors');
//         if (response.ok) {
//           const data = await response.json();
//           setDoctorsList(data);
//           if (data.length > 0) {
//             setFormDoctor(data[0].name);
//           }
//         }
//       } catch (err) {
//         console.error('Failed to fetch doctors:', err);
//       }
//     }
//     fetchDoctors();
//   }, []);

//   // Filter logic with safety checks
//   const filteredCases = cases.filter(c => {
//     // Safety: if c is null/undefined, skip it
//     if (!c) return false;
    
//     const matchesGlobal = !search || 
//                           c.patient?.name?.toLowerCase().includes(search.toLowerCase()) || 
//                           c.recommendation?.surgeryName?.toLowerCase().includes(search.toLowerCase()) ||
//                           c.id?.toLowerCase().includes(search.toLowerCase());
    
//     const matchesPatient = !patientSearch || c.patient?.name?.toLowerCase().includes(patientSearch.toLowerCase());
//     const matchesCaseId = !caseIdSearch || c.id?.toLowerCase().includes(caseIdSearch.toLowerCase());
//     const matchesProcedure = !procedureSearch || 
//                              c.recommendation?.surgeryName?.toLowerCase().includes(procedureSearch.toLowerCase()) ||
//                              c.recommendation?.diagnosis?.toLowerCase().includes(procedureSearch.toLowerCase());
    
//     const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
//     const matchesPriority = priorityFilter === 'All' || c.recommendation?.priorityLevel === priorityFilter;
    
//     // ✅ FIX: Safe access with optional chaining and fallback
//     const surgeonVal = c.teamAssignment?.team?.primarySurgeon || c.recommendation?.recommendedBy || 'Unassigned';
//     const matchesSurgeon = !surgeonSearch || surgeonVal.toLowerCase().includes(surgeonSearch.toLowerCase());

//     const isDischarged = c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged';
//     const matchesTab = viewTab === 'All' || (viewTab === 'Discharged' ? isDischarged : !isDischarged);

//     return matchesGlobal && matchesPatient && matchesCaseId && matchesProcedure && matchesStatus && matchesPriority && matchesSurgeon && matchesTab;
//   });

//   const isAnyFilterActive = search !== '' || patientSearch !== '' || caseIdSearch !== '' || procedureSearch !== '' || surgeonSearch !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

//   const handleResetFilters = () => {
//     setSearch('');
//     setPatientSearch('');
//     setCaseIdSearch('');
//     setProcedureSearch('');
//     setSurgeonSearch('');
//     setStatusFilter('All');
//     setPriorityFilter('All');
//     setActiveFilters({
//       patient: false,
//       caseId: false,
//       procedure: false,
//       priority: false,
//       status: false,
//       surgeon: false,
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formName || !formSurgery || !formDiagnosis) {
//       alert("Please fill in the Patient Name, Diagnosis, and Surgery Name.");
//       return;
//     }

//     const newCaseId = `CASE-${Math.floor(100 + Math.random() * 900)}`;

//     const newCaseData: Partial<SurgeryCase> = {
//       id: newCaseId,
//       patient: {
//         id: `P-${Math.floor(500 + Math.random() * 500)}`,
//         name: formName,
//         age: parseInt(formAge),
//         gender: formGender,
//         admissionId: `ADM-${Math.floor(9000 + Math.random() * 999)}`,
//         roomNumber: formBed,
//         phone: formPhone,
//         bloodGroup: formBlood
//       },
//       status: 'Recommended',
//       currentStep: 1,
//       recommendation: {
//         surgeryName: formSurgery,
//         diagnosis: formDiagnosis,
//         surgeryType: formType,
//         expectedDate: formDate,
//         priorityLevel: formPriority,
//         estimatedDuration: parseInt(formDuration),
//         clinicalNotes: formNotes,
//         recommendedBy: formDoctor,
//         recommendedDate: new Date().toISOString().split('T')[0]
//       }
//     };

//     addCase(newCaseData);
//     setShowModal(false);
    
//     // Reset form
//     setFormName('');
//     setFormSurgery('');
//     setFormDiagnosis('');
//     setFormNotes('');

//     // Redirect straight to newly added case workflow
 
//   };

//   const getPriorityBadge = (p: string) => {
//     switch (p) {
//       case 'Immediate': return 'bg-rose-100 text-rose-800 border-rose-200';
//       case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
//       default: return 'bg-sky-100 text-sky-800 border-sky-200';
//     }
//   };

//   const getStepProgress = (c: SurgeryCase) => {
//     if (!c) return 0;
//     if (c.currentStep >= 15 || c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged') {
//       return 100;
//     }
//     return Math.round((c.currentStep / 15) * 100);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Search and Action Bar */}
//       <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
//         <div className="relative flex-1">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
//           <input 
//             type="text"
//             placeholder="Global search by patient name, case ID, or surgical procedure..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-700 text-sm transition"
//           />
//         </div>

//         {/* Global actions */}
//         <div className="flex items-center gap-3">
//           {isAnyFilterActive && (
//             <button
//               onClick={handleResetFilters}
//               className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
//             >
//               <X className="w-4 h-4" /> Clear All Filters
//             </button>
//           )}

//           <button 
//             onClick={() => setShowModal(true)}
//             id="btn-recommend-surgery"
//             className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm shadow-teal-500/10 cursor-pointer"
//           >
//             <Plus className="w-4 h-4" /> Recommend Surgery
//           </button>
//         </div>
//       </div>

//       {/* Surgical Cases Directory - Table View */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         {/* Navigation Tabs for Active vs Discharged patients */}
//         <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
//             <button
//               onClick={() => setViewTab('Active')}
//               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
//                 viewTab === 'Active'
//                   ? 'bg-white text-teal-600 shadow-sm'
//                   : 'text-slate-600 hover:text-slate-900'
//               }`}
//             >
//               <span>Active Patients</span>
//               <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
//                 viewTab === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-700'
//               }`}>
//                 {cases.filter(c => c && c.status !== 'Completed & Discharged' && c.discharge?.status !== 'Discharged').length}
//               </span>
//             </button>
//             <button
//               onClick={() => setViewTab('Discharged')}
//               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
//                 viewTab === 'Discharged'
//                   ? 'bg-white text-emerald-600 shadow-sm'
//                   : 'text-slate-600 hover:text-slate-900'
//               }`}
//             >
//               <span>Discharged Patients</span>
//               <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
//                 viewTab === 'Discharged' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-700'
//               }`}>
//                 {cases.filter(c => c && (c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged')).length}
//               </span>
//             </button>
//             <button
//               onClick={() => setViewTab('All')}
//               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
//                 viewTab === 'All'
//                   ? 'bg-white text-slate-900 shadow-sm'
//                   : 'text-slate-600 hover:text-slate-900'
//               }`}
//             >
//               <span>All Cases</span>
//               <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
//                 viewTab === 'All' ? 'bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-700'
//               }`}>
//                 {cases.length}
//               </span>
//             </button>
//           </div>

//           <div className="text-[11px] text-slate-500 font-medium">
//             Showing <span className="font-bold text-slate-700">{filteredCases.length}</span> of <span className="font-bold text-slate-700">{cases.length}</span> records
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse border border-slate-200">
//             <thead>
//               {/* Primary Header Titles with Grid Lines */}
//               <tr className="bg-slate-50 text-[#1F8F89] text-[11px] font-bold uppercase tracking-wider select-none">
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
//                   <div className="flex items-center justify-between gap-2">
//                     <span>Patient Details</span>
//                     <button
//                       onClick={() => toggleFilter('patient')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.patient || patientSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Patient"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-28">
//                   <div className="flex items-center justify-between gap-2">
//                     <span>Case ID</span>
//                     <button
//                       onClick={() => toggleFilter('caseId')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.caseId || caseIdSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Case ID"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
//                   <div className="flex items-center justify-between gap-2">
//                     <span>Procedure & Diagnosis</span>
//                     <button
//                       onClick={() => toggleFilter('procedure')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.procedure || procedureSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Procedure"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-center w-36">
//                   <div className="flex items-center justify-between gap-2">
//                     <span className="w-full text-center">Priority</span>
//                     <button
//                       onClick={() => toggleFilter('priority')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.priority || priorityFilter !== 'All' ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Priority"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-36">Expected Date</th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
//                   <div className="flex items-center justify-between gap-2">
//                     <span>Surgeon Name</span>
//                     <button
//                       onClick={() => toggleFilter('surgeon')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.surgeon || surgeonSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Surgeon"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-40">Surgery Timing</th>
//                 <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
//                   <div className="flex items-center justify-between gap-2">
//                     <span>Workflow & Progress</span>
//                     <button
//                       onClick={() => toggleFilter('status')}
//                       className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
//                         activeFilters.status || statusFilter !== 'All' ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                       title="Filter Status"
//                     >
//                       <Filter className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-3 px-4 border-b border-slate-200 text-right w-36">Actions</th>
//               </tr>
              
//               {/* Secondary Inline Filters Header Row */}
//               <tr className="bg-slate-50/50 border-b border-slate-200">
//                 {/* Patient Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.patient || patientSearch ? (
//                     <div className="relative animate-fade-in">
//                       <input 
//                         type="text"
//                         placeholder="Filter patient..."
//                         value={patientSearch}
//                         onChange={(e) => setPatientSearch(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
//                         autoFocus
//                       />
//                       {patientSearch && (
//                         <button 
//                           onClick={() => setPatientSearch('')}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Case ID Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.caseId || caseIdSearch ? (
//                     <div className="relative animate-fade-in">
//                       <input 
//                         type="text"
//                         placeholder="Filter ID..."
//                         value={caseIdSearch}
//                         onChange={(e) => setCaseIdSearch(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-mono text-slate-700 transition shadow-sm"
//                         autoFocus
//                       />
//                       {caseIdSearch && (
//                         <button 
//                           onClick={() => setCaseIdSearch('')}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Procedure/Diagnosis Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.procedure || procedureSearch ? (
//                     <div className="relative animate-fade-in">
//                       <input 
//                         type="text"
//                         placeholder="Filter procedure..."
//                         value={procedureSearch}
//                         onChange={(e) => setProcedureSearch(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
//                         autoFocus
//                       />
//                       {procedureSearch && (
//                         <button 
//                           onClick={() => setProcedureSearch('')}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Priority Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.priority || priorityFilter !== 'All' ? (
//                     <select 
//                       value={priorityFilter}
//                       onChange={(e) => setPriorityFilter(e.target.value)}
//                       className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-600 font-medium cursor-pointer shadow-sm animate-fade-in"
//                       autoFocus
//                     >
//                       <option value="All">All Priorities</option>
//                       <option value="Immediate">Immediate</option>
//                       <option value="High">High</option>
//                       <option value="Medium">Medium</option>
//                       <option value="Low">Low</option>
//                     </select>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Expected Date Filter placeholder */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                     (No filter)
//                   </div>
//                 </td>

//                 {/* Surgeon Name Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.surgeon || surgeonSearch ? (
//                     <div className="relative animate-fade-in">
//                       <input 
//                         type="text"
//                         placeholder="Filter surgeon..."
//                         value={surgeonSearch}
//                         onChange={(e) => setSurgeonSearch(e.target.value)}
//                         className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
//                         autoFocus
//                       />
//                       {surgeonSearch && (
//                         <button 
//                           onClick={() => setSurgeonSearch('')}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Surgery Timing Filter placeholder */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                     (No filter)
//                   </div>
//                 </td>

//                 {/* Workflow Status Filter */}
//                 <td className="p-2 border-r border-b border-slate-200">
//                   {activeFilters.status || statusFilter !== 'All' ? (
//                     <select 
//                       value={statusFilter}
//                       onChange={(e) => setStatusFilter(e.target.value)}
//                       className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-600 font-medium cursor-pointer shadow-sm animate-fade-in"
//                       autoFocus
//                     >
//                       <option value="All">All Statuses</option>
//                       <option value="Recommended">Recommended</option>
//                       <option value="Assessment Pending">Assessment Pending</option>
//                       <option value="Team Assigned">Team Assigned</option>
//                       <option value="Scheduled">Scheduled</option>
//                       <option value="OT Day Clearance">Clearance Phase</option>
//                       <option value="In Surgery">In Surgery</option>
//                       <option value="In Recovery">In Recovery</option>
//                       <option value="Completed & Discharged">Discharged</option>
//                     </select>
//                   ) : (
//                     <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
//                       Filter hidden
//                     </div>
//                   )}
//                 </td>

//                 {/* Clear Inline button */}
//                 <td className="p-2 border-b border-slate-200 text-center">
//                   {isAnyFilterActive ? (
//                     <button 
//                       onClick={handleResetFilters}
//                       className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
//                     >
//                       Reset Table
//                     </button>
//                   ) : (
//                     <span className="text-[10px] text-slate-400">Grid active</span>
//                   )}
//                 </td>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {filteredCases.map((c) => {
//                 const progress = getStepProgress(c);
//                 return (
//                   <tr 
//                     key={c.id} 
//                     id={`case-row-${c.id}`}
//                     className="hover:bg-slate-50/50 transition duration-150 text-slate-700"
//                   >
//                     {/* Patient Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200">
//                       <div className="font-semibold text-slate-900 text-sm">{c.patient?.name || 'Unknown'}</div>
//                       <div className="flex gap-2 text-[11px] text-slate-400 mt-0.5">
//                         <span>{c.patient?.age || '?'}y</span>
//                         <span>•</span>
//                         <span>{c.patient?.gender || 'N/A'}</span>
//                         <span>•</span>
//                         <span className="text-[#2BB2A7] font-semibold">{c.patient?.roomNumber || 'N/A'}</span>
//                       </div>
//                     </td>

//                     {/* Case ID Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 font-mono text-xs font-bold text-slate-500">
//                       {c.id || 'N/A'}
//                     </td>

//                     {/* Procedure Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 max-w-xs">
//                       <div className="font-semibold text-slate-800 text-xs truncate" title={c.recommendation?.surgeryName || 'N/A'}>
//                         {c.recommendation?.surgeryName || 'N/A'}
//                       </div>
//                       <div className="text-[11px] text-slate-500 truncate mt-0.5" title={c.recommendation?.diagnosis || 'N/A'}>
//                         {c.recommendation?.diagnosis || 'N/A'}
//                       </div>
//                     </td>

//                     {/* Priority Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 text-center">
//                       <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${getPriorityBadge(c.recommendation?.priorityLevel || 'Medium')}`}>
//                         {c.recommendation?.priorityLevel || 'Medium'}
//                       </span>
//                     </td>

//                     {/* Expected Date Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
//                       {c.recommendation?.expectedDate || 'N/A'}
//                     </td>

//                     {/* Surgeon Name Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 text-xs text-slate-700">
//                       {c.teamAssignment?.team?.primarySurgeon || c.recommendation?.recommendedBy ? (
//                         <span className="font-semibold text-slate-700">
//                           {c.teamAssignment?.team?.primarySurgeon || c.recommendation?.recommendedBy}
//                         </span>
//                       ) : (
//                         <span className="text-slate-400 italic">Unassigned</span>
//                       )}
//                     </td>

//                     {/* Surgery Timing Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200 text-xs text-slate-700">
//                       {c.otScheduling?.startTime ? (
//                         <div className="font-mono font-bold text-[#1F8F89] bg-[#EAF7F4] px-2 py-0.5 rounded border border-[#CDEFEA] inline-block text-[11px]">
//                           {c.otScheduling.startTime} - {c.otScheduling.endTime}
//                         </div>
//                       ) : (
//                         <span className="text-slate-400 italic text-center block">TBD</span>
//                       )}
//                     </td>

//                     {/* Workflow Progress Column */}
//                     <td className="py-3 px-4 border-r border-b border-slate-200">
//                       <div className="flex justify-between items-center text-xs mb-1">
//                         <span className="text-slate-500 font-semibold">
//                           {c.currentStep >= 15 || c.status === 'Completed & Discharged' ? 'Discharged' : `Step ${c.currentStep || 1}/14`}
//                         </span>
//                         <span className="text-[#2BB2A7] font-bold font-mono">{progress}%</span>
//                       </div>
//                       <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-100/50">
//                         <div className="bg-[#2BB2A7] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
//                       </div>
//                       <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
//                         Active: {c.status || 'Unknown'}
//                       </div>
//                     </td>

//                     {/* Actions Column */}
//                     <td className="py-3 px-4 border-b border-slate-200 text-right whitespace-nowrap space-x-2">
                     
//                       <button 
//                         onClick={() => router.push(`/ot/cases/${c.id}`)}
//                         id={`btn-open-workflow-${c.id}`}
//                         className="text-xs bg-slate-900 hover:bg-[#2BB2A7] hover:text-white transition-all text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer"
//                       >
//                         Open Workflow <ChevronRight className="w-3.5 h-3.5" />
//                       </button>
//                       {c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged' ? (
//                         <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-emerald-200">
//                           <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Discharged
//                         </span>
//                       ) : (
//                         <button 
//                           onClick={async () => {
//                             const updated = { ...c };
//                             if (!updated.discharge) {
//                               updated.discharge = { status: 'Pending', summary: {} };
//                             }
//                             if (!updated.discharge.summary) {
//                               updated.discharge.summary = {};
//                             }
//                             if (!updated.discharge.summary.dischargeSummary) {
//                               updated.discharge.summary = {
//                                 surgerySummary: `Uneventful clinical execution of ${c.recommendation?.surgeryName || 'surgery'} by ${c.teamAssignment?.team?.primarySurgeon || c.recommendation?.recommendedBy || 'Assigned Surgeon'}.`,
//                                 otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
//                                 implantDetails: (c.costEstimation?.charges?.implants || 0) > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
//                                 dischargeSummary: `Patient ${c.patient?.name || 'Patient'} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
//                                 medicationPlan: c.postOpOrders?.medications || 'Standard analgesics prescribed.',
//                                 followUpAppointment: c.outcomeTracking?.followUpPlan || 'Outpatient clinic review in 2 weeks.'
//                               };
//                             }
//                             updated.discharge.status = 'Discharged';
//                             updated.discharge.dischargeDate = new Date().toISOString().split('T')[0];
//                             updated.status = 'Completed & Discharged';
//                             updated.currentStep = 15;
//                             await updateCase(updated);
//                           }}
//                           id={`btn-direct-discharge-${c.id}`}
//                           className="text-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer shadow-sm hover:shadow"
//                         >
//                           <CheckCircle className="w-3.5 h-3.5" /> Discharge
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {filteredCases.length === 0 && (
//           <div className="bg-white p-12 text-center text-slate-400 space-y-3">
//             <h4 className="font-semibold text-slate-700">No Surgical Patients Found</h4>
//             <p className="text-xs max-w-sm mx-auto leading-relaxed">No cases match your filter or search query. Click "Recommend Surgery" to inject a new patient into the operating theatre module.</p>
//           </div>
//         )}
//       </div>

//       {/* Recommend Surgery Modal (Step 1) */}
//       {showModal && (
//         <div id="recommend-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
//             {/* Modal Header */}
//             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-teal-400" />
//                 <div>
//                   <h3 className="font-bold text-lg leading-tight">Recommend Patient For Surgery</h3>
//                   <p className="text-xs text-slate-400">Step 1: Clinical Recommendation & Intake Formulation</p>
//                 </div>
//               </div>
//               <button 
//                 onClick={() => setShowModal(false)}
//                 className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Modal Form */}
//             <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
//               {/* Section: Patient Demographics */}
//               <div className="space-y-4">
//                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">1. Patient Demographics & Admission</h4>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Patient Full Name *</label>
//                     <input 
//                       type="text"
//                       required
//                       placeholder="e.g. Anand Gopal"
//                       value={formName}
//                       onChange={(e) => setFormName(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-1">
//                       <label className="text-xs font-semibold text-slate-600 block">Age *</label>
//                       <input 
//                         type="number"
//                         required
//                         value={formAge}
//                         onChange={(e) => setFormAge(e.target.value)}
//                         className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                       />
//                     </div>
//                     <div className="space-y-1">
//                       <label className="text-xs font-semibold text-slate-600 block">Gender *</label>
//                       <select 
//                         value={formGender}
//                         onChange={(e) => setFormGender(e.target.value as any)}
//                         className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                       >
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Blood Group *</label>
//                     <select 
//                       value={formBlood}
//                       onChange={(e) => setFormBlood(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     >
//                       <option value="A Positive">A Positive (A+)</option>
//                       <option value="A Negative">A Negative (A-)</option>
//                       <option value="B Positive">B Positive (B+)</option>
//                       <option value="B Negative">B Negative (B-)</option>
//                       <option value="O Positive">O Positive (O+)</option>
//                       <option value="O Negative">O Negative (O-)</option>
//                       <option value="AB Positive">AB Positive (AB+)</option>
//                       <option value="AB Negative">AB Negative (AB-)</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Ward/Bed Location *</label>
//                     <input 
//                       type="text"
//                       required
//                       value={formBed}
//                       onChange={(e) => setFormBed(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Emergency Contact *</label>
//                     <input 
//                       type="text"
//                       required
//                       value={formPhone}
//                       onChange={(e) => setFormPhone(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Section: Surgery Recommendation */}
//               <div className="space-y-4">
//                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">2. Surgical Recommendation & Procedure</h4>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Surgery / Procedure Name *</label>
//                     <input 
//                       type="text"
//                       required
//                       placeholder="e.g. Laparoscopic Cholecystectomy"
//                       value={formSurgery}
//                       onChange={(e) => setFormSurgery(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Clinical Diagnosis *</label>
//                     <input 
//                       type="text"
//                       required
//                       placeholder="e.g. Cholelithiasis with acute cholecystitis"
//                       value={formDiagnosis}
//                       onChange={(e) => setFormDiagnosis(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Surgery Type</label>
//                     <select 
//                       value={formType}
//                       onChange={(e) => setFormType(e.target.value as SurgeryType)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     >
//                       <option value="Minor">Minor</option>
//                       <option value="Major">Major</option>
//                       <option value="Emergency">Emergency</option>
//                       <option value="Elective">Elective</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Priority Level</label>
//                     <select 
//                       value={formPriority}
//                       onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     >
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                       <option value="Immediate">Immediate</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Expected Date</label>
//                     <input 
//                       type="date"
//                       value={formDate}
//                       onChange={(e) => setFormDate(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600 block">Est. Duration (Mins)</label>
//                     <input 
//                       type="number"
//                       value={formDuration}
//                       onChange={(e) => setFormDuration(e.target.value)}
//                       className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600 block">Clinical Presentation & Indications</label>
//                   <textarea 
//                     rows={3}
//                     placeholder="Describe symptoms, ultrasound/CT findings, and reason for surgery recommendation..."
//                     value={formNotes}
//                     onChange={(e) => setFormNotes(e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500 resize-none"
//                   />
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600 block">Recommending Clinician</label>
//                   <select 
//                     value={formDoctor}
//                     onChange={(e) => setFormDoctor(e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
//                   >
//                     {doctorsList.length > 0 ? (
//                       doctorsList.map((doc: any) => (
//                         <option key={doc.id} value={doc.name}>
//                           {doc.name} ({doc.specialty || doc.role})
//                         </option>
//                       ))
//                     ) : (
//                       <>
//                         <option value="Dr. Devendra Mehta">Dr. Devendra Mehta (General Surgeon)</option>
//                         <option value="Dr. Anjali Deshmukh">Dr. Anjali Deshmukh (Orthopedics)</option>
//                         <option value="Dr. Kabir Fernandez">Dr. Kabir Fernandez (Neurosurgery)</option>
//                       </>
//                     )}
//                   </select>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
//                 <button 
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit"
//                   id="btn-confirm-recommend"
//                   className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-sm font-bold hover:bg-teal-600 transition shadow-md shadow-teal-500/10"
//                 >
//                   Confirm Recommendation
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  Filter, 
  X, 
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { SurgeryCase, SurgeryType, PriorityLevel } from '@/types';

export default function CasesDirectory() {
  const router = useRouter();
  const { cases, addCase, updateCase } = useCases();

  const [search, setSearch] = useState('');
  const [viewTab, setViewTab] = useState<'Active' | 'Discharged' | 'All'>('Active');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [patientSearch, setPatientSearch] = useState('');
  const [caseIdSearch, setCaseIdSearch] = useState('');
  const [procedureSearch, setProcedureSearch] = useState('');
  const [surgeonSearch, setSurgeonSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [activeFilters, setActiveFilters] = useState<{ [key: string]: boolean }>({
    patient: false,
    caseId: false,
    procedure: false,
    priority: false,
    status: false,
    surgeon: false,
  });

  const toggleFilter = (key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Form states for new case
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('45');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formBlood, setFormBlood] = useState('O Positive');
  const [formBed, setFormBed] = useState('Ward B, Bed 14');
  const [formPhone, setFormPhone] = useState('+91 98765 00000');
  
  const [formSurgery, setFormSurgery] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formType, setFormType] = useState<SurgeryType>('Elective');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formDate, setFormDate] = useState('2026-06-28');
  const [formDuration, setFormDuration] = useState('60');
  const [formNotes, setFormNotes] = useState('');
  const [formDoctor, setFormDoctor] = useState('Dr. Devendra Mehta');
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/ot/api/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctorsList(data);
          if (data.length > 0) {
            setFormDoctor(data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    }
    fetchDoctors();
  }, []);

  // Filter logic
  const filteredCases = cases.filter(c => {
    const matchesGlobal = !search || 
                          c.patient.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.recommendation.surgeryName.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesPatient = !patientSearch || c.patient.name.toLowerCase().includes(patientSearch.toLowerCase());
    const matchesCaseId = !caseIdSearch || c.id.toLowerCase().includes(caseIdSearch.toLowerCase());
    const matchesProcedure = !procedureSearch || 
                             c.recommendation.surgeryName.toLowerCase().includes(procedureSearch.toLowerCase()) ||
                             c.recommendation.diagnosis.toLowerCase().includes(procedureSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.recommendation.priorityLevel === priorityFilter;
    
    const surgeonVal = c.teamAssignment?.team?.primarySurgeon || c.recommendation.recommendedBy || 'Unassigned';
    const matchesSurgeon = !surgeonSearch || surgeonVal.toLowerCase().includes(surgeonSearch.toLowerCase());

    const isDischarged = c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged';
    const matchesTab = viewTab === 'All' || (viewTab === 'Discharged' ? isDischarged : !isDischarged);

    return matchesGlobal && matchesPatient && matchesCaseId && matchesProcedure && matchesStatus && matchesPriority && matchesSurgeon && matchesTab;
  });

  const isAnyFilterActive = search !== '' || patientSearch !== '' || caseIdSearch !== '' || procedureSearch !== '' || surgeonSearch !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

  const handleResetFilters = () => {
    setSearch('');
    setPatientSearch('');
    setCaseIdSearch('');
    setProcedureSearch('');
    setSurgeonSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setActiveFilters({
      patient: false,
      caseId: false,
      procedure: false,
      priority: false,
      status: false,
      surgeon: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSurgery || !formDiagnosis) {
      alert("Please fill in the Patient Name, Diagnosis, and Surgery Name.");
      return;
    }

    const newCaseId = `CASE-${Math.floor(100 + Math.random() * 900)}`;

    const newCaseData: Partial<SurgeryCase> = {
      id: newCaseId,
      patient: {
        id: `P-${Math.floor(500 + Math.random() * 500)}`,
        name: formName,
        age: parseInt(formAge),
        gender: formGender,
        admissionId: `ADM-${Math.floor(9000 + Math.random() * 999)}`,
        roomNumber: formBed,
        phone: formPhone,
        bloodGroup: formBlood
      },
      status: 'Recommended',
      currentStep: 1,
      recommendation: {
        surgeryName: formSurgery,
        diagnosis: formDiagnosis,
        surgeryType: formType,
        expectedDate: formDate,
        priorityLevel: formPriority,
        estimatedDuration: parseInt(formDuration),
        clinicalNotes: formNotes,
        recommendedBy: formDoctor,
        recommendedDate: new Date().toISOString().split('T')[0]
      }
    };

    addCase(newCaseData);
    setShowModal(false);
    
    // Reset form
    setFormName('');
    setFormSurgery('');
    setFormDiagnosis('');
    setFormNotes('');

    // Redirect straight to newly added case workflow
    router.push(`/ot/cases/${newCaseId}`);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Immediate': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  const getStepProgress = (c: SurgeryCase) => {
    if (c.currentStep >= 15 || c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged') {
      return 100;
    }
    return Math.round((c.currentStep / 15) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Global search by patient name, case ID, or surgical procedure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-700 text-sm transition"
          />
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          {isAnyFilterActive && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" /> Clear All Filters
            </button>
          )}

          <button 
            onClick={() => setShowModal(true)}
            id="btn-recommend-surgery"
            className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm shadow-teal-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Recommend Surgery
          </button>
        </div>
      </div>

      {/* Surgical Cases Directory - Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs for Active vs Discharged patients */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setViewTab('Active')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
                viewTab === 'Active'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Active Patients</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                viewTab === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {cases.filter(c => c.status !== 'Completed & Discharged' && c.discharge?.status !== 'Discharged').length}
              </span>
            </button>
            <button
              onClick={() => setViewTab('Discharged')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
                viewTab === 'Discharged'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Discharged Patients</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                viewTab === 'Discharged' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {cases.filter(c => c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged').length}
              </span>
            </button>
            <button
              onClick={() => setViewTab('All')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 flex items-center gap-2 cursor-pointer ${
                viewTab === 'All'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Cases</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                viewTab === 'All' ? 'bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {cases.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{filteredCases.length}</span> of <span className="font-bold text-slate-700">{cases.length}</span> records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              {/* Primary Header Titles with Grid Lines */}
              <tr className="bg-slate-50 text-[#1F8F89] text-[11px] font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span>Patient Details</span>
                    <button
                      onClick={() => toggleFilter('patient')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.patient || patientSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Patient"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-28">
                  <div className="flex items-center justify-between gap-2">
                    <span>Case ID</span>
                    <button
                      onClick={() => toggleFilter('caseId')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.caseId || caseIdSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Case ID"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span>Procedure & Diagnosis</span>
                    <button
                      onClick={() => toggleFilter('procedure')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.procedure || procedureSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Procedure"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-center w-36">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-full text-center">Priority</span>
                    <button
                      onClick={() => toggleFilter('priority')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.priority || priorityFilter !== 'All' ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Priority"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-36">Expected Date</th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span>Surgeon Name</span>
                    <button
                      onClick={() => toggleFilter('surgeon')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.surgeon || surgeonSearch ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Surgeon"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left w-40">Surgery Timing</th>
                <th className="py-3 px-4 border-r border-b border-slate-200 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span>Workflow & Progress</span>
                    <button
                      onClick={() => toggleFilter('status')}
                      className={`p-1 rounded hover:bg-slate-200/75 transition-all cursor-pointer ${
                        activeFilters.status || statusFilter !== 'All' ? 'text-[#2BB2A7] bg-[#EAF7F4] scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Filter Status"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-b border-slate-200 text-right w-36">Actions</th>
              </tr>
              
              {/* Secondary Inline Filters Header Row */}
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {/* Patient Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.patient || patientSearch ? (
                    <div className="relative animate-fade-in">
                      <input 
                        type="text"
                        placeholder="Filter patient..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
                        autoFocus
                      />
                      {patientSearch && (
                        <button 
                          onClick={() => setPatientSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Case ID Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.caseId || caseIdSearch ? (
                    <div className="relative animate-fade-in">
                      <input 
                        type="text"
                        placeholder="Filter ID..."
                        value={caseIdSearch}
                        onChange={(e) => setCaseIdSearch(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-mono text-slate-700 transition shadow-sm"
                        autoFocus
                      />
                      {caseIdSearch && (
                        <button 
                          onClick={() => setCaseIdSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Procedure/Diagnosis Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.procedure || procedureSearch ? (
                    <div className="relative animate-fade-in">
                      <input 
                        type="text"
                        placeholder="Filter procedure..."
                        value={procedureSearch}
                        onChange={(e) => setProcedureSearch(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
                        autoFocus
                      />
                      {procedureSearch && (
                        <button 
                          onClick={() => setProcedureSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Priority Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.priority || priorityFilter !== 'All' ? (
                    <select 
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-600 font-medium cursor-pointer shadow-sm animate-fade-in"
                      autoFocus
                    >
                      <option value="All">All Priorities</option>
                      <option value="Immediate">Immediate</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Expected Date Filter placeholder */}
                <td className="p-2 border-r border-b border-slate-200">
                  <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                    (No filter)
                  </div>
                </td>

                {/* Surgeon Name Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.surgeon || surgeonSearch ? (
                    <div className="relative animate-fade-in">
                      <input 
                        type="text"
                        placeholder="Filter surgeon..."
                        value={surgeonSearch}
                        onChange={(e) => setSurgeonSearch(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700 transition shadow-sm"
                        autoFocus
                      />
                      {surgeonSearch && (
                        <button 
                          onClick={() => setSurgeonSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Surgery Timing Filter placeholder */}
                <td className="p-2 border-r border-b border-slate-200">
                  <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                    (No filter)
                  </div>
                </td>

                {/* Workflow Status Filter */}
                <td className="p-2 border-r border-b border-slate-200">
                  {activeFilters.status || statusFilter !== 'All' ? (
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-600 font-medium cursor-pointer shadow-sm animate-fade-in"
                      autoFocus
                    >
                      <option value="All">All Statuses</option>
                      <option value="Recommended">Recommended</option>
                      <option value="Assessment Pending">Assessment Pending</option>
                      <option value="Team Assigned">Team Assigned</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="OT Day Clearance">Clearance Phase</option>
                      <option value="In Surgery">In Surgery</option>
                      <option value="In Recovery">In Recovery</option>
                      <option value="Completed & Discharged">Discharged</option>
                    </select>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-1.5 select-none font-medium">
                      Filter hidden
                    </div>
                  )}
                </td>

                {/* Clear Inline button */}
                <td className="p-2 border-b border-slate-200 text-center">
                  {isAnyFilterActive ? (
                    <button 
                      onClick={handleResetFilters}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                    >
                      Reset Table
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Grid active</span>
                  )}
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCases.map((c) => {
                const progress = getStepProgress(c);
                return (
                  <tr 
                    key={c.id} 
                    id={`case-row-${c.id}`}
                    className="hover:bg-slate-50/50 transition duration-150 text-slate-700"
                  >
                    {/* Patient Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200">
                      <div className="font-semibold text-slate-900 text-sm">{c.patient.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                        <div className="flex gap-1.5 items-center">
                          <span>{c.patient.age}y</span>
                          <span>•</span>
                          <span>{c.patient.gender}</span>
                        </div>
                        <div className="text-[#2BB2A7] font-semibold text-[11px] leading-tight">
                          {c.patient.roomNumber}
                        </div>
                      </div>
                    </td>

                    {/* Case ID Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 font-mono text-xs font-bold text-slate-500">
                      {c.id}
                    </td>

                    {/* Procedure Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 max-w-xs">
                      <div className="font-semibold text-slate-800 text-xs truncate" title={c.recommendation.surgeryName}>
                        {c.recommendation.surgeryName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5" title={c.recommendation.diagnosis}>
                        {c.recommendation.diagnosis}
                      </div>
                    </td>

                    {/* Priority Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${getPriorityBadge(c.recommendation.priorityLevel)}`}>
                        {c.recommendation.priorityLevel}
                      </span>
                    </td>

                    {/* Expected Date Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {c.recommendation.expectedDate}
                    </td>

                    {/* Surgeon Name Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 text-xs text-slate-700">
                      {c.teamAssignment?.team?.primarySurgeon || c.recommendation.recommendedBy ? (
                        <span className="font-semibold text-slate-700">
                          {c.teamAssignment?.team?.primarySurgeon || c.recommendation.recommendedBy}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Surgery Timing Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200 text-xs text-slate-700">
                      {c.otScheduling?.startTime ? (
                        <div className="font-mono font-bold text-[#1F8F89] bg-[#EAF7F4] px-2 py-0.5 rounded border border-[#CDEFEA] inline-block text-[11px]">
                          {c.otScheduling.startTime} - {c.otScheduling.endTime}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-center block">TBD</span>
                      )}
                    </td>

                    {/* Workflow Progress Column */}
                    <td className="py-3 px-4 border-r border-b border-slate-200">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500 font-semibold">
                          {c.currentStep >= 15 || c.status === 'Completed & Discharged' ? 'Discharged' : `Step ${c.currentStep}/14`}
                        </span>
                        <span className="text-[#2BB2A7] font-bold font-mono">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-100/50">
                        <div className="bg-[#2BB2A7] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                        Active: {c.status}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 border-b border-slate-200 text-right whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => router.push(`/ot/cases/${c.id}`)}
                        id={`btn-open-workflow-${c.id}`}
                        className="text-xs bg-slate-900 hover:bg-[#2BB2A7] hover:text-white transition-all text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        Open Workflow <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {c.status === 'Completed & Discharged' || c.discharge?.status === 'Discharged' ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Discharged
                        </span>
                      ) : (
                       <button 
  onClick={async () => {
    const updated = { ...c };
    
    // ✅ Initialize discharge with valid status
    if (!updated.discharge) {
      updated.discharge = { 
        status: 'Ready for Discharge', 
        summary: {
          surgerySummary: '',
          otNotes: '',
          implantDetails: '',
          dischargeSummary: '',
          medicationPlan: '',
          followUpAppointment: ''
        }
      };
    }
    
    if (!updated.discharge.summary) {
      updated.discharge.summary = {
        surgerySummary: '',
        otNotes: '',
        implantDetails: '',
        dischargeSummary: '',
        medicationPlan: '',
        followUpAppointment: ''
      };
    }
    
    if (!updated.discharge.summary.dischargeSummary) {
      updated.discharge.summary = {
        surgerySummary: `Uneventful clinical execution of ${c.recommendation?.surgeryName || 'surgery'} by ${c.teamAssignment?.team?.primarySurgeon || c.recommendation?.recommendedBy || 'Assigned Surgeon'}.`,
        otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
        implantDetails: (c.costEstimation?.charges?.implants || 0) > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
        dischargeSummary: `Patient ${c.patient?.name || 'Patient'} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
        medicationPlan: c.postOpOrders?.medications || 'Standard analgesics prescribed.',
        followUpAppointment: c.outcomeTracking?.followUpPlan || 'Outpatient clinic review in 2 weeks.'
      };
    }
    
    // ✅ Set discharge status to 'Discharged'
    updated.discharge.status = 'Discharged';
    updated.discharge.dischargeDate = new Date().toISOString().split('T')[0];
    updated.status = 'Completed & Discharged';
    updated.currentStep = 15;
    
    await updateCase(updated);
  }}
  id={`btn-direct-discharge-${c.id}`}
  className="text-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer shadow-sm hover:shadow"
>
  <CheckCircle className="w-3.5 h-3.5" /> Discharge
</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div className="bg-white p-12 text-center text-slate-400 space-y-3">
            <h4 className="font-semibold text-slate-700">No Surgical Patients Found</h4>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">No cases match your filter or search query. Click "Recommend Surgery" to inject a new patient into the operating theatre module.</p>
          </div>
        )}
      </div>

      {/* Recommend Surgery Modal (Step 1) */}
      {showModal && (
        <div id="recommend-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-lg leading-tight">Recommend Patient For Surgery</h3>
                  <p className="text-xs text-slate-400">Step 1: Clinical Recommendation & Intake Formulation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section: Patient Demographics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">1. Patient Demographics & Admission</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Patient Full Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Anand Gopal"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">Age *</label>
                      <input 
                        type="number"
                        required
                        value={formAge}
                        onChange={(e) => setFormAge(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">Gender *</label>
                      <select 
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Blood Group *</label>
                    <select 
                      value={formBlood}
                      onChange={(e) => setFormBlood(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="A Positive">A Positive (A+)</option>
                      <option value="A Negative">A Negative (A-)</option>
                      <option value="B Positive">B Positive (B+)</option>
                      <option value="B Negative">B Negative (B-)</option>
                      <option value="O Positive">O Positive (O+)</option>
                      <option value="O Negative">O Negative (O-)</option>
                      <option value="AB Positive">AB Positive (AB+)</option>
                      <option value="AB Negative">AB Negative (AB-)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Ward/Bed Location *</label>
                    <input 
                      type="text"
                      required
                      value={formBed}
                      onChange={(e) => setFormBed(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Emergency Contact *</label>
                    <input 
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Surgery Recommendation */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">2. Surgical Recommendation & Procedure</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Surgery / Procedure Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Laparoscopic Cholecystectomy"
                      value={formSurgery}
                      onChange={(e) => setFormSurgery(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Clinical Diagnosis *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Cholelithiasis with acute cholecystitis"
                      value={formDiagnosis}
                      onChange={(e) => setFormDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Surgery Type</label>
                    <select 
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as SurgeryType)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Elective">Elective</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Priority Level</label>
                    <select 
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Immediate">Immediate</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Expected Date</label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Est. Duration (Mins)</label>
                    <input 
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Clinical Presentation & Indications</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe symptoms, ultrasound/CT findings, and reason for surgery recommendation..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Recommending Clinician</label>
                  <select 
                    value={formDoctor}
                    onChange={(e) => setFormDoctor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500"
                  >
                    {doctorsList.length > 0 ? (
                      doctorsList.map((doc: any) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} ({doc.specialty || doc.role})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Dr. Devendra Mehta">Dr. Devendra Mehta (General Surgeon)</option>
                        <option value="Dr. Anjali Deshmukh">Dr. Anjali Deshmukh (Orthopedics)</option>
                        <option value="Dr. Kabir Fernandez">Dr. Kabir Fernandez (Neurosurgery)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  id="btn-confirm-recommend"
                  className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-sm font-bold hover:bg-teal-600 transition shadow-md shadow-teal-500/10"
                >
                  Confirm Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
