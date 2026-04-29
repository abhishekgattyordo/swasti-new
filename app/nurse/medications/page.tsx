
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pill, Clock, CheckCircle2, AlertCircle, XCircle, Plus, Filter, Search, Eye, Trash2, Calendar, Bell, Zap, Flame, RefreshCw } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  startDate: string;
  endDate?: string;
  reason: string;
  status: 'active' | 'discontinued' | 'suspended';
  orderType?: 'routine' | 'stat' | 'prn';
  orderedAt?: string;
}

interface MedicationAdministration {
  id: string;
  medicationId: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: string;
  status: 'pending' | 'administered' | 'missed' | 'refused';
  notes?: string;
  route: string;
  orderType?: 'routine' | 'stat' | 'prn';
  orderedAt?: string;
  isNewOrder?: boolean;
  minutesSinceOrder?: number;
}

interface Patient {
  id: string;
  name: string;
  bed: string;
  status: 'critical' | 'warning' | 'stable';
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'John Doe', bed: 'ICU-101', status: 'critical' },
  { id: 'P002', name: 'Mary Smith', bed: 'ICU-102', status: 'warning' },
  { id: 'P003', name: 'Robert Johnson', bed: 'Ward-201', status: 'stable' },
  { id: 'P004', name: 'Sarah Williams', bed: 'Ward-202', status: 'stable' },
];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'M001',
    name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescriber: 'Dr. Smith',
    startDate: '2026-04-20',
    reason: 'Hypertension management',
    status: 'active',
  },
  {
    id: 'M002',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily',
    route: 'Oral',
    prescriber: 'Dr. Johnson',
    startDate: '2026-04-15',
    reason: 'Type 2 Diabetes',
    status: 'active',
  },
  {
    id: 'M003',
    name: 'Amoxicillin',
    dosage: '500 mg',
    frequency: 'Three times daily',
    route: 'Oral',
    prescriber: 'Dr. Williams',
    startDate: '2026-04-25',
    endDate: '2026-05-02',
    reason: 'Bacterial infection',
    status: 'active',
  },
  {
    id: 'M004',
    name: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescriber: 'Dr. Smith',
    startDate: '2026-03-10',
    reason: 'Cholesterol management',
    status: 'active',
  },
  {
    id: 'M005',
    name: 'Omeprazole',
    dosage: '20 mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescriber: 'Dr. Johnson',
    startDate: '2026-04-22',
    reason: 'Acid reflux',
    status: 'discontinued',
  },
];

const generateMockAdministrations = (): MedicationAdministration[] => {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60000);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  
  return [
    {
      id: 'ADM001',
      medicationId: 'M001',
      patientId: 'P001',
      patientName: 'John Doe',
      medicationName: 'Lisinopril',
      dosage: '10 mg',
      scheduledTime: '09:00',
      administeredTime: '09:05',
      administeredBy: 'Nurse Johnson',
      status: 'administered',
      route: 'Oral',
      notes: 'Patient alert and cooperative',
      orderType: 'routine',
    },
    {
      id: 'ADM002',
      medicationId: 'M002',
      patientId: 'P002',
      patientName: 'Mary Smith',
      medicationName: 'Metformin',
      dosage: '500 mg',
      scheduledTime: '08:00',
      administeredTime: '08:10',
      administeredBy: 'Nurse Smith',
      status: 'administered',
      route: 'Oral',
      notes: 'With food as instructed',
      orderType: 'routine',
    },
    {
      id: 'ADM003',
      medicationId: 'M003',
      patientId: 'P003',
      patientName: 'Robert Johnson',
      medicationName: 'Amoxicillin',
      dosage: '500 mg',
      scheduledTime: '10:00',
      administeredTime: '10:02',
      administeredBy: 'Nurse Davis',
      status: 'administered',
      route: 'Oral',
      orderType: 'routine',
    },
    {
      id: 'ADM008',
      medicationId: 'STAT001',
      patientId: 'P001',
      patientName: 'John Doe',
      medicationName: 'Epinephrine',
      dosage: '0.3 mg',
      scheduledTime: 'NOW',
      status: 'pending',
      route: 'IM',
      orderType: 'stat',
      orderedAt: twoMinutesAgo.toISOString(),
      isNewOrder: true,
      minutesSinceOrder: 2,
      notes: 'STAT order for acute allergic reaction',
    },
    {
      id: 'ADM009',
      medicationId: 'PRN001',
      patientId: 'P002',
      patientName: 'Mary Smith',
      medicationName: 'Morphine',
      dosage: '2 mg',
      scheduledTime: 'PRN',
      status: 'pending',
      route: 'IV',
      orderType: 'prn',
      orderedAt: fiveMinutesAgo.toISOString(),
      isNewOrder: true,
      minutesSinceOrder: 5,
      notes: 'PRN for acute pain management',
    },
    {
      id: 'ADM004',
      medicationId: 'M001',
      patientId: 'P004',
      patientName: 'Sarah Williams',
      medicationName: 'Lisinopril',
      dosage: '10 mg',
      scheduledTime: '14:00',
      status: 'pending',
      route: 'Oral',
      orderType: 'routine',
    },
    {
      id: 'ADM005',
      medicationId: 'M002',
      patientId: 'P001',
      patientName: 'John Doe',
      medicationName: 'Metformin',
      dosage: '500 mg',
      scheduledTime: '18:00',
      status: 'pending',
      route: 'Oral',
      orderType: 'routine',
    },
    {
      id: 'ADM006',
      medicationId: 'M004',
      patientId: 'P002',
      patientName: 'Mary Smith',
      medicationName: 'Atorvastatin',
      dosage: '20 mg',
      scheduledTime: '20:00',
      status: 'pending',
      route: 'Oral',
      orderType: 'routine',
    },
    {
      id: 'ADM007',
      medicationId: 'M003',
      patientId: 'P003',
      patientName: 'Robert Johnson',
      medicationName: 'Amoxicillin',
      dosage: '500 mg',
      scheduledTime: '06:00',
      status: 'missed',
      route: 'Oral',
      notes: 'Patient was sleeping, not given',
      orderType: 'routine',
    },
  ];
};

