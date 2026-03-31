





"use client";

import React, { useState, useMemo, useEffect, ReactNode } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Users,
  UserCircle,
  Edit,
  ChevronUp,
  ChevronDown,
  Video,
  XCircle,
} from "lucide-react";
import { useDoctor } from "../layout";
import ColumnFilterPopover from "@/components/doctor/ColumnFilterPopover";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";

import { doctorsApi } from "@/lib/api/doctors";
import NewAppointmentModal from "@/components/doctor/schedule/NewAppointmentModal";
import EditAppointmentModal from "@/components/doctor/schedule/EditAppointmentModal";
import ConfirmCancelModal from "@/components/doctor/schedule/ConfirmCancelModal";
import AvailableSlotsModal from "@/components/doctor/schedule/AvailableSlotsModal";
import { ClipboardList } from "lucide-react";
import { appointmentsApi } from "@/lib/api/appointments";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// Define ViewMode type
export type ViewMode = "day" | "week" | "month";

export interface Appointment {
  id: string;
  time: string;
  patientId?: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
  meta: string;
  type: string;
  status: string;
  statusColor: string;
  action: string;
  icon: ReactNode;
  highlight?: boolean;
  notes?: string;
  meetingLink?: string;
}

export default function SchedulePage() {
  const { appointments, setAppointments } = useDoctor();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAvailableSlotsModal, setShowAvailableSlotsModal] = useState(false);
  const [slotsData, setSlotsData] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const [doctorId, setDoctorId] = useState<number | null>(null);

  const router = useRouter();

useEffect(() => {
  const fetchDoctorId = async () => {
    try {
      console.log("🚀 Fetching doctor ID...");

      const token = localStorage.getItem("accessToken");
      console.log("🔑 Token:", token);

      if (!token) {
        console.warn("⚠️ No token found in localStorage");
        return;
      }

      const response = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 API Response Status:", response.status);

      const data = await response.json();
      console.log("📦 API Response Data:", data);

      if (data.success && data.user) {
        const doctorId = data.user.doctor_id;
        console.log("👨‍⚕️ Doctor ID:", doctorId);

        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("📂 Current User from localStorage:", currentUser);

        const updatedUser = {
          ...currentUser,
          id: doctorId,
          doctor_id: doctorId,
        };

        console.log("✏️ Updated User:", updatedUser);

        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("💾 User saved to localStorage");

        setDoctorId(doctorId);
      } else {
        console.warn("❌ Invalid response or user not found");
      }
    } catch (error) {
      console.error("❌ Failed to fetch doctor ID:", error);
    }
  };

  fetchDoctorId();
}, []);

useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(payload);
  } catch (err) {
    console.error("Invalid token", err);
  }
}, []);



  const handleViewEHR = (e: React.MouseEvent, patientId: string) => {
    e.stopPropagation();
    router.push(`/doctor/ehr/${patientId}/vitals`);
  };

  useEffect(() => {
    if (doctorId && currentDate) {
      fetchAvailableSlots();
    }
  }, [doctorId, currentDate]);

  const handleViewSlots = async () => {
    console.log("Clicked View Slots");

    if (!doctorId) {
      console.log("Doctor ID missing");
      return;
    }

    setLoadingSlots(true);

    try {
      const response = await doctorsApi.getSlots(
        doctorId,
        format(currentDate, "yyyy-MM-dd")
      );

      console.log("Full response:", response);

      // ✅ CORRECT (no .data)
      const slots = response?.slots || [];

      console.log("Extracted slots:", slots);
      console.log("Slots length:", slots.length);

      setAvailableSlots(slots);

      console.log("State set: availableSlots");

      setShowAvailableSlotsModal(true);

      console.log("Modal should open now");
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
      console.log("Loading finished");
    }
  };

  const fetchAvailableSlots = async () => {
    console.log("Fetching slots automatically...");

    if (!doctorId) {
      console.log("Doctor ID missing");
      return;
    }

    setLoadingSlots(true);

    try {
      const response = await doctorsApi.getSlots(
        doctorId,
        format(currentDate, "yyyy-MM-dd")
      );

      console.log("Auto fetch response:", response);

      // ✅ CORRECT (no .data)
      const slots = response?.slots || [];

      console.log("Auto slots:", slots);

      setSlotsData(slots);

      console.log("State set: slotsData");
    } catch (error) {
      console.error("Error in auto fetch:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCancel = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setShowCancelModal(true);
  };

  const confirmCancel = async (appt: Appointment) => {
    const previousAppointments = appointments;
    // Optimistically remove from UI
    setAppointments(appointments.filter((a) => a.id !== appt.id));
    setShowCancelModal(false);
    setSelectedAppointment(null);

    try {
      const response = await appointmentsApi.deleteAppointment(appt.id);
      if (!response.success) {
        throw new Error(response.message || "Cancel failed");
      }
      toast.success("Appointment cancelled");
    } catch (error) {
      toast.error("Failed to cancel appointment");
      // Rollback optimistic update
      setAppointments(previousAppointments);
    }
  };

  const handleSaveNew = (newAppt: Appointment) => {
    setAppointments([...appointments, newAppt]);
    setShowNewModal(false);
    setSelectedSlot(null);
  };

  const handleSaveEdit = (updated: Appointment) => {
    setAppointments(
      appointments.map((a) => (a.id === updated.id ? updated : a)),
    );
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const handleBookSlot = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    setShowNewModal(true);
  };

  const timeSlots = Array.from(
    { length: 24 },
    (_, i) => i.toString().padStart(2, "0") + ":00",
  );

  const dailySchedule = useMemo(() => {
    if (viewMode !== "day") return [];
    const bookedMap = new Map();
    appointments.forEach((appt) => bookedMap.set(appt.time, appt));
    return timeSlots.map((time) => ({
      time,
      appointment: bookedMap.get(time),
    }));
  }, [viewMode, timeSlots, appointments]);

  // Filtering and sorting
  type FilterableColumn = "name" | "type" | "status";
  interface ColumnFilter {
    column: FilterableColumn;
    value: string;
  }
  type SortableColumn = "time" | "name" | "type" | "status";

  interface SortConfig {
    key: SortableColumn;
    direction: "asc" | "desc";
  }

  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleColumnFilter = (column: string, value: string) => {
    if (!["name", "type", "status"].includes(column)) return;
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.column !== column);
      return value
        ? [...filtered, { column: column as FilterableColumn, value }]
        : filtered;
    });
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter((appointment) => {
      return columnFilters.every((filter) => {
        const val = appointment[filter.column];
        return val
          ?.toString()
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      });
    });
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }
    return filtered;
  }, [appointments, columnFilters, sortConfig]);

  const handleSort = (key: SortableColumn) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Appointment }) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const clearAllFilters = () => {
    setColumnFilters([]);
    setSortConfig(null);
  };

  const typeOptions = Array.from(new Set(appointments.map((a) => a.type)));
  const statusOptions = Array.from(new Set(appointments.map((a) => a.status)));

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with view controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Schedule
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* TOTAL APPOINTMENTS card */}
          <div className="bg-white border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                TOTAL APPOINTMENTS
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-800">
              {appointments.length}
            </p>
          </div>

          {/* TELEMEDICINE card */}
          <div className="bg-white border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                TELEMEDICINE
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-800">
              {appointments.filter((a) => a.type === "teleconsultation").length}
            </p>
          </div>

          {/* AVAILABLE SLOTS card */}
          <div className="bg-white border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                AVAILABLE SLOTS
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-800">
              {slotsData.length}
            </p>
          </div>

          {/* TODAY'S APPOINTMENTS card */}
          <div className="bg-white border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                TODAY'S APPOINTMENTS
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-800">
              {appointments.length}
            </p>
          </div>
        </div>

        {viewMode === "day" && (
          <div className=" overflow-hidden">
            <div className="p-3  font-medium text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>Schedule for {format(currentDate, "PPP")}</span>
              <button
                onClick={handleViewSlots}
                disabled={loadingSlots}
                className="w-full sm:w-auto text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingSlots ? "Loading..." : "View Available Slots"}
              </button>
            </div>
          </div>
        )}

        {viewMode !== "day" && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            {viewMode === "week"
              ? "Weekly calendar view (coming soon)"
              : "Monthly calendar view (coming soon)"}
          </div>
        )}

        {(columnFilters.length > 0 || sortConfig) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-lg"
          >
            Clear all filters
          </button>
        )}

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[640px] lg:min-w-full">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> TIME
                        <button
                          onClick={() => handleSort("time")}
                          className="ml-auto"
                        >
                          <SortIcon columnKey="time" />
                        </button>
                      </div>
                    </th>
                    <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" /> PATIENT DETAILS
                        <ColumnFilterPopover
                          column="name"
                          placeholder="Filter by name..."
                          onFilter={handleColumnFilter}
                          currentValue={
                            columnFilters.find((f) => f.column === "name")
                              ?.value
                          }
                        />
                        <button
                          onClick={() => handleSort("name")}
                          className="ml-auto"
                        >
                          <SortIcon columnKey="name" />
                        </button>
                      </div>
                    </th>
                    <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      <div className="flex items-center gap-1">
                        TYPE
                        <ColumnFilterPopover
                          column="type"
                          options={typeOptions}
                          onFilter={handleColumnFilter}
                          currentValue={
                            columnFilters.find((f) => f.column === "type")
                              ?.value
                          }
                        />
                        <button onClick={() => handleSort("type")}>
                          <SortIcon columnKey="type" />
                        </button>
                      </div>
                    </th>
                    <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      <div className="flex items-center gap-1">
                        STATUS
                        <ColumnFilterPopover
                          column="status"
                          options={statusOptions}
                          onFilter={handleColumnFilter}
                          currentValue={
                            columnFilters.find((f) => f.column === "status")
                              ?.value
                          }
                        />
                        <button onClick={() => handleSort("status")}>
                          <SortIcon columnKey="status" />
                        </button>
                      </div>
                    </th>
                    <th className="w-24 p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      EHR
                    </th>
                    <th className="w-32 p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      Teleconsultation
                    </th>
                    <th className="w-32 p-3 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">
                      Cancel Appointment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => {
                    console.log("Appointment type:", appointment.type);
                    return (
                      <tr
                        key={appointment.id}
                        className={`hover:bg-gray-50 ${appointment.highlight ? "bg-blue-50" : ""}`}
                      >
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {appointment.time}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <Link
                            href={`/ehr/${appointment.id}`}
                            className="font-bold text-gray-800 hover:text-blue-600 hover:underline"
                          >
                            {appointment.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {appointment.meta}
                          </p>
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <span className="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 bg-gray-100 text-gray-600">
                            {appointment.type === "teleconsultation" ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            {appointment.type === "teleconsultation"
                              ? "Teleconsultation"
                              : appointment.type}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${appointment.statusColor}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          {appointment.patientId ? (
                            <button
                              onClick={(e) =>
                                handleViewEHR(e, appointment.patientId!)
                              }
                              className="p-1 rounded-md hover:bg-gray-100 text-blue-600 transition-colors"
                              title="View Electronic Health Record"
                            >
                              EHR
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          {appointment.type === "teleconsultation" ? (
                            <button
                              onClick={() =>
                                router.push(
                                  `/doctor/teleconsultation/${appointment.id}`,
                                )
                              }
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <Video className="w-4 h-4" />
                              Join
                            </button>
                          ) : (
                          null
                          )}
                        </td>
                        <td className="p-3 sm:p-4 border border-gray-200">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancel(appointment)}
                              className="p-1 rounded-md hover:bg-gray-100 text-red-600 transition-colors"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            Showing {filteredAppointments.length} of {appointments.length}{" "}
            appointments
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAvailableSlotsModal && (
        <AvailableSlotsModal
          date={format(currentDate, "yyyy-MM-dd")}
          slots={availableSlots}
          onClose={() => setShowAvailableSlotsModal(false)}
          onBook={(time) => {
            setShowAvailableSlotsModal(false);
            handleBookSlot(format(currentDate, "yyyy-MM-dd"), time);
          }}
        />
      )}
      {showNewModal && selectedSlot && doctorId && (
        <NewAppointmentModal
          doctorId={doctorId}
          selectedDate={selectedSlot.date}
          selectedTime={selectedSlot.time}
          onClose={() => {
            setShowNewModal(false);
            setSelectedSlot(null);
          }}
          onSave={handleSaveNew}
        />
      )}
      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
      {showCancelModal && selectedAppointment && (
        <ConfirmCancelModal
          appointment={selectedAppointment}
          onConfirm={confirmCancel}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </>
  );
}