


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/pharmacy/Sidebar";
import {
  TrendingUp,
  TrendingDown,
  ClipboardList,
  AlertTriangle,
  Package,
  XCircle,
  Clock,
  Menu,
  X,
  Activity,
  DollarSign,
  Users,
  Pill,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { purchasesApi } from "@/lib/api/purchasesApi";
import { salesApi } from "@/lib/api/salesApi";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";
import { useRouter } from "next/navigation";

// Types for fetched data
interface StockItem {
  id: number;
  medicine_id: number;
  medicineName: string;
  batch: string;
  expiryDate: string;
  availableQty: number;
  reorderLevel: number;
}

interface Sale {
  id: number;
  sale_date: string;
  grand_total: number;
  walkin_name: string | null;
  items?: SaleItem[];
}

interface SaleItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  total: number;
}

export default function PharmacyDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]); // all sales (for charts)
  const [pendingSales, setPendingSales] = useState<Sale[]>([]); // only pending (delivered=false)

  const [chartView, setChartView] = useState<"dispensing" | "medicines" | "stock">("dispensing");
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isDashboardEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.DASHBOARD
);

useEffect(() => {
  if (!tenantLoading && !isDashboardEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  // Fetch all data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stock
        const stockRes = await purchasesApi.getStock();
        const stockData = stockRes?.data?.data ?? stockRes?.data ?? [];
        setStockItems(stockData);

        // Fetch all sales (for charts and totals)
        const allSalesRes = await salesApi.getSales({ limit: 100 });
        const allSalesData = allSalesRes?.data?.data ?? allSalesRes?.data ?? [];
        setSales(allSalesData);

        // Fetch pending sales (delivered=false)
        const pendingRes = await salesApi.getSales({ delivered: false });
        const pendingData = pendingRes?.data?.data ?? pendingRes?.data ?? [];
        setPendingSales(pendingData);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ========== Computed stats ==========
  const today = new Date().toISOString().split('T')[0];

  const todaySalesTotal = sales
    .filter(s => s.sale_date.startsWith(today))
    .reduce((sum, s) => sum + Number(s.grand_total), 0);

  // Pending counts from pendingSales
  const pendingOP = pendingSales.filter(s => s.walkin_name).length;
  const pendingIP = pendingSales.filter(s => !s.walkin_name).length;

  // Stock stats
  const lowStockCount = stockItems.filter(
    (s) => s.availableQty > 0 && s.availableQty <= s.reorderLevel
  ).length;

  const outOfStock = stockItems.filter((s) => s.availableQty === 0).length;

  const expiringIn30 = stockItems.filter((s) => {
    const exp = new Date(s.expiryDate);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  }).length;

  const totalStockItems = stockItems.reduce((sum, s) => sum + s.availableQty, 0);

  // Weekly dispensing data (using all sales)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyData = last7Days.map(date => {
    const daySales = sales.filter(s => s.sale_date.startsWith(date));
    const prescriptionsCount = daySales.length;
    const value = daySales.reduce((sum, s) => sum + Number(s.grand_total), 0);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { day: dayName, prescriptions: prescriptionsCount, value };
  });

  // Top medicines (requires items in sales)
  const medicineSales: Record<number, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        if (!medicineSales[item.medicineId]) {
          medicineSales[item.medicineId] = { name: item.medicineName, quantity: 0, revenue: 0 };
        }
        medicineSales[item.medicineId].quantity += item.quantity;
        medicineSales[item.medicineId].revenue += item.total;
      });
    }
  });
  const topMedicinesData = Object.values(medicineSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Stock status for pie chart
  const stockStatusData = [
    { name: "In Stock", value: stockItems.filter(s => s.availableQty > s.reorderLevel).length, color: "#22c55e" },
    { name: "Low Stock", value: lowStockCount, color: "#eab308" },
    { name: "Out of Stock", value: outOfStock, color: "#ef4444" },
    { name: "Expiring Soon", value: expiringIn30, color: "#f97316" },
  ];

  // Alerts from stock and pending sales
  const alerts = [
    ...stockItems
      .filter((s) => {
        const exp = new Date(s.expiryDate);
        const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
      })
      .map((s) => ({
        type: "warning" as const,
        text: `${s.medicineName} (${s.batch}) expiring ${new Date(s.expiryDate).toLocaleDateString()}`,
        link: "/pharmacy/expiry-report",
      })),
    ...stockItems
      .filter((s) => s.availableQty > 0 && s.availableQty <= s.reorderLevel)
      .map((s) => ({
        type: "critical" as const,
        text: `${s.medicineName} — only ${s.availableQty} left (reorder: ${s.reorderLevel})`,
        link: "/pharmacy/stock",
      })),
    ...(pendingOP > 0 ? [{
      type: "info" as const,
      text: `${pendingOP} pending OP prescription${pendingOP > 1 ? 's' : ''}`,
      link: "/pharmacy/op-dispense",
    }] : []),
    ...(pendingIP > 0 ? [{
      type: "info" as const,
      text: `${pendingIP} pending IP order${pendingIP > 1 ? 's' : ''}`,
      link: "/pharmacy/ip-issue",
    }] : []),
  ];

  // Summary cards – split OP and IP
  const summaryCards = [
    {
      label: "Today's Sales",
      value: `₹${todaySalesTotal.toFixed(2)}`,
      trend: "up" as const,
      icon: DollarSign,
      link: "/pharmacy/ledger",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending OP",
      value: String(pendingOP),
      icon: ClipboardList,
      link: "/pharmacy/op-dispense",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Pending IP",
      value: String(pendingIP),
      icon: ClipboardList,
      link: "/pharmacy/ip-issue",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Low Stock Items",
      value: String(lowStockCount),
      icon: Package,
      link: "/pharmacy/stock",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Expiring in 30 Days",
      value: String(expiringIn30),
      icon: AlertTriangle,
      link: "/pharmacy/expiry-report",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Prescriptions: {payload[0].value}</p>
          <p className="text-xs text-green-600 dark:text-green-400">Revenue: ₹{payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!tenantLoading && !isDashboardEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Dashboard feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pharmacy Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Operational overview —{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {summaryCards.map((card) => (
                <Link
                  key={card.label}
                  href={card.link}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <card.icon size={18} className={card.iconColor} />
                    </div>
                    {card.trend && card.trend === "up" ? (
                      <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                    ) : card.trend === "down" ? (
                      <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                    ) : null}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.label}
                  </p>
                </Link>
              ))}
            </div>

            {/* Charts Section (unchanged) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      Analytics Overview
                    </CardTitle>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
                      <button
                        onClick={() => setChartView("dispensing")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartView === "dispensing"
                            ? "bg-white dark:bg-gray-800 text-green-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        Dispensing
                      </button>
                      <button
                        onClick={() => setChartView("medicines")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartView === "medicines"
                            ? "bg-white dark:bg-gray-800 text-green-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        Top Medicines
                      </button>
                      <button
                        onClick={() => setChartView("stock")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartView === "stock"
                            ? "bg-white dark:bg-gray-800 text-green-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        Stock Status
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartView === "dispensing" ? (
                          <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar yAxisId="left" dataKey="prescriptions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : chartView === "medicines" ? (
                          <BarChart
                            data={topMedicinesData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#22c55e" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie
                              data={stockStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                              labelLine={false}
                            >
                              {stockStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      Alerts & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                          No active alerts
                        </p>
                      ) : (
                        alerts.map((alert, i) => (
                          <Link
                            key={i}
                            href={alert.link}
                            className={`flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              alert.type === "critical"
                                ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10"
                                : alert.type === "warning"
                                  ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10"
                                  : "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10"
                            }`}
                          >
                            <div className="mt-0.5">
                              {alert.type === "critical" ? (
                                <XCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                              ) : alert.type === "warning" ? (
                                <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              ) : (
                                <Clock size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                            <span className="text-xs text-gray-900 dark:text-white">{alert.text}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Pill className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500">Today</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {sales.filter(s => s.sale_date.startsWith(today)).length}
                </p>
                <p className="text-xs text-gray-500">Prescriptions</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Active</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">—</p>
                <p className="text-xs text-gray-500">Patients</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalStockItems}</p>
                <p className="text-xs text-gray-500">Items in Stock</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-gray-500">vs yesterday</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">—</p>
                <p className="text-xs text-gray-500">Growth</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}