export default function MedicationsPage() {
  const [selectedPatient, setSelectedPatient] = useState<string>(MOCK_PATIENTS[0].id);
  const [administrations, setAdministrations] = useState<MedicationAdministration[]>(generateMockAdministrations());
  const [viewType, setViewType] = useState<'today' | 'history' | 'prescriptions'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'administered' | 'missed' | 'refused'>('all');
  const [showAdminForm, setShowAdminForm] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dismissedSTATAlerts, setDismissedSTATAlerts] = useState<Set<string>>(new Set());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoRefresh) return;

    const performRefresh = () => {
      setAdministrations(generateMockAdministrations());
      setLastRefresh(new Date());
    };

    refreshIntervalRef.current = setInterval(performRefresh, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setAdministrations(generateMockAdministrations());
    setLastRefresh(new Date());
  };

  const statMedications = administrations.filter(
    adm => adm.orderType === 'stat' && adm.status === 'pending' && !dismissedSTATAlerts.has(adm.id)
  );
  const prnMedications = administrations.filter(
    adm => adm.orderType === 'prn' && adm.status === 'pending' && !dismissedSTATAlerts.has(adm.id)
  );

  const dismissAlert = (adminId: string) => {
    setDismissedSTATAlerts(prev => new Set([...prev, adminId]));
  };

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);
  
  const filteredAdministrations = administrations.filter(adm => {
    const matchesPatient = adm.patientId === selectedPatient;
    const matchesSearch = adm.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || adm.status === selectedStatus;
    return matchesPatient && matchesSearch && matchesStatus;
  });

  const handleAdminister = (adminId: string) => {
    setAdministrations(prev =>
      prev.map(adm =>
        adm.id === adminId
          ? {
              ...adm,
              status: 'administered',
              administeredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              administeredBy: 'Nurse Smith',
              notes: adminNotes,
            }
          : adm
      )
    );
    setShowAdminForm(null);
    setAdminNotes('');
  };

  const handleRefuse = (adminId: string) => {
    setAdministrations(prev =>
      prev.map(adm =>
        adm.id === adminId
          ? {
              ...adm,
              status: 'refused',
              notes: adminNotes,
            }
          : adm
      )
    );
    setShowAdminForm(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'administered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'missed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'refused':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'administered':
        return <CheckCircle2 size={18} />;
      case 'pending':
        return <Clock size={18} />;
      case 'missed':
        return <XCircle size={18} />;
      case 'refused':
        return <AlertCircle size={18} />;
      default:
        return null;
    }
  };

  const pendingCount = administrations.filter(a => a.status === 'pending' && a.patientId === selectedPatient).length;
  const administeredCount = administrations.filter(a => a.status === 'administered' && a.patientId === selectedPatient).length;
  const missedCount = administrations.filter(a => a.status === 'missed' && a.patientId === selectedPatient).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
         
          <div className="flex items-center gap-2">
            <Pill size={24} className="text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medication Administration Record (MAR)</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* STAT/PRN Alert Banner */}
        {(statMedications.length > 0 || prnMedications.length > 0) && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* STAT ORDERS ALERT */}
    {statMedications.length > 0 && (
      <div className="animate-pulse bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 border-l-4 border-red-900 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            <Flame size={24} className="text-red-100 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Zap size={18} />
              STAT ORDERS - URGENT
            </h3>
            <p className="text-red-100 text-xs mb-2">
              {statMedications.length} medication{statMedications.length !== 1 ? 's' : ''} requires immediate action
            </p>
            <div className="space-y-1">
              {statMedications.slice(0, 2).map(med => (
                <div key={med.id} className="bg-red-500/30 backdrop-blur rounded p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-white text-xs">{med.medicationName} {med.dosage}</p>
                      <p className="text-red-100 text-xs">
                        {med.patientName} • {med.minutesSinceOrder} min ago
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(med.patientId)}
                      className="bg-white hover:bg-red-50 text-red-700 font-bold py-1 px-2 rounded text-xs whitespace-nowrap"
                    >
                      Administer
                    </button>
                  </div>
                </div>
              ))}
              {statMedications.length > 2 && (
                <p className="text-red-100 text-xs text-center pt-1">
                  +{statMedications.length - 2} more
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* PRN ORDERS ALERT */}
    {prnMedications.length > 0 && (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-l-4 border-orange-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            <AlertCircle size={24} className="text-orange-100" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">PRN ORDERS</h3>
            <p className="text-orange-100 text-xs mb-2">
              {prnMedications.length} as-needed medication{prnMedications.length !== 1 ? 's' : ''} available
            </p>
            <div className="space-y-1">
              {prnMedications.slice(0, 2).map(med => (
                <div key={med.id} className="bg-orange-400/30 backdrop-blur rounded p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-white text-xs">{med.medicationName} {med.dosage}</p>
                      <p className="text-orange-100 text-xs">
                        {med.patientName} • Ordered: {med.minutesSinceOrder} min ago
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(med.patientId)}
                      className="bg-white hover:bg-orange-50 text-orange-700 font-bold py-1 px-2 rounded text-xs whitespace-nowrap"
                    >
                      Administer
                    </button>
                  </div>
                </div>
              ))}
              {prnMedications.length > 2 && (
                <p className="text-orange-100 text-xs text-center pt-1">
                  +{prnMedications.length - 2} more
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

        {/* Auto-Refresh Control */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Auto-refresh every 30s
              </label>
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Now
          </button>
        </div>

        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOCK_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPatient === p.id
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-purple-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bed {p.bed}</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  p.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  p.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Doses</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{pendingCount}</p>
              </div>
              <Clock size={32} className="text-yellow-600 opacity-20" />
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Administered</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{administeredCount}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Missed/Refused</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{missedCount}</p>
              </div>
              <XCircle size={32} className="text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {(['today', 'history', 'prescriptions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setViewType(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewType === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'today' && 'Today\'s Schedule'}
                {tab === 'history' && 'Administration History'}
                {tab === 'prescriptions' && 'Active Prescriptions'}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'administered', 'missed', 'refused'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewType === 'today' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Medication Schedule - {patient?.name}</h2>
            {filteredAdministrations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 text-center">
                <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 dark:text-gray-400">No medications scheduled</p>
              </div>
            ) : (
              filteredAdministrations.map(adm => (
                <div
                  key={adm.id}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{adm.medicationName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusBadge(adm.status)}`}>
                          {getStatusIcon(adm.status)}
                          {adm.status.charAt(0).toUpperCase() + adm.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dosage: <span className="font-semibold text-gray-900 dark:text-white">{adm.dosage}</span></p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Route: <span className="font-semibold text-gray-900 dark:text-white">{adm.route}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{adm.scheduledTime}</p>
                      {adm.administeredTime && (
                        <p className="text-sm text-green-600">Administered: {adm.administeredTime}</p>
                      )}
                    </div>
                  </div>

                  {adm.notes && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">Notes:</span> {adm.notes}</p>
                    </div>
                  )}

                  {adm.administeredBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Administered by: {adm.administeredBy}</p>
                  )}

                  {adm.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAdminForm(adm.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Give Medication
                      </button>
                      <button
                        onClick={() => setShowAdminForm(`refuse-${adm.id}`)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={18} />
                        Patient Refused
                      </button>
                    </div>
                  )}

                  {showAdminForm === adm.id && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                      <textarea
                        placeholder="Add administration notes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdminister(adm.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          Confirm Administration
                        </button>
                        <button
                          onClick={() => setShowAdminForm(null)}
                          className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {showAdminForm === `refuse-${adm.id}` && (
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-3">
                      <textarea
                        placeholder="Reason for refusal..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRefuse(adm.id)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          Confirm Refusal
                        </button>
                        <button
                          onClick={() => setShowAdminForm(null)}
                          className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {viewType === 'history' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administration History - {patient?.name}</h2>
            {filteredAdministrations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 dark:text-gray-400">No administration records</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAdministrations.map(adm => (
                  <div
                    key={adm.id}
                    className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{adm.medicationName} ({adm.dosage})</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusBadge(adm.status)}`}>
                            {getStatusIcon(adm.status)}
                            {adm.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Scheduled: {adm.scheduledTime}
                          {adm.administeredTime && ` • Administered: ${adm.administeredTime}`}
                        </p>
                        {adm.administeredBy && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By: {adm.administeredBy}</p>
                        )}
                        {adm.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Notes: {adm.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewType === 'prescriptions' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Prescriptions</h2>
            {MOCK_MEDICATIONS.filter(m => m.status === 'active').length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 text-center">
                <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 dark:text-gray-400">No active prescriptions</p>
              </div>
            ) : (
              MOCK_MEDICATIONS.filter(m => m.status === 'active').map(med => (
                <div
                  key={med.id}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{med.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Dosage</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{med.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Frequency</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{med.frequency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Route</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{med.route}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Prescriber</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{med.prescriber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Start Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{med.startDate}</p>
                        </div>
                        {med.endDate && (
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">End Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{med.endDate}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">Reason:</span> {med.reason}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        med.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        med.status === 'discontinued' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {med.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}