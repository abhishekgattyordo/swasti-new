"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Clock, User, CheckCircle2, XCircle, Filter, CalendarX, Eye, Edit, Trash2 } from "lucide-react";

export type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  doctorId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "checkup" | "consultation" | "followup" | "emergency";
  notes?: string;
};

type Doctor = {
  id: string;
  name: string;
  specialization: string;
};

interface AppointmentsTableProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
  getStatusColor: (status: Appointment["status"]) => string;
  getTypeColor: (type: Appointment["type"]) => string;
}

export default function AppointmentsTable({
  appointments = [],
  doctors,
  onConfirm,
  onComplete,
  onEdit,
  onCancel,
  getStatusColor,
  getTypeColor,
}: AppointmentsTableProps) {
  const [filters, setFilters] = useState({
    patient: "",
    date: "",
    doctor: "",
    type: "",
  });

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openFilter &&
        filterRefs.current[openFilter] &&
        !filterRefs.current[openFilter]?.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilter]);

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const clearFilter = (column: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [column]: "" }));
    setOpenFilter(null);
  };

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter((apt) => {
      const matchPatient =
        filters.patient === "" ||
        apt.patientName.toLowerCase().includes(filters.patient.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(filters.patient.toLowerCase());
      const matchDate =
        filters.date === "" || apt.appointmentDate.includes(filters.date);
      const matchDoctor =
        filters.doctor === "" ||
        apt.doctorName.toLowerCase().includes(filters.doctor.toLowerCase());
      const matchType =
        filters.type === "" ||
        apt.type.toLowerCase().includes(filters.type.toLowerCase());
      return matchPatient && matchDate && matchDoctor && matchType;
    });
  }, [appointments, filters]);

  const FilterPopover = ({
    column,
    placeholder,
  }: {
    column: keyof typeof filters;
    placeholder: string;
  }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

    return (
      <div
        className="relative inline-block"
        ref={(el) => {
          filterRefs.current[column] = el;
        }}
      >
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors ${value ? "text-blue-600" : "text-gray-400"}`}
          aria-label={`Filter by ${column}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by {column}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to check if appointment is today
  const isTodayAppointment = (appointmentDate: string) => {
    const aptDate = new Date(appointmentDate);
    const today = new Date();
    return (
      aptDate.getFullYear() === today.getFullYear() &&
      aptDate.getMonth() === today.getMonth() &&
      aptDate.getDate() === today.getDate()
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Mobile filter row – visible only on small screens */}
      <div className="lg:hidden p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
        <FilterPopover column="patient" placeholder="Filter patient..." />
        <FilterPopover column="date" placeholder="Filter date..." />
        <FilterPopover column="doctor" placeholder="Filter doctor..." />
        <FilterPopover column="type" placeholder="Filter type..." />
      </div>

      {/* Table wrapper with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] lg:min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" /> PATIENT
                  <span className="hidden lg:inline">
                    <FilterPopover
                      column="patient"
                      placeholder="Filter by name or ID..."
                    />
                  </span>
                </div>
              </th>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> DATE & TIME
                  <span className="hidden lg:inline">
                    <FilterPopover column="date" placeholder="YYYY-MM-DD..." />
                  </span>
                </div>
              </th>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" /> DOCTOR
                  <span className="hidden lg:inline">
                    <FilterPopover
                      column="doctor"
                      placeholder="Filter by doctor..."
                    />
                  </span>
                </div>
              </th>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                <div className="flex items-center gap-1">
                  TYPE
                  <span className="hidden lg:inline">
                    <FilterPopover
                      column="type"
                      placeholder="Filter by type..."
                    />
                  </span>
                </div>
              </th>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                STATUS
              </th>
              <th className="p-2 sm:p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAppointments.map((apt) => {
              const isToday = isTodayAppointment(apt.appointmentDate);
              const isCompleted = apt.status === "completed";
              const isCancelled = apt.status === "cancelled";
              const isPending = apt.status === "pending";
              const isConfirmed = apt.status === "confirmed";

              return (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="whitespace-nowrap">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {apt.patientName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {apt.patientId}
                      </p>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {new Date(apt.appointmentDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {apt.appointmentTime}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="whitespace-nowrap">
                      <p className="text-gray-900 text-sm sm:text-base">
                        {apt.doctorName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {doctors.find((d) => d.id === apt.doctorId)
                          ?.specialization || "General"}
                      </p>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${getTypeColor(apt.type || "consultation")}`}
                      >
                        {apt.type
                          ? apt.type.charAt(0).toUpperCase() + apt.type.slice(1)
                          : "Consultation"}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(apt.status)}`}
                      >
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-gray-200">
                    <div className="flex gap-2 whitespace-nowrap">
                      {/* ✅ For completed appointments - show only View Details */}
                      {isCompleted && (
                        <button
                          onClick={() => onEdit(apt.id)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* ✅ For cancelled appointments - show no actions */}
                      {isCancelled && (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}

                      {/* ✅ For pending/confirmed appointments - show full actions (only for today) */}
                      {(isPending || isConfirmed) && isToday && (
                        <>
                        
                          
                          <button
                            onClick={() => onEdit(apt.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onCancel(apt.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-rose-600 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* For pending/confirmed but not today - show limited actions */}
                      {(isPending || isConfirmed) && !isToday && (
                        <>
                          <button
                            onClick={() => onEdit(apt.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onCancel(apt.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-rose-600 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
}