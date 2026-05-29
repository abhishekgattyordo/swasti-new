

// 'use client';

// import { Suspense } from 'react';
// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Header from '@/components/admin/Header';
// import Sidebar from '@/components/admin/Sidebar';
// import { Menu, X, XCircle } from 'lucide-react';
// import {
//   PersonAdd,
//   Upload,
//   CheckCircle,
//   ErrorOutline,
//   Phone,
//   Email,
//   CalendarToday,
//   Badge,
//   Home,
//   Wc,
//   Bloodtype,
//   LocalHospital,
//   NoteAdd,
//   Close,
//   Info,
// } from '@mui/icons-material';
// import { patientsApi } from '@/lib/api/registration';
// import { toast } from 'sonner';
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";

// function AddNewPatientContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editPatientId = searchParams.get('patientId');
//   const isEditMode = !!editPatientId;

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     fullNameEn: '',
//     fullNameHi: '',
//     dob: '',
//     gender: '',
//     address: '',
//     city: '',
//     state: '',
//     country: 'India',
//     pincode: '',
//     phone: '',
//     email: '',
//     blood_group: '',
//     allergies: [] as string[],
//     chronicConditions: [] as string[],
//     medications: '',
//     insuranceProvider: '',
//     policyNumber: '',
//     validUntil: '',
//     groupId: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   const genders = ['Male', 'Female', 'Other'];
//   const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

//   const isPatientsEnabled = isMicroFeatureEnabled(
//   MODULE_KEYS.ADMIN,
//   ADMIN_FEATURES.PATIENTS
// );

// useEffect(() => {
//   if (!tenantLoading && !isPatientsEnabled) {
//     router.push("/unauthorized");
//   }
// }, [tenantLoading]);

//   // Fetch patient data for edit mode
//   useEffect(() => {
//     if (!isEditMode || !editPatientId) return;

//     const fetchPatient = async () => {
//       setIsLoading(true);
//       setFetchError(null);
//       try {
//         const response = await patientsApi.adminGetPatient(editPatientId);
//         console.log('📦 Edit fetch response:', response); // debug

//         // Try to extract patient data from many possible structures
//         let patientData = null;

//         // Case 1: { success: true, data: { ... } }
//         if (response.data?.success && response.data.data) {
//           patientData = response.data.data;
//         }
//         // Case 2: { data: { ... } } (no success)
//         else if (response.data?.data && typeof response.data.data === 'object') {
//           patientData = response.data.data;
//         }
//         // Case 3: { patient: { ... } }
//         else if (response.data?.patient && typeof response.data.patient === 'object') {
//           patientData = response.data.patient;
//         }
//         // Case 4: direct patient object (has patient_id or id)
//         else if (response.data && typeof response.data === 'object' && 
//                 ('patient_id' in response.data || 'id' in response.data)) {
//           patientData = response.data;
//         }
//         // Case 5: response.data itself is the patient (axios wraps in data)
//         else if (response.data && typeof response.data === 'object' && 
//                 Object.keys(response.data).length > 0) {
//           patientData = response.data;
//         }

//         if (!patientData) {
//           console.error('❌ Could not extract patient data from:', response.data);
//           setFetchError('Failed to load patient data: unexpected response format');
//           return;
//         }

//         // Map database fields to form state
//         setFormData({
//           fullNameEn: patientData.full_name_en || patientData.fullNameEn || '',
//           fullNameHi: patientData.full_name_hi || patientData.fullNameHi || '',
//           dob: patientData.dob ? patientData.dob.split('T')[0] : '',
//           gender: patientData.gender
//             ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1)
//             : '',
//           address: patientData.address || '',
//           city: patientData.city || '',
//           state: patientData.state || '',
//           country: patientData.country || 'India',
//           pincode: patientData.pincode || '',
//           phone: patientData.phone || '',
//           email: patientData.email || '',
//           blood_group: patientData.blood_group || patientData.bloodGroup || '',
//           allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
//           chronicConditions: patientData.chronic_condition ? [patientData.chronic_condition] : patientData.chronicConditions || [],
//           medications: patientData.medications || '',
//           insuranceProvider: patientData.insurance_provider || patientData.insuranceProvider || '',
//           policyNumber: patientData.policy_number || patientData.policyNumber || '',
//           validUntil: patientData.valid_until ? patientData.valid_until.split('T')[0] : '',
//           groupId: patientData.group_id || patientData.groupId || '',
//         });
//       } catch (error) {
//         console.error('🔥 Error fetching patient:', error);
//         setFetchError('An error occurred while fetching patient data.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPatient();
//   }, [isEditMode, editPatientId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const addListItem = (field: 'allergies' | 'chronicConditions') => {
//     setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
//   };

