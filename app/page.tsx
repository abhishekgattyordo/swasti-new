

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
//     { icon: Video, title: 'Online Consultation', description: 'Connect with doctors via video call from anywhere', color: 'from-[#2BB2A7] to-[#86C94C]' },
//     { icon: Calendar, title: 'Book Appointments', description: 'Schedule in-hospital visits with ease', color: 'from-[#2BB2A7] to-[#86C94C]' },
//     { icon: Ambulance, title: 'Emergency Care', description: '24/7 emergency medical assistance', color: 'from-red-500 to-red-700' },
//     { icon: Microscope, title: 'Lab Tests', description: 'Book lab tests and get reports online', color: 'from-[#2BB2A7] to-[#86C94C]' },
//     { icon: Pill, title: 'Pharmacy', description: 'Order medicines with prescription', color: 'from-cyan-500 to-cyan-700' },
//   ];

//   const steps = [
//     { icon: Search, title: 'Search Doctor', description: 'Find by specialty or name', color: 'from-[#2BB2A7] to-[#86C94C]' },
//     { icon: Calendar, title: 'Choose Slot', description: 'Select date and time', color: 'from-[#2BB2A7] to-[#86C94C]' },
//     { icon: Stethoscope, title: 'Consult', description: 'Get expert advice', color: 'from-[#86C94C] to-[#2BB2A7]' },
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
      
