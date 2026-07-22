'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Receipt, TrendingUp, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

interface Bill {
  id: number;
  bill_number: string;
  admission_id: number;
  patient_name: string;
  total_amount: number;
  paid_amount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  created_at: string;
}

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    outstanding: 0,
    paidCount: 0,
    unpaidCount: 0,
    partialCount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; collected: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  const router = useRouter();
const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isDashboardEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.BILLING,
  BILLING_FEATURES.DASHBOARD
);

useEffect(() => {
  if (!tenantLoading && !isDashboardEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/bills');
      const data = await res.json();
      if (data.success) {
        const parsedBills: Bill[] = data.data.map((bill: any) => ({
          ...bill,
          total_amount: parseFloat(bill.total_amount) || 0,
          paid_amount: parseFloat(bill.paid_amount) || 0,
        }));
        setBills(parsedBills);

        let revenue = 0, paid = 0, paidCount = 0, unpaidCount = 0, partialCount = 0;
        parsedBills.forEach(bill => {
          revenue += bill.total_amount;
          paid += bill.paid_amount;
          if (bill.status === 'PAID') paidCount++;
          else if (bill.status === 'PARTIAL') partialCount++;
          else unpaidCount++;
        });
        setStats({
          totalRevenue: revenue,
          totalPaid: paid,
          outstanding: revenue - paid,
          paidCount,
          unpaidCount,
          partialCount,
        });

        setStatusData([
          { name: 'Paid', value: paidCount, color: '#10b981' },
          { name: 'Partial', value: partialCount, color: '#f59e0b' },
          { name: 'Unpaid', value: unpaidCount, color: '#ef4444' },
        ]);

        const monthMap = new Map<string, { revenue: number; collected: number }>();
        parsedBills.forEach(bill => {
          const date = new Date(bill.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const existing = monthMap.get(monthKey) || { revenue: 0, collected: 0 };
          existing.revenue += bill.total_amount;
          existing.collected += bill.paid_amount;
          monthMap.set(monthKey, existing);
        });
        const sortedMonths = Array.from(monthMap.keys()).sort();
        const monthly = sortedMonths.map(key => ({
          month: key,
          revenue: monthMap.get(key)!.revenue,
          collected: monthMap.get(key)!.collected,
        }));
        setMonthlyData(monthly);
      } else {
        toast.error('Failed to load bills');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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
          Billing Dashboard feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Sum of all bills</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalPaid.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Payments received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{stats.outstanding.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Pending payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bills Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidCount} / {stats.unpaidCount + stats.partialCount}</div>
              <p className="text-xs text-gray-500">Paid / Unpaid+Partial</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                   label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} bills`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue & Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
           <Tooltip
  formatter={(value) => {
    const num = typeof value === 'number' ? value : parseFloat(value as string);
    if (isNaN(num)) return ['₹0', 'Amount'];
    return [`₹${num.toFixed(2)}`, 'Amount'];
  }}
/>
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Line Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
               <Tooltip
  formatter={(value) => {
    const num = typeof value === 'number' ? value : parseFloat(value as string);
    if (isNaN(num)) return ['₹0', 'Amount'];
    return [`₹${num.toFixed(2)}`, 'Amount'];
  }}
/>
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="collected" stroke="#10b981" name="Collected" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}