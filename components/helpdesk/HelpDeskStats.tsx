"use client";

import React from "react";
import { Calendar, CheckCircle2, Users, Clock } from "lucide-react";

export default function HelpDeskStats() {
  const stats = [
    {
      title: "Total Expected",
      value: "",
      subtitle: "patients",
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-100",
    },
    {
      title: "Checked In",
      value: "",
      subtitle: "",
      progress: "",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      title: "Doctors Available",
      value: "",
      badge: "Active now",
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-100",
    },
    {
      title: "Delayed",
      value: "",
      badge: "Needs attn.",
      icon: <Clock className="w-5 h-5 text-rose-600" />,
      bgColor: "bg-rose-100",
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>{stat.icon}</div>
              {stat.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">{stat.title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.subtitle && <span className="text-xs sm:text-sm text-gray-500">{stat.subtitle}</span>}
            </div>
            {stat.progress && (
              <div className="mt-2 sm:mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: stat.progress }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}