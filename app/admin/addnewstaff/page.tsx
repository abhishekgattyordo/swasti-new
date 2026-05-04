// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Header from "@/components/admin/Header";
// import Sidebar from "@/components/admin/Sidebar";
// import { Menu, X } from "lucide-react";
// import {
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
//   School,
//   Close,
// } from "@mui/icons-material";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
// import toast from "react-hot-toast";
// import { staffApi } from "@/lib/api/staff";

// // Mock data for roles and departments
// const roleOptions = [
//   "Helpdesk",
//   "Nurse",
//   "Receptionist",
//   "Lab Technician",
//   "Pharmacist",
//   "Radiology Tech",
//   "Billing Specialist",
//   "Housekeeping",
//   "IT Support",
//   "Admin Assistant",
//   "Security",
//   "Dietitian",
//   "Physiotherapist",
// ];

// const departmentOptions = [
//   "Emergency",
//   "Front Desk",
//   "Laboratory",
//   "Pharmacy",
//   "Radiology",
//   "Billing",
//   "Facilities",
//   "IT",
//   "Administration",
//   "Security",
//   "Nutrition",
//   "Physiotherapy",
// ];

// export default function AddNewStaffPage() {
//   const router = useRouter();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     role: "",
//     department: "",
//     employeeId: "",
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
//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

//   const isDoctorsEnabled = isMicroFeatureEnabled(
//     MODULE_KEYS.ADMIN,
//     ADMIN_FEATURES.DOCTORS
//   );

//   useEffect(() => {
//     if (!tenantLoading && !isDoctorsEnabled) {
//       router.push("/unauthorized");
//     }
//   }, [tenantLoading]);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
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
//       // Validate file type
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//       if (!allowedTypes.includes(file.type)) {
//         toast.error('Please upload a JPG, PNG, or WebP image');
//         return;
//       }

//       // Validate file size (2MB max)
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error('File size must be less than 2MB');
//         return;
//       }

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
//     if (!formData.role) newErrors.role = "Role is required";
//     if (!formData.department) newErrors.department = "Department is required";
//     if (!formData.dateJoined) newErrors.dateJoined = "Date joined is required";

//     return newErrors;
//   };

//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   const validationErrors = validateForm();
//   if (Object.keys(validationErrors).length > 0) {
//     setErrors(validationErrors);
//     return;
//   }

//   try {
//     setIsSubmitting(true);

//     // Filter out empty qualifications
//     const filteredQualifications = formData.qualifications.filter(q => q.trim() !== "");

//     // Create FormData to send both JSON data and file together
//     const formDataToSend = new FormData();
    
//     // Append all text fields
//     formDataToSend.append('firstName', formData.firstName);
//     formDataToSend.append('lastName', formData.lastName);
//     formDataToSend.append('email', formData.email);
//     formDataToSend.append('phone', formData.phone);
//     formDataToSend.append('role', formData.role);
//     formDataToSend.append('department', formData.department);
//     formDataToSend.append('employeeId', formData.employeeId);
//     formDataToSend.append('dateOfBirth', formData.dateOfBirth || '');
//     formDataToSend.append('dateJoined', formData.dateJoined);
//     formDataToSend.append('address', formData.address || '');
//     formDataToSend.append('city', formData.city || '');
//     formDataToSend.append('state', formData.state || '');
//     formDataToSend.append('zipCode', formData.zipCode || '');
//     formDataToSend.append('country', formData.country || '');
//     formDataToSend.append('experience', (formData.experience ? Number(formData.experience) : 0).toString());
//     formDataToSend.append('bio', formData.bio || '');
//     formDataToSend.append('status', formData.status);
    
//     // Append qualifications as JSON string
//     formDataToSend.append('qualifications', JSON.stringify(filteredQualifications));
    
//     // Append avatar file if selected
//     if (formData.avatar) {
//       formDataToSend.append('avatar', formData.avatar);
//       console.log('Avatar file appended:', formData.avatar.name);
//     }

