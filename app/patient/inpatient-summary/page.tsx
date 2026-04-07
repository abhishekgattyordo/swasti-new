// // app/in-patient/[id]/page.tsx
// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import Sidebar from '@/components/patient/Sidebar';
// import Header from '@/components/patient/Header';
// import { Menu, X } from 'lucide-react';

// export default function InPatientSummaryPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//       const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const timelineEvents = [
//     {
//       id: 1,
//       date: 'Oct 12, 09:00 AM',
//       title: 'Patient Admitted',
//       description: 'Patient admitted via ER for acute chest pain. Vitals recorded and initial assessment completed by duty resident.',
//       type: 'admission',
//       icon: null,
//       color: 'green',
//     },
//     {
//       id: 2,
//       date: 'Oct 13, 02:00 PM',
//       title: 'Angioplasty Procedure',
//       description: 'Minimally invasive angioplasty performed successfully. Stent placed in LAD artery.',
//       type: 'surgery',
//       icon: 'local_hospital',
//       color: 'green',
//       note: 'No complications observed',
//     },
//     {
//       id: 3,
//       date: 'Oct 14, 10:00 AM',
//       title: 'Moved to General Ward',
//       description: 'Transferred from ICU to Ward 4B for observation and recovery. Patient stable and ambulatory.',
//       type: 'recovery',
//       icon: null,
//       color: 'gray',
//     },
//     {
//       id: 4,
//       date: 'Oct 15, 11:00 AM',
//       title: 'Discharge Complete',
//       description: 'Final vitals checked. Discharge summary handed over. Patient instructed on medication and follow-up visit.',
//       type: 'discharge',
//       icon: 'logout',
//       color: 'gray',
//     },
//   ];

//   const medicalRecords = [
//     {
//       id: 1,
//       title: 'Daily Physician Notes',
//       subtitle: 'Oct 12 - Oct 15 • PDF',
//       icon: 'description',
//     },
//     {
//       id: 2,
//       title: 'Discharge Summary',
//       subtitle: 'Final Report • PDF',
//       icon: 'assignment_turned_in',
//     },
//     {
//       id: 3,
//       title: 'Lab Results',
//       subtitle: 'Blood Work & Imaging • PDF',
//       icon: 'biotech',
//     },
//   ];

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
      
//       {/* Tailwind CSS Configuration - Using same green primary color */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
//         @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
//         @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
//         :root {
//           --font-inter: 'Inter', sans-serif;
//         }
        
//         body {
//           font-family: var(--font-inter);
//         }
//       `}</style>
//   <button
//   className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//   aria-label="Toggle menu"
// >
//   {isSidebarOpen ? (
//     <X className="w-5 h-5" />
//   ) : (
//     <Menu className="w-5 h-5" />
//   )}
// </button>
     
//            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         {/* Header with search */}
       

//         {/* Scrollable Content Area */}
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
        

//           {/* Patient Summary Card */}
//           <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group mb-8">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-green-600/10 transition-colors duration-500"></div>

//             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//               <div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                     James Anderson
//                   </h1>
//                   <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
//                     Discharged
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Admission ID:{' '}
//                   <span className="font-mono text-gray-700 dark:text-gray-300">
//                     #IP-89210-OP
//                   </span>
//                 </p>
//               </div>

//               <div className="flex gap-4">
//                 <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 shadow-sm">
//                   <span className="material-icons text-lg text-green-600 dark:text-green-400">print</span>
//                   Print Summary
//                 </button>
//               </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
//               {/* Primary Consultant */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Primary Consultant
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="relative h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
//                     <Image
//                       src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk4atNpa9iiX5CKkNwBLnQmozGL8xnzN7Aij4zn1jBsRcPKWqmn1TDGV-5UQAK7mq4Yn66hdD_GebmlNIeBtP1hiN1z0yUbwqud67Lv4_X_ZwAo5bdD3Z_tujZBzZZJ7l9eKjUWlJfm0LikYrVSsU8ADmeRLQwhFqUi6Aaja3X6EdJzWhM44lOYVQRiSmLcYBZFM1ttG9-B2na8NHmLuyqTRc1hzDWxio8PMQOfgFuzmKNfwg5gznWhD6c6T0lalSnwPXbH4vhdHw"
//                       alt="Dr. Sarah Jenkins"
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <p className="font-medium text-gray-900 dark:text-white">
//                     Dr. Sarah Jenkins
//                   </p>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-11">
//                   Cardiology Dept.
//                 </p>
//               </div>

//               {/* Ward / Room */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Ward / Room
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     meeting_room
//                   </span>
//                   <span>Ward 4B - Room 202</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   Premium Wing
//                 </p>
//               </div>

//               {/* Admission Date */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Admission Date
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     event_available
//                   </span>
//                   <span>Oct 12, 2023</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   09:15 AM
//                 </p>
//               </div>

