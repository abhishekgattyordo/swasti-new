


// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Calendar, Clock, User, Video, Phone, Loader2, Stethoscope, ChevronLeft } from "lucide-react";
// import { appointmentsApi } from "@/lib/api/appointments";
// import toast from "react-hot-toast";

// interface Appointment {
//   id: string;
//   doctor_id: number;
//   doctor_name: string;
//   doctor_specialty: string;
//   patient_id?: string;
//   patient_name?: string;
//   appointment_date: string;
//   appointment_time: string;
//   consultation_type: string;
//   status: string;
//   notes?: string;
// }

// export default function DoctorTeleconsultationPage() {
//   const params = useParams();
//   const router = useRouter();
//   const appointmentId = params.appointmentId as string;

//   const [appointment, setAppointment] = useState<Appointment | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [joining, setJoining] = useState(false);

//   useEffect(() => {
//     const fetchAppointment = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user") || "null");
//         if (!user || user.role !== "doctor") {
//           toast.error("Access denied. Doctors only.");
//           router.push("/login");
//           return;
//         }

//         const response = await appointmentsApi.getAppointment(appointmentId);
//         const data = response.data?.data || response.data;

//         let apt: Appointment | null = null;
//         if (Array.isArray(data)) {
//           apt = data.find((item: any) => item.id === appointmentId) || null;
//         } else if (data && typeof data === "object") {
//           apt = data;
//         }

//         if (apt && apt.id) {
//           setAppointment(apt);
//         } else {
//           setError("Appointment not found");
//         }
//       } catch (err) {
//         console.error("Failed to fetch appointment:", err);
//         setError("Could not load appointment details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (appointmentId) {
//       fetchAppointment();
//     }
//   }, [appointmentId, router]);

//   const canJoin = () => {
//     if (!appointment) return false;
//     // Doctors can join any time (or you can add time constraints)
//     return true;
//   };

//   const handleJoinCall = () => {
//     if (!appointment) return;
//     setJoining(true);

//     // Use the same room name as the patient page
//     const roomName = `ordo-tele-${appointment.id}`;

//     // Doctor's display name
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const doctorName = user?.full_name_en || "Doctor";

//     const jitsiUrl = `https://meet.jit.si/${roomName}?userInfo.displayName=${encodeURIComponent(doctorName)}&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

//     window.open(jitsiUrl, "_blank");
//     toast.success("Opening video call...");
//     setJoining(false);
//   };

//   const formatDateTime = (dateStr: string, timeStr: string) => {
//     const date = new Date(dateStr);
//     const formattedDate = date.toLocaleDateString(undefined, {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//     const [hours, minutes] = timeStr.split(":");
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? "PM" : "AM";
//     const hour12 = hour % 12 || 12;
//     return { formattedDate, time: `${hour12}:${minutes} ${ampm}` };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//         <div className="flex items-center justify-center min-h-[70vh]">
//           <div className="text-center">
//             <Loader2 className="h-14 w-14 animate-spin text-blue-600 mx-auto mb-6" />
//             <p className="text-gray-600 dark:text-gray-400 text-lg">Loading appointment details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !appointment) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//         <div className="container mx-auto px-6 py-12 max-w-2xl">
//           <Card className="shadow-xl border-0">
//             <CardHeader className="text-center pt-8">
//               <CardTitle className="text-2xl text-red-600">Error</CardTitle>
//             </CardHeader>
//             <CardContent className="text-center pb-8">
//               <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Appointment not found"}</p>
//               <Button
//                 variant="outline"
//                 onClick={() => router.push("/doctor/dashboard")}
//                 className="px-6 py-2.5 hover:bg-blue-50"
//               >
//                 Back to Dashboard
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   const { formattedDate, time } = formatDateTime(appointment.appointment_date, appointment.appointment_time);
//   const isJoinable = canJoin();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      

//       <div className="container mx-auto px-6 py-10 max-w-6xl">
//         <div className="grid gap-8 lg:grid-cols-3">
//           {/* Main Appointment Card - spans 2 columns on desktop */}
//           <div className="lg:col-span-2 space-y-8">
//             <Card className="shadow-xl border-0 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
//                 <div className="flex items-center gap-4">
//                   <Video className="h-7 w-7 text-white" />
//                   <h1 className="text-2xl font-bold text-white">Video Consultation</h1>
//                 </div>
//               </div>
//               <CardContent className="p-8 space-y-8">
//                 {/* Patient Info */}
//                 <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
//                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
//                     <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
//                       {appointment.patient_name || "Patient"}
//                     </h2>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       Patient • Appointment ID: {appointment.id.slice(0, 8)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Appointment Details Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                     <Calendar className="h-6 w-6 text-blue-600" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
//                       <p className="text-base font-semibold text-gray-900 dark:text-white">{formattedDate}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                     <Clock className="h-6 w-6 text-blue-600" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
//                       <p className="text-base font-semibold text-gray-900 dark:text-white">{time}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Status Badge */}
//                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                   <span className="text-sm text-gray-500">Appointment Status</span>
//                   <Badge
//                     className={`text-sm px-3 py-1 ${
//                       appointment.status === "BOOKED"
//                         ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {appointment.status === "BOOKED" ? "Confirmed" : appointment.status}
//                   </Badge>
//                 </div>