//     console.log('Sending form data with avatar:', formData.avatar ? 'Yes' : 'No');

//     // Send using fetch with FormData (not JSON)
//     const response = await fetch('/api/admin/staff', {
//       method: 'POST',
//       body: formDataToSend,
//     });

//     const result = await response.json();

//     if (!result?.success) {
//       throw new Error(result?.message || "Failed to add staff");
//     }

//     toast.success("Staff member added successfully!");
//     router.push("/admin/staffmanagement");

//   } catch (err: any) {
//     console.error("Error:", err);
//     toast.error(err.message || "Something went wrong");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   if (!tenantLoading && !isDoctorsEnabled) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//           <p className="text-gray-600">
//             Admin Staff Management feature is not enabled for {tenant?.name}.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
//       {/* Mobile Sidebar Toggle */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? (
//           <X className="w-5 h-5" />
//         ) : (
//           <Menu className="w-5 h-5" />
//         )}
//       </button>

//       {/* Sidebar Component */}
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       {/* Overlay for mobile sidebar */}
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
//                     Add New Staff Member
//                   </h2>
//                   <p className="text-slate-500 dark:text-slate-400 text-sm">
//                     Add new staff member to the system
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
//                               placeholder="staff@hospital.com"
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

//                         {/* Employee ID */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Employee ID
//                           </label>
//                           <input
//                             type="text"
//                             name="employeeId"
//                             value={formData.employeeId}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
//                             placeholder="EMP-001"
//                           />
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
//                         {/* Role */}
//                         <div className="space-y-2">
//                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                             Role *
//                           </label>
//                           <select
//                             name="role"
//                             value={formData.role}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2.5 rounded-lg border ${
//                               errors.role
//                                 ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
//                                 : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
//                             } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
//                           >
//                             <option value="">Select role</option>
//                             {roleOptions.map((role) => (
//                               <option key={role} value={role}>
//                                 {role}
//                               </option>
//                             ))}
//                           </select>
//                           {errors.role && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.role}
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
//                             {departmentOptions.map((dept) => (
//                               <option key={dept} value={dept}>
//                                 {dept}
//                               </option>
//                             ))}
//                           </select>
//                           {errors.department && (
//                             <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
//                               <ErrorOutline className="text-xs" />
//                               {errors.department}
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
//                               placeholder="e.g., BSN, RN License, BLS Certified"
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
//                               Staff member is currently working
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
//                               Staff member is temporarily unavailable
//                             </p>
//                           </div>
//                         </label>

//                         <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 cursor-pointer transition-colors">
//                           <input
//                             type="radio"
//                             name="status"
//                             value="inactive"
//                             checked={formData.status === "inactive"}
//                             onChange={handleChange}
//                             className="text-red-600 focus:ring-red-500"
//                           />
//                           <div>
//                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                               Inactive
//                             </span>
//                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                               Staff member is no longer with the organization
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
//                           Adding Staff...
//                         </>
//                       ) : (
//                         <>
//                           <PersonAdd className="text-lg" />
//                           Add New Staff
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
import { Menu, X } from "lucide-react";
import {
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
  School,
  Close,
} from "@mui/icons-material";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
import toast from "react-hot-toast";
import { staffApi } from "@/lib/api/staff";

// Mock data for roles and departments
const roleOptions = [
  "Helpdesk",
  "Nurse",
  "Receptionist",
  "Lab Technician",
  "Pharmacist",
  "Radiology Tech",
  "Billing Specialist",
  "Housekeeping",
  "IT Support",
  "Admin Assistant",
  "Security",
  "Dietitian",
  "Physiotherapist",
];

const departmentOptions = [
  "Emergency",
  "Front Desk",
  "Laboratory",
  "Pharmacy",
  "Radiology",
  "Billing",
  "Facilities",
  "IT",
  "Administration",
  "Security",
  "Nutrition",
  "Physiotherapy",
];

