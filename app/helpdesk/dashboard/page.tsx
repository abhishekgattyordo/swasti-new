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
  Activity,
  TrendingUp,
  ArrowRight,
  BedDouble,
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
  
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayPaidRevenue, setTodayPaidRevenue] = useState(0);

  const handleBillingClick = () => router.push("/helpdesk/billing");
  const handleRoomAvailabilityClick = () =>
    router.push("/helpdesk/room-availability");
  const handleDoctorSlotsClick = () => router.push("/helpdesk/doctor-slots");

  const fetchRevenue = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/helpdesk/invoices?startDate=${today}&endDate=${today}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const invoices = data.data;
        
        const total = invoices.reduce(
          (sum: number, inv: any) => sum + (inv.amount || 0),
          0
        );
        
        const paid = invoices
          .filter((inv: any) => inv.status === "paid")
          .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
        
        setTodayRevenue(total);
        setTodayPaidRevenue(paid);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRevenue();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const appointmentsRes =
        await appointmentsApi.getAppointmentsByDate(today);
      const appointments = appointmentsRes.data || [];

      const uniquePatientIds = new Set(
        appointments.map((apt: any) => apt.patient_id),
      );
      setPatientsTodayCount(uniquePatientIds.size);
      setTodayAppointmentsCount(appointments.length);

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

  const quickStats = [
    {
      title: "Patients Today",
      value: patientsTodayCount,
      change: "",
      icon: <Users className="w-5 h-5 text-[#3B1E6F]" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Appointments",
      value: todayAppointmentsCount,
      change: "",
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Avg. Wait Time",
      value: "12 min",
      change: "",
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Revenue Today",
      value: `₹${todayRevenue.toFixed(2)}`,
      change: "",
      icon: <DollarSign className="w-5 h-5 text-[#7A329F]" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-[#3B1E6F] dark:text-white truncate">
            Dashboard
          </h1>
        </header>

        {/* Mobile toggle button */}
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] hover:from-[#7A329F] hover:to-[#0D5CB3] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
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
                <h1 className="text-3xl font-bold text-[#3B1E6F] dark:text-white">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This is what is happening at the help desk today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Quick Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                      {stat.title}
                    </p>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Stats from HelpDeskStats */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-[#3B1E6F] dark:text-white mb-3">
                Appointment Overview
              </h2>
              <HelpDeskStats />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#3B1E6F] dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push("/helpdesk/appointments/new")}
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Schedule a new appointment for a patient
                  </p>
                </button>

                <button
                  onClick={() => router.push("/helpdesk/doctor-slots")}
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#7A329F] to-[#0D5CB3] rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Manage Doctor Slots
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update availability for doctors
                  </p>
                </button>

                <button
                  onClick={() => router.push("/helpdesk/billing")}
                  className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Process Payment
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Create invoice or collect payment
                  </p>
                </button>

                <button
                  onClick={() => router.push("/helpdesk/room-availability")}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Room Availability
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Check and manage room schedules
                  </p>
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#3B1E6F] dark:text-white">
                  Recent Appointments
                </h2>
                <button 
                  onClick={() => router.push("/helpdesk/appointments")}
                  className="text-sm text-[#7A329F] dark:text-[#9B4DBF] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No appointments today.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] flex items-center justify-center text-white font-semibold text-sm">
                          {apt.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {apt.patientName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {apt.doctorName} • {apt.appointmentTime}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === "completed" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : apt.status === "scheduled"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : apt.status === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}