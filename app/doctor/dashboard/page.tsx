"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
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
}, [tenantLoading]);

  const stats = [
    {
      title: "Today's Appointments",
      value: appointments.length.toString(),
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "Total Patients",
      value: patients.length.toString(),
      icon: <Users className="w-5 h-5 text-green-600" />,
      color: "bg-green-100"
    },
    {
      title: "Pending Payments",
      value: invoices.filter(i => i.status === "Pending").length.toString(),
      icon: <DollarSign className="w-5 h-5 text-orange-600" />,
      color: "bg-orange-100"
    },
    {
      title: "Completed Today",
      value: appointments.filter(a => a.status === "Completed").length.toString(),
      icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100"
    },
  ];

  const upcomingAppointments = appointments.filter(apt => apt.status !== "Completed").slice(0, 3);

  if (!tenantLoading && !isDashboardEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Doctor Dashboard is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Stats Grid – 2 columns on mobile, 4 columns on medium+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className={`p-2 rounded-lg w-fit mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.title}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Schedule Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Today's Schedule</h3>
            <Link href="/doctor/schedule" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition mb-1">
                <div className="w-14 text-xs font-medium text-gray-600">{apt.time}</div>
                <div className={`w-2 h-2 rounded-full ${
                  apt.status === 'Ready' ? 'bg-green-500' :
                  apt.status === 'Checked-in' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <Link
                    href={`/ehr/${apt.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    {apt.name}
                  </Link>
                  <p className="text-xs text-gray-500">{apt.reason}</p>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Invoices</h3>
            <Link href="/doctor/billing" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-3">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition mb-1">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.patientName}</p>
                  <p className="text-xs text-gray-500">{invoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-600' :
                    invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No invoices yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}