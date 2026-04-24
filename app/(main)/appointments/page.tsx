


// "use client";

// import { useState, useMemo, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { toast } from "sonner";
// import {
//   Search,
//   SlidersHorizontal,
//   Star,
//   Calendar,
//   CheckCircle2,
//   X,
//   UserX,
//   Video,
//   User,
//   Stethoscope,
//   Heart,
//   Activity,
//   Brain,
//   Bone,
//   Baby,
//   Eye,
//   ArrowUpDown,
//   MapPin,
//   Clock,
//   Verified,
// } from "lucide-react";
// import Header from "@/components/ui/Header";
// import { doctorsApi } from "@/lib/api/doctors";

// // Types
// type SortOption =
//   | "recommended"
//   | "rating"
//   | "experience"
//   | "price-low"
//   | "price-high";

// interface Doctor {
//   id: string;
//   name: string;
//   specialty: string;
//   experience: number;
//   rating: number;
//   reviewCount: number;
//   isVerified: boolean;
//   isOnline: boolean;
//   isPremium: boolean;
//   imageUrl: string;
//   nextAvailableSlots: { time: string }[];
//   consultationFee: number;
//   price: number;
//   profilePhoto: string;
//   nextAvailable: string;
// }

// const specialties = [
//   "Cardiology",
//   "Dermatology",
//   "General Practice",
//   "Pediatrics",
//   "Neurology",
//   "Orthopedics",
//   "Dentistry",
//   "Ophthalmology",
// ];

// // Default placeholder image (only for image loading errors)
// const DEFAULT_AVATAR = "https://via.placeholder.com/400x400?text=Doctor";

// export default function AppointmentBookingPage() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
//   const [onlineOnly, setOnlineOnly] = useState(false);
//   const [premiumOnly, setPremiumOnly] = useState(false);
//   const [sortBy, setSortBy] = useState<SortOption>("recommended");
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchDoctors = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const res = await doctorsApi.getDoctors();
//         console.log("API Response:", res.data);

//         let formattedDoctors: Doctor[] = [];
        
//         if (res.data && Array.isArray(res.data) && res.data.length > 0) {
//           formattedDoctors = res.data.map((doc: any) => {
//             // Validate and construct proper image URL
//             let profilePhoto = "";
//             if (doc.avatar) {
//               // Check if avatar is already a full URL
//               if (doc.avatar.startsWith('http')) {
//                 profilePhoto = doc.avatar;
//               } else {
//                 const avatarPath = doc.avatar.startsWith('/')
//                   ? doc.avatar
//                   : `/${doc.avatar}`;
//                 const baseURL = typeof window !== "undefined"
//                   ? window.location.origin
//                   : process.env.NEXT_PUBLIC_API_URL;
//                 profilePhoto = `${baseURL}${avatarPath}`;
//               }
//             }

//             return {
//               id: doc.id?.toString() || Math.random().toString(),
//               name: `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
//               specialty: doc.specialty || 'General Practice',
//               experience: doc.experience || 5,
//               rating: doc.rating || 4.5,
//               reviewCount: doc.reviewCount || 20,
//               isVerified: doc.isVerified !== undefined ? doc.isVerified : true,
//               isOnline: doc.isOnline !== undefined ? doc.isOnline : true,
//               isPremium: doc.isPremium || false,
//               profilePhoto: profilePhoto,
//               imageUrl: profilePhoto,
//               nextAvailableSlots: [{ time: "10:00 AM" }],
//               consultationFee: doc.consultationFee || 500,
//               price: doc.price || doc.consultationFee || 500,
//               nextAvailable: doc.nextAvailable || "Today",
//             };
//           });
//         }

//         if (formattedDoctors.length === 0) {
//           setError("No doctors found in the system. Please check back later.");
//           setDoctors([]);
//         } else {
//           setDoctors(formattedDoctors);
//         }
//       } catch (error) {
//         console.error("Error fetching doctors:", error);
//         setError("Failed to load doctors. Please try again later.");
//         toast.error("Failed to load doctors. Please try again.");
//         setDoctors([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   const filteredAndSortedDoctors = useMemo(() => {
//     const filtered = doctors.filter((doctor) => {
//       const matchesSearch =
//         searchQuery === "" ||
//         doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

