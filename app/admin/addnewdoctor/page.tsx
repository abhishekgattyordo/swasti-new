// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Header from "@/components/admin/Header";
// import Sidebar from "@/components/admin/Sidebar";
// import { Menu, X } from "lucide-react";
// import {
//   ArrowBack,
//   PersonAdd,
//   Upload,
//   CheckCircle,
//   ErrorOutline,
//   Phone,
//   Email,
//   CalendarToday,
//   Badge,
//   LocalHospital,
//   Home,
//   Language,
//   Work,
//   School,
//   AttachFile,
//   Close,
// } from "@mui/icons-material";
// import { doctorsApi } from "@/lib/api/doctors";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";

// export default function AddNewDoctorPage() {
//   const router = useRouter();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     specialty: "",
//     department: "",
//     licenseNumber: "",
//     dateOfBirth: "",
//     dateJoined: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "",
//     qualifications: [""],
//     experience: "",
//     bio: "",
//     status: "active",
//     avatar: null as File | null,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
//   const [loadingOptions, setLoadingOptions] = useState(true);
// const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

// const isDoctorsEnabled = isMicroFeatureEnabled(
//   MODULE_KEYS.ADMIN,
//   ADMIN_FEATURES.DOCTORS
// );

// useEffect(() => {
//   if (!tenantLoading && !isDoctorsEnabled) {
//     router.push("/unauthorized");
//   }
// }, [tenantLoading]);

//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         setLoadingOptions(true);
       
//         const response = await doctorsApi.getSpecialties();
  
//         // ✅ Correct check: response.success and response.data array
//        if (response?.data && Array.isArray(response.data)) {
//           console.log("Specialties array from API:", response.data);

//           // Extract unique specialty names
//           const specialties = Array.from(
//             new Set(response.data.map((item: any) => item.name)),
//           ).sort() as string[];
//           console.log("Processed specialties:", specialties);
//           setSpecialtyOptions(specialties);

//           // Extract unique department names
//           const departments = Array.from(
//             new Set(
//               response.data.map((item: any) => item.department).filter(Boolean),
//             ),
//           ).sort() as string[];
//           console.log("Processed departments:", departments);
//           setDepartmentOptions(departments);
//         } else {
//          console.error(
//   "Failed to fetch specialties:",
//   response?.data?.message || "Unknown error",
// );
//         }
//       } catch (error) {
//         console.error("Error fetching specialties:", error);
//       } finally {
//         setLoadingOptions(false);
//         console.log("Loading finished. Specialty options:", specialtyOptions);
//       }
//     };
//     fetchOptions();
//   }, []);



//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Clear error for this field
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, avatar: file }));

//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeAvatar = () => {
//     setFormData((prev) => ({ ...prev, avatar: null }));
//     setAvatarPreview(null);
//   };

//   const addQualification = () => {
//     setFormData((prev) => ({
//       ...prev,
//       qualifications: [...prev.qualifications, ""],
//     }));
//   };

//   const updateQualification = (index: number, value: string) => {
//     setFormData((prev) => {
//       const newQualifications = [...prev.qualifications];
//       newQualifications[index] = value;
//       return { ...prev, qualifications: newQualifications };
//     });
//   };

//   const removeQualification = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       qualifications: prev.qualifications.filter((_, i) => i !== index),
//     }));
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.firstName.trim())
//       newErrors.firstName = "First name is required";
//     if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email";
//     }
//     if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
//     if (!formData.specialty) newErrors.specialty = "Specialty is required";
//     if (!formData.department) newErrors.department = "Department is required";
//     if (!formData.licenseNumber.trim())
//       newErrors.licenseNumber = "License number is required";
//     if (!formData.dateJoined) newErrors.dateJoined = "Date joined is required";

//     return newErrors;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const validationErrors = validateForm();

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setIsSubmitting(true);
//     setErrors({}); // Clear previous API errors

//     try {
//       const apiFormData = new FormData();