//   const updateListItem = (field: 'allergies' | 'chronicConditions', index: number, value: string) => {
//     setFormData(prev => {
//       const updated = [...prev[field]];
//       updated[index] = value;
//       return { ...prev, [field]: updated };
//     });
//   };

//   const removeListItem = (field: 'allergies' | 'chronicConditions', index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index),
//     }));
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.fullNameEn.trim()) newErrors.fullNameEn = 'Full name is required';
//     if (!formData.dob) newErrors.dob = 'Date of birth is required';
//     if (!formData.gender) newErrors.gender = 'Gender is required';
//     if (!formData.address.trim()) newErrors.address = 'Address is required';
//     if (!formData.city.trim()) newErrors.city = 'City is required';
//     if (!formData.state) newErrors.state = 'State is required';
//     if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }
//     return newErrors;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   const validationErrors = validateForm();
//   if (Object.keys(validationErrors).length > 0) {
//     setErrors(validationErrors);
//     return;
//   }

//   setIsSubmitting(true);
//   setErrors({});

//   try {
//     const payload: any = {
//       fullNameEn: formData.fullNameEn,
//       fullNameHi: formData.fullNameHi || undefined,
//       dob: formData.dob,
//       gender: formData.gender.toLowerCase(),
//       address: formData.address,
//       city: formData.city,
//       state: formData.state,
//       country: formData.country,
//       pincode: formData.pincode,
//       phone: formData.phone,
//       email: formData.email,
//       blood_group: formData.blood_group || undefined,
//       allergies: formData.allergies.filter(a => a.trim() !== ''),
//       chronicConditions: formData.chronicConditions.filter(c => c.trim() !== ''),
//       medications: formData.medications || undefined,
//       insuranceProvider: formData.insuranceProvider || undefined,
//       policyNumber: formData.policyNumber || undefined,
//       validUntil: formData.validUntil || undefined,
//       groupId: formData.groupId || undefined,
//     };

//     if (isEditMode && editPatientId) {
//       payload.patientId = editPatientId;
//     }

//     console.log('Submit payload:', payload);

//     const response = isEditMode
//       ? await patientsApi.adminUpdatePatient(payload)
//       : await patientsApi.adminCreatePatient(payload);

//     // Normalize response (handles both Axios and direct response)
//     const serverResponse = response.data || response;
//     console.log('Server response:', serverResponse);

//     // Success if patientId is present (for create) or success flag is true (for future updates)
//     if (serverResponse.patientId || serverResponse.success) {
//       toast.success(isEditMode ? 'Patient updated successfully!' : 'Patient added successfully!');
//       router.push('/admin/patientmanagement');
//     } else {
//       if (serverResponse.errors) {
//         setErrors(serverResponse.errors);
//       } else {
//         toast.error(serverResponse.message || 'Operation failed');
//       }
//     }
//   } catch (error) {
//     console.error('Submit error:', error);
//     toast.error('An error occurred while saving. Check console.');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
//             <p className="text-gray-600 dark:text-gray-400">Loading patient data...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Error state (e.g., fetch failed)
//   if (fetchError) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//         <main className="flex-1 flex items-center justify-center p-4">
//           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
//             <XCircle className="text-red-500 text-5xl mx-auto mb-4" />
//             <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Failed to Load Patient</h2>
//             <p className="text-red-600 dark:text-red-300 mb-4">{fetchError}</p>
//             <button
//               onClick={() => router.push('/admin/patientmanagement')}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//             >
//               Go to Patient List
//             </button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   if (!tenantLoading && !isPatientsEnabled) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <div className="text-red-500 text-6xl mb-4">🔒</div>
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//         <p className="text-gray-600">
//           Admin Patients Management feature is not enabled for {tenant?.name}.
//         </p>
//       </div>
//     </div>
//   );
// }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
//       {/* Mobile Sidebar Toggle */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-white-600 hover:bg-green-700 text-blue rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//         onClick={toggleSidebar}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//       </button>