//               {/* Discharge Date */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Discharge Date
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     event_busy
//                   </span>
//                   <span>Oct 15, 2023</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   11:00 AM
//                 </p>
//               </div>
//             </div>
//           </section>

//           {/* Two Column Layout: Timeline & Sidebar */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Left Column: Care Timeline */}
//             <div className="lg:col-span-2 space-y-6">
//               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
//                   <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
//                   Hospital Stay Timeline
//                 </h2>

//                 <div className="relative pl-4">
//                   {/* Vertical Line */}
//                   <div className="absolute top-2 bottom-6 left-[27px] w-0.5 bg-gradient-to-b from-green-600/80 to-green-600/10"></div>

//                   {timelineEvents.map((event, index) => (
//                     <div
//                       key={event.id}
//                       className={`relative flex gap-6 ${
//                         index < timelineEvents.length - 1 ? 'pb-12' : ''
//                       } group`}
//                     >
//                       <div className="mt-1 flex-shrink-0 relative">
//                         <div
//                           className={`h-6 w-6 rounded-full ${
//                             event.type === 'surgery'
//                               ? 'bg-green-600'
//                               : 'bg-white dark:bg-gray-800 border-2 ' +
//                                 (event.color === 'green'
//                                   ? 'border-green-600 dark:border-green-500'
//                                   : 'border-gray-300 dark:border-gray-600')
//                           } z-10 relative flex items-center justify-center ${
//                             event.type === 'surgery'
//                               ? 'shadow-[0_0_10px_rgba(22,163,74,0.4)]'
//                               : ''
//                           }`}
//                         >
//                           {event.icon && (
//                             <span className="material-icons text-white text-[14px]">
//                               {event.icon}
//                             </span>
//                           )}
//                           {!event.icon && event.color === 'green' && (
//                             <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex-grow">
//                         <span
//                           className={`text-xs font-semibold ${
//                             event.color === 'green'
//                               ? 'text-green-600 dark:text-green-400'
//                               : 'text-gray-500 dark:text-gray-400'
//                           } mb-1 block`}
//                         >
//                           {event.date}
//                         </span>
//                         <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//                           {event.title}
//                         </h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
//                           {event.description}
//                         </p>

//                         {event.note && (
//                           <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-2 border border-gray-100 dark:border-gray-700">
//                             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//                               <span className="material-icons text-sm text-green-600 dark:text-green-400">
//                                 check_circle
//                               </span>
//                               <span>{event.note}</span>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column: Documents & Billing */}
//             <div className="space-y-6">
//               {/* Documents Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     folder_shared
//                   </span>
//                   Medical Records
//                 </h2>

//                 <div className="space-y-3">
//                   {medicalRecords.map((record) => (
//                     <a
//                       key={record.id}
//                       href="#"
//                       className="group block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-green-200 dark:hover:border-green-900 transition-all duration-200"
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white text-green-600 dark:text-green-400 transition-colors">
//                           <span className="material-icons">{record.icon}</span>
//                         </div>
//                         <div className="flex-grow">
//                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                             {record.title}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                             {record.subtitle}
//                           </p>
//                         </div>
//                         <span className="material-icons text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
//                           download
//                         </span>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>

//               {/* Billing Summary Card */}
//               <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                   Final Bill Summary
//                 </h2>

//                 <div className="flex justify-between items-end mb-2">
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     Total Amount
//                   </span>
//                   <span className="text-xl font-bold text-gray-900 dark:text-white">
//                     $4,250.00
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-end mb-6">
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     Insurance Coverage
//                   </span>
//                   <span className="text-sm font-medium text-green-600 dark:text-green-400">
//                     - $4,250.00
//                   </span>
//                 </div>

//                 <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mb-6">
//                   <div className="flex justify-between items-end">
//                     <span className="text-sm font-bold text-gray-900 dark:text-white">
//                       Patient to Pay
//                     </span>
//                     <span className="text-2xl font-bold text-green-600 dark:text-green-400">$0.00</span>
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Status:{' '}
//                     <span className="text-green-600 dark:text-green-400 font-medium">
//                       Settled
//                     </span>
//                   </p>
//                 </div>

//                 <a
//                   href="#"
//                   className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900 dark:bg-gray-700 text-white dark:text-white font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-600"
//                 >
//                   View Detailed Bill
//                   <span className="material-icons text-sm">arrow_forward</span>
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Footer Disclaimer */}
//           <footer className="mt-12 text-center">
//             <p className="text-xs text-gray-400 max-w-2xl mx-auto">
//               Disclaimer: This inpatient summary is for information management purposes.
//               Always consult official medical records and your healthcare provider for
//               accurate medical advice.
//             </p>
//           </footer>
//         </div>
//       </main>
//     </div>
//   );
// }

