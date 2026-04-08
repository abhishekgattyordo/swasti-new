'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';
import toast from 'react-hot-toast';

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
      await appointmentsApi.updateAppointment(appointment.id, { status: 'IN_PROGRESS' }).catch(() => {});
      setShowVideoCall(true);
    }
    setJoining(false);
  }, [appointment]);

  const handleEndCall = useCallback(async () => {
    setShowVideoCall(false);
    setAgoraToken(null);
    if (appointment) {
      await appointmentsApi.updateAppointment(appointment.id, { status: 'COMPLETED' }).catch(() => {});
      toast.success('Call ended. Appointment marked as completed.');
    }
  }, [appointment]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Appointment not found'}</p>
            <Button onClick={() => router.push('/doctor/dashboard')} className="mt-4">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          {/* <Button
            variant="ghost"
            onClick={() => router.push('/doctor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button> */}

          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                Teleconsultation
              </CardTitle>
              <p className="text-sm text-blue-100">ID: {appointment.id}</p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{appointment.patient_name}</h2>
                  <p className="text-sm text-gray-500">
                    {appointment.patient_email || ''} {appointment.patient_phone ? `· ${appointment.patient_phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Your Information</h3>
                <p className="font-medium">Dr. {appointment.doctor_name}</p>
                <p className="text-sm text-gray-600">{appointment.doctor_specialty}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge>{appointment.status}</Badge>
              </div>

              {appointment.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Clinical Notes</p>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}

              <Button
                onClick={handleJoinCall}
                disabled={joining || !isAgoraConfigured}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
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

              {!isAgoraConfigured && (
                <div className="text-sm text-yellow-600 text-center">
                  Video call not configured. Please contact support.
                </div>
              )}

              <div className="text-xs text-gray-500 text-center border-t pt-4">
                <p>Ensure stable internet and working camera/microphone.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showVideoCall && appointment && isAgoraConfigured && agoraToken && (
        <VideoCall
          appId={agoraAppId!}
          channel={`teleconsultation-${appointment.id}`}
          token={agoraToken}
          uid={null}
          onClose={handleEndCall}
        />
      )}
    </>
  );
}