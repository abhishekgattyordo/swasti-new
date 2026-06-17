"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useDoctor } from "../layout";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, DOCTOR_FEATURES } from "@/lib/feature";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { appointments, patients, invoices } = useDoctor();
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isDashboardEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.DOCTOR,
    DOCTOR_FEATURES.DASHBOARD
  );

  useEffect(() => {
    if (!tenantLoading && !isDashboardEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isDashboardEnabled, router]);

  const stats = [
    {
      title: "Today's Appointments",
      value: appointments.length.toString(),
      icon: <Calendar className="w-5 h-5 text-[#2BB2A7]" />,
      color: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20",
    },
    {
      title: "Total Patients",
      value: patients.length.toString(),
      icon: <Users className="w-5 h-5 text-[#86C94C]" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Pending Payments",
      value: invoices.filter(i => i.status === "Pending").length.toString(),
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Completed Today",
      value: appointments.filter(a => a.status === "Completed").length.toString(),
      icon: <CheckCircle2 className="w-5 h-5 text-[#2BB2A7]" />,
      color: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20",
    },
  ];

  const upcomingAppointments = appointments.filter(apt => apt.status !== "Completed").slice(0, 3);

  if (!tenantLoading && !isDashboardEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Doctor Dashboard is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-[#E2EFEA] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-2 rounded-lg w-fit mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Schedule Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2EFEA] dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-[#E2EFEA] dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-[#1F8F89] dark:text-[#2BB2A7] text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today's Schedule
            </h3>
            <Link href="/doctor/schedule" className="text-xs text-[#2BB2A7] dark:text-[#2BB2A7] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="p-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-2 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 rounded-lg transition mb-1">
                <div className="w-14 text-xs font-medium text-gray-600 dark:text-gray-400">{apt.time}</div>
                <div className={`w-2 h-2 rounded-full ${
                  apt.status === 'Ready' ? 'bg-[#86C94C]' :
                  apt.status === 'Checked-in' ? 'bg-amber-500' : 'bg-[#2BB2A7]'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {apt.name}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{apt.reason}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  apt.status === 'Ready' ? 'bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]' :
                  apt.status === 'Checked-in' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                  'bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2EFEA] dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-[#E2EFEA] dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-[#1F8F89] dark:text-[#2BB2A7] text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Recent Invoices
            </h3>
            <Link href="/doctor/billing" className="text-xs text-[#2BB2A7] dark:text-[#2BB2A7] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="p-3">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-2 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 rounded-lg transition mb-1">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.patientName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    invoice.status === 'Paid' ? 'bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]' :
                    invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No invoices yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}