'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, Loader2, AlertCircle } from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments';

const VideoCall = dynamic(
  () => import('@/components/teleconsultation/VideoCall'),
  { ssr: false }
);

interface Appointment {
  id: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
  notes?: string;
  patient_id?: string;
}

export default function TeleconsultationPage() {
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
      try {
        const response = await appointmentsApi.getAppointment(appointmentId);
        const data = response.data?.data || response.data;
        let apt: Appointment | null = null;
        if (Array.isArray(data)) {
          apt = data.find((item: any) => item.id === appointmentId) || null;
        } else if (data && typeof data === 'object') {
          apt = data;
        }
        if (apt && apt.id) {
          setAppointment(apt);
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
    if (appointmentId) fetchAppointment();
  }, [appointmentId]);

  // Fetch a fresh token from your backend
  const fetchAgoraToken = async (channelName: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName }),
      });
      const data = await res.json();
      if (data.success && data.token) return data.token;
      throw new Error(data.message || 'Failed to get token');
    } catch (err) {
      console.error('Token fetch error:', err);
      setError('Could not initialize video call. Please try again later.');
      return null;
    }
  };

  const handleJoinCall = async () => {
    if (!appointment) return;
    setJoining(true);
    const channelName = `teleconsultation-${appointment.id}`;
    const token = await fetchAgoraToken(channelName);
    if (token) {
      setAgoraToken(token);
      setShowVideoCall(true);
    }
    setJoining(false);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{error || 'Appointment not found'}</p>
            <Button className="mt-4" variant="outline" onClick={() => router.push('/patient/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { formattedDate, time } = formatDateTime(appointment.appointment_date, appointment.appointment_time);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-6 w-6" />
                Teleconsultation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {appointment.doctor_name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.doctor_specialty}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">{time}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge className={appointment.status === 'BOOKED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {appointment.status}
                </Badge>
              </div>

              {appointment.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                </div>
              )}

              <div className="pt-4">
                {!isAgoraConfigured ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">Video call is not configured. Please contact support.</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinCall}
                    disabled={joining}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing Call...
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

      {showVideoCall && appointment && isAgoraConfigured && agoraToken && (
        <VideoCall
          appId={agoraAppId!}
          channel={`teleconsultation-${appointment.id}`}
          token={agoraToken}
          uid={null}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </>
  );
}