//       const matchesSpecialty =
//         selectedSpecialty === "" ||
//         doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

//       const matchesOnline = !onlineOnly || doctor.isOnline;
//       const matchesPremium = !premiumOnly || doctor.isPremium;

//       return matchesSearch && matchesSpecialty && matchesOnline && matchesPremium;
//     });

//     return filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "rating":
//           return b.rating - a.rating;
//         case "experience":
//           return b.experience - a.experience;
//         case "price-low":
//           return a.price - b.price;
//         case "price-high":
//           return b.price - a.price;
//         default:
//           return 0;
//       }
//     });
//   }, [doctors, searchQuery, selectedSpecialty, onlineOnly, premiumOnly, sortBy]);

//   const clearFilters = () => {
//     setSearchQuery("");
//     setSelectedSpecialty("");
//     setOnlineOnly(false);
//     setPremiumOnly(false);
//     setSortBy("recommended");
//   };

//   const handleImageError = (doctorId: string) => {
//     setImageErrors(prev => ({ ...prev, [doctorId]: true }));
//   };

//   const FiltersSection = () => (
//     <div className="space-y-6">
//       {/* Search Bar - Moved to sidebar */}
//       <div>
//         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
//           Search
//         </h3>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <Input
//             placeholder="Search doctors..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-9 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
//           />
//         </div>
//       </div>

//       <div>
//         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
//           Specialty
//         </h3>
//         <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
//           <button
//             onClick={() => setSelectedSpecialty("")}
//             className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
//               selectedSpecialty === ""
//                 ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
//                 : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
//             }`}
//           >
//             All Specialties
//           </button>
//           {specialties.map((specialty) => (
//             <button
//               key={specialty}
//               onClick={() => setSelectedSpecialty(specialty)}
//               className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
//                 selectedSpecialty === specialty
//                   ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
//                   : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
//               }`}
//             >
//               {specialty}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div>
//         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
//           Filters
//         </h3>
//         <div className="space-y-3">
//           <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
//             <input
//               type="checkbox"
//               checked={onlineOnly}
//               onChange={(e) => setOnlineOnly(e.target.checked)}
//               className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
//             />
//             <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//               Online Doctors Only
//             </span>
//           </label>
//           <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
//             <input
//               type="checkbox"
//               checked={premiumOnly}
//               onChange={(e) => setPremiumOnly(e.target.checked)}
//               className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
//             />
//             <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
//               <CheckCircle2 className="w-4 h-4 text-yellow-500" />
//               Premium Doctors Only
//             </span>
//           </label>
//         </div>
//       </div>

//       {/* Sort Options in Sidebar for Mobile */}
//       <div className="lg:hidden">
//         <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
//           Sort By
//         </h3>
//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value as SortOption)}
//           className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//         >
//           <option value="recommended">Recommended</option>
//           <option value="rating">Highest Rated</option>
//           <option value="experience">Most Experienced</option>
//           <option value="price-low">Price: Low to High</option>
//           <option value="price-high">Price: High to Low</option>
//         </select>
//       </div>

//       <Button
//         variant="outline"
//         onClick={clearFilters}
//         className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//       >
//         Clear All Filters
//       </Button>
//     </div>
//   );

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Header />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <div className="text-center">
//             <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600 dark:text-gray-400">Loading doctors...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <Header />

//       {/* Mobile Filters Toggle */}
//       <div className="lg:hidden px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
//         <p className="text-gray-600 dark:text-gray-400">
//           <span className="font-semibold text-gray-900 dark:text-white">
//             {filteredAndSortedDoctors.length}
//           </span>{" "}
//           doctors found
//         </p>
//         <Button
//           onClick={() => setShowMobileFilters(true)}
//           variant="outline"
//           className="flex items-center gap-2"
//         >
//           <SlidersHorizontal className="w-4 h-4" />
//           Filters
//         </Button>
//       </div>

