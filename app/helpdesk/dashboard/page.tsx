"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
 
} from "lucide-react";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import HelpDeskStats from "@/components/helpdesk/HelpDeskStats";
import { appointmentsApi } from "@/lib/api/appointments";

import toast from "react-hot-toast";

type Appointment = {
  id: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  status: string;
};

export default function HelpDeskDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [patientsTodayCount, setPatientsTodayCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  const handleBillingClick = () => router.push("/helpdesk/billing");
  const handleRoomAvailabilityClick = () =>
    router.push("/helpdesk/room-availability");
  const handleDoctorSlotsClick = () => router.push("/helpdesk/doctor-slots");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's appointments
      const appointmentsRes =
        await appointmentsApi.getAppointmentsByDate(today);
      const appointments = appointmentsRes.data || [];

      // Count unique patients
      const uniquePatientIds = new Set(
        appointments.map((apt: any) => apt.patient_id),
      );
      setPatientsTodayCount(uniquePatientIds.size);

      // Set appointment count
      setTodayAppointmentsCount(appointments.length);

      // Map to the Appointment type expected by the UI
      const mappedAppointments = appointments.map((apt: any) => ({
        id: apt.appointment_id,
        patientName: apt.patient_name || "Unknown",
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        doctorName: apt.doctor_name || "Unknown",
        status: apt.status,
      }));

      setUpcomingAppointments(mappedAppointments.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for stats that aren't yet backed by API
  const quickStats = [
    {
      title: "Patients Today",
      value: patientsTodayCount,
      change: "+12%", // can be calculated if we have yesterday's data
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Appointments",
      value: todayAppointmentsCount,
      change: "+5",
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-100",
    },
    {
      title: "Avg. Wait Time",
      value: "14 min", // mock
      change: "-2 min",
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-100",
    },
    {
      title: "Revenue Today",
      value: "$2,450", // mock
      change: "+18%",
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-100",
    },
  ];

  // Recent activities can be derived from today's appointments or a separate activity log API
  const recentActivities = upcomingAppointments.map((apt, index) => ({
    id: index,
    action: "Appointment booked",
    patient: apt.patientName,
    time: apt.appointmentTime,
    color: "bg-blue-500",
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <HelpDeskSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onBillingClick={handleBillingClick}
        onRoomAvailabilityClick={handleRoomAvailabilityClick}
        onDoctorSlotsClick={handleDoctorSlotsClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 truncate">
            Dashboard
          </h1>
        </header>

        {/* Mobile toggle button */}
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, Jane!
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Here's what's happening at the help desk today.
                </p>
              </div>
              {/* <button
                onClick={() => router.push('/helpdesk/appointments/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                New Appointment
              </button> */}
            </div>

            {/* Quick Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                      {stat.title}
                    </p>
                    <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Stats from HelpDeskStats (reuse) */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Appointment Overview
              </h2>
              <HelpDeskStats />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
           
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => router.push("/helpdesk/appointments/new")}
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Book Appointment
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Schedule a new appointment for a patient
                    </p>
                  </button>

                  <button
                    onClick={() => router.push("/helpdesk/doctor-slots")}
                    className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Manage Doctor Slots
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Update availability for doctors
                    </p>
                  </button>

                  <button
                    onClick={() => router.push("/helpdesk/billing")}
                    className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white mb-3">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Process Payment
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Create invoice or collect payment
                    </p>
                  </button>

                  <button
                    onClick={() => router.push("/helpdesk/room-availability")}
                    className="p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Room Availability
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Check and manage room schedules
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