// app/in-patient/[id]/page.tsx
// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import Sidebar from '@/components/patient/Sidebar';
// import Header from '@/components/patient/Header';
// import { Menu, X } from 'lucide-react';

// export default function InPatientSummaryPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//       const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const timelineEvents = [
//     {
//       id: 1,
//       date: 'Oct 12, 09:00 AM',
//       title: 'Patient Admitted',
//       description: 'Patient admitted via ER for acute chest pain. Vitals recorded and initial assessment completed by duty resident.',
//       type: 'admission',
//       icon: null,
//       color: 'green',
//     },
//     {
//       id: 2,
//       date: 'Oct 13, 02:00 PM',
//       title: 'Angioplasty Procedure',
//       description: 'Minimally invasive angioplasty performed successfully. Stent placed in LAD artery.',
//       type: 'surgery',
//       icon: 'local_hospital',
//       color: 'green',
//       note: 'No complications observed',
//     },
//     {
//       id: 3,
//       date: 'Oct 14, 10:00 AM',
//       title: 'Moved to General Ward',
//       description: 'Transferred from ICU to Ward 4B for observation and recovery. Patient stable and ambulatory.',
//       type: 'recovery',
//       icon: null,
//       color: 'gray',
//     },
//     {
//       id: 4,
//       date: 'Oct 15, 11:00 AM',
//       title: 'Discharge Complete',
//       description: 'Final vitals checked. Discharge summary handed over. Patient instructed on medication and follow-up visit.',
//       type: 'discharge',
//       icon: 'logout',
//       color: 'gray',
//     },
//   ];

//   const medicalRecords = [
//     {
//       id: 1,
//       title: 'Daily Physician Notes',
//       subtitle: 'Oct 12 - Oct 15 • PDF',
//       icon: 'description',
//     },
//     {
//       id: 2,
//       title: 'Discharge Summary',
//       subtitle: 'Final Report • PDF',
//       icon: 'assignment_turned_in',
//     },
//     {
//       id: 3,
//       title: 'Lab Results',
//       subtitle: 'Blood Work & Imaging • PDF',
//       icon: 'biotech',
//     },
//   ];

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
      
//       {/* Tailwind CSS Configuration - Using same green primary color */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
//         @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
//         @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
//         :root {
//           --font-inter: 'Inter', sans-serif;
//         }
        
//         body {
//           font-family: var(--font-inter);
//         }
//       `}</style>
//   <button
//   className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//   aria-label="Toggle menu"
// >
//   {isSidebarOpen ? (
//     <X className="w-5 h-5" />
//   ) : (
//     <Menu className="w-5 h-5" />
//   )}
// </button>
     
//            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         {/* Header with search */}
       

//         {/* Scrollable Content Area */}
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
        

//           {/* Patient Summary Card */}
//           <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group mb-8">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-green-600/10 transition-colors duration-500"></div>

//             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//               <div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                     James Anderson
//                   </h1>
//                   <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
//                     Discharged
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Admission ID:{' '}
//                   <span className="font-mono text-gray-700 dark:text-gray-300">
//                     #IP-89210-OP
//                   </span>
//                 </p>
//               </div>

//               <div className="flex gap-4">
//                 <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 shadow-sm">
//                   <span className="material-icons text-lg text-green-600 dark:text-green-400">print</span>
//                   Print Summary
//                 </button>
//               </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
//               {/* Primary Consultant */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Primary Consultant
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="relative h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
//                     <Image
//                       src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk4atNpa9iiX5CKkNwBLnQmozGL8xnzN7Aij4zn1jBsRcPKWqmn1TDGV-5UQAK7mq4Yn66hdD_GebmlNIeBtP1hiN1z0yUbwqud67Lv4_X_ZwAo5bdD3Z_tujZBzZZJ7l9eKjUWlJfm0LikYrVSsU8ADmeRLQwhFqUi6Aaja3X6EdJzWhM44lOYVQRiSmLcYBZFM1ttG9-B2na8NHmLuyqTRc1hzDWxio8PMQOfgFuzmKNfwg5gznWhD6c6T0lalSnwPXbH4vhdHw"
//                       alt="Dr. Sarah Jenkins"
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <p className="font-medium text-gray-900 dark:text-white">
//                     Dr. Sarah Jenkins
//                   </p>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-11">
//                   Cardiology Dept.
//                 </p>
//               </div>

//               {/* Ward / Room */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Ward / Room
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     meeting_room
//                   </span>
//                   <span>Ward 4B - Room 202</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   Premium Wing
//                 </p>
//               </div>

//               {/* Admission Date */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Admission Date
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     event_available
//                   </span>
//                   <span>Oct 12, 2023</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   09:15 AM
//                 </p>
//               </div>

//               {/* Discharge Date */}
//               <div>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                   Discharge Date
//                 </p>
//                 <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     event_busy
//                   </span>
//                   <span>Oct 15, 2023</span>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
//                   11:00 AM
//                 </p>
//               </div>
//             </div>
//           </section>