//       {/* Mobile Filters Sidebar */}
//       {showMobileFilters && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setShowMobileFilters(false)}
//         >
//           <div
//             className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                 Filters
//               </h2>
//               <button onClick={() => setShowMobileFilters(false)}>
//                 <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
//               </button>
//             </div>
//             <FiltersSection />
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex gap-8">
//           {/* Desktop Filters Sidebar - Now includes search */}
//           <aside className="hidden lg:block w-72 flex-shrink-0">
//             <Card className="p-6 sticky top-24 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//               <FiltersSection />
//             </Card>
//           </aside>

//           {/* Doctor Results */}
//           <div className="flex-1">
//             {/* Sort Bar for Desktop */}
//             <div className="hidden lg:flex items-center justify-between mb-6">
//               <p className="text-gray-600 dark:text-gray-400">
//                 <span className="font-semibold text-gray-900 dark:text-white">
//                   {filteredAndSortedDoctors.length}
//                 </span>{" "}
//                 doctors found
//               </p>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   Sort by:
//                 </span>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value as SortOption)}
//                   className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
//                 >
//                   <option value="recommended">Recommended</option>
//                   <option value="rating">Highest Rated</option>
//                   <option value="experience">Most Experienced</option>
//                   <option value="price-low">Price: Low to High</option>
//                   <option value="price-high">Price: High to Low</option>
//                 </select>
//               </div>
//             </div>

//             {/* Error State - No Doctors in System */}
//             {error && doctors.length === 0 && (
//               <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//                 <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <UserX className="w-10 h-10 text-red-500" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   No Doctors Available
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
//                   {error}
//                 </p>
//                 <Button
//                   onClick={() => window.location.reload()}
//                   className="bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   Try Again
//                 </Button>
//               </Card>
//             )}

//             {/* No Results After Filtering */}
//             {!error && filteredAndSortedDoctors.length === 0 && doctors.length > 0 && (
//               <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//                 <UserX className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   No doctors match your filters
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">
//                   Try adjusting your search criteria or clear the filters
//                 </p>
//                 <Button
//                   onClick={clearFilters}
//                   className="bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   Clear All Filters
//                 </Button>
//               </Card>
//             )}

//             {/* No Doctors in System at All */}
//             {!error && doctors.length === 0 && !isLoading && (
//               <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//                 <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Stethoscope className="w-10 h-10 text-yellow-500" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   No Doctors Found
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
//                   There are currently no doctors registered in the system. Please check back later or contact support.
//                 </p>
//                 <Button
//                   onClick={() => window.location.reload()}
//                   className="bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   Refresh
//                 </Button>
//               </Card>
//             )}

//             {/* Display Doctors */}
//             {filteredAndSortedDoctors.length > 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {filteredAndSortedDoctors.map((doctor) => (
//                   <Card
//                     key={doctor.id}
//                     className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-colors"
//                   >
//                     <div className="flex flex-col sm:flex-row">
//                       <div className="relative sm:w-40 h-48 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-800">
//                         {doctor.profilePhoto && !imageErrors[doctor.id] ? (
//                           <Image
//                             src={doctor.profilePhoto}
//                             alt={doctor.name}
//                             fill
//                             sizes="(max-width: 640px) 160px, 160px"
//                             className="object-cover"
//                             unoptimized={true}
//                             onError={() => handleImageError(doctor.id)}
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center">
//                             <User className="w-12 h-12 text-gray-400" />
//                           </div>
//                         )}
//                         {doctor.isOnline && (
//                           <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
//                             <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
//                             Online
//                           </div>
//                         )}
//                         {doctor.isPremium && (
//                           <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
//                             Premium
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex-1 p-5">
//                         <div className="flex items-start justify-between mb-2">
//                           <div>
//                             <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
//                               {doctor.name}
//                               {doctor.isVerified && (
//                                 <Verified className="w-5 h-5 text-green-600" />
//                               )}
//                             </h3>
//                             <p className="text-sm text-green-600 dark:text-green-400">
//                               {doctor.specialty}
//                             </p>
//                           </div>
//                         </div>

