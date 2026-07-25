

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import dynamic from 'next/dynamic';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Calendar, Clock, User, Video, Phone, Loader2, X, FileText } from 'lucide-react';
// import { appointmentsApi } from '@/lib/api/appointments';
// import toast from 'react-hot-toast';

// import AddMedicationModal from '@/components/doctor/AddMedicationModal';
// import CurrentVisitPage from '@/components/doctor/CurrentVisitPage'; // 👈 import the component

// const VideoCall = dynamic(
//   () => import('@/components/teleconsultation/VideoCall'),
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
//   meeting_link?: string;
//   meeting_id?: string;
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
//   const [agoraToken, setAgoraToken] = useState<string | null>(null);

//   // Modals
//   const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
//   const [showVisitDocumentationModal, setShowVisitDocumentationModal] = useState(false);

//   const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
//   const isAgoraConfigured = !!agoraAppId;

//   // Fetch appointment
//   useEffect(() => {
//     const fetchAppointment = async () => {
//       if (!appointmentId) {
//         setError('Appointment ID is missing');
//         setLoading(false);
//         return;
//       }
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
//         setError('Could not load appointment details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAppointment();
//   }, [appointmentId]);

//   const fetchAgoraToken = async (channelName: string): Promise<string | null> => {
//     try {
//       const res = await fetch('/api/agora/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ channelName, role: 'publisher' }),
//       });
//       const data = await res.json();
//       if (data.success && data.token) return data.token;
//       throw new Error(data.message || 'Failed to get token');
//     } catch (err) {
//       console.error('Token fetch error:', err);
//       toast.error('Could not initialize video call. Please try again later.');
//       return null;
//     }
//   };

//   const handleJoinCall = useCallback(async () => {
//     if (!appointment) return;
//     setJoining(true);
//     const channelName = `teleconsultation-${appointment.id}`;
//     const token = await fetchAgoraToken(channelName);
//     if (token) {
//       setAgoraToken(token);
//       setShowVideoCall(true);
//     }
//     setJoining(false);
//   }, [appointment]);

//   const handleEndCall = useCallback(() => {
//     setShowVideoCall(false);
//     setAgoraToken(null);
//     toast.success('Call ended.');
//   }, []);

//   const handlePrescriptionAdded = (medications: any[]) => {
//     toast.success(`✅ ${medications.length} medication(s) added!`);
//     setShowPrescriptionModal(false);
//   };

//   const formatDateTime = (dateStr: string, timeStr: string) => {
//     try {
//       const date = new Date(dateStr);
//       const formattedDate = date.toLocaleDateString(undefined, {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       });
//       const [hours, minutes] = timeStr.split(':');
//       const hour = parseInt(hours);
//       const ampm = hour >= 12 ? 'PM' : 'AM';
//       const hour12 = hour % 12 || 12;
//       return { formattedDate, time: `${hour12}:${minutes} ${ampm}` };
//     } catch {
//       return { formattedDate: 'Invalid date', time: 'Invalid time' };
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (error || !appointment) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Error</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>{error || 'Appointment not found'}</p>
//             <Button onClick={() => router.push('/doctor/dashboard')} className="mt-4">
//               Back to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
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
//         <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
//           <Card>
//             <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
//               <CardTitle className="flex items-center gap-2">
//                 <Video className="h-6 w-6" />
//                 Teleconsultation
//               </CardTitle>
//               <p className="text-sm text-blue-100">ID: {appointment.id}</p>
//             </CardHeader>

//             <CardContent className="p-6 space-y-6">
//               {/* Patient info */}
//               <div className="flex items-center gap-4 pb-4 border-b">
//                 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
//                   <User className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold">{appointment.patient_name}</h2>
//                   <p className="text-sm text-gray-500">
//                     {appointment.patient_email || ''} {appointment.patient_phone ? `· ${appointment.patient_phone}` : ''}
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm text-gray-500">Date</p>
//                     <p className="font-medium">{formattedDate}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Clock className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm text-gray-500">Time</p>
//                     <p className="font-medium">{time}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-4">
//                 <h3 className="text-sm font-medium text-gray-500">Your Information</h3>
//                 <p className="font-medium">Dr. {appointment.doctor_name}</p>
//                 <p className="text-sm text-gray-600">{appointment.doctor_specialty}</p>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-gray-500">Status</span>
//                 <Badge>{appointment.status}</Badge>
//               </div>

//               {appointment.notes && (
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">Clinical Notes</p>
//                   <p className="text-sm">{appointment.notes}</p>
//                 </div>
//               )}

