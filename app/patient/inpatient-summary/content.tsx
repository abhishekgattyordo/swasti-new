

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/patient/Sidebar';
import { 
  Menu, X, Loader2, Calendar, AlertCircle, FileText, 
  Activity, ChevronDown, ChevronUp, ExternalLink, User,
  Stethoscope, Heart, Thermometer, Droplets, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InPatientSummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get('date');
  const patientIdParam = searchParams.get('patientId');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(dateParam || '');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [manualPatientId, setManualPatientId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [noAdmission, setNoAdmission] = useState(false);
  
  // Emergency summary states
  const [emergencySummary, setEmergencySummary] = useState<any>(null);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  // Sync selectedDate with URL dateParam
  useEffect(() => {
    if (dateParam) setSelectedDate(dateParam);
  }, [dateParam]);

  // Get patient ID from URL or localStorage
  useEffect(() => {
    if (patientIdParam) {
      setPatientId(patientIdParam);
      return;
    }

    try {
      const stored = localStorage.getItem('patientId');
      if (stored) {
        setPatientId(stored);
        return;
      }
    } catch (err) {
      console.warn('localStorage error:', err);
    }

    setShowManualInput(true);
    setLoading(false);
  }, [patientIdParam]);

  // Fetch emergency summary for this patient
  const fetchEmergencySummary = async (pid: string) => {
    try {
      setLoadingEmergency(true);
      const res = await fetch(`/api/patient/emergency-summary?patientId=${pid}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        setEmergencySummary(result.data);
      } else {
        setEmergencySummary(null);
      }
    } catch (error) {
      console.error('Error fetching emergency summary:', error);
      setEmergencySummary(null);
    } finally {
      setLoadingEmergency(false);
    }
  };

  const fetchSummaryByDate = async (pid: string, date: string) => {
    try {
      setLoading(true);
      setNoAdmission(false);
      setError(null);
      
      const res = await fetch(`/api/patient/inpatient-summary?patientId=${pid}&date=${date}`);
      const result = await res.json();
      
      if (result.success) {
        setSummaryData(result.data);
        setError(null);
        setNoAdmission(false);
      } else {
        if (result.message?.includes('No active admission found')) {
          setNoAdmission(true);
          setSummaryData(null);
          setError(null);
        } else {
          throw new Error(result.message);
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load summary');
      toast.error(err.message || 'Failed to load summary');
      setSummaryData(null);
      setNoAdmission(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    router.push(`/patient/inpatient-summary?${params.toString()}`);
  };

  const handleManualSubmit = () => {
    if (!manualPatientId) {
      toast.error('Please enter a patient ID');
      return;
    }
    localStorage.setItem('patientId', manualPatientId);
    setPatientId(manualPatientId);
    setShowManualInput(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('patientId', manualPatientId);
    router.push(`/patient/inpatient-summary?${params.toString()}`);
  };

  // Load data when patientId is available
  useEffect(() => {
    if (!patientId) return;
    if (showManualInput) return;

    const loadData = async () => {
      let targetDate = dateParam;
      if (!targetDate) {
        const today = new Date().toISOString().split('T')[0];
        targetDate = today;
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', today);
        if (!patientIdParam) params.set('patientId', patientId);
        router.replace(`/patient/inpatient-summary?${params.toString()}`);
        return;
      }
      
      await Promise.all([
        fetchSummaryByDate(patientId, targetDate),
        fetchEmergencySummary(patientId)
      ]);
    };

    loadData();
  }, [patientId, dateParam]);

  const getTriageBadge = (triage: string) => {
    const config: Record<string, string> = {
      Red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return config[triage] || config.Green;
  };

  // Manual input screen
  if (showManualInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Enter Patient ID</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please enter your patient ID to view the complete patient summary.
          </p>
          <input
            type="text"
            value={manualPatientId}
            onChange={(e) => setManualPatientId(e.target.value)}
            placeholder="e.g., 1778062374665888"
            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleManualSubmit}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Load Summary
          </button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading || loadingEmergency) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </main>
      </div>
    );
  }

  // No admission found but show emergency history
  if (noAdmission) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {emergencySummary && emergencySummary.latestAssessment ? (
            <CompletePatientFlow 
              emergencySummary={emergencySummary}
              inpatientData={null}
              showEmergencyDetails={showEmergencyDetails}
              onToggleEmergencyDetails={() => setShowEmergencyDetails(!showEmergencyDetails)}
              onViewAssessment={(id) => router.push(`/emergency/assessments/${id}`)}
              getTriageBadge={getTriageBadge}
            />
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Records Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No active admission or emergency records found.
                </p>
                <button
                  onClick={() => router.push('/emergency/assessments/new')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Start Emergency Assessment
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Error screen
  if (error || !summaryData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Unable to load patient summary'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success screen - complete flow
  const { patient, timelineEvents, medicalRecords, billing } = summaryData;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Date picker */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Complete Patient Flow - Single Integrated View */}
        <CompletePatientFlow 
          emergencySummary={emergencySummary}
          inpatientData={{
            patient,
            timelineEvents,
            medicalRecords,
            billing
          }}
          showEmergencyDetails={showEmergencyDetails}
          onToggleEmergencyDetails={() => setShowEmergencyDetails(!showEmergencyDetails)}
          onViewAssessment={(id) => router.push(`/emergency/assessments/${id}`)}
          getTriageBadge={getTriageBadge}
        />

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            Disclaimer: This summary is for information management purposes.
            Always consult official medical records for accurate medical advice.
          </p>
        </footer>
      </main>
    </div>
  );
}

// Complete Patient Flow Component - Single Integrated View
function CompletePatientFlow({ 
  emergencySummary, 
  inpatientData,
  showEmergencyDetails, 
  onToggleEmergencyDetails, 
  onViewAssessment,
  getTriageBadge
}: { 
  emergencySummary: any;
  inpatientData: any;
  showEmergencyDetails: boolean;
  onToggleEmergencyDetails: () => void;
  onViewAssessment: (id: string) => void;
  getTriageBadge: (triage: string) => string;
}) {
  const hasEmergency = emergencySummary?.latestAssessment;
  const hasInpatient = inpatientData?.patient;

  return (
    <div className="space-y-6">
      {/* Header */}
      {inpatientData?.patient && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{inpatientData.patient.name}</h1>
              <p className="text-green-100 mt-1">
                Admission ID: {inpatientData.patient.admissionId}
              </p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {inpatientData.patient.status || 'Admitted'}
            </span>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-green-100 text-xs">Primary Consultant</p>
              <p className="font-semibold">{inpatientData.patient.primaryConsultant || '—'}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Ward / Room</p>
              <p className="font-semibold">{inpatientData.patient.wardRoom || '—'}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Admission Date</p>
              <p className="font-semibold">
                {inpatientData.patient.admissionDate ? new Date(inpatientData.patient.admissionDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-green-100 text-xs">Discharge Date</p>
              <p className="font-semibold">
                {inpatientData.patient.dischargeDate ? new Date(inpatientData.patient.dischargeDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency History Section */}
      {hasEmergency && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-2xl overflow-hidden shadow-sm border border-blue-200 dark:border-blue-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Emergency Department History
              </h2>
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                {emergencySummary.summary?.totalVisits || 0} visit(s)
              </span>
            </div>
            <button
              onClick={onToggleEmergencyDetails}
              className="text-blue-600 hover:text-blue-700"
            >
              {showEmergencyDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Latest Assessment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Last Emergency Visit</p>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {emergencySummary.latestAssessment.date ? new Date(emergencySummary.latestAssessment.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Triage Level</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTriageBadge(emergencySummary.latestAssessment.triage)}`}>
                  {emergencySummary.latestAssessment.triage || 'N/A'}
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Decision</p>
                <p className="text-sm font-semibold">{emergencySummary.latestAssessment.decision || 'N/A'}</p>
              </div>
            </div>

            {/* Doctors Info */}
            {emergencySummary.doctors && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Treating Doctor</p>
                      <p className="text-sm font-semibold">{emergencySummary.doctors.treatingDoctor || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Assessment Written By</p>
                      <p className="text-sm font-semibold">{emergencySummary.doctors.assessmentWrittenBy || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
                {emergencySummary.doctors.referredTo && emergencySummary.doctors.referredTo !== 'None' && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">Referred To</p>
                    <p className="text-sm">{emergencySummary.doctors.referredTo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Clinical Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Latest Assessment</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Chief Complaints</p>
                  <p className="text-sm">{emergencySummary.latestAssessment.chiefComplaints || 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Diagnosis</p>
                  <p className="text-sm">{emergencySummary.latestAssessment.diagnosis || 'Not recorded'}</p>
                </div>
                
                {/* Vitals */}
                {emergencySummary.latestAssessment.vitals && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                    {emergencySummary.latestAssessment.vitals.bp && (
                      <div>
                        <p className="text-xs text-gray-500">BP</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          {emergencySummary.latestAssessment.vitals.bp}
                        </p>
                      </div>
                    )}
                    {emergencySummary.latestAssessment.vitals.heartRate && (
                      <div>
                        <p className="text-xs text-gray-500">Heart Rate</p>
                        <p className="text-sm font-medium">{emergencySummary.latestAssessment.vitals.heartRate} bpm</p>
                      </div>
                    )}
                    {emergencySummary.latestAssessment.vitals.temperature && (
                      <div>
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Thermometer className="h-3 w-3 text-orange-500" />
                          {emergencySummary.latestAssessment.vitals.temperature}
                        </p>
                      </div>
                    )}
                    {emergencySummary.latestAssessment.vitals.spo2 && (
                      <div>
                        <p className="text-xs text-gray-500">SpO₂</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          {emergencySummary.latestAssessment.vitals.spo2}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <p className="text-xs text-gray-500">Assessment ID</p>
                    <p className="text-xs font-mono">{emergencySummary.latestAssessment.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-xs">{emergencySummary.latestAssessment.status}</p>
                  </div>
                </div>
              </div>
              
            </div>

            {/* All Visits History (expandable) */}
            {showEmergencyDetails && emergencySummary.allVisits?.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">All Emergency Visits</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {emergencySummary.allVisits.map((visit: any) => (
                    <div key={visit.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-xs font-mono">{visit.id}</p>
                        <p className="text-xs text-gray-500">{new Date(visit.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTriageBadge(visit.triage)}`}>
                          {visit.triage}
                        </span>
                        <span className="text-xs text-gray-600">{visit.decision}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inpatient Timeline */}
      {hasInpatient && inpatientData.timelineEvents?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
            Hospital Stay Timeline
          </h2>
          <div className="relative pl-4">
            <div className="absolute top-2 bottom-6 left-[27px] w-0.5 bg-gradient-to-b from-green-600/80 to-green-600/10"></div>
            {inpatientData.timelineEvents.map((event: any, index: number) => (
              <div key={event.id} className={`relative flex gap-6 ${index < inpatientData.timelineEvents.length - 1 ? 'pb-8' : ''} group`}>
                <div className="mt-1 flex-shrink-0 relative">
                  <div className={`h-6 w-6 rounded-full ${
                    event.type === 'surgery' ? 'bg-green-600' : 'bg-white dark:bg-gray-800 border-2 border-green-600'
                  } z-10 relative flex items-center justify-center`}>
                    {event.icon ? <span className="text-white text-[14px]">{event.icon}</span> : <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>}
                  </div>
                </div>
                <div className="flex-grow">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 block">{event.date}</span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Records & Billing */}
      {hasInpatient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical Records */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> Medical Records
            </h2>
            <div className="space-y-3">
              {inpatientData.medicalRecords?.length > 0 ? (
                inpatientData.medicalRecords.map((record: any) => (
                  <a key={record.id} href={record.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{record.title}</p>
                      <p className="text-xs text-gray-500">{record.subtitle}</p>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No medical records available</p>
              )}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Billing Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-xl font-bold">₹{inpatientData.billing?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Insurance Coverage</span>
                <span className="text-sm font-medium text-green-600">- ₹{inpatientData.billing?.insuranceCoverage?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-bold">Patient to Pay</span>
                  <span className="text-2xl font-bold text-green-600">₹{inpatientData.billing?.patientPay?.toFixed(2) || '0.00'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Status: <span className={`font-medium ${inpatientData.billing?.status === 'Settled' ? 'text-green-600' : 'text-orange-600'}`}>
                    {inpatientData.billing?.status || 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}