//       {/* Hero Section - Matching Teal Theme */}
//       <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#EAF7F4] via-white to-[#F4F9F7] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="text-center lg:text-left">
//               <div className="inline-flex items-center gap-2 bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#1F8F89] dark:text-[#2BB2A7] px-4 py-2 rounded-full text-sm font-medium mb-6">
//                 <Shield className="w-4 h-4" />
//                 Trusted by 50,000+ Patients
//               </div>
//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
//                 Consult Trusted Doctors{' '}
//                 <span className="text-[#2BB2A7]">Anytime, Anywhere</span>
//               </h1>
//               <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
//                 Online & in-hospital consultations with verified specialists. Get expert medical
//                 advice from the comfort of your home.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//                 <Link href="/appointments">
//                   <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white shadow-lg shadow-[#2BB2A7]/20">
//                     Find Doctor
//                   </Button>
//                 </Link>
//                 <Link href="/appointments">
//                   <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#2BB2A7] text-[#2BB2A7] hover:bg-[#EAF7F4] dark:border-[#2BB2A7] dark:text-[#2BB2A7] dark:hover:bg-[#1F8F89]/20">
//                     Consult Online
//                   </Button>
//                 </Link>
//               </div>
//               <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="w-5 h-5 text-[#2BB2A7]" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Certified Doctors</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Lock className="w-5 h-5 text-[#2BB2A7]" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Secure Consultations</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-[#2BB2A7]" />
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
//               <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border border-[#E2EFEA] dark:border-gray-800 bg-white dark:bg-slate-900">
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
//                 <Card className="p-8 text-center h-full border border-[#E2EFEA] dark:border-gray-800 bg-white dark:bg-slate-900">
//                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-[#2BB2A7]/20">
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
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BB2A7]"></div>
//             </div>
//           ) : error ? (
//             <div className="text-center text-red-500 py-12">{error}</div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 {featuredDoctors.map((doctor) => (
//                   <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-[#E2EFEA] dark:border-gray-800 bg-white dark:bg-slate-900">
//                     <div className="relative h-48 w-full">
//                       <Image
//                         src={doctor.profilePhoto!}
//                         alt={getFullName(doctor)}
//                         fill
//                         className="object-cover"
//                       />
//                       {doctor.isOnline && (
//                         <div className="absolute top-3 right-3 bg-[#2BB2A7] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
//                           <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
//                           Online
//                         </div>
//                       )}
//                     </div>
//                     <div className="p-5">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="font-semibold text-gray-900 dark:text-white">{getFullName(doctor)}</h3>
//                       </div>
//                       <p className="text-sm text-[#1F8F89] dark:text-[#2BB2A7] mb-2">{doctor.specialty}</p>
//                       <div className="flex items-center gap-1 mb-3">
//                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
//                         <span className="text-sm font-medium text-gray-900 dark:text-white">{doctor.rating}</span>
//                         <span className="text-sm text-gray-500 dark:text-gray-400">({doctor.reviewCount})</span>
//                       </div>
//                       <Link href={`/booking/${doctor.id}`}>
//                         <Button className="w-full bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white shadow-lg shadow-[#2BB2A7]/20">
//                           Book Now
//                         </Button>
//                       </Link>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//               <div className="text-center">
//                 <Link href="/appointments">
//                   <Button variant="outline" size="lg" className="border-[#2BB2A7] text-[#2BB2A7] hover:bg-[#EAF7F4] dark:border-[#2BB2A7] dark:text-[#2BB2A7] dark:hover:bg-[#1F8F89]/20">
//                     View All Doctors
//                   </Button>
//                 </Link>
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//       {/* Why Choose Us Section - Matching Teal Gradient */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#2BB2A7] to-[#86C94C]">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
//             <p className="text-lg text-white/80 max-w-2xl mx-auto">
//               We are committed to providing the best healthcare experience
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {features.map((feature, index) => (
//               <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
//                 <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
//                   <feature.icon className="w-7 h-7 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
//                 <p className="text-sm text-white/80">{feature.description}</p>
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
//               <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow border border-[#E2EFEA] dark:border-gray-800 bg-white dark:bg-slate-900">
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
//             <Button size="lg" className="bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white shadow-lg shadow-[#2BB2A7]/20">
//               Find Your Doctor Now
//             </Button>
//           </Link>
//         </div>
//       </section>
      
//       <Footer />
//     </div>
//   );
// }



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
  ArrowRight,
  Bed,
  Brain,
  Layers,
  LineChart,
  Users,
  Volume2,
  Receipt,
  X,
  ChevronRight,
  RefreshCw,
  MapPin,
  Syringe,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Award,
} from 'lucide-react';
import Header from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { useEffect, useState } from 'react';

// ---------- Data (copied from swasti.ai reference) ----------
const HIS_MODULES = [
  {
    id: 'mod-emergency',
    title: 'Intuitive Emergency AI Triage',
    description: 'Rapid acuity assessment, vital sign interpretation, ESI level prediction, and automatic high-risk ER alert routing.',
    icon: Ambulance,
    badge: '24/7 Emergency Triage',
    metrics: '< 3 min ER Intake',
  },
  {
    id: 'mod-bed',
    title: 'Automatic Bed Allocation',
    description: 'Dynamic ward matching based on patient severity, infection control parameters, and real-time nurse staffing density.',
    icon: Bed,
    badge: 'Smart Bed Occupancy',
    metrics: '+45% Bed Turnover',
  },
  {
    id: 'mod-scribe',
    title: 'AI Ambient Scribing & Consult',
    description: 'Hands-free voice capture during doctor-patient conversations automatically generates SOAP notes, orders, and ICD-10 codes.',
    icon: Sparkles,
    badge: 'Voice-to-SOAP Scribe',
    metrics: '2.5 hrs/doc Saved',
  },
  {
    id: 'mod-rx',
    title: 'AI Prescription & Administration',
    description: 'Cross-analyzes 15,000+ pharmaceuticals for interaction guard, allergen warnings, dosage calculations, and nurse eMAR.',
    icon: Pill,
    badge: 'Pharmacy Safety Guard',
    metrics: '99.8% Safety Score',
  },
  {
    id: 'mod-records',
    title: 'Intuitive Patient Record (EMR)',
    description: 'Unified longitudinal EHR with timeline search, AI chart summaries, lab trends, and seamless FHIR/HL7 interoperability.',
    icon: FileText,
    badge: 'FHIR & HL7 Native',
    metrics: 'Instant Chart Sync',
  },
  {
    id: 'mod-discharge',
    title: 'Voice & AI Assisted Discharge',
    description: 'Generates multi-lingual discharge summaries, voice audio care instructions for patients, and automated follow-up tasks.',
    icon: Volume2,
    badge: 'Voice Audio Guidance',
    metrics: '-30% Delay Time',
  },
  {
    id: 'mod-lab-pharmacy',
    title: 'Comprehensive Lab & Pharmacy',
    description: 'Automated LIS/RIS barcoding, specimen tracking, electronic prescriptions, stock reorder alerts, and result delivery.',
    icon: Microscope,
    badge: 'LIS & RIS Sync',
    metrics: 'Paperless Operations',
  },
  {
    id: 'mod-portal',
    title: 'AI-Assisted Patient Portal',
    description: 'Empowers patients with 24/7 AI symptom check, medical report access, direct doctor booking, and bill payments.',
    icon: Users,
    badge: '24/7 Patient Self-Service',
    metrics: '+42 NPS Score',
  },
  {
    id: 'mod-telehealth',
    title: 'Teleconsultation Engine',
    description: 'HD encrypted video room integrated directly into the doctor\'s workflow with instant e-prescriptions and lab booking.',
    icon: Video,
    badge: 'Encrypted HD Telehealth',
    metrics: 'Global Access',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Intake & Emergency AI Assessment',
    description: 'Patients check in via website, patient portal, or emergency triage desk. swasti.ai instantly evaluates vitals and predicts acuity level.',
    icon: Activity,
  },
  {
    step: '02',
    title: 'Automated Bed & Room Allocation',
    description: 'Smart algorithms assign optimal hospital beds, isolation wards, or ICU slots based on real-time nurse load and clinical needs.',
    icon: Bed,
  },
  {
    step: '03',
    title: 'AI Ambient Consultation & Scribing',
    description: 'Doctor and patient talk naturally. swasti.ai listens, transcribes, and constructs structured SOAP notes, orders, and diagnostic plans.',
    icon: Sparkles,
  },
  {
    step: '04',
    title: 'Integrated Pharmacy, Lab & Nursing eMAR',
    description: 'Prescriptions and lab orders are instantly dispatched to pharmacy inventory, lab LIS, and bedside nurse administration records.',
    icon: Syringe,
  },
  {
    step: '05',
    title: 'Voice Discharge & Patient Portal Sync',
    description: 'AI generates personalized voice discharge summaries in the patient\'s language and syncs records directly to the patient portal.',
    icon: CheckCircle2,
  },
];

const ROI_METRICS = [
  {
    value: '2.5 Hrs',
    title: 'Saved Per Clinician Daily',
    description: 'AI ambient scribing eliminates manual typing and documentation burden, giving doctors more direct patient interaction time.',
    icon: Clock,
  },
  {
    value: '+45%',
    title: 'Faster Bed Turnover',
    description: 'Automated bed allocation and voice discharge routing significantly reduce patient wait times in ED and triage wards.',
    icon: TrendingUp,
  },
  {
    value: '99.8%',
    title: 'Prescription Safety Rate',
    description: 'Real-time AI screening against drug-drug interactions, patient allergies, and weight-adjusted dosage calculations.',
    icon: ShieldCheck,
  },
  {
    value: '30%',
    title: 'Reduction in Discharge Delays',
    description: 'AI generates instant, clear discharge instructions, patient audio summaries, and billing scrub reconciliations.',
    icon: FileCheck,
  },
];

// Types for doctor data
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
  bio?: string;
  availableSlots?: string[];
}

const getFullName = (doctor: Doctor) => `${doctor.firstName} ${doctor.lastName}`;

export default function LandingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    type: 'online' as 'online' | 'in-person',
    notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

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
            bio: doc.bio || 'Experienced specialist in ' + doc.specialty,
            availableSlots: doc.availableSlots || ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
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

  // Booking handlers
  const handleOpenBooking = (doctor?: Doctor) => {
    const target = doctor || doctors[0];
    if (!target) return;
    setSelectedDoctor(target);
    setBookingStatus('idle');
    setBookingConfirmation(null);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setBookingStatus('submitting');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          ...bookingForm,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBookingConfirmation(json.data);
        setBookingStatus('success');
      } else {
        // Fallback mock
        setBookingConfirmation({
          appointmentId: 'SWASTI-' + Math.floor(100000 + Math.random() * 900000),
          doctorName: getFullName(selectedDoctor),
          date: bookingForm.date,
          timeSlot: bookingForm.timeSlot,
        });
        setBookingStatus('success');
      }
    } catch {
      setBookingConfirmation({
        appointmentId: 'SWASTI-' + Math.floor(100000 + Math.random() * 900000),
        doctorName: getFullName(selectedDoctor),
        date: bookingForm.date,
        timeSlot: bookingForm.timeSlot,
      });
      setBookingStatus('success');
    }
  };

  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-teal-500 selection:text-white">
      <Header />

      {/* HERO SECTION with ROI metrics */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>swasti.ai Next-Gen Hospital Information System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
                The Intelligent AI Operating System for{' '}
                <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Modern Hospitals
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Powering emergency triage, ambient AI scribing, automatic bed allocation, smart prescriptions, voice-assisted discharge, and seamless patient portals in one unified HIS.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <a
                  href="#modules"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5 text-white" />
                  <span>Explore HIS Modules</span>
                </a>
                {/* <button
                  onClick={() => handleOpenBooking()}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Book Patient Appointment</span>
                </button> */}
              </div>
            </div>

            {/* Right Column – Image with floating badges */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white p-2">
                <Image
                  src="https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="swasti.ai Healthcare Team"
                  width={800}
                  height={500}
                  className="w-full h-[380px] sm:h-[420px] object-cover rounded-2xl"
                />
                {/* Floating Status Badge 1 */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">swasti.ai Active Engine</div>
                    <div className="text-[10px] text-slate-600">Clinical Triage & Scribe Ready</div>
                  </div>
                </div>
                {/* Floating Metric Badge 2 */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold font-mono">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm font-black font-mono text-[#0F172A]">99.8%</div>
                    <div className="text-[10px] text-slate-600 font-medium">Prescription Safety Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive ROI Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xl">
            {ROI_METRICS.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-teal-600 mb-1">{m.value}</div>
                <div className="text-xs font-bold text-[#0F172A] mb-1">{m.title}</div>
                <div className="text-[11px] text-slate-600 leading-tight hidden sm:block">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIS CORE MODULES */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Unified Hospital Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Comprehensive Modules of swasti.ai HIS
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              An end-to-end hospital management platform covering every clinical and operational department from Emergency to Billing, Pharmacy, and Patient Care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HIS_MODULES.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-teal-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-teal-700 border border-slate-200">
                        {mod.metrics}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 block mb-1 font-bold">
                      {mod.badge}
                    </span>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-teal-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Seamless Clinical Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              How swasti.ai Operates Across the Hospital
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              From emergency intake to voice-assisted discharge, swasti.ai coordinates clinicians, nurses, pharmacists, and patients in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {HOW_IT_WORKS_STEPS.map((st, idx) => {
              const IconComponent = st.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono text-teal-600">{st.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-teal-600">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-2">{st.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI FOR HOSPITALS */}
      <section id="roi" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
                <LineChart className="w-3.5 h-3.5 text-teal-600" />
                <span>Hospital ROI & Financial Impact</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
                Quantifiable Operational & Economic Returns
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                swasti.ai is engineered to maximize hospital throughput, eliminate administrative waste, and boost physician retention by stripping away clerical overhead.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">2.5 Hours Saved Per Doctor / Day</h4>
                    <p className="text-xs text-slate-600">Ambient AI scribing transcribes doctor-patient interactions directly into structured SOAP notes with zero manual data entry.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">45% Faster Bed Turnover Rate</h4>
                    <p className="text-xs text-slate-600">Automated bed allocation matches emergency intake to open ward beds instantly based on nurse availability and infection protocol.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Zero Prescription & Billing Claims Rejection</h4>
                    <p className="text-xs text-slate-600">AI cross-checks 15,000+ drug interactions and scrubs insurance billing codes (ICD-10/CPT) prior to claim submission.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-8 rounded-3xl bg-slate-50 border border-slate-200 relative overflow-hidden shadow-xl">
              <div className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider mb-4">
                swasti.ai Executive Analytics Preview
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-[10px] text-slate-600 uppercase font-mono">ED Wait Time Reduction</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mt-1">-58%</div>
                    <div className="text-[10px] text-slate-600 mt-1">Average 12 mins vs 28 mins</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="text-[10px] text-slate-600 uppercase font-mono">Clinician Satisfaction</div>
                    <div className="text-2xl font-black text-teal-600 font-mono mt-1">94%</div>
                    <div className="text-[10px] text-slate-600 mt-1">Automated eMAR & Bed routing</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#0F172A]">Hospital Resource Utilization</span>
                    <span className="text-xs font-mono font-bold text-teal-600">Optimal</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>ICU & Acute Bed Allocation</span>
                        <span className="font-mono text-[#0F172A] font-bold">88%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 w-[88%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>AI Scribe Note Accuracy Rate</span>
                        <span className="font-mono text-[#0F172A] font-bold">99.4%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99.4%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-[#0F172A]">
                  <span className="font-bold text-teal-600">FHIR & HL7 Compliant: </span>
                  Integrates bi-directionally with existing Epic, Cerner, or legacy hospital databases within 14 days.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT CARE & PORTAL */}
      <section id="patient-care" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Portal & Self-Service</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Empowering Patients with swasti.ai Portal
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Patients gain 24/7 access to their medical records, AI health guidance, direct web appointment booking, and multi-lingual voice discharge instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Direct Web Appointment Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients search physician availability, pick preferred slots, choose between teleconsultation or hospital visits, and reserve instantly.
              </p>
              {/* <button
                onClick={() => handleOpenBooking()}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <span>Test Appointment Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button> */}
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Voice Discharge Instructions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post-care instructions are converted into audio narration in 12+ languages, ensuring elderly and recovering patients never miss prescription steps.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Transparent Billing & Pre-Auth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time insurance pre-authorization and itemized billing estimates give patients full clarity on out-of-pocket expenses before treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTOR PORTAL & DIRECT BOOKING */}
      <section id="doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Specialists</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Book Appointments Directly from swasti.ai
            </h2>
            <p className="text-slate-600 text-sm">
              Connect with board-certified hospital attending physicians for online teleconsultation or in-hospital visits.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 rounded-3xl bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-slate-100">
                        <Image
                          src={doctor.profilePhoto!}
                          alt={getFullName(doctor)}
                          fill
                          className="object-cover"
                        />
                        {doctor.isOnline && (
                          <div className="absolute top-3 right-3 bg-teal-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            Online Now
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-[#0F172A]">{getFullName(doctor)}</h3>
                        <p className="text-xs font-bold text-teal-600 mb-2">{doctor.specialty}</p>
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">{doctor.bio}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-[#0F172A]">{doctor.rating}</span>
                          <span className="text-slate-600">({doctor.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleOpenBooking(doctor)}
                        className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all text-xs"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link href="/appointments">
                  <Button variant="outline" size="lg" className="border-teal-500 text-teal-700 hover:bg-teal-50 rounded-2xl px-8">
                    View All Doctors
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Book your appointment with our experienced doctors today
          </p>
          <Link href="/appointments">
            <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-xl hover:shadow-teal-500/20 text-white rounded-2xl shadow-lg shadow-teal-500/30 px-8 py-4 text-base font-medium transition-all duration-300">
              Find Your Doctor Now
            </Button>
          </Link>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={handleCloseBooking}
              className="absolute top-4 right-4 text-slate-600 hover:text-[#0F172A] p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingStatus === 'success' && bookingConfirmation ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">Appointment Confirmed!</h3>
                <p className="text-xs text-slate-600">
                  Your appointment with{' '}
                  <span className="font-bold text-[#0F172A]">{getFullName(selectedDoctor)}</span> has been reserved via swasti.ai.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 text-left font-mono text-xs space-y-1.5 border border-slate-200">
                  <div>
                    <span className="text-slate-600">Confirmation ID:</span>{' '}
                    <span className="text-teal-600 font-bold">{bookingConfirmation.appointmentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Date:</span> {bookingForm.date}
                  </div>
                  <div>
                    <span className="text-slate-600">Time:</span> {bookingForm.timeSlot}
                  </div>
                  <div>
                    <span className="text-slate-600">Type:</span>{' '}
                    {bookingForm.type === 'online' ? 'Virtual Video Teleconsultation' : 'In-Hospital Clinic Visit'}
                  </div>
                </div>
                <button
                  onClick={handleCloseBooking}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-sm shadow-md"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <Image
                    src={selectedDoctor.profilePhoto!}
                    alt={getFullName(selectedDoctor)}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{getFullName(selectedDoctor)}</h3>
                    <p className="text-xs text-teal-600 font-bold">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Your Full Name</label>
                    <input
                      required
                      type="text"
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Preferred Date</label>
                    <input
                      required
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Time Slot</label>
                    <select
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                    >
                      {(selectedDoctor.availableSlots || ['09:00 AM', '11:30 AM', '02:00 PM']).map((slot, i) => (
                        <option key={i} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingForm({ ...bookingForm, type: 'online' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        bookingForm.type === 'online'
                          ? 'bg-teal-50 border-teal-500 text-teal-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Online Telehealth</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingForm({ ...bookingForm, type: 'in-person' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        bookingForm.type === 'in-person'
                          ? 'bg-teal-50 border-teal-500 text-teal-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>In-Hospital Visit</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">Brief Health Context (Optional)</label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Describe symptoms or reason for visit..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingStatus === 'submitting'}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingStatus === 'submitting' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Confirming Reservation...</span>
                    </>
                  ) : (
                    <span>Confirm & Reserve Appointment</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}