//       // Append all fields
//       apiFormData.append("firstName", formData.firstName);
//       apiFormData.append("lastName", formData.lastName);
//       apiFormData.append("email", formData.email);
//       apiFormData.append("phone", formData.phone);
//       apiFormData.append("specialty", formData.specialty);
//       apiFormData.append("department", formData.department);
//       apiFormData.append("licenseNumber", formData.licenseNumber);
//       if (formData.dateOfBirth)
//         apiFormData.append("dateOfBirth", formData.dateOfBirth);
//       apiFormData.append("dateJoined", formData.dateJoined);
//       if (formData.address) apiFormData.append("address", formData.address);
//       if (formData.city) apiFormData.append("city", formData.city);
//       if (formData.state) apiFormData.append("state", formData.state);
//       if (formData.zipCode) apiFormData.append("zipCode", formData.zipCode);
//       if (formData.country) apiFormData.append("country", formData.country);

//       // Qualifications array (filter out empty strings)
//       formData.qualifications.forEach((q) => {
//         if (q.trim()) apiFormData.append("qualifications[]", q);
//       });

//       if (formData.experience) {
//         const exp = parseInt(formData.experience, 10);
//         if (!isNaN(exp)) {
//           apiFormData.append("experience", exp.toString()); // still a string, but numeric string
//         }
//       }
//       if (formData.bio) apiFormData.append("bio", formData.bio);
//       apiFormData.append("status", formData.status);
//       if (formData.avatar) apiFormData.append("avatar", formData.avatar);

//       const response = await fetch("/api/doctors", {
//         method: "POST",
//         body: apiFormData,
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         // Handle validation errors from API
//         if (result.errors) {
//           setErrors(result.errors);
//         } else {
//           alert(result.message || "Failed to add doctor");
//         }
//         setIsSubmitting(false);
//         return;
//       }

