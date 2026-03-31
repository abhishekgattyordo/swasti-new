


// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import dynamic from 'next/dynamic';
// import Header from '@/components/ui/Header';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Calendar, Clock, User, Video, Phone, Loader2, AlertCircle } from 'lucide-react';
// import { appointmentsApi } from '@/lib/api/appointments';

// const VideoCall = dynamic(
//   () => import('@/components/teleconsultation/VideoCall').catch(err => {
//     console.error('Failed to load VideoCall component:', err);
//     return () => (
//       <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//         <div className="bg-red-500 text-white p-4 rounded-lg">
//           Failed to load video call. Please check console for errors.
//         </div>
//       </div>
//     );
//   }),
//   { ssr: false }
// );

// interface Appointment {
//   id: string;
//   patient_id?: string;
//   patient_name: string;
//   patient_email?: string;
//   patient_phone?: string;
//   doctor_id: number;
//   doctor_name: string;
//   doctor_specialty: string;
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
//   const [showVideoCall, setShowVideoCall] = useState(false);

//   const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
//   const isAgoraConfigured = !!agoraAppId;

//   useEffect(() => {
//     const fetchAppointment = async () => {
//       try {
//         const response = await appointmentsApi.getAppointment(appointmentId);
//         const data = response.data?.data || response.data;

//         if (data && data.id) {
//           setAppointment(data);
//         } else {
//           setError('Appointment not found');
//         }
//       } catch (err) {
//         console.error('Failed to fetch appointment:', err);
//         setError('Could not load appointment details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (appointmentId) {
//       fetchAppointment();
//     }
//   }, [appointmentId]);

//   const handleJoinCall = () => {
//     if (!appointment) return;
//     setJoining(true);
//     setShowVideoCall(true);
//     setTimeout(() => setJoining(false), 500);
//   };

//   const formatDateTime = (dateStr: string, timeStr: string) => {
//     const date = new Date(dateStr);
//     const formattedDate = date.toLocaleDateString(undefined, {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//     const [hours, minutes] = timeStr.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const hour12 = hour % 12 || 12;
//     return { formattedDate, time: `${hour12}:${minutes} ${ampm}` };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Header />
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <div className="text-center">
//             <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//             <p className="text-gray-600 dark:text-gray-400">Loading appointment...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !appointment) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Header />
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle className="text-center text-red-600">Error</CardTitle>
//             </CardHeader>
//             <CardContent className="text-center">
//               <p>{error || 'Appointment not found'}</p>
//               <Button
//                 className="mt-4"
//                 variant="outline"
//                 onClick={() => router.push('/doctor/dashboard')}
//               >
//                 Back to Dashboard
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   const { formattedDate, time } = formatDateTime(
//     appointment.appointment_date,
//     appointment.appointment_time
//   );

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <Header />
//         <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
//           <Card>
//             <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <Video className="h-6 w-6" />
//                 Teleconsultation with Patient
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6 space-y-6">
//               {/* Patient Info */}
//               <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
//                 <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                   <User className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                     {appointment.patient_name}
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {appointment.patient_email} · {appointment.patient_phone}
//                   </p>
//                 </div>
//               </div>

//               {/* Appointment Details */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
//                     <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Clock className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
//                     <p className="font-medium text-gray-900 dark:text-white">{time}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Badge */}
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-gray-500">Status</span>
//                 <Badge
//                   className={
//                     appointment.status === 'BOOKED'
//                       ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                       : 'bg-gray-100 text-gray-800'
//                   }
//                 >
//                   {appointment.status}
//                 </Badge>
//               </div>

//               {/* Notes */}
//               {appointment.notes && (
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Notes</p>
//                   <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
//                 </div>
//               )}

//               {/* Join Call Button */}
//               <div className="pt-4">
//                 {!isAgoraConfigured ? (
//                   <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//                     <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
//                       <AlertCircle className="h-5 w-5" />
//                       <p className="text-sm">Video call is not configured. Please contact support.</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <Button
//                     onClick={handleJoinCall}
//                     disabled={joining}
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
//                   >
//                     {joining ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Opening Call...
//                       </>
//                     ) : (
//                       <>
//                         <Phone className="mr-2 h-4 w-4" />
//                         Join Video Call
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Videoooo  Call Modal */}
//       {showVideoCall && appointment && isAgoraConfigured && (
//              <VideoCall
//   appId={agoraAppId!}
//   channel="test123"   // fixed channel for testing
//   token="007eJxTYHj+8FELX0HNm+/f/r5dueKNdwOfe7TrYqnlL/RvtqfWtV9UYDAxSzG3SDNMtEhKTDMxSU1JNDO3NDBONk1KTDIzsEhO0pU9ltkQyMgwmbWImZEBAkF8doaS1OISQyNjBgYA46cjGw=="
//   uid={null}          // let Agora assign a unique UID
//   onClose={() => setShowVideoCall(false)}
// />
//       )}
//     </>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';