//               {!showVideoCall ? (
//                 <>
//                   <Button
//                     onClick={handleJoinCall}
//                     disabled={joining || !isAgoraConfigured}
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
//                     size="lg"
//                   >
//                     {joining ? (
//                       <>
//                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                         Initializing Call...
//                       </>
//                     ) : (
//                       <>
//                         <Phone className="mr-2 h-5 w-5" />
//                         Join Video Call
//                       </>
//                     )}
//                   </Button>
//                   {!isAgoraConfigured && (
//                     <div className="text-sm text-yellow-600 text-center">
//                       Video call not configured. Please contact support.
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-sm text-gray-500 text-center py-2">
//                   Call in progress… Use the floating controls.
//                 </div>
//               )}

//               <div className="text-xs text-gray-500 text-center border-t pt-4">
//                 <p>Ensure stable internet and working camera/microphone.</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Video Call Overlay */}
//       {showVideoCall && appointment && isAgoraConfigured && agoraToken && (
//         <VideoCall
//           appId={agoraAppId!}
//           channel={`teleconsultation-${appointment.id}`}
//           token={agoraToken}
//           uid={1001}
//           onClose={handleEndCall}
//           onOpenPrescription={() => setShowPrescriptionModal(true)}
//           onOpenVisitDocumentation={() => setShowVisitDocumentationModal(true)} // 👈 new callback
//         />
//       )}

//       {/* Prescription Modal */}
//       {showPrescriptionModal && appointment && (
//         <AddMedicationModal
//           onClose={() => setShowPrescriptionModal(false)}
//           onAdd={handlePrescriptionAdded}
//           patientId={appointment.patient_id}
//           appointmentId={appointment.id}
//         />
//       )}

//       {/* ✅ Visit Documentation Modal – full CurrentVisitPage */}
//       {showVisitDocumentationModal && appointment && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
//             <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
//               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
//                 <FileText className="h-5 w-5 text-blue-600" />
//                 Clinical Documentation
//               </h2>
//               <button
//                 onClick={() => setShowVisitDocumentationModal(false)}
//                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <X className="h-5 w-5 text-slate-500" />
//               </button>
//             </div>
//             <div className="p-6">
//               <CurrentVisitPage
//                 patientId={appointment.patient_id || ''}
//                 appointmentId={appointment.id}
//                 date={appointment.appointment_date}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, Loader2, X, FileText, Mic } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';
import toast from 'react-hot-toast';

import AddMedicationModal from '@/components/doctor/AddMedicationModal';
import CurrentVisitPage from '@/components/doctor/CurrentVisitPage';

