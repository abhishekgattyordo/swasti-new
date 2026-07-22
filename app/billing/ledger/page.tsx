'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2, Search, Download } from 'lucide-react';
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

export default function LedgerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isLedgerEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.BILLING,
  BILLING_FEATURES.LEDGER
);

useEffect(() => {
  if (!tenantLoading && !isLedgerEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBills(bills);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = bills.filter(
        b =>
          b.patient_name.toLowerCase().includes(term) ||
          b.bill_number.toLowerCase().includes(term)
      );
      setFilteredBills(filtered);
    }
  }, [searchTerm, bills]);

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
        setFilteredBills(parsedBills);
      } else {
        setError(data.message || 'Failed to load bills');
        toast.error(data.message || 'Failed to load bills');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading ledger');
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Bill No.', 'Patient', 'Date', 'Room Rent (₹)', 'Medicine (₹)', 'Total (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Status'];
    const rows = filteredBills.map(bill => {
      const roomTotal = bill.items
        .filter(i => i.medicine_name.toLowerCase().includes('room rent'))
        .reduce((sum, i) => sum + i.total_price, 0);
      const medicineTotal = bill.total_amount - roomTotal;
      const outstanding = bill.total_amount - bill.paid_amount;
      return [
        bill.bill_number,
        bill.patient_name,
        new Date(bill.created_at).toLocaleDateString(),
        roomTotal.toFixed(2),
        medicineTotal.toFixed(2),
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
    link.setAttribute('download', 'ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export completed', { description: 'Ledger exported as CSV' });
  };

  const viewBillDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailOpen(true);
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

if (!tenantLoading && !isLedgerEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Billing Ledger feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Ledger</h1>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient or bill number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matching records found.' : 'No bills found.'}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Bill No.</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Room Rent (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Medicine (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Grand Total (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Paid (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Outstanding (₹)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBills.map((bill) => {
                    const roomTotal = bill.items
                      .filter(i => i.medicine_name.toLowerCase().includes('room rent'))
                      .reduce((sum, i) => sum + i.total_price, 0);
                    const medicineTotal = bill.total_amount - roomTotal;
                    const outstanding = bill.total_amount - bill.paid_amount;
                    return (
                      <tr
                        key={bill.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => viewBillDetails(bill)}
                      >
                        <td className="px-4 py-3 border border-gray-200 font-mono text-xs">{bill.bill_number}</td>
                        <td className="px-4 py-3 border border-gray-200">{bill.patient_name}</td>
                        <td className="px-4 py-3 border border-gray-200">{formatDate(bill.created_at)}</td>
                        <td className="px-4 py-3 border border-gray-200">₹{roomTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 border border-gray-200">₹{medicineTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 border border-gray-200 font-medium">₹{bill.total_amount.toFixed(2)}</td>
                        <td className="px-4 py-3 border border-gray-200">₹{bill.paid_amount.toFixed(2)}</td>
                        <td className="px-4 py-3 border border-gray-200 font-medium">
                          {outstanding > 0 ? `₹${outstanding.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 border border-gray-200">{getStatusBadge(bill.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer (Sheet) */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bill Details</SheetTitle>
          </SheetHeader>
          {selectedBill && (
            <div className="space-y-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bill Number</span>
                  <span className="font-mono font-medium">{selectedBill.bill_number}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Patient</span>
                  <span className="font-medium">{selectedBill.patient_name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Date</span>
                  <span>{formatDate(selectedBill.created_at)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span>{getStatusBadge(selectedBill.status)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                      <span className="text-gray-600">{item.medicine_name}</span>
                      <div className="text-right">
                        <span className="text-gray-500 mr-3">{item.quantity} × ₹{item.unit_price.toFixed(2)}</span>
                        <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedBill.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Paid</span>
                  <span>₹{selectedBill.paid_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1 font-bold">
                  <span>Outstanding</span>
                  <span className="text-red-600">₹{(selectedBill.total_amount - selectedBill.paid_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}