//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <Header />

//         <div className="p-4 lg:p-6">
//           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
//             {/* Form Header */}
//             <div className="p-6 border-b border-slate-200 dark:border-slate-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
//                   <PersonAdd className="text-2xl" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">
//                     {isEditMode ? 'Edit Patient' : 'Add New Patient'}
//                   </h2>
//                   <p className="text-slate-500 dark:text-slate-400 text-sm">
//                     {isEditMode ? 'Update patient information' : 'Register a new patient'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                   {/* Left Column - Personal & Medical Info */}
//                   <div className="lg:col-span-2 space-y-6">
//                     {/* Personal Information */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <Badge className="text-emerald-600 dark:text-emerald-400" />
//                         Personal Information
//                       </h3>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Full Name (English) */}
//                         <div className="space-y-2 md:col-span-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Full Name (English) *
//                           </label>
//                           <input
//                             type="text"
//                             name="fullNameEn"
//                             value={formData.fullNameEn}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.fullNameEn
//                                 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                 : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="e.g. Rajesh Kumar"
//                           />
//                           {errors.fullNameEn && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.fullNameEn}
//                             </p>
//                           )}
//                         </div>

//                         {/* Full Name (Hindi) */}
//                         <div className="space-y-2 md:col-span-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             पूरा नाम (हिंदी)
//                           </label>
//                           <input
//                             type="text"
//                             name="fullNameHi"
//                             value={formData.fullNameHi}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="उदा. राजेश कुमार"
//                           />
//                         </div>

//                         {/* Date of Birth */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Date of Birth *
//                           </label>
//                           <div className="relative">
//                             <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <input
//                               type="date"
//                               name="dob"
//                               value={formData.dob}
//                               onChange={handleChange}
//                               className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
//                                 errors.dob
//                                   ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                   : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             />
//                           </div>
//                           {errors.dob && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.dob}
//                             </p>
//                           )}
//                         </div>

//                         {/* Gender */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Gender *
//                           </label>
//                           <div className="relative">
//                             <Wc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <select
//                               name="gender"
//                               value={formData.gender}
//                               onChange={handleChange}
//                               className={`w-full pl-10 pr-4 py-2.5 rounded-lg border appearance-none ${
//                                 errors.gender
//                                   ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                   : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             >
//                               <option value="">Select gender</option>
//                               {genders.map(g => (
//                                 <option key={g} value={g}>{g}</option>
//                               ))}
//                             </select>
//                           </div>
//                           {errors.gender && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.gender}
//                             </p>
//                           )}
//                         </div>

//                         {/* Blood Group */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Blood Group
//                           </label>
//                           <div className="relative">
//                             <Bloodtype className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <select
//                               name="blood_group"
//                               value={formData.blood_group}
//                               onChange={handleChange}
//                               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors appearance-none"
//                             >
//                               <option value="">Select blood group</option>
//                               {bloodGroups.map(bg => (
//                                 <option key={bg} value={bg}>{bg}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>

//                         {/* Email */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Email Address *
//                           </label>
//                           <div className="relative">
//                             <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <input
//                               type="email"
//                               name="email"
//                               value={formData.email}
//                               onChange={handleChange}
//                               className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
//                                 errors.email
//                                   ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                   : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                               placeholder="patient@example.com"
//                             />
//                           </div>
//                           {errors.email && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.email}
//                             </p>
//                           )}
//                         </div>

//                         {/* Phone */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Phone Number *
//                           </label>
//                           <div className="relative">
//                             <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <input
//                               type="tel"
//                               name="phone"
//                               value={formData.phone}
//                               onChange={handleChange}
//                               className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
//                                 errors.phone
//                                   ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                   : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                               placeholder="+91 9876543210"
//                             />
//                           </div>
//                           {errors.phone && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.phone}
//                             </p>
//                           )}
//                         </div>

//                         {/* Address */}
//                         <div className="space-y-2 md:col-span-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Residential Address *
//                           </label>
//                           <textarea
//                             name="address"
//                             value={formData.address}
//                             onChange={handleChange}
//                             rows={3}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.address
//                                 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                 : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors resize-none`}
//                             placeholder="House No, Street, Locality..."
//                           />
//                           {errors.address && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.address}
//                             </p>
//                           )}
//                         </div>