//           {/* Two Column Layout: Timeline & Sidebar */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Left Column: Care Timeline */}
//             <div className="lg:col-span-2 space-y-6">
//               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
//                   <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
//                   Hospital Stay Timeline
//                 </h2>

//                 <div className="relative pl-4">
//                   {/* Vertical Line */}
//                   <div className="absolute top-2 bottom-6 left-[27px] w-0.5 bg-gradient-to-b from-green-600/80 to-green-600/10"></div>

//                   {timelineEvents.map((event, index) => (
//                     <div
//                       key={event.id}
//                       className={`relative flex gap-6 ${
//                         index < timelineEvents.length - 1 ? 'pb-12' : ''
//                       } group`}
//                     >
//                       <div className="mt-1 flex-shrink-0 relative">
//                         <div
//                           className={`h-6 w-6 rounded-full ${
//                             event.type === 'surgery'
//                               ? 'bg-green-600'
//                               : 'bg-white dark:bg-gray-800 border-2 ' +
//                                 (event.color === 'green'
//                                   ? 'border-green-600 dark:border-green-500'
//                                   : 'border-gray-300 dark:border-gray-600')
//                           } z-10 relative flex items-center justify-center ${
//                             event.type === 'surgery'
//                               ? 'shadow-[0_0_10px_rgba(22,163,74,0.4)]'
//                               : ''
//                           }`}
//                         >
//                           {event.icon && (
//                             <span className="material-icons text-white text-[14px]">
//                               {event.icon}
//                             </span>
//                           )}
//                           {!event.icon && event.color === 'green' && (
//                             <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex-grow">
//                         <span
//                           className={`text-xs font-semibold ${
//                             event.color === 'green'
//                               ? 'text-green-600 dark:text-green-400'
//                               : 'text-gray-500 dark:text-gray-400'
//                           } mb-1 block`}
//                         >
//                           {event.date}
//                         </span>
//                         <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//                           {event.title}
//                         </h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
//                           {event.description}
//                         </p>

//                         {event.note && (
//                           <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-2 border border-gray-100 dark:border-gray-700">
//                             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//                               <span className="material-icons text-sm text-green-600 dark:text-green-400">
//                                 check_circle
//                               </span>
//                               <span>{event.note}</span>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column: Documents & Billing */}
//             <div className="space-y-6">
//               {/* Documents Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-xl">
//                     folder_shared
//                   </span>
//                   Medical Records
//                 </h2>

//                 <div className="space-y-3">
//                   {medicalRecords.map((record) => (
//                     <a
//                       key={record.id}
//                       href="#"
//                       className="group block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-green-200 dark:hover:border-green-900 transition-all duration-200"
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white text-green-600 dark:text-green-400 transition-colors">
//                           <span className="material-icons">{record.icon}</span>
//                         </div>
//                         <div className="flex-grow">
//                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                             {record.title}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                             {record.subtitle}
//                           </p>
//                         </div>
//                         <span className="material-icons text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
//                           download
//                         </span>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>

//               {/* Billing Summary Card */}
//               <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
//                   Final Bill Summary
//                 </h2>

//                 <div className="flex justify-between items-end mb-2">
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     Total Amount
//                   </span>
//                   <span className="text-xl font-bold text-gray-900 dark:text-white">
//                     $4,250.00
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-end mb-6">
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     Insurance Coverage
//                   </span>
//                   <span className="text-sm font-medium text-green-600 dark:text-green-400">
//                     - $4,250.00
//                   </span>
//                 </div>

//                 <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mb-6">
//                   <div className="flex justify-between items-end">
//                     <span className="text-sm font-bold text-gray-900 dark:text-white">
//                       Patient to Pay
//                     </span>
//                     <span className="text-2xl font-bold text-green-600 dark:text-green-400">$0.00</span>
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Status:{' '}
//                     <span className="text-green-600 dark:text-green-400 font-medium">
//                       Settled
//                     </span>
//                   </p>
//                 </div>

//                 <a
//                   href="#"
//                   className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900 dark:bg-gray-700 text-white dark:text-white font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-600"
//                 >
//                   View Detailed Bill
//                   <span className="material-icons text-sm">arrow_forward</span>
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Footer Disclaimer */}
//           <footer className="mt-12 text-center">
//             <p className="text-xs text-gray-400 max-w-2xl mx-auto">
//               Disclaimer: This inpatient summary is for information management purposes.
//               Always consult official medical records and your healthcare provider for
//               accurate medical advice.
//             </p>
//           </footer>
//         </div>
//       </main>
//     </div>
//   );
// }

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import InPatientSummaryContent from './content';

export default function InPatientSummaryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <InPatientSummaryContent />
    </Suspense>
  );
}