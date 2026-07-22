'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from "@/context/TenantContext";
import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

interface BillItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Bill {
  id: number;
  bill_number: string;
  admission_id: number;
  patient_name: string;
  total_amount: number;
  paid_amount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  created_at: string;
  items: BillItem[];
}

export default function AllBillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mainStatusFilter, setMainStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filters, setFilters] = useState({
    patientName: '',
    billNumber: '',
    date: '',
    totalAmount: '',
    paidAmount: '',
    status: '',
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isAllBillsEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.BILLING,
  BILLING_FEATURES.ALL_BILLS
);

useEffect(() => {
  if (!tenantLoading && !isAllBillsEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilter && filterRefs.current[openFilter] &&
          !filterRefs.current[openFilter]?.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/bills');
      const data = await res.json();
      if (data.success) {
        const parsedBills: Bill[] = data.data.map((bill: any) => ({
          ...bill,
          total_amount: parseFloat(bill.total_amount) || 0,
          paid_amount: parseFloat(bill.paid_amount) || 0,
          items: (bill.items || []).map((item: any) => ({
            medicine_name: item.medicine_name,
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price) || 0,
            total_price: parseFloat(item.total_price) || 0,
          })),
        }));
        setBills(parsedBills);
      } else {
        setError(data.message || 'Failed to load bills');
        toast.error(data.message || 'Failed to load bills');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading bills');
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Bill No.', 'Patient', 'Date', 'Total (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Status'];
    const rows = filteredBills.map(bill => {
      const outstanding = bill.total_amount - bill.paid_amount;
      return [
        bill.bill_number,
        bill.patient_name,
        new Date(bill.created_at).toLocaleDateString(),
        bill.total_amount.toFixed(2),
        bill.paid_amount.toFixed(2),
        outstanding.toFixed(2),
        bill.status,
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'all-bills.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export completed', { description: 'Bills exported as CSV' });
  };

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilter = (column: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [column]: '' }));
    setOpenFilter(null);
  };

  const clearAllFilters = () => {
    setFilters({
      patientName: '',
      billNumber: '',
      date: '',
      totalAmount: '',
      paidAmount: '',
      status: '',
    });
    setMainStatusFilter('all');
    setOpenFilter(null);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || mainStatusFilter !== 'all';

  const filteredBills = useMemo(() => {
    let filtered = [...bills];
    if (mainStatusFilter === 'paid') {
      filtered = filtered.filter(bill => bill.status === 'PAID');
    } else if (mainStatusFilter === 'unpaid') {
      filtered = filtered.filter(bill => bill.status !== 'PAID');
    }
    return filtered.filter(bill => {
      const matchPatientName = bill.patient_name.toLowerCase().includes(filters.patientName.toLowerCase());
      const matchBillNumber = bill.bill_number.toLowerCase().includes(filters.billNumber.toLowerCase());
      const matchDate = filters.date ? bill.created_at.startsWith(filters.date) : true;
      const matchTotalAmount = filters.totalAmount ? bill.total_amount.toString().includes(filters.totalAmount) : true;
      const matchPaidAmount = filters.paidAmount ? bill.paid_amount.toString().includes(filters.paidAmount) : true;
      const matchStatus = filters.status ? bill.status.toLowerCase().includes(filters.status.toLowerCase()) : true;
      return matchPatientName && matchBillNumber && matchDate && matchTotalAmount && matchPaidAmount && matchStatus;
    });
  }, [bills, mainStatusFilter, filters]);

  const FilterPopover = ({ column, placeholder, label }: { column: keyof typeof filters; placeholder: string; label: string }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

    if (!tenantLoading && !isAllBillsEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          All Bills feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

    return (
      <div className="relative inline-block" ref={el => { filterRefs.current[column] = el; }}>
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors ${value ? 'text-blue-600' : 'text-gray-400'}`}
          aria-label={`Filter by ${label}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by {label}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-amber-100 text-amber-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchBills}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">All Bills</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Main Status Filter Tabs */}
        <Tabs value={mainStatusFilter} onValueChange={(val) => setMainStatusFilter(val as 'all' | 'paid' | 'unpaid')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {hasActiveFilters ? 'No matching bills found.' : 'No bills found.'}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        PATIENT
                        <FilterPopover column="patientName" placeholder="Filter by name..." label="Patient Name" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        BILL NO.
                        <FilterPopover column="billNumber" placeholder="Filter by number..." label="Bill Number" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        DATE
                        <FilterPopover column="date" placeholder="YYYY-MM-DD" label="Date" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        TOTAL (₹)
                        <FilterPopover column="totalAmount" placeholder="Filter amount..." label="Total Amount" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        PAID (₹)
                        <FilterPopover column="paidAmount" placeholder="Filter amount..." label="Paid Amount" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        STATUS
                        <FilterPopover column="status" placeholder="Paid/Partial/Unpaid" label="Status" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => router.push(`/billing/admission/${bill.admission_id}`)}
                    >
                      <TableCell className="border">{bill.patient_name}</TableCell>
                      <TableCell className="border font-mono text-xs">{bill.bill_number}</TableCell>
                      <TableCell className="border">{formatDate(bill.created_at)}</TableCell>
                      <TableCell className="border font-medium">₹{bill.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="border">₹{bill.paid_amount.toFixed(2)}</TableCell>
                      <TableCell className="border">{getStatusBadge(bill.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
          </div>
        )}
      </div>
    </div>
  );
}