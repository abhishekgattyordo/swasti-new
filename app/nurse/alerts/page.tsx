'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bell, AlertCircle, CheckCircle2, XCircle, 
  Filter, Search, Clock, User, Activity, Heart, 
  Droplet, Thermometer, Wind, Calendar, ChevronRight,
  Volume2, VolumeX, RefreshCw
} from 'lucide-react';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  type: 'critical' | 'warning' | 'info';
  category: 'vitals' | 'lab' | 'medication' | 'fall' | 'equipment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  status: 'new' | 'read' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
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

const MOCK_ALERTS: Alert[] = [
  {
    id: 'A001',
    patientId: 'P001',
    patientName: 'John Doe',
    bed: 'ICU-101',
    type: 'critical',
    category: 'vitals',
    title: 'Critical Blood Pressure',
    message: 'Systolic BP: 185/95 mmHg - Severe hypertension detected. Immediate intervention required.',
    timestamp: '2026-04-28 09:30:00',
    source: 'BP Monitor',
    status: 'new',
  },
  {
    id: 'A002',
    patientId: 'P001',
    patientName: 'John Doe',
    bed: 'ICU-101',
    type: 'warning',
    category: 'lab',
    title: 'Elevated WBC Count',
    message: 'White blood cell count: 15,500/µL (Normal: 4,500-11,000). Possible infection.',
    timestamp: '2026-04-28 08:45:00',
    source: 'Lab Results',
    status: 'new',
  },
  {
    id: 'A003',
    patientId: 'P002',
    patientName: 'Mary Smith',
    bed: 'ICU-102',
    type: 'critical',
    category: 'vitals',
    title: 'Oxygen Desaturation',
    message: 'SpO2 dropped to 88%. Patient requires urgent respiratory assessment.',
    timestamp: '2026-04-28 07:30:00',
    source: 'Pulse Oximeter',
    status: 'acknowledged',
    assignedTo: 'Nurse Johnson',
  },
  {
    id: 'A004',
    patientId: 'P002',
    patientName: 'Mary Smith',
    bed: 'ICU-102',
    type: 'warning',
    category: 'medication',
    title: 'Medication Due',
    message: 'Lisinopril 10mg due at 09:00 AM. Not yet administered.',
    timestamp: '2026-04-28 09:00:00',
    source: 'MAR System',
    status: 'new',
  },
  {
    id: 'A005',
    patientId: 'P003',
    patientName: 'Robert Johnson',
    bed: 'Ward-201',
    type: 'info',
    category: 'fall',
    title: 'Fall Risk Alert',
    message: 'Patient fall risk assessment score: 45. Implement fall precautions.',
    timestamp: '2026-04-28 06:00:00',
    source: 'Risk Assessment',
    status: 'read',
  },
  {
    id: 'A006',
    patientId: 'P003',
    patientName: 'Robert Johnson',
    bed: 'Ward-201',
    type: 'info',
    category: 'system',
    title: 'New Lab Result Available',
    message: 'CBC results are ready for review.',
    timestamp: '2026-04-27 20:30:00',
    source: 'Lab System',
    status: 'resolved',
    resolvedBy: 'Nurse Davis',
    resolvedAt: '2026-04-27 21:00:00',
  },
  {
    id: 'A007',
    patientId: 'P004',
    patientName: 'Sarah Williams',
    bed: 'Ward-202',
    type: 'warning',
    category: 'vitals',
    title: 'Elevated Temperature',
    message: 'Temperature: 38.5°C. Patient febrile, monitor closely.',
    timestamp: '2026-04-28 07:00:00',
    source: 'Thermometer',
    status: 'new',
  },
  {
    id: 'A008',
    patientId: 'P004',
    patientName: 'Sarah Williams',
    bed: 'Ward-202',
    type: 'info',
    category: 'equipment',
    title: 'IV Pump Alarm',
    message: 'IV pump occlusion alarm. Check IV line.',
    timestamp: '2026-04-28 08:15:00',
    source: 'IV Pump',
    status: 'acknowledged',
    assignedTo: 'Nurse Wilson',
  },
];

const getAlertTypeColor = (type: Alert['type']) => {
  switch (type) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'info':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  }
};

const getAlertTypeIcon = (type: Alert['type']) => {
  switch (type) {
    case 'critical':
      return <AlertCircle size={20} />;
    case 'warning':
      return <AlertCircle size={20} />;
    case 'info':
      return <Bell size={20} />;
  }
};