//                         {/* City, State, Pincode, Country */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             City *
//                           </label>
//                           <input
//                             type="text"
//                             name="city"
//                             value={formData.city}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.city
//                                 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                 : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="e.g. Mumbai"
//                           />
//                           {errors.city && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.city}
//                             </p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             State *
//                           </label>
//                           <select
//                             name="state"
//                             value={formData.state}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.state
//                                 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                 : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                           >
//                             <option value="">Select State</option>
//                             <option value="Delhi">Delhi</option>
//                             <option value="Maharashtra">Maharashtra</option>
//                             <option value="Karnataka">Karnataka</option>
//                             <option value="Uttar Pradesh">Uttar Pradesh</option>
//                             <option value="Tamil Nadu">Tamil Nadu</option>
//                             <option value="Gujarat">Gujarat</option>
//                             <option value="West Bengal">West Bengal</option>
//                             <option value="Telangana">Telangana</option>
//                           </select>
//                           {errors.state && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.state}
//                             </p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Pincode *
//                           </label>
//                           <input
//                             type="text"
//                             name="pincode"
//                             value={formData.pincode}
//                             onChange={handleChange}
//                             maxLength={6}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.pincode
//                                 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
//                                 : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="110001"
//                           />
//                           {errors.pincode && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.pincode}
//                             </p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Country *
//                           </label>
//                           <input
//                             type="text"
//                             name="country"
//                             value={formData.country}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="India"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Medical History */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <LocalHospital className="text-emerald-600 dark:text-emerald-400" />
//                         Medical History
//                       </h3>

//                       {/* Allergies */}
//                       <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Allergies
//                           </label>
//                           <button
//                             type="button"
//                             onClick={() => addListItem('allergies')}
//                             className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
//                           >
//                             <NoteAdd className="text-sm" />
//                             Add Allergy
//                           </button>
//                         </div>
//                         {formData.allergies.map((allergy, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={allergy}
//                               onChange={(e) => updateListItem('allergies', index, e.target.value)}
//                               className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="e.g. Penicillin, Peanuts"
//                             />
//                             {formData.allergies.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => removeListItem('allergies', index)}
//                                 className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
//                               >
//                                 <Close className="text-lg" />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                       </div>

//                       {/* Chronic Conditions */}
//                       <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Chronic Conditions
//                           </label>
//                           <button
//                             type="button"
//                             onClick={() => addListItem('chronicConditions')}
//                             className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
//                           >
//                             <NoteAdd className="text-sm" />
//                             Add Condition
//                           </button>
//                         </div>
//                         {formData.chronicConditions.map((condition, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={condition}
//                               onChange={(e) => updateListItem('chronicConditions', index, e.target.value)}
//                               className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="e.g. Diabetes Type 2"
//                             />
//                             {formData.chronicConditions.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => removeListItem('chronicConditions', index)}
//                                 className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
//                               >
//                                 <Close className="text-lg" />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                       </div>

