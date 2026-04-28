'use client';

import Link from 'next/link';
import { BarChart3, Users, AlertCircle, Pill, FileText, CheckSquare, Bell, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Patients', value: '12', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Tasks', value: '8', icon: CheckSquare, color: 'bg-green-100 text-green-700' },
    { label: 'Critical Alerts', value: '2', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    { label: 'Active Medications', value: '24', icon: Pill, color: 'bg-purple-100 text-purple-700' },
  ];

  const navItems = [
    { href: '/patients', label: 'My Patients', icon: Users },
    { href: '/vitals', label: 'Vitals Entry', icon: BarChart3 },
    { href: '/medications', label: 'Medications', icon: Pill },
    { href: '/nursing-notes', label: 'Nursing Notes', icon: FileText },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/handover', label: 'Shift Handover', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Grid */}
        <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                      <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">→ Access {item.label.toLowerCase()}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Recent Activity</h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Vitals recorded for <span className="font-medium text-foreground">John Doe</span></p>
                <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-slate-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Medicine given to <span className="font-medium text-foreground">Mary Smith</span></p>
                <span className="ml-auto text-xs text-gray-500">4 hours ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <p className="text-sm text-gray-600 dark:text-gray-400">New alert for <span className="font-medium text-foreground">Patient ICU-101</span></p>
                <span className="ml-auto text-xs text-gray-500">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}