//                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
//                           {doctor.experience} years experience
//                         </p>

//                         <div className="flex items-center gap-1 mb-4">
//                           <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
//                           <span className="text-sm font-medium text-gray-900 dark:text-white">
//                             {doctor.rating}
//                           </span>
//                           <span className="text-sm text-gray-500 dark:text-gray-400">
//                             ({doctor.reviewCount} reviews)
//                           </span>
//                         </div>

//                         <div className="flex items-center gap-2 mb-4 text-sm">
//                           <Calendar className="w-4 h-4 text-gray-400" />
//                           <span className="text-gray-600 dark:text-gray-400">
//                             Next available:{" "}
//                             <span className="font-medium text-gray-900 dark:text-white">
//                               {doctor.nextAvailable}
//                             </span>
//                           </span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div>
//                             <span className="text-sm text-gray-500 dark:text-gray-400">
//                               Consultation Fee
//                             </span>
//                             <p className="text-lg font-bold text-gray-900 dark:text-white">
//                               ₹{doctor.price}
//                             </p>
//                           </div>
//                           <Link href={`/booking/${doctor.id}`}>
//                             <Button className="bg-green-600 hover:bg-green-700 text-white">
//                               Book Now
//                             </Button>
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Star,
  Calendar,
  CheckCircle2,
  X,
  UserX,
  Video,
  User,
  Stethoscope,
  Heart,
  Activity,
  Brain,
  Bone,
  Baby,
  Eye,
  ArrowUpDown,
  MapPin,
  Clock,
  Verified,
} from "lucide-react";
import Header from "@/components/ui/Header";
import { doctorsApi } from "@/lib/api/doctors";

// Types
type SortOption =
  | "recommended"
  | "rating"
  | "experience"
  | "price-low"
  | "price-high";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isOnline: boolean;
  isPremium: boolean;
  imageUrl: string;
  nextAvailableSlots: { time: string }[];
  consultationFee: number;
  price: number;
  profilePhoto: string;
  nextAvailable: string;
}

const specialties = [
  "Cardiology",
  "Dermatology",
  "General Practice",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Dentistry",
  "Ophthalmology",
];

// Default placeholder image (only for image loading errors)
const DEFAULT_AVATAR = "https://via.placeholder.com/400x400?text=Doctor";

