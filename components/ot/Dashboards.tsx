
'use client';

import React, { useState } from 'react';
import { useCases } from '@/context/CasesContext';
import { 
  Activity, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  PlusSquare, 
  Flame, 
  Building,
  Info,
  Loader2
} from 'lucide-react';
import { SurgeryCase, CaseStatus } from '@/types';

interface DashboardsProps {
  cases: SurgeryCase[];
  onSelectCase: (caseId: string, step?: number) => void;
  activeDashboard: 'surgeon' | 'ot' | 'nursing' | 'admin';
}

export default function Dashboards({ cases, onSelectCase, activeDashboard }: DashboardsProps) {
  const { auditLogs, updateCase, loading } = useCases();

  // Helper: safely filter cases
  const safeFilter = (predicate: (c: SurgeryCase) => boolean) => {
    return (cases || []).filter(c => c && predicate(c));
  };

  // Helper: safely count cases
  const safeCount = (predicate: (c: SurgeryCase) => boolean) => {
    return (cases || []).filter(c => c && predicate(c)).length;
  };

  // --- Helper functions with safety checks ---
  const handleUpdateInsuranceStatus = async (caseId: string, newStatus: 'N/A' | 'Draft' | 'Submitted' | 'Under Review' | 'Query Raised' | 'Approved' | 'Rejected') => {
    const originalCase = (cases || []).find(c => c && c.id === caseId);
    if (!originalCase) return;

    let approvedAmt = originalCase.insurancePreAuth?.approvedAmount || 0;
    if (newStatus === 'Approved' && approvedAmt === 0) {
      approvedAmt = originalCase.insurancePreAuth?.requestedAmount || 0;
    }

    const updatedCase = {
      ...originalCase,
      insurancePreAuth: {
        ...originalCase.insurancePreAuth,
        status: newStatus,
        approvedAmount: approvedAmt,
      }
    };
    
    await updateCase(updatedCase);
  };
  
  // Helper to map clinical status colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Immediate': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  // Helper to map workflow step name
  const getStepName = (step: number) => {
    const steps = [
      'Recommended', 'Pre-Op Assessment', 'Anesthesia Eval', 'Cost Estimation', 
      'Insurance Pre-Auth', 'Consent Management', 'Team Assignment', 'OT Scheduling', 
      'Equipment Check', 'Surgery Clearance', 'Intra-Op Management', 'Consumables Tracking', 
      'Recovery Monitoring', 'Post-Op Orders', 'Outcome Tracking', 'Surgery Billing', 'Discharge Summary'
    ];
    return steps[step - 1] || 'Unknown';
  };

  // --- Helper to get today's date string ---
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2BB2A7]" />
      </div>
    );
  }

  // ==========================================
  // SURGEON PORTAL DASHBOARD
  // ==========================================
  const renderSurgeonDashboard = () => {
    const todayDate = getTodayDate();
    const upcomingSurgeries = safeFilter(c => c.status === 'Scheduled' || c.status === 'Team Assigned');
    const pendingAssessments = safeFilter(c => c.status === 'Recommended' || c.status === 'Assessment Pending');
    const successfulOutcomes = safeFilter(c => c.outcomeTracking?.outcome === 'Successful');
    const totalOutcomes = safeFilter(c => c.currentStep >= 13);
    const successRate = totalOutcomes.length ? Math.round((successfulOutcomes.length / totalOutcomes.length) * 100) : 100;
    const scheduledToday = safeCount(c => c.otScheduling?.surgeryDate === todayDate);

    // ... rest of renderSurgeonDashboard (same as before but with safe variables)
    return (
      <div id="surgeon-dashboard" className="space-y-6">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" />
              Surgeon Portal & Clinical Scheduler
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review clinical workflows, patient fitness evaluations, and operating theatre assignments.</p>
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Logged In Surgeon</span>
              <span className="text-sm font-semibold text-slate-800">Dr. Devendra Mehta</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              DM
            </div>
          </div>
        </div>

        {/* Top KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Scheduled Today</span>
              <span className="text-2xl font-bold text-slate-800">{scheduledToday} Cases</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Pending Clearance</span>
              <span className="text-2xl font-bold text-slate-800">{pendingAssessments.length} Cases</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Clinical Success Rate</span>
              <span className="text-2xl font-bold text-slate-800">{successRate}%</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Active Surgeries</span>
              <span className="text-2xl font-bold text-slate-800">{safeCount(c => c.status === 'In Surgery')}</span>
            </div>
          </div>
        </div>

        {/* Main portal grid - same as before but using safe variables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Pre-Op Assessments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                  Action Required: Pending Pre-Surgery Assessments
                </h3>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-100">
                  {pendingAssessments.length} Alert
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {pendingAssessments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">All pre-surgery clinical assessments are completed. Great work!</div>
                ) : (
                  pendingAssessments.map(c => (
                    <div key={c.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-center transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{c.patient?.name || 'Unknown'}</span>
                          <span className="text-xs text-slate-400">({c.patient?.age || '?'}y {c.patient?.gender || 'N/A'})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getPriorityColor(c.recommendation?.priorityLevel || 'Medium')}`}>
                            {c.recommendation?.priorityLevel || 'Medium'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Diagnosis: <span className="text-slate-700 font-semibold">{c.recommendation?.diagnosis || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Recommended: <span className="font-semibold">{c.recommendation?.surgeryName || 'N/A'}</span> by {c.recommendation?.recommendedBy || 'Unknown'}
                        </div>
                      </div>
                      <button 
                        onClick={() => onSelectCase(c.id, 2)}
                        className="text-xs bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        Assess <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Scheduler Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Upcoming Scheduled Procedures
                </h3>
              </div>
              <div className="p-4">
                <div className="relative border-l border-slate-100 pl-4 space-y-6">
                  {upcomingSurgeries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">No upcoming surgeries currently scheduled.</div>
                  ) : (
                    upcomingSurgeries.slice(0, 5).map((c, idx) => (
                      <div key={c.id} className="relative">
                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white ring-4 ring-teal-50"></span>
                        <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 transition flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.otScheduling?.surgeryDate || 'TBD'} at {c.otScheduling?.startTime || 'TBD'}</span>
                              <span>•</span>
                              <span>{c.otScheduling?.otRoom || 'Not Assigned'}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{c.recommendation?.surgeryName || 'N/A'}</h4>
                            <div className="text-xs text-slate-600">
                              Patient: <span className="font-semibold text-slate-800">{c.patient?.name || 'Unknown'}</span> ({c.patient?.bloodGroup || 'N/A'})
                            </div>
                            <div className="text-xs text-slate-500">
                              Primary: <span className="font-semibold text-slate-700">{c.teamAssignment?.team?.primarySurgeon || 'Not Assigned'}</span> | Anesthetist: <span className="text-slate-700">{c.teamAssignment?.team?.leadAnesthetist || 'Not Assigned'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => onSelectCase(c.id, c.currentStep || 1)}
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold border border-teal-200 hover:border-teal-300 bg-white px-3 py-1.5 rounded-lg transition"
                          >
                            Manage Case
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Surgery Outcomes */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm">Clinical Surgery Outcomes</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-xs text-slate-500 font-semibold">Total Tracked Procedures</span>
                  <span className="text-sm font-bold text-slate-800">{totalOutcomes.length} cases</span>
                </div>
                
                <div className="space-y-3">
                  {totalOutcomes.slice(0, 3).map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800">{c.recommendation?.surgeryName || 'N/A'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.outcomeTracking?.outcome === 'Successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.outcomeTracking?.outcome || 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {c.outcomeTracking?.outcomeNotes || "No clinical post-op notes logged."}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 text-right">— {c.patient?.name || 'Unknown'}</div>
                    </div>
                  ))}
                  {totalOutcomes.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-sm">No tracked outcomes yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // OPERATING THEATRE (OT) DASHBOARD
  // ==========================================
  const renderOTDashboard = () => {
    const todayDate = getTodayDate();
    const todayCases = safeFilter(c => c?.otScheduling?.surgeryDate === todayDate || c?.status === 'In Surgery' || c?.status === 'In Recovery');
    const activeSurgeries = safeFilter(c => c?.status === 'In Surgery');

    // Get unique OT rooms from cases
  const otRooms = [...new Set((cases || []).map(c => c?.otScheduling?.otRoom).filter(Boolean))];

    return (
      <div id="ot-dashboard" className="space-y-6">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-6 h-6 text-indigo-600" />
              OT Suite & Real-Time Occupancy Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">Live tracking of OT schedules, room occupancies, equipment statuses, and clinical delays.</p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/60 flex items-center gap-2 self-start md:self-auto">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">LIVE SYSTEM ONLINE</span>
          </div>
        </div>

        {/* OT Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {otRooms.length > 0 ? (
            otRooms.slice(0, 4).map((roomName, index) => {
              const activeCaseInRoom = (cases || []).find(c => 
                c && c?.otScheduling?.otRoom === roomName && 
                (c?.status === 'In Surgery' || c?.status === 'In Recovery')
              );
              const scheduledTodayInRoom = (cases || []).find(c => 
                c && c?.otScheduling?.otRoom === roomName && 
                ['Team Assigned', 'Scheduled', 'OT Day Clearance'].includes(c?.status || '')
              );
              
              let displayStatus = 'Empty / Available';
              let statusColor = 'border-slate-200 bg-white text-slate-500';
              let details = 'No procedure currently active';
              let patientName = '';

              if (activeCaseInRoom) {
                if (activeCaseInRoom.status === 'In Surgery') {
                  displayStatus = 'SURGERY IN PROGRESS';
                  statusColor = 'border-rose-300 bg-rose-50/50 text-rose-700 ring-4 ring-rose-100';
                  details = activeCaseInRoom.recommendation?.surgeryName || 'N/A';
                  patientName = activeCaseInRoom.patient?.name || 'Unknown';
                } else if (activeCaseInRoom.status === 'In Recovery') {
                  displayStatus = 'IN RECOVERY / CLEANING';
                  statusColor = 'border-amber-300 bg-amber-50/50 text-amber-700 ring-4 ring-amber-100';
                  details = 'Patient in recovery room';
                  patientName = activeCaseInRoom.patient?.name || 'Unknown';
                }
              } else if (scheduledTodayInRoom) {
                displayStatus = 'SCHEDULED';
                statusColor = 'border-indigo-300 bg-indigo-50/50 text-indigo-700';
                details = scheduledTodayInRoom.recommendation?.surgeryName || 'N/A';
                patientName = scheduledTodayInRoom.patient?.name || 'Unknown';
              }

              return (
                <div key={index} className={`p-5 rounded-2xl border-2 transition duration-200 flex flex-col justify-between h-48 shadow-sm ${statusColor}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OT-{index + 1}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                        {displayStatus.split(' ')[0]}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-2">{roomName}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">{details}</p>
                  </div>

                  <div className="border-t border-slate-100/60 pt-3">
                    {patientName ? (
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Active Patient</div>
                        <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                          <span>{patientName}</span>
                          {activeCaseInRoom && (
                            <button 
                              onClick={() => onSelectCase(activeCaseInRoom.id, activeCaseInRoom.currentStep || 1)}
                              className="text-[10px] text-indigo-600 hover:underline font-bold"
                            >
                              Track Live
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">OT Suite ready for admissions</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 text-center py-8 text-slate-400 text-sm">No OT rooms configured. Please schedule surgeries to see occupancy.</div>
          )}
        </div>

        {/* Schedule & Team columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              OT Master Timeline (Today's Cases)
            </h3>
            
            <div className="space-y-4">
              {todayCases.length > 0 ? (
                todayCases.map(c => {
                  let stepBadge = '';
                  let stepColor = '';
                  if (c.status === 'In Surgery') {
                    stepBadge = 'Surgical Intervention';
                    stepColor = 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
                  } else if (c.status === 'In Recovery') {
                    stepBadge = 'Recovery Room';
                    stepColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  } else {
                    stepBadge = 'Ready / Cleared';
                    stepColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  }

                  return (
                    <div key={c.id} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-20 font-mono text-xs text-slate-500 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100 text-center flex-shrink-0">
                        <div>{c.otScheduling?.startTime || 'TBD'}</div>
                        <div className="text-[10px] text-slate-400">— {c.otScheduling?.endTime || 'TBD'}</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{c.recommendation?.surgeryName || 'N/A'}</h4>
                            <p className="text-xs text-slate-500">Patient: <span className="font-semibold text-slate-700">{c.patient?.name || 'Unknown'}</span> ({c.patient?.age || '?'}y {c.patient?.gender || 'N/A'})</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stepColor}`}>
                            {stepBadge}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                          <span>OT Room: <strong className="text-slate-600">{c.otScheduling?.otRoom?.split(' (')[0] || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Surgeon: <strong className="text-slate-600">{c.teamAssignment?.team?.primarySurgeon || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Duration: <strong className="text-slate-600">{c.otScheduling?.estimatedDuration || 'N/A'} mins</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">No cases scheduled or running in Operating Theatre today.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Clinical Staff Overview
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Active Surgeries</span>
                <div className="text-2xl font-bold text-slate-800">{activeSurgeries.length}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Scheduled Cases</span>
                <div className="text-2xl font-bold text-slate-800">{(cases || []).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // NURSING PORTAL & STATION DASHBOARD
  // ==========================================
  const renderNursingDashboard = () => {
    const recoveryCases = safeFilter(c => c.status === 'In Recovery' || c.status === 'Shifted to Ward');
    const preOpCases = safeFilter(c => c.status === 'OT Day Clearance' || c.status === 'Scheduled');

    return (
      <div id="nursing-dashboard" className="space-y-6">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-rose-600" />
              Nursing Station & Post-Operative Ward Portal
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage pre-op patient checklists, record live recovery vitals, and execute post-operative nurse medication administrations.</p>
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Station Head Nurse</span>
              <span className="text-sm font-semibold text-slate-800">Sister Jaspreet Kaur</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">JK</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recovery Room Monitoring */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  Recovery Room Live Vitals Stream
                </h3>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {recoveryCases.length} Active Patients
                </span>
              </div>
              
              <div className="p-4 space-y-4">
                {recoveryCases.length > 0 ? (
                  recoveryCases.map(c => {
                    const latestLog = c.postOpRecovery?.vitalsLogs?.[(c.postOpRecovery.vitalsLogs || []).length - 1];
                    const painColor = (pain: number) => {
                      if (pain >= 7) return 'text-rose-600 font-bold';
                      if (pain >= 4) return 'text-amber-500 font-semibold';
                      return 'text-emerald-500';
                    };

                    return (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{c.patient?.name || 'Unknown'}</span>
                            <span className="text-xs text-slate-500">({c.patient?.age || '?'}y {c.patient?.gender || 'N/A'})</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            Procedure: <span className="text-slate-800 font-bold">{c.recommendation?.surgeryName || 'N/A'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Current Location: <span className="font-bold text-indigo-600">{c.patient?.roomNumber || 'N/A'}</span>
                          </div>
                        </div>

                        {latestLog ? (
                          <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center flex-1 max-w-md w-full">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">BP</span>
                              <span className="text-xs font-bold text-slate-800">{latestLog.bp || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Pulse</span>
                              <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                                <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                {latestLog.pulse || 'N/A'} <span className="text-[9px] text-slate-400">bpm</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">O2 Sat.</span>
                              <span className="text-xs font-bold text-emerald-600">{latestLog.spo2 || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Pain</span>
                              <span className={`text-xs ${painColor(latestLog.painScore || 0)}`}>{latestLog.painScore || 0}/10</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-slate-100 flex-1 text-center">
                            Awaiting post-op recovery induction vitals log.
                          </div>
                        )}

                        <button 
                          onClick={() => onSelectCase(c.id, 13)}
                          className="text-xs bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold px-3 py-2 rounded-lg transition self-stretch md:self-auto flex items-center justify-center gap-1"
                        >
                          Vitals log <PlusSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">No surgical patients currently in Post-Op Recovery monitoring.</div>
                )}
              </div>
            </div>

            {/* Post-Op Tasks & Nursing Orders */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-rose-500" />
                  Medication Administration & Clinical Nursing Tasks
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {recoveryCases.flatMap(c => 
                  (c.postOpOrders?.nursingTasks || []).map((task: any) => ({
                    caseId: c.id,
                    patientName: c.patient?.name || 'Unknown',
                    room: c.patient?.roomNumber || 'N/A',
                    ...task
                  }))
                ).slice(0, 5).map((task: any) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 flex justify-between items-center transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {task.room}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{task.patientName}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{task.task}</p>
                      <div className="text-[10px] text-slate-400">Assigned time: {task.assignedTime || 'N/A'}</div>
                    </div>
                    <button
                      onClick={() => onSelectCase(task.caseId, 14)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                        task.done 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-500 text-slate-950 hover:bg-rose-600'
                      }`}
                    >
                      {task.done ? 'Administered ✓' : 'Mark Administered'}
                    </button>
                  </div>
                ))}
                {recoveryCases.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-sm">No active recovery medications to administer.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Pre-Op Clearance Checklists */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm">Pre-Op Clearance Checklists (Scheduled Cases)</h3>
              </div>
              <div className="p-4 space-y-4">
                {preOpCases.length > 0 ? (
                  preOpCases.map(c => {
                    const items = c.dayChecklist?.checklist || {};
                    const completedCount = Object.values(items).filter(Boolean).length;
                    const totalCount = Object.keys(items).length || 1;
                    const pct = Math.round((completedCount / totalCount) * 100);

                    return (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-xs text-slate-800 leading-tight">{c.patient?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-slate-400">{c.recommendation?.surgeryName || 'N/A'}</div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 font-mono">{completedCount}/{totalCount} Done</span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-teal-500 h-1.5 transition-all duration-300" style={{ width: `${pct}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="text-slate-400 font-medium">Clearance: <strong>{c.dayChecklist?.otClearanceStatus || 'Pending'}</strong></span>
                          <button 
                            onClick={() => onSelectCase(c.id, 10)}
                            className="text-teal-600 hover:underline font-bold"
                          >
                            Complete Checklist
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">No patients currently in active Pre-Op scheduling phase.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // ADMIN & FINANCE DASHBOARD
  // ==========================================
  const renderAdminDashboard = () => {
    const totalEstimated = (cases || []).reduce((acc, c) => acc + (c && c.costEstimation?.packageCost || 0), 0);
    const totalBilled = (cases || []).reduce((acc, c) => acc + (c && c.billing?.isBilled ? c.billing?.totalActualCost || 0 : 0), 0);
    const pendingPreAuth = safeFilter(c => c && c.insurancePreAuth?.status === 'Submitted' || c.insurancePreAuth?.status === 'Under Review');
    const billedCases = safeFilter(c => c && c.billing?.isBilled);

    return (
      <div id="admin-dashboard" className="space-y-6">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-amber-500" />
              Administrative, TPA Insurance & Finance Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">Audit operational revenues, monitor claims pre-authorization pipelines, and generate package billing cost-variance reports.</p>
          </div>
          <div className="text-right self-end md:self-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Operational Accounts Director</span>
            <span className="text-sm font-semibold text-slate-800">Finance & Billing Wing</span>
          </div>
        </div>

        {/* Financial KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Total Est. Pipeline</span>
              <span className="text-2xl font-bold text-slate-800">₹{totalEstimated.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Total Billed & Settled</span>
              <span className="text-2xl font-bold text-slate-800">₹{totalBilled.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-6 h-6" /></div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Active Pre-Auth Claims</span>
              <span className="text-2xl font-bold text-slate-800">{pendingPreAuth.length} Claims</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Total Cases</span>
              <span className="text-2xl font-bold text-slate-800">{(cases || []).length}</span>
            </div>
          </div>
        </div>

        {/* TPA Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Insurance TPA Pre-Authorization Board
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Draft / Submitted */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submitted / Draft</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-1.5 rounded-full">
                    {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Draft' || c.insurancePreAuth?.status === 'Submitted')).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Draft' || c.insurancePreAuth?.status === 'Submitted')).slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-1.5 hover:border-indigo-100 transition">
                      <div className="font-bold text-xs text-slate-800 leading-tight">{c.patient?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{c.insurancePreAuth?.insuranceCompany || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">Req: ₹{(c.insurancePreAuth?.requestedAmount || 0).toLocaleString('en-IN')}</div>
                      <div className="pt-1 flex flex-wrap gap-1">
                        <button
                          onClick={() => handleUpdateInsuranceStatus(c.id, 'Under Review')}
                          className="px-1.5 py-0.5 text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded transition"
                        >
                          Start Review
                        </button>
                        <button
                          onClick={() => handleUpdateInsuranceStatus(c.id, 'Approved')}
                          className="px-1.5 py-0.5 text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded transition"
                        >
                          Approve
                        </button>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <button onClick={() => onSelectCase(c.id, 5)} className="text-teal-600 hover:underline font-bold">Details</button>
                        <select
                          value={c.insurancePreAuth?.status || 'Draft'}
                          onChange={(e) => handleUpdateInsuranceStatus(c.id, e.target.value as any)}
                          className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Query Raised">Query Raised</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Draft' || c.insurancePreAuth?.status === 'Submitted')).length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">No submissions</div>
                  )}
                </div>
              </div>

              {/* Under Review / Query */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-1.5 rounded-full">
                    {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Under Review' || c.insurancePreAuth?.status === 'Query Raised')).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Under Review' || c.insurancePreAuth?.status === 'Query Raised')).slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-1.5 hover:border-indigo-100 transition">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-xs text-slate-800 leading-tight">{c.patient?.name || 'Unknown'}</div>
                        {c.insurancePreAuth?.status === 'Query Raised' && (
                          <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1 rounded animate-pulse border border-rose-200">QUERY</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">{c.insurancePreAuth?.insuranceCompany || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">Req: ₹{(c.insurancePreAuth?.requestedAmount || 0).toLocaleString('en-IN')}</div>
                      <div className="pt-1 flex flex-wrap gap-1">
                        <button onClick={() => handleUpdateInsuranceStatus(c.id, 'Approved')} className="px-1.5 py-0.5 text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded transition">Approve</button>
                        <button onClick={() => handleUpdateInsuranceStatus(c.id, 'Query Raised')} className="px-1.5 py-0.5 text-[9px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded transition">Raise Query</button>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <button onClick={() => onSelectCase(c.id, 5)} className="text-teal-600 hover:underline font-bold">Resolve</button>
                        <select
                          value={c.insurancePreAuth?.status || 'Under Review'}
                          onChange={(e) => handleUpdateInsuranceStatus(c.id, e.target.value as any)}
                          className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Query Raised">Query Raised</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && (c.insurancePreAuth?.status === 'Under Review' || c.insurancePreAuth?.status === 'Query Raised')).length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">No items in review</div>
                  )}
                </div>
              </div>

              {/* Approved */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-1.5 rounded-full">
                    {safeFilter(c => c.insurancePreAuth?.hasInsurance && c.insurancePreAuth?.status === 'Approved').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && c.insurancePreAuth?.status === 'Approved').slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-1.5 hover:border-indigo-100 transition">
                      <div className="font-bold text-xs text-slate-800 leading-tight">{c.patient?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Approved: ₹{(c.insurancePreAuth?.approvedAmount || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">TPA: {c.insurancePreAuth?.tpaName || 'N/A'}</div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-semibold px-2 py-0.5 rounded border border-emerald-100 inline-block">Verified</span>
                        <select
                          value={c.insurancePreAuth?.status || 'Approved'}
                          onChange={(e) => handleUpdateInsuranceStatus(c.id, e.target.value as any)}
                          className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Query Raised">Query Raised</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {safeFilter(c => c.insurancePreAuth?.hasInsurance && c.insurancePreAuth?.status === 'Approved').length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">No approved claims</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Variance Report */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Surgical Cost Variance Audit
            </h3>
            <p className="text-xs text-slate-500">Compares final billed surgery costs against initial package cost estimations to flag operational leakage.</p>

            <div className="space-y-3">
              {billedCases.length > 0 ? (
                billedCases.slice(0, 4).map(c => {
                  const est = c.costEstimation?.packageCost || 0;
                  const act = c.billing?.totalActualCost || 0;
                  const variance = act - est;
                  const pct = est ? Math.round((variance / est) * 100) : 0;

                  return (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-xs text-slate-800 leading-tight">{c.patient?.name || 'Unknown'}</div>
                          <span className="text-[10px] text-slate-400">{c.recommendation?.surgeryName || 'N/A'}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${variance <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {variance <= 0 ? `-${Math.abs(pct)}%` : `+${Math.abs(pct)}%`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-200/50 pt-2">
                        <div>Estimated: <strong className="text-slate-700">₹{est.toLocaleString('en-IN')}</strong></div>
                        <div>Actual Cost: <strong className="text-slate-700">₹{act.toLocaleString('en-IN')}</strong></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm italic">No cases have been fully billed yet to generate variance reports.</div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Persistent Database Transaction Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Every write operation is fully validated, normalized across relations, and immutably logged with the author's identity.</p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              RELATIONAL DB SYNCED
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-left">
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">User Email</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Entity ID</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.slice(0, 10).map((log: any) => {
                    const actionColors: { [key: string]: string } = {
                      CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      UPDATE: 'bg-sky-50 text-sky-700 border-sky-100',
                      SEED: 'bg-purple-50 text-purple-700 border-purple-100',
                    };
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500 font-bold">{log.id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{log.userEmail}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${actionColors[log.action] || 'bg-slate-50 text-slate-600'}`}>{log.action}</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">{log.entity}</td>
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-700">{log.entityId}</td>
                        <td className="py-3 px-3 text-right text-slate-400 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic">No database audit records available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeDashboard === 'surgeon' && renderSurgeonDashboard()}
      {activeDashboard === 'ot' && renderOTDashboard()}
      {activeDashboard === 'nursing' && renderNursingDashboard()}
      {activeDashboard === 'admin' && renderAdminDashboard()}
    </div>
  );
}