//                       {/* Medications */}
//                       <div className="space-y-2">
//                         <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                           Current Medications & Treatments
//                         </label>
//                         <textarea
//                           name="medications"
//                           value={formData.medications}
//                           onChange={handleChange}
//                           rows={4}
//                           className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
//                           placeholder="List name and dosage (e.g., Metformin 500mg, Daily)..."
//                           maxLength={500}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column - Insurance Details */}
//                   <div className="space-y-6">
//                     {/* Insurance Details */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <Info className="text-emerald-600 dark:text-emerald-400" />
//                         Insurance Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Insurance Provider
//                           </label>
//                           <input
//                             type="text"
//                             name="insuranceProvider"
//                             value={formData.insuranceProvider}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="e.g., LIC, HDFC Ergo"
//                           />
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               Policy Number
//                             </label>
//                             <input
//                               type="text"
//                               name="policyNumber"
//                               value={formData.policyNumber}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="Policy #"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               Valid Until
//                             </label>
//                             <input
//                               type="date"
//                               name="validUntil"
//                               value={formData.validUntil}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             />
//                           </div>
//                         </div>
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Group ID
//                           </label>
//                           <input
//                             type="text"
//                             name="groupId"
//                             value={formData.groupId}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="Group #"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Form Actions */}
//               <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30">
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                   <div className="text-sm text-slate-500 dark:text-slate-400">
//                     <p className="flex items-center gap-2">
//                       <CheckCircle className="text-emerald-500" />
//                       All patient information is securely stored and encrypted
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={() => router.back()}
//                       className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           {isEditMode ? 'Updating...' : 'Adding...'}
//                         </>
//                       ) : (
//                         <>
//                           <PersonAdd className="text-lg" />
//                           {isEditMode ? 'Update Patient' : 'Add New Patient'}
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default function AddNewPatientPage() {
//   return (
//     <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
//       <AddNewPatientContent />
//     </Suspense>
//   );
// }

'use client';

import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { Menu, X, XCircle, Mic } from 'lucide-react';
import {
  PersonAdd,
  Upload,
  CheckCircle,
  ErrorOutline,
  Phone,
  Email,
  CalendarToday,
  Badge,
  Home,
  Wc,
  Bloodtype,
  LocalHospital,
  NoteAdd,
  Close,
  Info,
} from '@mui/icons-material';
import { patientsApi } from '@/lib/api/registration';
import { toast } from 'sonner';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
import EnhancedVoiceInput from "@/components/ui/EnhancedVoiceInput";

function AddNewPatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPatientId = searchParams.get('patientId');
  const isEditMode = !!editPatientId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [formData, setFormData] = useState({
    fullNameEn: '',
    fullNameHi: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    blood_group: '',
    allergies: [] as string[],
    chronicConditions: [] as string[],
    medications: '',
    insuranceProvider: '',
    policyNumber: '',
    validUntil: '',
    groupId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const genders = ['Male', 'Female', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isPatientsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.ADMIN,
    ADMIN_FEATURES.PATIENTS
  );

  useEffect(() => {
    if (!tenantLoading && !isPatientsEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading]);

  // Fetch patient data for edit mode
  useEffect(() => {
    if (!isEditMode || !editPatientId) return;

    const fetchPatient = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await patientsApi.adminGetPatient(editPatientId);
        console.log('📦 Edit fetch response:', response);

        let patientData = null;

        if (response.data?.success && response.data.data) {
          patientData = response.data.data;
        }
        else if (response.data?.data && typeof response.data.data === 'object') {
          patientData = response.data.data;
        }
        else if (response.data?.patient && typeof response.data.patient === 'object') {
          patientData = response.data.patient;
        }
        else if (response.data && typeof response.data === 'object' && 
                ('patient_id' in response.data || 'id' in response.data)) {
          patientData = response.data;
        }
        else if (response.data && typeof response.data === 'object' && 
                Object.keys(response.data).length > 0) {
          patientData = response.data;
        }

        if (!patientData) {
          console.error('❌ Could not extract patient data from:', response.data);
          setFetchError('Failed to load patient data: unexpected response format');
          return;
        }

        setFormData({
          fullNameEn: patientData.full_name_en || patientData.fullNameEn || '',
          fullNameHi: patientData.full_name_hi || patientData.fullNameHi || '',
          dob: patientData.dob ? patientData.dob.split('T')[0] : '',
          gender: patientData.gender
            ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1)
            : '',
          address: patientData.address || '',
          city: patientData.city || '',
          state: patientData.state || '',
          country: patientData.country || 'India',
          pincode: patientData.pincode || '',
          phone: patientData.phone || '',
          email: patientData.email || '',
          blood_group: patientData.blood_group || patientData.bloodGroup || '',
          allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
          chronicConditions: patientData.chronic_condition ? [patientData.chronic_condition] : patientData.chronicConditions || [],
          medications: patientData.medications || '',
          insuranceProvider: patientData.insurance_provider || patientData.insuranceProvider || '',
          policyNumber: patientData.policy_number || patientData.policyNumber || '',
          validUntil: patientData.valid_until ? patientData.valid_until.split('T')[0] : '',
          groupId: patientData.group_id || patientData.groupId || '',
        });
      } catch (error) {
        console.error('🔥 Error fetching patient:', error);
        setFetchError('An error occurred while fetching patient data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [isEditMode, editPatientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVoiceInput = (fieldName: string, text: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: text }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const addListItem = (field: 'allergies' | 'chronicConditions') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field: 'allergies' | 'chronicConditions', index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const removeListItem = (field: 'allergies' | 'chronicConditions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullNameEn.trim()) newErrors.fullNameEn = 'Full name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: any = {
        fullNameEn: formData.fullNameEn,
        fullNameHi: formData.fullNameHi || undefined,
        dob: formData.dob,
        gender: formData.gender.toLowerCase(),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        blood_group: formData.blood_group || undefined,
        allergies: formData.allergies.filter(a => a.trim() !== ''),
        chronicConditions: formData.chronicConditions.filter(c => c.trim() !== ''),
        medications: formData.medications || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        policyNumber: formData.policyNumber || undefined,
        validUntil: formData.validUntil || undefined,
        groupId: formData.groupId || undefined,
      };

      if (isEditMode && editPatientId) {
        payload.patientId = editPatientId;
      }

      console.log('Submit payload:', payload);

      const response = isEditMode
        ? await patientsApi.adminUpdatePatient(payload)
        : await patientsApi.adminCreatePatient(payload);

      const serverResponse = response.data || response;
      console.log('Server response:', serverResponse);

      if (serverResponse.patientId || serverResponse.success) {
        toast.success(isEditMode ? 'Patient updated successfully!' : 'Patient added successfully!');
        router.push('/admin/patientmanagement');
      } else {
        if (serverResponse.errors) {
          setErrors(serverResponse.errors);
        } else {
          toast.error(serverResponse.message || 'Operation failed');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred while saving. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading patient data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
            <XCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Failed to Load Patient</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{fetchError}</p>
            <button
              onClick={() => router.push('/admin/patientmanagement')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Patient List
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!tenantLoading && !isPatientsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Admin Patients Management feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <div className="p-4 lg:p-6">
          {/* Voice Mode Toggle */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setVoiceMode(!voiceMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                voiceMode 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Mic className="w-4 h-4" />
              {voiceMode ? "Voice Mode ON" : "Voice Mode OFF"}
            </button>
          </div>

          {/* Voice Mode Info Banner */}
          {voiceMode && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Voice mode is ON! Click the microphone icon next to any field and speak to fill it automatically.
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
                  <PersonAdd className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEditMode ? 'Edit Patient' : 'Add New Patient'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isEditMode ? 'Update patient information' : 'Register a new patient'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Personal & Medical Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Badge className="text-emerald-600 dark:text-emerald-400" />
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name (English) */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Full Name (English) *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="fullNameEn"
                              value={formData.fullNameEn}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.fullNameEn
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="e.g. Rajesh Kumar"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("fullNameEn", text)}
                                  fieldName="fullNameEn"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.fullNameEn && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.fullNameEn}
                            </p>
                          )}
                        </div>

                        {/* Full Name (Hindi) */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            पूरा नाम (हिंदी)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="fullNameHi"
                              value={formData.fullNameHi}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="उदा. राजेश कुमार"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("fullNameHi", text)}
                                  fieldName="fullNameHi"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Date of Birth *
                          </label>
                          <div className="relative">
                            <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.dob
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("dob", text)}
                                  fieldName="dob"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.dob && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.dob}
                            </p>
                          )}
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Gender *
                          </label>
                          <div className="relative">
                            <Wc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border appearance-none ${
                                errors.gender
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                            >
                              <option value="">Select gender</option>
                              {genders.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          {errors.gender && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.gender}
                            </p>
                          )}
                        </div>

                        {/* Blood Group */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Blood Group
                          </label>
                          <div className="relative">
                            <Bloodtype className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <select
                              name="blood_group"
                              value={formData.blood_group}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors appearance-none"
                            >
                              <option value="">Select blood group</option>
                              {bloodGroups.map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.email
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="patient@example.com"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => {
                                    const cleanEmail = text.replace(/\s/g, '').replace(/at/g, '@').replace(/dot/g, '.');
                                    handleVoiceInput("email", cleanEmail);
                                  }}
                                  fieldName="email"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.email && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.phone
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="+91 9876543210"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => {
                                    const digits = text.replace(/\D/g, '');
                                    handleVoiceInput("phone", digits.slice(0, 10));
                                  }}
                                  fieldName="phone"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.phone && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Residential Address *
                          </label>
                          <div className="relative">
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows={3}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.address
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors resize-none ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="House No, Street, Locality..."
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-4">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("address", text)}
                                  fieldName="address"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.address && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.address}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            City *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.city
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="e.g. Mumbai"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("city", text)}
                                  fieldName="city"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.city && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.city}
                            </p>
                          )}
                        </div>

                        {/* State */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            State *
                          </label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.state
                                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                          >
                            <option value="">Select State</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Telangana">Telangana</option>
                          </select>
                          {errors.state && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.state}
                            </p>
                          )}
                        </div>

                        {/* Pincode */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Pincode *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleChange}
                              maxLength={6}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.pincode
                                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20'
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="110001"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => {
                                    const digits = text.replace(/\D/g, '');
                                    handleVoiceInput("pincode", digits.slice(0, 6));
                                  }}
                                  fieldName="pincode"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.pincode && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.pincode}
                            </p>
                          )}
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Country *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="India"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("country", text)}
                                  fieldName="country"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <LocalHospital className="text-emerald-600 dark:text-emerald-400" />
                        Medical History
                      </h3>

                      {/* Allergies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Allergies
                          </label>
                          <button
                            type="button"
                            onClick={() => addListItem('allergies')}
                            className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <NoteAdd className="text-sm" />
                            Add Allergy
                          </button>
                        </div>
                        {formData.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={allergy}
                                onChange={(e) => updateListItem('allergies', index, e.target.value)}
                                className={`flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="e.g. Penicillin, Peanuts"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => updateListItem('allergies', index, text)}
                                    fieldName={`allergy_${index}`}
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                            {formData.allergies.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeListItem('allergies', index)}
                                className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              >
                                <Close className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Chronic Conditions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Chronic Conditions
                          </label>
                          <button
                            type="button"
                            onClick={() => addListItem('chronicConditions')}
                            className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <NoteAdd className="text-sm" />
                            Add Condition
                          </button>
                        </div>
                        {formData.chronicConditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={condition}
                                onChange={(e) => updateListItem('chronicConditions', index, e.target.value)}
                                className={`flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="e.g. Diabetes Type 2"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => updateListItem('chronicConditions', index, text)}
                                    fieldName={`condition_${index}`}
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                            {formData.chronicConditions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeListItem('chronicConditions', index)}
                                className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              >
                                <Close className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Medications */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Current Medications & Treatments
                        </label>
                        <div className="relative">
                          <textarea
                            name="medications"
                            value={formData.medications}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none ${
                              voiceMode ? "pr-12" : ""
                            }`}
                            placeholder="List name and dosage (e.g., Metformin 500mg, Daily)..."
                            maxLength={500}
                          />
                          {voiceMode && (
                            <div className="absolute right-2 top-4">
                              <EnhancedVoiceInput
                                onTranscript={(text) => handleVoiceInput("medications", text)}
                                fieldName="medications"
                                disabled={isSubmitting}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Insurance Details */}
                  <div className="space-y-6">
                    {/* Insurance Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Info className="text-emerald-600 dark:text-emerald-400" />
                        Insurance Details
                      </h3>
                      <div className="space-y-3">
                        {/* Insurance Provider */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Insurance Provider
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="insuranceProvider"
                              value={formData.insuranceProvider}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="e.g., LIC, HDFC Ergo"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("insuranceProvider", text)}
                                  fieldName="insuranceProvider"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Policy Number */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Policy Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="policyNumber"
                                value={formData.policyNumber}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="Policy #"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => handleVoiceInput("policyNumber", text)}
                                    fieldName="policyNumber"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Valid Until */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Valid Until
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => handleVoiceInput("validUntil", text)}
                                    fieldName="validUntil"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Group ID */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Group ID
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="groupId"
                              value={formData.groupId}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="Group #"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("groupId", text)}
                                  fieldName="groupId"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="text-emerald-500" />
                      All patient information is securely stored and encrypted
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isEditMode ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <PersonAdd className="text-lg" />
                          {isEditMode ? 'Update Patient' : 'Add New Patient'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddNewPatientPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AddNewPatientContent />
    </Suspense>
  );
}