//                 {/* Patient Notes */}
//                 {appointment.notes && (
//                   <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
//                     <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Patient Notes</p>
//                     <p className="text-base text-gray-700 dark:text-gray-300">{appointment.notes}</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Column - Doctor Info & Call Button */}
//           <div className="space-y-8">
//             {/* Doctor Info Card */}
//             <Card className="shadow-xl border-0">
//               <CardHeader className="pb-3 pt-6 px-6">
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <Stethoscope className="h-6 w-6 text-blue-600" />
//                   Your Details
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="px-6 pb-6 space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-500">Doctor</p>
//                   <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{appointment.doctor_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Specialty</p>
//                   <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{appointment.doctor_specialty}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Join Call Button */}
//             <Card className={`shadow-xl border-0 ${!isJoinable ? "opacity-75" : ""}`}>
//               <CardContent className="p-8">
//                 {isJoinable ? (
//                   <div className="space-y-5">
//                     <Button
//                       onClick={handleJoinCall}
//                       disabled={joining}
//                       className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all"
//                     >
//                       {joining ? (
//                         <>
//                           <Loader2 className="mr-2 h-6 w-6 animate-spin" />
//                           Opening Call...
//                         </>
//                       ) : (
//                         <>
//                           <Phone className="mr-2 h-6 w-6" />
//                           Join Video Call
//                         </>
//                       )}
//                     </Button>
//                     <p className="text-sm text-center text-gray-500">
//                       The call will open in a new tab using Jitsi Meet.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="text-center">
//                     <p className="text-amber-600 dark:text-amber-400 mb-5">
//                       This appointment is not ready for teleconsultation.
//                     </p>
//                     <Button
//                       variant="outline"
//                       className="w-full py-3"
//                       onClick={() => router.push("/doctor/dashboard")}
//                     >
//                       Back to Dashboard
//                     </Button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, Loader2, AlertCircle } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';

const VideoCall = dynamic(
  () => import('@/components/teleconsultation/VideoCall').catch(err => {
    console.error('Failed to load VideoCall component:', err);
    return () => (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          Failed to load video call. Please check console for errors.
        </div>
      </div>
    );
  }),
  { ssr: false }
);

interface Appointment {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
  notes?: string;
}

export default function DoctorTeleconsultationPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const isAgoraConfigured = !!agoraAppId;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentsApi.getAppointment(appointmentId);
        const data = response.data?.data || response.data;

        if (data && data.id) {
          setAppointment(data);
        } else {
          setError('Appointment not found');
        }
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Could not load appointment details');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handleJoinCall = () => {
    if (!appointment) return;
    setJoining(true);
    setShowVideoCall(true);
    setTimeout(() => setJoining(false), 500);
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return { formattedDate, time: `${hour12}:${minutes} ${ampm}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading appointment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>{error || 'Appointment not found'}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => router.push('/doctor/dashboard')}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { formattedDate, time } = formatDateTime(
    appointment.appointment_date,
    appointment.appointment_time
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-6 w-6" />
                Teleconsultation with Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {appointment.patient_name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.patient_email} · {appointment.patient_phone}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">{time}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge
                  className={
                    appointment.status === 'BOOKED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {appointment.status}
                </Badge>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                </div>
              )}

              {/* Join Call Button */}
              <div className="pt-4">
                {!isAgoraConfigured ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">Video call is not configured. Please contact support.</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinCall}
                    disabled={joining}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening Call...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Join Video Call
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Videoooo  Call Modal */}
      {showVideoCall && appointment && isAgoraConfigured && (
             <VideoCall
  appId={agoraAppId!}
  channel="test123"   // fixed channel for testing
  token="007eJxTYHj+8FELX0HNm+/f/r5dueKNdwOfe7TrYqnlL/RvtqfWtV9UYDAxSzG3SDNMtEhKTDMxSU1JNDO3NDBONk1KTDIzsEhO0pU9ltkQyMgwmbWImZEBAkF8doaS1OISQyNjBgYA46cjGw=="
  uid={null}          // let Agora assign a unique UID
  onClose={() => setShowVideoCall(false)}
/>
      )}
    </>
  );
}