export default function AddNewStaffPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [wardId, setWardId] = useState('');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    employeeId: "",
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
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isDoctorsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.ADMIN,
    ADMIN_FEATURES.DOCTORS
  );

  // Fetch wards
  const fetchWards = async () => {
    try {
      const response = await fetch('/api/bed-config/wards');
      const result = await response.json();
      if (result?.success && result?.data) {
        setWards(result.data);
      } else if (Array.isArray(result)) {
        setWards(result);
      } else if (result?.data) {
        setWards(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    if (!tenantLoading && !isDoctorsEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPG, PNG, or WebP image');
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));

      // Create preview
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
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";
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

    try {
      setIsSubmitting(true);

      // Filter out empty qualifications
      const filteredQualifications = formData.qualifications.filter(q => q.trim() !== "");

      // Create FormData to send both JSON data and file together
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('employeeId', formData.employeeId);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth || '');
      formDataToSend.append('dateJoined', formData.dateJoined);
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('zipCode', formData.zipCode || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('experience', (formData.experience ? Number(formData.experience) : 0).toString());
      formDataToSend.append('bio', formData.bio || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('wardId', wardId);
      
      // Append qualifications as JSON string
      formDataToSend.append('qualifications', JSON.stringify(filteredQualifications));
      
      // Append avatar file if selected
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
        console.log('Avatar file appended:', formData.avatar.name);
      }

      console.log('Sending form data with avatar:', formData.avatar ? 'Yes' : 'No');
      console.log('Ward ID:', wardId);

      // Send using fetch with FormData (not JSON)
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to add staff");
      }

      toast.success("Staff member added successfully!");
      router.push("/admin/staffmanagement");

    } catch (err: any) {
      console.error("Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tenantLoading && !isDoctorsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Admin Staff Management feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Overlay for mobile sidebar */}
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
                    Add New Staff Member
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Add new staff member to the system
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
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.firstName
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                            placeholder="Enter first name"
                          />
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
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.lastName
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                            placeholder="Enter last name"
                          />
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
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                              placeholder="staff@hospital.com"
                            />
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
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                              placeholder="+1 (555) 123-4567"
                            />
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
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            />
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
                              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                            />
                          </div>
                          {errors.dateJoined && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.dateJoined}
                            </p>
                          )}
                        </div>

                        {/* Employee ID */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Employee ID
                          </label>
                          <input
                            type="text"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            placeholder="EMP-001"
                          />
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
                        {/* Role */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Role *
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                              errors.role
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20"
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors`}
                          >
                            <option value="">Select role</option>
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          {errors.role && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.role}
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
                            {departmentOptions.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          {errors.department && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <ErrorOutline className="text-xs" />
                              {errors.department}
                            </p>
                          )}
                        </div>

                        {/* Ward - NEW */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Ward
                          </label>
                          <select
                            name="wardId"
                            value={wardId}
                            onChange={(e) => setWardId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          >
                            <option value="">Select Ward</option>
                            {wards.map((ward: any) => (
                              <option key={ward.id} value={ward.id}>
                                {ward.name} ({ward.type || 'N/A'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Years of Experience */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            min="0"
                            max="50"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            placeholder="5"
                          />
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
                            <input
                              type="text"
                              value={qualification}
                              onChange={(e) =>
                                updateQualification(index, e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                              placeholder="e.g., BSN, RN License, BLS Certified"
                            />
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
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                          placeholder="Brief professional biography, areas of expertise, notable achievements..."
                        />
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
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            placeholder="123 Medical Center Dr"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                              placeholder="City"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                              placeholder="State"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                              placeholder="12345"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-2 focus:ring-blue-500/20 transition-colors"
                              placeholder="Country"
                            />
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
                              Staff member is currently working
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
                              Staff member is temporarily unavailable
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={formData.status === "inactive"}
                            onChange={handleChange}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Inactive
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Staff member is no longer with the organization
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
                          Adding Staff...
                        </>
                      ) : (
                        <>
                          <PersonAdd className="text-lg" />
                          Add New Staff
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