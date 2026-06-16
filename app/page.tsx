// // app/page.tsx

// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';

// import {
//   Video,
//   Calendar,
//   Activity,
//   FlaskConical,
//   Pill,
//   Search,
//   Clock,
//   FileText,
//   Shield,
//   DollarSign,
//   Lock,
//   Zap,
//   Star,
//   CheckCircle2,
//   Heart,
//   Stethoscope,
//   Ambulance,
//   Microscope,
// } from 'lucide-react';
// import Header from '@/components/ui/Header';
// import { Footer } from '@/components/ui/Footer';
// import { useEffect, useState } from 'react';

// // Types for doctor data (matching API)
// interface Doctor {
//   id: number;
//   firstName: string;
//   lastName: string;
//   specialty: string;
//   department: string;
//   email: string;
//   phone: string;
//   status: 'active' | 'on-leave' | 'inactive';
//   rating?: number;
//   reviewCount?: number;
//   profilePhoto?: string;
//   isOnline?: boolean;
// }

// // Helper to get full name
// const getFullName = (doctor: Doctor) => `${doctor.firstName} ${doctor.lastName}`;

// export default function LandingPage() {
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch doctors from API
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch('/api/doctors');
//         const data = await res.json();
//         if (data.success && Array.isArray(data.data)) {
//           const activeDoctors = data.data.filter((d: any) => d.status === 'active');
//           const mapped = activeDoctors.map((doc: any) => ({
//             id: doc.id,
//             firstName: doc.firstName,
//             lastName: doc.lastName,
//             specialty: doc.specialty,
//             department: doc.department,
//             email: doc.email,
//             phone: doc.phone,
//             status: doc.status,
//             rating: doc.rating || 4.8,
//             reviewCount: doc.reviewCount || Math.floor(Math.random() * 100) + 50,
//             profilePhoto: doc.profilePhoto || getRandomDoctorImage(doc.id),
//             isOnline: doc.status === 'active',
//           }));
//           setDoctors(mapped);
//         } else {
//           throw new Error(data.message || 'Failed to load doctors');
//         }
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message || 'Failed to load doctors');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   const getRandomDoctorImage = (id: number) => {
//     const images = [
//       'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
//       'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
//       'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
//       'https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?w=400&h=400&fit=crop&crop=face',
//     ];
//     return images[id % images.length];
//   };

//   const featuredDoctors = doctors.slice(0, 4);

//   const services = [
//     { icon: Video, title: 'Online Consultation', description: 'Connect with doctors via video call from anywhere', color: 'from-blue-500 to-blue-700' },
//     { icon: Calendar, title: 'Book Appointments', description: 'Schedule in-hospital visits with ease', color: 'from-emerald-500 to-emerald-700' },
//     { icon: Ambulance, title: 'Emergency Care', description: '24/7 emergency medical assistance', color: 'from-red-500 to-red-700' },
//     { icon: Microscope, title: 'Lab Tests', description: 'Book lab tests and get reports online', color: 'from-purple-500 to-purple-700' },
//     { icon: Pill, title: 'Pharmacy', description: 'Order medicines with prescription', color: 'from-cyan-500 to-cyan-700' },
//   ];

//   const steps = [
//     { icon: Search, title: 'Search Doctor', description: 'Find by specialty or name', color: 'from-blue-500 to-blue-700' },
//     { icon: Calendar, title: 'Choose Slot', description: 'Select date and time', color: 'from-emerald-500 to-emerald-700' },
//     { icon: Stethoscope, title: 'Consult', description: 'Get expert advice', color: 'from-purple-500 to-purple-700' },
//   ];

//   const features = [
//     { icon: CheckCircle2, title: 'Verified Doctors', description: 'All doctors are certified and experienced', color: 'from-emerald-500 to-emerald-700' },
//     { icon: DollarSign, title: 'Affordable Pricing', description: 'Quality healthcare at reasonable rates', color: 'from-blue-500 to-blue-700' },
//     { icon: Lock, title: 'Secure & Private', description: 'Your data is protected and confidential', color: 'from-purple-500 to-purple-700' },
//     { icon: Zap, title: 'Fast Booking', description: 'Book appointments in seconds', color: 'from-amber-500 to-amber-700' },
//   ];

//   const testimonials = [
//     { id: 1, name: 'John Doe', rating: 5, feedback: 'Excellent service! The doctors are very professional and caring.' },
//     { id: 2, name: 'Jane Smith', rating: 5, feedback: 'Very convenient platform. Saved me so much time.' },
//     { id: 3, name: 'Mike Johnson', rating: 4, feedback: 'Great experience overall. Highly recommended.' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//       <Header />
      
//       {/* Hero Section - Matching Nurse Sidebar Colors */}
//       <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="text-center lg:text-left">
//               <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
//                 <Shield className="w-4 h-4" />
//                 Trusted by 50,000+ Patients
//               </div>
//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
//                 Consult Trusted Doctors{' '}
//                 <span className="text-blue-600 dark:text-blue-400">Anytime, Anywhere</span>
//               </h1>
//               <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
//                 Online & in-hospital consultations with verified specialists. Get expert medical
//                 advice from the comfort of your home.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//                 <Link href="/appointments">
//                   <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
//                     Find Doctor
//                   </Button>
//                 </Link>
//                 <Link href="/appointments">
//                   <Button variant="outline" size="lg" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400">
//                     Consult Online
//                   </Button>
//                 </Link>
//               </div>
//               <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Certified Doctors</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Secure Consultations</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">24/7 Support</span>
//                 </div>
//               </div>
//             </div>
//             <div className="hidden lg:block relative h-[500px] w-full">
//               <Image
//                 src="https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800"
//                 alt="Healthcare professionals"
//                 fill
//                 className="rounded-2xl shadow-2xl object-cover"
//                 priority
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
//             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//               Comprehensive healthcare services designed for your convenience
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//             {services.map((service, index) => (
//               <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
//                 <div className={`bg-gradient-to-br ${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
//                   <service.icon className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
//             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//               Book your appointment in three simple steps
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {steps.map((step, index) => (
//               <div key={index} className="relative">
//                 <Card className="p-8 text-center h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
//                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
//                     {index + 1}
//                   </div>
//                   <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
//                     <step.icon className="w-8 h-8 text-white" />
//                   </div>
//                   <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">{step.title}</h3>
//                   <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
//                 </Card>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Featured Doctors Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Featured Doctors
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//               Meet our highly qualified and experienced medical professionals
//             </p>
//           </div>
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : error ? (
//             <div className="text-center text-red-500 py-12">{error}</div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 {featuredDoctors.map((doctor) => (
//                   <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
//                     <div className="relative h-48 w-full">
//                       <Image
//                         src={doctor.profilePhoto!}
//                         alt={getFullName(doctor)}
//                         fill
//                         className="object-cover"
//                       />
//                       {doctor.isOnline && (
//                         <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
//                           <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
//                           Online
//                         </div>
//                       )}
//                     </div>
//                     <div className="p-5">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="font-semibold text-gray-900 dark:text-white">{getFullName(doctor)}</h3>
//                       </div>
//                       <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{doctor.specialty}</p>
//                       <div className="flex items-center gap-1 mb-3">
//                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
//                         <span className="text-sm font-medium text-gray-900 dark:text-white">{doctor.rating}</span>
//                         <span className="text-sm text-gray-500 dark:text-gray-400">({doctor.reviewCount})</span>
//                       </div>
//                       <Link href={`/booking/${doctor.id}`}>
//                         <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Book Now</Button>
//                       </Link>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//               <div className="text-center">
//                 <Link href="/appointments">
//                   <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400">
//                     View All Doctors
//                   </Button>
//                 </Link>
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//       {/* Why Choose Us Section - Matching Sidebar Gradient */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-cyan-600">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
//             <p className="text-lg text-blue-100 max-w-2xl mx-auto">
//               We are committed to providing the best healthcare experience
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {features.map((feature, index) => (
//               <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
//                 <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
//                   <feature.icon className="w-7 h-7 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
//                 <p className="text-sm text-blue-100">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Patient Testimonials
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//               Hear what our patients have to say
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {testimonials.map((testimonial) => (
//               <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
//                 <div className="flex gap-1 mb-3">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
//                   ))}
//                 </div>
//                 <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.feedback}"</p>
//                 <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//             Ready to Get Started?
//           </h2>
//           <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
//             Book your appointment with our experienced doctors today
//           </p>
//           <Link href="/appointments">
//             <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
//               Find Your Doctor Now
//             </Button>
//           </Link>
//         </div>
//       </section>
      
//       <Footer />
//     </div>
//   );
// }




// app/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  Video,
  Calendar,
  Activity,
  FlaskConical,
  Pill,
  Search,
  Clock,
  FileText,
  Shield,
  DollarSign,
  Lock,
  Zap,
  Star,
  CheckCircle2,
  Heart,
  Stethoscope,
  Ambulance,
  Microscope,
} from 'lucide-react';
import Header from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { useEffect, useState } from 'react';

// Types for doctor data (matching API)
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'on-leave' | 'inactive';
  rating?: number;
  reviewCount?: number;
  profilePhoto?: string;
  isOnline?: boolean;
}

// Helper to get full name
const getFullName = (doctor: Doctor) => `${doctor.firstName} ${doctor.lastName}`;

export default function LandingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/doctors');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const activeDoctors = data.data.filter((d: any) => d.status === 'active');
          const mapped = activeDoctors.map((doc: any) => ({
            id: doc.id,
            firstName: doc.firstName,
            lastName: doc.lastName,
            specialty: doc.specialty,
            department: doc.department,
            email: doc.email,
            phone: doc.phone,
            status: doc.status,
            rating: doc.rating || 4.8,
            reviewCount: doc.reviewCount || Math.floor(Math.random() * 100) + 50,
            profilePhoto: doc.profilePhoto || getRandomDoctorImage(doc.id),
            isOnline: doc.status === 'active',
          }));
          setDoctors(mapped);
        } else {
          throw new Error(data.message || 'Failed to load doctors');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const getRandomDoctorImage = (id: number) => {
    const images = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?w=400&h=400&fit=crop&crop=face',
    ];
    return images[id % images.length];
  };

  const featuredDoctors = doctors.slice(0, 4);

  const services = [
    { icon: Video, title: 'Online Consultation', description: 'Connect with doctors via video call from anywhere', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: Calendar, title: 'Book Appointments', description: 'Schedule in-hospital visits with ease', color: 'from-[#3B1E6F] to-[#0D5CB3]' },
    { icon: Ambulance, title: 'Emergency Care', description: '24/7 emergency medical assistance', color: 'from-red-500 to-red-700' },
    { icon: Microscope, title: 'Lab Tests', description: 'Book lab tests and get reports online', color: 'from-purple-500 to-purple-700' },
    { icon: Pill, title: 'Pharmacy', description: 'Order medicines with prescription', color: 'from-cyan-500 to-cyan-700' },
  ];

  const steps = [
    { icon: Search, title: 'Search Doctor', description: 'Find by specialty or name', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: Calendar, title: 'Choose Slot', description: 'Select date and time', color: 'from-[#3B1E6F] to-[#0D5CB3]' },
    { icon: Stethoscope, title: 'Consult', description: 'Get expert advice', color: 'from-[#7A329F] to-[#0D5CB3]' },
  ];

  const features = [
    { icon: CheckCircle2, title: 'Verified Doctors', description: 'All doctors are certified and experienced', color: 'from-emerald-500 to-emerald-700' },
    { icon: DollarSign, title: 'Affordable Pricing', description: 'Quality healthcare at reasonable rates', color: 'from-blue-500 to-blue-700' },
    { icon: Lock, title: 'Secure & Private', description: 'Your data is protected and confidential', color: 'from-purple-500 to-purple-700' },
    { icon: Zap, title: 'Fast Booking', description: 'Book appointments in seconds', color: 'from-amber-500 to-amber-700' },
  ];

  const testimonials = [
    { id: 1, name: 'John Doe', rating: 5, feedback: 'Excellent service! The doctors are very professional and caring.' },
    { id: 2, name: 'Jane Smith', rating: 5, feedback: 'Very convenient platform. Saved me so much time.' },
    { id: 3, name: 'Mike Johnson', rating: 4, feedback: 'Great experience overall. Highly recommended.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />
      
      {/* Hero Section - Matching Purple Theme */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-[#3B1E6F] dark:text-[#7A329F] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Trusted by 50,000+ Patients
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Consult Trusted Doctors{' '}
                <span className="text-[#3B1E6F] dark:text-[#7A329F]">Anytime, Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                Online & in-hospital consultations with verified specialists. Get expert medical
                advice from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/appointments">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] hover:opacity-90 text-white shadow-lg shadow-[#3B1E6F]/20">
                    Find Doctor
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#3B1E6F] text-[#3B1E6F] hover:bg-purple-50 dark:border-[#7A329F] dark:text-[#7A329F] dark:hover:bg-purple-900/20">
                    Consult Online
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Certified Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Secure Consultations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-[500px] w-full">
              <Image
                src="https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Healthcare professionals"
                fill
                className="rounded-2xl shadow-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3B1E6F] dark:text-white mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive healthcare services designed for your convenience
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                <div className={`bg-gradient-to-br ${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3B1E6F] dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Book your appointment in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 text-center h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-[#3B1E6F]/20">
                    {index + 1}
                  </div>
                  <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3B1E6F] dark:text-white mb-4">
              Featured Doctors
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Meet our highly qualified and experienced medical professionals
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B1E6F]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                    <div className="relative h-48 w-full">
                      <Image
                        src={doctor.profilePhoto!}
                        alt={getFullName(doctor)}
                        fill
                        className="object-cover"
                      />
                      {doctor.isOnline && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          Online
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{getFullName(doctor)}</h3>
                      </div>
                      <p className="text-sm text-[#7A329F] dark:text-[#9B4DBF] mb-2">{doctor.specialty}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{doctor.rating}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({doctor.reviewCount})</span>
                      </div>
                      <Link href={`/booking/${doctor.id}`}>
                        <Button className="w-full bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] hover:opacity-90 text-white shadow-lg shadow-[#3B1E6F]/20">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Link href="/appointments">
                  <Button variant="outline" size="lg" className="border-[#3B1E6F] text-[#3B1E6F] hover:bg-purple-50 dark:border-[#7A329F] dark:text-[#7A329F] dark:hover:bg-purple-900/20">
                    View All Doctors
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us Section - Matching Purple Gradient */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              We are committed to providing the best healthcare experience
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-purple-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3B1E6F] dark:text-white mb-4">
              Patient Testimonials
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear what our patients have to say
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.feedback}"</p>
                <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3B1E6F] dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Book your appointment with our experienced doctors today
          </p>
          <Link href="/appointments">
            <Button size="lg" className="bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] hover:opacity-90 text-white shadow-lg shadow-[#3B1E6F]/20">
              Find Your Doctor Now
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}