const getCategoryIcon = (category: Alert['category']) => {
  switch (category) {
    case 'vitals':
      return <Heart size={16} />;
    case 'lab':
      return <Activity size={16} />;
    case 'medication':
      return <CheckCircle2 size={16} />;
    case 'fall':
      return <User size={16} />;
    case 'equipment':
      return <AlertCircle size={16} />;
    case 'system':
      return <Bell size={16} />;
  }
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Alert['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Alert['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);

  const filteredAlerts = alerts.filter(alert => {
    const matchesPatient = selectedPatient === 'all' || alert.patientId === selectedPatient;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPatient && matchesType && matchesStatus && matchesSearch;
  });

  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const criticalAlertsCount = alerts.filter(a => a.type === 'critical' && a.status !== 'resolved').length;

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged', assignedTo: 'Nurse Smith' }
          : alert
      )
    );
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'acknowledged', assignedTo: 'Nurse Smith' });
    }
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { 
              ...alert, 
              status: 'resolved', 
              resolvedBy: 'Nurse Smith', 
              resolvedAt: new Date().toLocaleString() 
            }
          : alert
      )
    );
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ 
        ...selectedAlert, 
        status: 'resolved', 
        resolvedBy: 'Nurse Smith', 
        resolvedAt: new Date().toLocaleString() 
      });
    }
  };

  const handleMarkRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId && alert.status === 'new'
          ? { ...alert, status: 'read' }
          : alert
      )
    );
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    if (selectedAlert?.id === alertId) {
      setShowAlertModal(false);
      setSelectedAlert(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all resolved alerts?')) {
      setAlerts(prev => prev.filter(alert => alert.status !== 'resolved'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/nurse" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Bell size={24} className="text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
              title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            {newAlertsCount > 0 && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                {newAlertsCount} New Alert{newAlertsCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Critical Alert Banner */}
        {criticalAlertsCount > 0 && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-lg p-5 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <AlertCircle size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Critical Alerts Active</h3>
                <p className="text-red-100 text-sm">
                  {criticalAlertsCount} critical alert{criticalAlertsCount !== 1 ? 's require' : ' requires'} immediate attention
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Alerts</p>
                <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'new').length}</p>
              </div>
              <Bell size={32} className="text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical</p>
                <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.type === 'critical' && a.status !== 'resolved').length}</p>
              </div>
              <AlertCircle size={32} className="text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Acknowledged</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.filter(a => a.status === 'acknowledged').length}</p>
              </div>
              <CheckCircle2 size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Patient Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter by Patient</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedPatient('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPatient === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              All Patients
            </button>
            {MOCK_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPatient === p.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts by title, message, or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Clear All Button */}
        {alerts.some(a => a.status === 'resolved') && (
          <div className="flex justify-end">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Clear Resolved Alerts
            </button>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedPatient === 'all' ? 'All Alerts' : `Alerts for ${patient?.name}`}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({filteredAlerts.length} alerts)
              </span>
            </h2>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 dark:text-gray-400">No alerts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    alert.status === 'new' ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-800'
                  } ${alert.status === 'new' ? 'animate-pulse' : ''}`}
                  onClick={() => {
                    setSelectedAlert(alert);
                    setShowAlertModal(true);
                    if (alert.status === 'new') {
                      handleMarkRead(alert.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className={`p-1.5 rounded-lg ${alert.type === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          {getAlertTypeIcon(alert.type)}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getAlertTypeColor(alert.type)}`}>
                          {alert.type.toUpperCase()}
                        </span>
                        {alert.status === 'new' && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{alert.message}</p>
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {alert.patientName} (Bed {alert.bed})
                        </span>
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(alert.category)}
                          {alert.category.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(alert.status === 'new' || alert.status === 'read' || alert.status === 'acknowledged') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(alert.id);
                          }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                          setShowAlertModal(true);
                          if (alert.status === 'new') {
                            handleMarkRead(alert.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Alert Details Modal */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className={`sticky top-0 p-6 flex items-center justify-between ${
              selectedAlert.type === 'critical' 
                ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800' 
                : selectedAlert.type === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getAlertTypeIcon(selectedAlert.type)}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAlert.title}</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAlert.patientName} • Bed {selectedAlert.bed}
                </p>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAlertTypeColor(selectedAlert.type)}`}>
                  {selectedAlert.type.toUpperCase()} ALERT
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {selectedAlert.category.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedAlert.status === 'new' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' :
                  selectedAlert.status === 'acknowledged' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  selectedAlert.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {selectedAlert.status.toUpperCase()}
                </span>
              </div>

              {/* Alert Message */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Alert Message</h3>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <p className="text-gray-700 dark:text-gray-300">{selectedAlert.message}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAlert.source}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Time Received</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                {selectedAlert.assignedTo && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedAlert.assignedTo}</p>
                  </div>
                )}
                {selectedAlert.resolvedBy && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Resolved By</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedAlert.resolvedBy}</p>
                  </div>
                )}
                {selectedAlert.resolvedAt && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Resolved At</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {selectedAlert.status === 'new' && (
                  <button
                    onClick={() => {
                      handleAcknowledge(selectedAlert.id);
                      setSelectedAlert({ ...selectedAlert, status: 'acknowledged', assignedTo: 'Nurse Smith' });
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Acknowledge Alert
                  </button>
                )}
                {(selectedAlert.status === 'new' || selectedAlert.status === 'acknowledged' || selectedAlert.status === 'read') && (
                  <button
                    onClick={() => {
                      handleResolve(selectedAlert.id);
                      setSelectedAlert({ 
                        ...selectedAlert, 
                        status: 'resolved', 
                        resolvedBy: 'Nurse Smith', 
                        resolvedAt: new Date().toLocaleString() 
                      });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Resolve Alert
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(selectedAlert.id)}
                  className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}