export default function AppointmentBookingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await doctorsApi.getDoctors();
        console.log("API Response:", res.data);

        let formattedDoctors: Doctor[] = [];
        
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          formattedDoctors = res.data.map((doc: any) => {
            // Validate and construct proper image URL
            let profilePhoto = "";
            if (doc.avatar) {
              // Check if avatar is already a full URL
              if (doc.avatar.startsWith('http')) {
                profilePhoto = doc.avatar;
              } else {
                const avatarPath = doc.avatar.startsWith('/')
                  ? doc.avatar
                  : `/${doc.avatar}`;
                const baseURL = typeof window !== "undefined"
                  ? window.location.origin
                  : process.env.NEXT_PUBLIC_API_URL;
                profilePhoto = `${baseURL}${avatarPath}`;
              }
            }

            return {
              id: doc.id?.toString() || Math.random().toString(),
              name: `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
              specialty: doc.specialty || 'General Practice',
              experience: doc.experience || 5,
              rating: doc.rating || 4.5,
              reviewCount: doc.reviewCount || 20,
              isVerified: doc.isVerified !== undefined ? doc.isVerified : true,
              isOnline: doc.isOnline !== undefined ? doc.isOnline : true,
              isPremium: doc.isPremium || false,
              profilePhoto: profilePhoto,
              imageUrl: profilePhoto,
              nextAvailableSlots: [{ time: "10:00 AM" }],
              consultationFee: doc.consultationFee || 500,
              price: doc.price || doc.consultationFee || 500,
              nextAvailable: doc.nextAvailable || "Today",
            };
          });
        }

        if (formattedDoctors.length === 0) {
          setError("No doctors found in the system. Please check back later.");
          setDoctors([]);
        } else {
          setDoctors(formattedDoctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError("Failed to load doctors. Please try again later.");
        toast.error("Failed to load doctors. Please try again.");
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredAndSortedDoctors = useMemo(() => {
    const filtered = doctors.filter((doctor) => {
      const matchesSearch =
        searchQuery === "" ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === "" ||
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesOnline = !onlineOnly || doctor.isOnline;

      return matchesSearch && matchesSpecialty && matchesOnline;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.experience - a.experience;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [doctors, searchQuery, selectedSpecialty, onlineOnly, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setOnlineOnly(false);
    setSortBy("recommended");
  };

  const handleImageError = (doctorId: string) => {
    setImageErrors(prev => ({ ...prev, [doctorId]: true }));
  };

  const FiltersSection = () => (
    <div className="space-y-6">
      {/* Search Bar - Moved to sidebar */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Specialty
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          <button
            onClick={() => setSelectedSpecialty("")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedSpecialty === ""
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            All Specialties
          </button>
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedSpecialty === specialty
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Filters
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Online Doctors Only
            </span>
          </label>
        </div>
      </div>

      {/* Sort Options in Sidebar for Mobile */}
      <div className="lg:hidden">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="recommended">Recommended</option>
          <option value="rating">Highest Rated</option>
          <option value="experience">Most Experienced</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
      >
        Clear All Filters
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Mobile Filters Toggle */}
      <div className="lg:hidden px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {filteredAndSortedDoctors.length}
          </span>{" "}
          doctors found
        </p>
        <Button
          onClick={() => setShowMobileFilters(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Mobile Filters Sidebar */}
      {showMobileFilters && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <FiltersSection />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar - Now includes search */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="p-6 sticky top-24 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <FiltersSection />
            </Card>
          </aside>

          {/* Doctor Results */}
          <div className="flex-1">
            {/* Sort Bar for Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredAndSortedDoctors.length}
                </span>{" "}
                doctors found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Error State - No Doctors in System */}
            {error && doctors.length === 0 && (
              <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserX className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Doctors Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Try Again
                </Button>
              </Card>
            )}

            {/* No Results After Filtering */}
            {!error && filteredAndSortedDoctors.length === 0 && doctors.length > 0 && (
              <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <UserX className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No doctors match your filters
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or clear the filters
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Clear All Filters
                </Button>
              </Card>
            )}

            {/* No Doctors in System at All */}
            {!error && doctors.length === 0 && !isLoading && (
              <Card className="p-12 text-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Doctors Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  There are currently no doctors registered in the system. Please check back later or contact support.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Refresh
                </Button>
              </Card>
            )}

            {/* Display Doctors */}
            {filteredAndSortedDoctors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-40 h-48 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {doctor.profilePhoto && !imageErrors[doctor.id] ? (
                          <Image
                            src={doctor.profilePhoto}
                            alt={doctor.name}
                            fill
                            sizes="(max-width: 640px) 160px, 160px"
                            className="object-cover"
                            unoptimized={true}
                            onError={() => handleImageError(doctor.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {doctor.isOnline && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            Online
                          </div>
                        )}
                        {doctor.isPremium && (
                          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                            Premium
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              {doctor.name}
                              {doctor.isVerified && (
                                <Verified className="w-5 h-5 text-green-600" />
                              )}
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {doctor.specialty}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {doctor.experience} years experience
                        </p>

                        <div className="flex items-center gap-1 mb-4">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doctor.rating}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({doctor.reviewCount} reviews)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Next available:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {doctor.nextAvailable}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Consultation Fee
                            </span>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{doctor.price}
                            </p>
                          </div>
                          <Link href={`/booking/${doctor.id}`}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}