const VideoCall = dynamic(
  () => import('@/components/teleconsultation/VideoCall'),
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
  const [agoraToken, setAgoraToken] = useState<string | null>(null);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showVisitDocumentationModal, setShowVisitDocumentationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVisitMinimized, setIsVisitMinimized] = useState(false);

  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const isAgoraConfigured = !!agoraAppId;

  // Fetch appointment
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
        } else {
          setError('Appointment not found');
        }
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Could not load appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const fetchAgoraToken = async (channelName: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, role: 'publisher' }),
      });
      const data = await res.json();
      if (data.success && data.token) return data.token;
      throw new Error(data.message || 'Failed to get token');
    } catch (err) {
      console.error('Token fetch error:', err);
      toast.error('Could not initialize video call. Please try again later.');
      return null;
    }
  };

  const handleJoinCall = useCallback(async () => {
    if (!appointment) return;
    setJoining(true);
    const channelName = `teleconsultation-${appointment.id}`;
    const token = await fetchAgoraToken(channelName);
    if (token) {
      setAgoraToken(token);
      setShowVideoCall(true);
    }
    setJoining(false);
  }, [appointment]);

  const handleEndCall = useCallback(() => {
    setShowVideoCall(false);
    setAgoraToken(null);
    if (isRecording) setIsRecording(false);
    toast.success('Call ended.');
  }, [isRecording]);

  const handlePrescriptionAdded = (medications: any[]) => {
    toast.success(`✅ ${medications.length} medication(s) added!`);
    setShowPrescriptionModal(false);
  };

  const toggleRecording = useCallback(() => {
    const newState = !isRecording;
    setIsRecording(newState);
    if (newState) {
      if (!showVisitDocumentationModal) {
        setShowVisitDocumentationModal(true);
        setIsVisitMinimized(false);
      }
      toast.success('🎤 Recording started – AI Scribe is listening.');
    } else {
      toast.success('⏹️ Recording stopped.');
    }
  }, [isRecording, showVisitDocumentationModal]);

  const handleMinimizeChange = useCallback((minimized: boolean) => {
    setIsVisitMinimized(minimized);
  }, []);

  const formatDateTime = (dateStr: string, timeStr: string) => {
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
    } catch {
      return { formattedDate: 'Invalid date', time: 'Invalid time' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#2BB2A7]" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <p>{error || 'Appointment not found'}</p>
            <Button onClick={() => router.push('/doctor/dashboard')} className="mt-4 bg-[#2BB2A7] hover:bg-[#1F8F89] text-white">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { formattedDate, time } = formatDateTime(
    appointment.appointment_date,
    appointment.appointment_time
  );

  return (
    <>
      <div className="min-h-screen bg-[#F4F9F7]">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          <Card className="border-0 shadow-xl overflow-hidden bg-white">
            {/* Header – gradient matching sidebar green theme */}
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-t-xl pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Video className="h-6 w-6" />
                </div>
                Teleconsultation
              </CardTitle>
              <p className="text-sm text-emerald-100 mt-1">ID: {appointment.id}</p>
              {isRecording && (
                <div className="flex items-center gap-2 mt-2 text-xs bg-red-500/30 px-3 py-1.5 rounded-full w-fit backdrop-blur-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  Recording in progress
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-6 bg-white">
              {/* Patient info */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#E2EFEA]">
                <div className="w-16 h-16 rounded-full bg-[#EAF7F4] flex items-center justify-center shadow-inner">
                  <User className="h-8 w-8 text-[#2BB2A7]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{appointment.patient_name}</h2>
                  <p className="text-sm text-slate-500">
                    {appointment.patient_email || ''} {appointment.patient_phone ? `· ${appointment.patient_phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#F4F9F7] rounded-xl border border-[#E2EFEA]">
                  <Calendar className="h-5 w-5 text-[#2BB2A7]" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date</p>
                    <p className="font-medium text-slate-800">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F4F9F7] rounded-xl border border-[#E2EFEA]">
                  <Clock className="h-5 w-5 text-[#2BB2A7]" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Time</p>
                    <p className="font-medium text-slate-800">{time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#EAF7F4] rounded-xl p-4 border border-[#E2EFEA]">
                <h3 className="text-sm font-medium text-[#1F8F89]">Your Information</h3>
                <p className="font-semibold text-slate-800">Dr. {appointment.doctor_name}</p>
                <p className="text-sm text-slate-600">{appointment.doctor_specialty}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 px-3 py-1">
                  {appointment.status}
                </Badge>
              </div>

              {appointment.notes && (
                <div className="bg-[#F4F9F7] rounded-xl p-4 border border-[#E2EFEA]">
                  <p className="text-sm text-slate-500">Clinical Notes</p>
                  <p className="text-sm text-slate-700">{appointment.notes}</p>
                </div>
              )}

              {/* Call Controls */}
              {!showVideoCall ? (
                <Button
                  onClick={handleJoinCall}
                  disabled={joining || !isAgoraConfigured}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6 text-lg shadow-lg shadow-emerald-600/30 transition-all duration-200"
                  size="lg"
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing Call...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-5 w-5" />
                      Join Video Call
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-[#EAF7F4] rounded-xl border border-[#E2EFEA]">
                  <span className="text-sm text-[#1F8F89] font-medium">Call in progress…</span>
                  <div className="flex items-center gap-2">
                    {isRecording && <Mic className="h-4 w-4 text-red-500 animate-pulse" />}
                    <span className="text-xs text-[#2BB2A7]">Use floating controls</span>
                  </div>
                </div>
              )}

              {!isAgoraConfigured && (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-xl text-center border border-yellow-200">
                  Video call not configured. Please contact support.
                </div>
              )}

              <div className="text-xs text-slate-400 text-center border-t border-[#E2EFEA] pt-4">
                <p>Ensure stable internet and working camera/microphone.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Call Overlay */}
      {showVideoCall && appointment && isAgoraConfigured && agoraToken && (
        <VideoCall
          appId={agoraAppId!}
          channel={`teleconsultation-${appointment.id}`}
          token={agoraToken}
          uid={1001}
          onClose={handleEndCall}
          onOpenPrescription={() => setShowPrescriptionModal(true)}
          onOpenVisitDocumentation={() => {
            setIsVisitMinimized(false);
            setShowVisitDocumentationModal(true);
          }}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
        />
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && appointment && (
        <AddMedicationModal
          onClose={() => setShowPrescriptionModal(false)}
          onAdd={handlePrescriptionAdded}
          patientId={appointment.patient_id}
          appointmentId={appointment.id}
        />
      )}

      {/* Visit Documentation Modal */}
      {showVisitDocumentationModal && appointment && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${
            isVisitMinimized ? 'bg-transparent pointer-events-none' : 'bg-[#1F8F89]/60 backdrop-blur-sm'
          }`}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 ${
              isVisitMinimized ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            {!isVisitMinimized && (
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Documentation
                </h2>
                <button
                  onClick={() => {
                    setShowVisitDocumentationModal(false);
                    setIsVisitMinimized(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className={isVisitMinimized ? 'p-0' : 'p-6'}>
              <CurrentVisitPage
                patientId={appointment.patient_id || ''}
                appointmentId={appointment.id}
                date={appointment.appointment_date}
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                onMinimizeChange={handleMinimizeChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}