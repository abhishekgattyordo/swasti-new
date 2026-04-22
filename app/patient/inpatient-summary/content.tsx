'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/patient/Sidebar';
import { Menu, X, Loader2, Calendar, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InPatientSummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get('date'); // YYYY-MM-DD
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

  // Sync selectedDate with URL dateParam
  useEffect(() => {
    if (dateParam) setSelectedDate(dateParam);
  }, [dateParam]);

  // Get patient ID from URL or localStorage (no API call)
  useEffect(() => {
    console.log('🚀 useEffect triggered');
    console.log('📌 patientIdParam:', patientIdParam);

    if (patientIdParam) {
      console.log('✅ Using patientId from URL:', patientIdParam);
      setPatientId(patientIdParam);
      return;
    }

    console.log('🔍 Checking localStorage for patientId...');

    try {
      const stored = localStorage.getItem('patientId');
      console.log('📦 localStorage value:', stored);

      if (stored) {
        console.log('✅ Using patientId from localStorage:', stored);
        setPatientId(stored);
        return;
      } else {
        console.log('⚠️ No patientId found in localStorage');
      }
    } catch (err) {
      console.warn('❌ localStorage error:', err);
    }

    console.log('⚠️ No patientId found anywhere → showing manual input');

    // No patientId found – show manual input
    setShowManualInput(true);
    setLoading(false);
  }, [patientIdParam]);

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
        // Check if it's a "no admission found" error
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
    // Reload with new patientId in URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('patientId', manualPatientId);
    router.push(`/patient/inpatient-summary?${params.toString()}`);
  };

  // Load summary when patientId and date are available
  useEffect(() => {
    if (!patientId) return;
    if (showManualInput) return;

    const loadSummary = async () => {
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
      await fetchSummaryByDate(patientId, targetDate);
    };

    loadSummary();
  }, [patientId, dateParam]);

  // Manual input screen
  if (showManualInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Enter Patient ID</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            No patient ID found in URL or localStorage. Please enter your patient ID to view the summary.
          </p>
          <input
            type="text"
            value={manualPatientId}
            onChange={(e) => setManualPatientId(e.target.value)}
            placeholder="e.g., 17744283791605696"
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
  if (loading) {
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

  // No admission found screen
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

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Active Admission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any active admission record 
            </p>
       
          </div>
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
              {error || 'Unable to load inpatient summary'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleDateChange(today);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Try Today
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success screen - show summary data
  const { patient, timelineEvents, medicalRecords, billing } = summaryData;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Date picker */}
          <div className="mb-6 flex justify-end items-center gap-2">
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

          {/* Patient Summary Card */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-green-600/10 transition-colors duration-500"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient?.name || '—'}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    patient?.status === 'Discharged'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}>
                    {patient?.status || 'Admitted'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Admission ID: <span className="font-mono text-gray-700 dark:text-gray-300">{patient?.admissionId || '—'}</span>
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Primary Consultant</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {patient?.primaryConsultant ? (
                      <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {patient.primaryConsultant.charAt(0)}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">—</div>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{patient?.primaryConsultant || '—'}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-11">{patient?.consultantDept || '—'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ward / Room</p>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                  <span className="text-green-600 dark:text-green-400 text-xl">🏥</span>
                  <span>{patient?.wardRoom || '—'}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Admission Date</p>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                  <span className="text-green-600 dark:text-green-400 text-xl">📅</span>
                  <span>{patient?.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Discharge Date</p>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                  <span className="text-green-600 dark:text-green-400 text-xl">📅</span>
                  <span>{patient?.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                  Hospital Stay Timeline
                </h2>
                <div className="relative pl-4">
                  <div className="absolute top-2 bottom-6 left-[27px] w-0.5 bg-gradient-to-b from-green-600/80 to-green-600/10"></div>
                  {timelineEvents?.map((event: any, index: number) => (
                    <div key={event.id} className={`relative flex gap-6 ${index < timelineEvents.length - 1 ? 'pb-12' : ''} group`}>
                      <div className="mt-1 flex-shrink-0 relative">
                        <div className={`h-6 w-6 rounded-full ${
                          event.type === 'surgery'
                            ? 'bg-green-600'
                            : 'bg-white dark:bg-gray-800 border-2 ' +
                              (event.color === 'green'
                                ? 'border-green-600 dark:border-green-500'
                                : 'border-gray-300 dark:border-gray-600')
                        } z-10 relative flex items-center justify-center`}>
                          {event.icon && <span className="text-white text-[14px]">{event.icon}</span>}
                          {!event.icon && event.color === 'green' && <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <span className={`text-xs font-semibold ${
                          event.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                        } mb-1 block`}>{event.date}</span>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{event.description}</p>
                        {event.note && (
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-2 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">{event.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Medical Records */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400 text-xl">📋</span>
                  Medical Records
                </h2>
                <div className="space-y-3">
                  {medicalRecords?.length > 0 ? (
                    medicalRecords.map((record: any) => (
                      <a 
                        key={record.id} 
                        href={record.fileUrl || '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-green-200 dark:hover:border-green-900 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white text-green-600 dark:text-green-400 transition-colors">
                            <span className="text-xl">📄</span>
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{record.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{record.subtitle}</p>
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No medical records available</p>
                  )}
                </div>
              </div>

              {/* Billing Summary */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Final Bill Summary</h2>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{billing?.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Insurance Coverage</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    - ₹{billing?.insuranceCoverage?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Patient to Pay</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{billing?.patientPay?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Status: <span className={`font-medium ${billing?.status === 'Settled' ? 'text-green-600' : 'text-orange-600'}`}>
                      {billing?.status || 'Pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <p className="text-xs text-gray-400 max-w-2xl mx-auto">
              Disclaimer: This inpatient summary is for information management purposes.
              Always consult official medical records and your healthcare provider for accurate medical advice.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}