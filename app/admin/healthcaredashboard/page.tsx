

"use client";

import React, { useState, useEffect } from "react";
import {
  Groups,
  LocalHospital,
  Hotel,
  PersonAdd,
  Warning,
  CloudDone,
  Update,
  MoreHoriz,
  DateRange,
  Download,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Menu, X } from 'lucide-react';
import { doctorsApi } from "@/lib/api/doctors";
import { patientsApi } from "@/lib/api/registration";
import { getBedSummary } from "@/lib/api/bed-config";

// Types
interface Personnel {
  id: string;
  name: string;
  role: string;
  department: string;
  facility: string;
  registrationDate: string;
  status: "active" | "pending";
  avatar: string;
}

interface Alert {
  id: string;
  type: "warning" | "success" | "info" | "update";
  title: string;
  description: string;
  time: string;
}

interface KPI {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactElement;
  color: string;
  trend: "up" | "down";
  progressPercent?: number;
}

// Chart data (mock – replace with real appointments endpoint)
const chartData = [
  { week: "Week 01", admissions: 180 },
  { week: "Week 02", admissions: 100 },
  { week: "Week 03", admissions: 120 },
  { week: "Week 04", admissions: 60 },
  { week: "Week 05", admissions: 80 },
];

export default function HealthcareDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPI[]>([]);
  const [personnelData, setPersonnelData] = useState<Personnel[]>([]);
  const [alertsData, setAlertsData] = useState<Alert[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [doctorsRes, patientsRes, summaryRes] = await Promise.all([
        doctorsApi.getDoctors(),
        patientsApi.getAllRegistrations(),
        getBedSummary()
      ]);

      const doctors = doctorsRes.data?.data || doctorsRes.data || [];
      const patients = patientsRes.data?.data || patientsRes.data || [];

      // ✅ Fix: Extract summary data safely
      const summaryResponse = summaryRes.data;
      let summaryData: any = {};
      if (summaryResponse?.success && summaryResponse.data) {
        summaryData = summaryResponse.data; // { summary, statusCounts, ... }
      } else if (summaryResponse && !summaryResponse.success ) {
        summaryData = summaryResponse;
      } else {
        summaryData = summaryResponse || {};
      }

      const totalPatients = patients.length;
      const activeDoctors = doctors.filter((d: any) => d.is_active !== false).length;
      const newRegistrations = patients.filter((p: any) => {
        const created = new Date(p.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return created >= sevenDaysAgo;
      }).length;

      // Bed occupancy
      const occupiedBeds = summaryData.summary?.occupiedBeds || 0;
      const totalBeds = summaryData.summary?.totalBeds || 1;
      const occupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);

      const kpis: KPI[] = [
        {
          title: "Total Patients",
          value: totalPatients.toLocaleString(),
          change: 5.2,
          icon: <Groups className="w-6 h-6" />,
          color: "blue",
          trend: "up",
        },
        {
          title: "New Registrations",
          value: newRegistrations.toLocaleString(),
          change: 8.3,
          icon: <PersonAdd className="w-6 h-6" />,
          color: "green",
          trend: "up",
        },
        {
          title: "Active Doctors",
          value: activeDoctors.toLocaleString(),
          change: 2.1,
          icon: <LocalHospital className="w-6 h-6" />,
          color: "purple",
          trend: "up",
        },
        {
          title: "Bed Occupancy",
          value: occupiedBeds,
          change: -1.2,
          icon: <Hotel className="w-6 h-6" />,
          color: "orange",
          trend: "down",
          progressPercent: occupancyPercent,
        },
      ];
      setKpiData(kpis);

      // Build personnel list
      const patientPersonnel = patients.map((p: any) => ({
        id: p.patient_id,
        name: p.full_name_en,
        role: "Patient",
        department: "N/A",
        facility: "Outpatient",
        registrationDate: p.created_at,
        status: "active",
        avatar: p.full_name_en?.charAt(0) || "P",
      }));
      const doctorPersonnel = doctors.map((d: any) => ({
        id: d.id.toString(),
        name: `Dr. ${d.firstName} ${d.lastName}`,
        role: d.specialty || "Doctor",
        department: d.department || "General",
        facility: "Main Hospital",
        registrationDate: d.created_at,
        status: d.is_active ? "active" : "pending",
        avatar: d.firstName?.charAt(0) || "D",
      }));
      const allPersonnel = [...patientPersonnel, ...doctorPersonnel];
      allPersonnel.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
      setPersonnelData(allPersonnel.slice(0, 5));

      // Build alerts from recent activity
      const recentActivity = summaryData.recentActivity || [];
      const alerts = recentActivity.slice(0, 4).map((activity: any, idx: number) => {
        let type: Alert["type"] = "info";
        let title = "";
        let description = "";
        if (activity.type === "bed") {
          if (activity.status === "occupied") {
            type = "warning";
            title = "Bed Occupied";
            description = `Bed ${activity.bed_number} in ${activity.ward_name} is now occupied.`;
          } else if (activity.status === "cleaning") {
            type = "update";
            title = "Bed Under Cleaning";
            description = `Bed ${activity.bed_number} in ${activity.ward_name} is being cleaned.`;
          } else if (activity.status === "available") {
            type = "success";
            title = "Bed Available";
            description = `Bed ${activity.bed_number} in ${activity.ward_name} is now available.`;
          } else {
            type = "info";
            title = "Bed Status Changed";
            description = `Bed ${activity.bed_number} status changed to ${activity.status}.`;
          }
        } else {
          title = "Activity";
          description = "A recent event occurred.";
        }
        const timeAgo = (date: string) => {
          const diff = Date.now() - new Date(date).getTime();
          const minutes = Math.floor(diff / 60000);
          if (minutes < 1) return "Just now";
          if (minutes < 60) return `${minutes} min ago`;
          const hours = Math.floor(minutes / 60);
          if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
          const days = Math.floor(hours / 24);
          return `${days} day${days > 1 ? 's' : ''} ago`;
        };
        return {
          id: `${idx}`,
          type,
          title,
          description,
          time: timeAgo(activity.updated_at),
        };
      });
      setAlertsData(alerts);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
      case "pending":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
      case "success":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "update":
        return "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Warning className="text-base" />;
      case "success":
        return <PersonAdd className="text-base" />;
      case "info":
        return <CloudDone className="text-base" />;
      case "update":
        return <Update className="text-base" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <div className="p-5 lg:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                System Dashboard
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Comprehensive overview of performance across all facilities
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm">
                <DateRange className="text-sm" />
                <span>Last 30 Days</span>
              </button>
              <button className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20">
                <Download className="text-sm" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {kpiData.map((kpi, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                        {kpi.title}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {kpi.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        kpi.color === "blue"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : kpi.color === "purple"
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : kpi.color === "green"
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {kpi.icon}
                    </div>
                  </div>

                  {kpi.title === "Bed Occupancy" && kpi.progressPercent !== undefined && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                          style={{ width: `${kpi.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                     
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Patient Growth Chart (mock – replace with real appointments data) */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Patient Admission Trends
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  Weekly admissions across all facilities
                </p>
              </div>
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                {["daily", "weekly", "monthly"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      activeTab === tab
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.3}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ fontWeight: 600, color: "#374151" }}
                    formatter={(value) => [`${value} admissions`, "Admissions"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="#3b82f6"
                    fill="url(#colorAdmissions)"
                    strokeWidth={2}
                    dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <defs>
                    <linearGradient
                      id="colorAdmissions"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Personnel & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Registrations
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {personnelData.map((person) => (
                  <div key={person.id} className="p-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                      {person.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {person.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(person.status)}`}>
                          {person.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {person.role} • {person.department} • {person.facility}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Registered {new Date(person.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHoriz className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {personnelData.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No recent registrations
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All Personnel
                </button>
              </div>
            </div>

            {/* Alerts from recent activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {alertsData.map((alert) => (
                  <div key={alert.id} className="p-4">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {alertsData.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}