// Dynamic import for VideoCall with proper error handling
const VideoCall = dynamic(
  () => import('@/components/teleconsultation/VideoCall').catch(err => {
    console.error('Failed to load VideoCall component:', err);
    return () => (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load video call</h3>
          <p className="text-sm">Please check your internet connection and try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-white text-red-500 hover:bg-gray-100"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }),
  { ssr: false, loading: () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white">Loading video call...</p>
      </div>
    </div>
  )}
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
  meeting_link?: string;
  meeting_id?: string;
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
  const [callEnded, setCallEnded] = useState(false);

  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const isAgoraConfigured = !!agoraAppId;

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setError('Appointment ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await appointmentsApi.getAppointment(appointmentId);
        const data = response.data?.data || response.data;

        if (data && data.id) {
          setAppointment(data);
          
          // Check if call was already ended
          if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
            setCallEnded(true);
          }
        } else {
          setError('Appointment not found');
        }
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Could not load appointment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleJoinCall = useCallback(async () => {
    if (!appointment) return;
    
    setJoining(true);
    
    try {
      // Optional: Update appointment status to IN_PROGRESS
      await appointmentsApi.updateAppointmentStatus(appointment.id, 'IN_PROGRESS');
      
      // Show video call component
      setShowVideoCall(true);
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      // Still show video call even if status update fails
      setShowVideoCall(true);
    } finally {
      setJoining(false);
    }
  }, [appointment]);

  const handleEndCall = useCallback(async () => {
    setShowVideoCall(false);
    setCallEnded(true);
    
    // Optional: Update appointment status to COMPLETED
    if (appointment) {
      try {
        await appointmentsApi.updateAppointmentStatus(appointment.id, 'COMPLETED');
      } catch (err) {
        console.error('Failed to update appointment status:', err);
      }
    }
  }, [appointment]);

  const formatDateTime = useCallback((dateStr: string, timeStr: string) => {
    try {
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
    } catch (error) {
      return { formattedDate: 'Invalid date', time: 'Invalid time' };
    }
  }, []);

  const isCallAvailable = useCallback(() => {
    if (!appointment) return false;
    
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    
    // Call available 15 minutes before and up to 30 minutes after appointment time
    const isWithinWindow = timeDiff <= 15 * 60 * 1000 && timeDiff >= -30 * 60 * 1000;
    
    return isWithinWindow && !callEnded && appointment.status === 'BOOKED';
  }, [appointment, callEnded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
<<<<<<< HEAD
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          <Card>
=======
     
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
>>>>>>> e62759276373c4ee9c99a6756e037caa645a8342
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'Appointment not found'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/doctor/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
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

  const callAvailable = isCallAvailable();

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
<<<<<<< HEAD
        <Header />
        
=======
 
>>>>>>> e62759276373c4ee9c99a6756e037caa645a8342
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/doctor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-6 w-6" />
                Teleconsultation Session
              </CardTitle>
              <p className="text-sm text-blue-100 mt-2">
                Appointment ID: {appointment.id}
              </p>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {appointment.patient_name}
                  </h2>
                  {(appointment.patient_email || appointment.patient_phone) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.patient_email && <span>{appointment.patient_email}</span>}
                      {appointment.patient_email && appointment.patient_phone && <span> · </span>}
                      {appointment.patient_phone && <span>{appointment.patient_phone}</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">{time}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Your Information
                </h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  Dr. {appointment.doctor_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {appointment.doctor_specialty}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <Badge
                  variant={
                    appointment.status === 'BOOKED' ? 'default' :
                    appointment.status === 'IN_PROGRESS' ? 'secondary' :
                    appointment.status === 'COMPLETED' ? 'success' :
                    'destructive'
                  }
                  className={
                    appointment.status === 'BOOKED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : appointment.status === 'IN_PROGRESS'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : appointment.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }
                >
                  {appointment.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Clinical Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                </div>
              )}

              {/* Call Status & Join Button */}
              <div className="pt-4">
                {callEnded ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                    <p className="text-blue-800 dark:text-blue-300 font-medium">
                      This consultation has been completed
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/doctor/dashboard')}
                      className="mt-3"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                ) : !isAgoraConfigured ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">
                        Video call is not configured. Please contact support to enable this feature.
                      </p>
                    </div>
                  </div>
                ) : !callAvailable && appointment.status === 'BOOKED' ? (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      The video call will be available 15 minutes before the scheduled time.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Appointment time: {formattedDate} at {time}
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinCall}
                    disabled={joining || !callAvailable}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Joining Call...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-5 w-5" />
                        Join Video Call
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Important Information */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <p>Please ensure you have a stable internet connection and working camera/microphone.</p>
                <p className="mt-1">For technical support, contact IT help desk.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && appointment && isAgoraConfigured && (
        <VideoCall
          appId={agoraAppId!}
          channel={appointment.id} // Use appointment ID as channel name
          token={null} // Implement token generation if needed
          uid={null} // Let Agora assign a unique UID
          onClose={handleEndCall}
          patientName={appointment.patient_name}
          doctorName={appointment.doctor_name}
        />
      )}
    </>
  );
}