//       // Success
//       alert("Doctor added successfully!");
//       router.push("/admin/doctorsmanagement");
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("An error occurred. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   if (!tenantLoading && !isDoctorsEnabled) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <div className="text-red-500 text-6xl mb-4">🔒</div>
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//         <p className="text-gray-600">
//           Admin Doctors Management feature is not enabled for {tenant?.name}.
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
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? (
//           <X className="w-5 h-5" />
//         ) : (
//           <Menu className="w-5 h-5" />
//         )}
//       </button>

//       {/* Sidebar Component - Stays on left */}
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       {/* Overlay for mobile sidebar - Kept the same */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <Header />

//         <div className="p-4 lg:p-6">
//           {/* Main Form */}
//           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
//             {/* Form Header */}
//             <div className="p-6 border-b border-slate-200 dark:border-slate-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
//                   <PersonAdd className="text-2xl" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">
//                     Add New Doctor
//                   </h2>
//                   <p className="text-slate-500 dark:text-slate-400 text-sm">
//                     Add new medical practitioner to the system
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                   {/* Left Column - Basic Info */}
//                   <div className="lg:col-span-2 space-y-6">
//                     {/* Personal Information Section */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <Badge className="text-blue-600 dark:text-blue-400" />
//                         Personal Information
//                       </h3>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* First Name */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             First Name *
//                           </label>
//                           <input
//                             type="text"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.firstName
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="Enter first name"
//                           />
//                           {errors.firstName && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.firstName}
//                             </p>
//                           )}
//                         </div>

//                         {/* Last Name */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Last Name *
//                           </label>
//                           <input
//                             type="text"
//                             name="lastName"
//                             value={formData.lastName}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.lastName
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="Enter last name"
//                           />
//                           {errors.lastName && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.lastName}
//                             </p>
//                           )}
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
//                                   ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                   : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                               placeholder="doctor@hospital.com"
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
//                                   ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                   : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                               placeholder="+1 (555) 123-4567"
//                             />
//                           </div>
//                           {errors.phone && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.phone}
//                             </p>
//                           )}
//                         </div>

//                         {/* Date of Birth */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Date of Birth
//                           </label>
//                           <div className="relative">
//                             <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <input
//                               type="date"
//                               name="dateOfBirth"
//                               value={formData.dateOfBirth}
//                               onChange={handleChange}
//                               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             />
//                           </div>
//                         </div>

//                         {/* Date Joined */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Date Joined *
//                           </label>
//                           <div className="relative">
//                             <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                             <input
//                               type="date"
//                               name="dateJoined"
//                               value={formData.dateJoined}
//                               onChange={handleChange}
//                               className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
//                                 errors.dateJoined
//                                   ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                   : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                               } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             />
//                           </div>
//                           {errors.dateJoined && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.dateJoined}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Professional Information Section */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <LocalHospital className="text-blue-600 dark:text-blue-400" />
//                         Professional Information
//                       </h3>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     
//                         {/* Specialty */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Specialty *
//                           </label>
//                           <select
//                             name="specialty"
//                             value={formData.specialty}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.specialty
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                           >
//                             <option value="">Select specialty</option>
//                             {loadingOptions ? (
//                               <option value="" disabled>
//                                 Loading specialties...
//                               </option>
//                             ) : (
//                               specialtyOptions.map((specialty) => (
//                                 <option key={specialty} value={specialty}>
//                                   {specialty}
//                                 </option>
//                               ))
//                             )}
//                           </select>
//                           {errors.specialty && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.specialty}
//                             </p>
//                           )}
//                         </div>

//                         {/* Department */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Department *
//                           </label>
//                           <select
//                             name="department"
//                             value={formData.department}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.department
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                           >
//                             <option value="">Select department</option>
//                             {loadingOptions ? (
//                               <option value="" disabled>
//                                 Loading departments...
//                               </option>
//                             ) : (
//                               departmentOptions.map((department) => (
//                                 <option key={department} value={department}>
//                                   {department}
//                                 </option>
//                               ))
//                             )}
//                           </select>
//                           {errors.department && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.department}
//                             </p>
//                           )}
//                         </div>

//                         {/* License Number */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             License Number *
//                           </label>
//                           <input
//                             type="text"
//                             name="licenseNumber"
//                             value={formData.licenseNumber}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.licenseNumber
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                             placeholder="MED123456"
//                           />
//                           {errors.licenseNumber && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.licenseNumber}
//                             </p>
//                           )}
//                         </div>

//                         {/* Years of Experience */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Years of Experience
//                           </label>
//                           <input
//                             type="number"
//                             name="experience"
//                             value={formData.experience}
//                             onChange={handleChange}
//                             min="0"
//                             max="50"
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="5"
//                           />
//                         </div>
//                       </div>

//                       {/* Qualifications */}
//                       <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Qualifications & Certifications
//                           </label>
//                           <button
//                             type="button"
//                             onClick={addQualification}
//                             className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
//                           >
//                             <School className="text-sm" />
//                             Add Qualification
//                           </button>
//                         </div>

//                         {formData.qualifications.map((qualification, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={qualification}
//                               onChange={(e) =>
//                                 updateQualification(index, e.target.value)
//                               }
//                               className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="e.g., MD, PhD, Board Certification"
//                             />
//                             {formData.qualifications.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => removeQualification(index)}
//                                 className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
//                               >
//                                 <Close className="text-lg" />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                       </div>

//                       {/* Bio */}
//                       <div className="space-y-2">
//                         <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                           Biography
//                         </label>
//                         <textarea
//                           name="bio"
//                           value={formData.bio}
//                           onChange={handleChange}
//                           rows={4}
//                           className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
//                           placeholder="Brief professional biography, areas of expertise, notable achievements..."
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column - Avatar & Address */}
//                   <div className="space-y-6">
//                     {/* Avatar Upload */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                         Profile Photo
//                       </h3>

//                       <div
//                         className={`border-2 ${
//                           avatarPreview
//                             ? "border-slate-200 dark:border-slate-700"
//                             : "border-dashed border-slate-300 dark:border-slate-700"
//                         } rounded-2xl p-6 transition-colors`}
//                       >
//                         {avatarPreview ? (
//                           <div className="space-y-4">
//                             <div className="relative">
//                               <div
//                                 className="w-32 h-32 mx-auto rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-900 shadow-lg"
//                                 style={{
//                                   backgroundImage: `url(${avatarPreview})`,
//                                 }}
//                               ></div>
//                               <button
//                                 type="button"
//                                 onClick={removeAvatar}
//                                 className="absolute top-0 right-1/3 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
//                               >
//                                 <Close className="text-sm" />
//                               </button>
//                             </div>
//                             <p className="text-sm text-center text-slate-600 dark:text-slate-400">
//                               Click to change photo
//                             </p>
//                           </div>
//                         ) : (
//                           <div className="text-center">
//                             <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center mb-4">
//                               <Upload className="text-blue-500 dark:text-blue-400 text-3xl" />
//                             </div>
//                             <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
//                               Upload a professional photo
//                             </p>
//                             <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
//                               JPG, PNG up to 2MB
//                             </p>
//                           </div>
//                         )}

//                         <label className="block">
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleAvatarChange}
//                             className="hidden"
//                           />
//                           <div className="cursor-pointer py-3 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium text-center">
//                             {avatarPreview ? "Change Photo" : "Upload Photo"}
//                           </div>
//                         </label>
//                       </div>
//                     </div>

//                     {/* Address Information */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                         <Home className="text-blue-600 dark:text-blue-400" />
//                         Address Information
//                       </h3>

//                       <div className="space-y-3">
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Street Address
//                           </label>
//                           <input
//                             type="text"
//                             name="address"
//                             value={formData.address}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="123 Medical Center Dr"
//                           />
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               City
//                             </label>
//                             <input
//                               type="text"
//                               name="city"
//                               value={formData.city}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="City"
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               State
//                             </label>
//                             <input
//                               type="text"
//                               name="state"
//                               value={formData.state}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="State"
//                             />
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               ZIP Code
//                             </label>
//                             <input
//                               type="text"
//                               name="zipCode"
//                               value={formData.zipCode}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="12345"
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               Country
//                             </label>
//                             <input
//                               type="text"
//                               name="country"
//                               value={formData.country}
//                               onChange={handleChange}
//                               className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                               placeholder="Country"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                         Status
//                       </h3>

//                       <div className="space-y-3">
//                         <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors">
//                           <input
//                             type="radio"
//                             name="status"
//                             value="active"
//                             checked={formData.status === "active"}
//                             onChange={handleChange}
//                             className="text-blue-600 focus:ring-blue-500"
//                           />
//                           <div>
//                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               Active
//                             </span>
//                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                               Doctor is currently practicing
//                             </p>
//                           </div>
//                         </label>

//                         <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors">
//                           <input
//                             type="radio"
//                             name="status"
//                             value="on-leave"
//                             checked={formData.status === "on-leave"}
//                             onChange={handleChange}
//                             className="text-amber-600 focus:ring-amber-500"
//                           />
//                           <div>
//                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               On Leave
//                             </span>
//                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                               Doctor is temporarily unavailable
//                             </p>
//                           </div>
//                         </label>
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
//                       All information is securely stored and encrypted
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
//                       className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#137fec] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                           Adding Doctor...
//                         </>
//                       ) : (
//                         <>
//                           <PersonAdd className="text-lg" />
//                           Add New Doctor
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



"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X, Mic } from "lucide-react";
import {
  ArrowBack,
  PersonAdd,
  Upload,
  CheckCircle,
  ErrorOutline,
  Phone,
  Email,
  CalendarToday,
  Badge,
  LocalHospital,
  Home,
  Language,
  Work,
  School,
  AttachFile,
  Close,
} from "@mui/icons-material";
import { doctorsApi } from "@/lib/api/doctors";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
import EnhancedVoiceInput from "@/components/ui/EnhancedVoiceInput";

export default function AddNewDoctorPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    department: "",
    licenseNumber: "",
    dateOfBirth: "",
    dateJoined: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    qualifications: [""],
    experience: "",
    bio: "",
    status: "active",
    avatar: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isDoctorsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.ADMIN,
    ADMIN_FEATURES.DOCTORS
  );

  useEffect(() => {
    if (!tenantLoading && !isDoctorsEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const response = await doctorsApi.getSpecialties();
        if (response?.data && Array.isArray(response.data)) {
          const specialties = Array.from(
            new Set(response.data.map((item: any) => item.name)),
          ).sort() as string[];
          setSpecialtyOptions(specialties);

          const departments = Array.from(
            new Set(
              response.data.map((item: any) => item.department).filter(Boolean),
            ),
          ).sort() as string[];
          setDepartmentOptions(departments);
        }
      } catch (error) {
        console.error("Error fetching specialties:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleVoiceInput = (fieldName: string, text: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: text }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, ""],
    }));
  };

  const updateQualification = (index: number, value: string) => {
    setFormData((prev) => {
      const newQualifications = [...prev.qualifications];
      newQualifications[index] = value;
      return { ...prev, qualifications: newQualifications };
    });
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.specialty) newErrors.specialty = "Specialty is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!formData.dateJoined) newErrors.dateJoined = "Date joined is required";

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
      const apiFormData = new FormData();

      apiFormData.append("firstName", formData.firstName);
      apiFormData.append("lastName", formData.lastName);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("specialty", formData.specialty);
      apiFormData.append("department", formData.department);
      apiFormData.append("licenseNumber", formData.licenseNumber);
      if (formData.dateOfBirth)
        apiFormData.append("dateOfBirth", formData.dateOfBirth);
      apiFormData.append("dateJoined", formData.dateJoined);
      if (formData.address) apiFormData.append("address", formData.address);
      if (formData.city) apiFormData.append("city", formData.city);
      if (formData.state) apiFormData.append("state", formData.state);
      if (formData.zipCode) apiFormData.append("zipCode", formData.zipCode);
      if (formData.country) apiFormData.append("country", formData.country);

      formData.qualifications.forEach((q) => {
        if (q.trim()) apiFormData.append("qualifications[]", q);
      });

      if (formData.experience) {
        const exp = parseInt(formData.experience, 10);
        if (!isNaN(exp)) {
          apiFormData.append("experience", exp.toString());
        }
      }
      if (formData.bio) apiFormData.append("bio", formData.bio);
      apiFormData.append("status", formData.status);
      if (formData.avatar) apiFormData.append("avatar", formData.avatar);

      const response = await fetch("/api/doctors", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert(result.message || "Failed to add doctor");
        }
        setIsSubmitting(false);
        return;
      }

      alert("Doctor added successfully!");
      router.push("/admin/doctorstaffmanagement");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!tenantLoading && !isDoctorsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Admin Doctors Management feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <div className="p-4 lg:p-6">
          {/* Voice Mode Toggle - Top Right */}
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

          {/* Main Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                  <PersonAdd className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Add New Doctor
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Add new medical practitioner to the system
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Badge className="text-blue-600 dark:text-blue-400" />
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            First Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.firstName
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="Enter first name"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("firstName", text)}
                                  fieldName="firstName"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.firstName && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Last Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.lastName
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="Enter last name"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("lastName", text)}
                                  fieldName="lastName"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.lastName && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.lastName}
                            </p>
                          )}
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
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="doctor@hospital.com"
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
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="+1 (555) 123-4567"
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

                        {/* Date of Birth */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("dateOfBirth", text)}
                                  fieldName="dateOfBirth"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Date Joined */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Date Joined *
                          </label>
                          <div className="relative">
                            <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              name="dateJoined"
                              value={formData.dateJoined}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                errors.dateJoined
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("dateJoined", text)}
                                  fieldName="dateJoined"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.dateJoined && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.dateJoined}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <LocalHospital className="text-blue-600 dark:text-blue-400" />
                        Professional Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Specialty */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Specialty *
                          </label>
                          <select
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.specialty
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                          >
                            <option value="">Select specialty</option>
                            {loadingOptions ? (
                              <option value="" disabled>
                                Loading specialties...
                              </option>
                            ) : (
                              specialtyOptions.map((specialty) => (
                                <option key={specialty} value={specialty}>
                                  {specialty}
                                </option>
                              ))
                            )}
                          </select>
                          {errors.specialty && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.specialty}
                            </p>
                          )}
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Department *
                          </label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.department
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                          >
                            <option value="">Select department</option>
                            {loadingOptions ? (
                              <option value="" disabled>
                                Loading departments...
                              </option>
                            ) : (
                              departmentOptions.map((department) => (
                                <option key={department} value={department}>
                                  {department}
                                </option>
                              ))
                            )}
                          </select>
                          {errors.department && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.department}
                            </p>
                          )}
                        </div>

                        {/* License Number */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            License Number *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.licenseNumber
                                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                  : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="MED123456"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("licenseNumber", text)}
                                  fieldName="licenseNumber"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                          {errors.licenseNumber && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.licenseNumber}
                            </p>
                          )}
                        </div>

                        {/* Years of Experience */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Years of Experience
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              min="0"
                              max="50"
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="5"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => {
                                    const num = text.match(/\d+/);
                                    handleVoiceInput("experience", num ? num[0] : text);
                                  }}
                                  fieldName="experience"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Qualifications & Certifications
                          </label>
                          <button
                            type="button"
                            onClick={addQualification}
                            className="text-sm text-[#137fec] hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <School className="text-sm" />
                            Add Qualification
                          </button>
                        </div>

                        {formData.qualifications.map((qualification, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={qualification}
                                onChange={(e) =>
                                  updateQualification(index, e.target.value)
                                }
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="e.g., MD, PhD, Board Certification"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => updateQualification(index, text)}
                                    fieldName={`qualification_${index}`}
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                            {formData.qualifications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQualification(index)}
                                className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              >
                                <Close className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Biography
                        </label>
                        <div className="relative">
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none ${
                              voiceMode ? "pr-12" : ""
                            }`}
                            placeholder="Brief professional biography, areas of expertise, notable achievements..."
                          />
                          {voiceMode && (
                            <div className="absolute right-2 top-4">
                              <EnhancedVoiceInput
                                onTranscript={(text) => handleVoiceInput("bio", text)}
                                fieldName="bio"
                                disabled={isSubmitting}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Avatar & Address */}
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Profile Photo
                      </h3>

                      <div
                        className={`border-2 ${
                          avatarPreview
                            ? "border-slate-200 dark:border-slate-700"
                            : "border-dashed border-slate-300 dark:border-slate-700"
                        } rounded-2xl p-6 transition-colors`}
                      >
                        {avatarPreview ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <div
                                className="w-32 h-32 mx-auto rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-900 shadow-lg"
                                style={{
                                  backgroundImage: `url(${avatarPreview})`,
                                }}
                              ></div>
                              <button
                                type="button"
                                onClick={removeAvatar}
                                className="absolute top-0 right-1/3 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                              >
                                <Close className="text-sm" />
                              </button>
                            </div>
                            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                              Click to change photo
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 flex items-center justify-center mb-4">
                              <Upload className="text-blue-500 dark:text-blue-400 text-3xl" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              Upload a professional photo
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                              JPG, PNG up to 2MB
                            </p>
                          </div>
                        )}

                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <div className="cursor-pointer py-3 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium text-center">
                            {avatarPreview ? "Change Photo" : "Upload Photo"}
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Home className="text-blue-600 dark:text-blue-400" />
                        Address Information
                      </h3>

                      <div className="space-y-3">
                        {/* Street Address */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Street Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                voiceMode ? "pr-12" : ""
                              }`}
                              placeholder="123 Medical Center Dr"
                            />
                            {voiceMode && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <EnhancedVoiceInput
                                  onTranscript={(text) => handleVoiceInput("address", text)}
                                  fieldName="address"
                                  disabled={isSubmitting}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* City */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              City
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="City"
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
                          </div>

                          {/* State */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              State
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="State"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => handleVoiceInput("state", text)}
                                    fieldName="state"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ZIP Code & Country */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              ZIP Code
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                                  voiceMode ? "pr-12" : ""
                                }`}
                                placeholder="12345"
                              />
                              {voiceMode && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <EnhancedVoiceInput
                                    onTranscript={(text) => {
                                      const digits = text.replace(/\D/g, '');
                                      handleVoiceInput("zipCode", digits);
                                    }}
                                    fieldName="zipCode"
                                    disabled={isSubmitting}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Country */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Country
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
                                placeholder="Country"
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
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Status
                      </h3>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === "active"}
                            onChange={handleChange}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Active
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Doctor is currently practicing
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value="on-leave"
                            checked={formData.status === "on-leave"}
                            onChange={handleChange}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              On Leave
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Doctor is temporarily unavailable
                            </p>
                          </div>
                        </label>
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
                      All information is securely stored and encrypted
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
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#137fec] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding Doctor...
                        </>
                      ) : (
                        <>
                          <PersonAdd className="text-lg" />
                          Add New Doctor
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