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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Download, Calendar, Building2, Bed, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

interface DischargeAdmission {
  id: number;
  patient_id: string;
  patient_name: string;
  admission_date: string;
  discharge_date: string;
  ward_name: string;
  bed_number: string;
  discharge_id: string;
  total_amount: number;
  paid_amount: number;
  status: 'PAID' | 'PARTIAL';
  reason?: string;
  diagnosis?: string;
}

export default function DischargeSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [discharges, setDischarges] = useState<DischargeAdmission[]>([]);
  const [filteredDischarges, setFilteredDischarges] = useState<DischargeAdmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedDischarge, setSelectedDischarge] = useState<DischargeAdmission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const router = useRouter(); // Add if not present
const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isDischargeSummaryEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.BILLING,
  BILLING_FEATURES.DISCHARGE_SUMMARY
);

useEffect(() => {
  if (!tenantLoading && !isDischargeSummaryEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    fetchDischarges();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDischarges(discharges);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = discharges.filter(
        d =>
          d.patient_name.toLowerCase().includes(term) ||
          d.discharge_id.toLowerCase().includes(term)
      );
      setFilteredDischarges(filtered);
    }
  }, [searchTerm, discharges]);

  const fetchDischarges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/helpdesk/admissions?status=discharged');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const admissions = data.data;
        const dischargeList: DischargeAdmission[] = await Promise.all(
          admissions.map(async (adm: any) => {
            try {
              const billRes = await fetch(`/api/billing?admissionId=${adm.id}`);
              const billData = await billRes.json();
          let total = 0, paid = 0, billStatus: 'PAID' | 'PARTIAL' = 'PAID';
              if (billData.success && billData.data?.bill_summary) {
                total = billData.data.bill_summary.totalAmount;
                paid = billData.data.bill_summary.paidAmount;
                billStatus = billData.data.bill_summary.status === 'PAID' ? 'PAID' : 'PARTIAL';
              }
              return {
                id: adm.id,
                patient_id: adm.patient_id,
                patient_name: adm.patient_name,
                admission_date: adm.admission_date,
                discharge_date: adm.discharge_date,
                ward_name: adm.ward_name || 'N/A',
                bed_number: adm.bed_number || 'N/A',
                discharge_id: adm.discharge_id || 'N/A',
                total_amount: total,
                paid_amount: paid,
                status: billStatus,
                reason: adm.reason,
                diagnosis: adm.diagnosis,
              };
            } catch (err) {
              console.error(`Error fetching bill for admission ${adm.id}`, err);
              return {
                id: adm.id,
                patient_id: adm.patient_id,
                patient_name: adm.patient_name,
                admission_date: adm.admission_date,
                discharge_date: adm.discharge_date,
                ward_name: adm.ward_name || 'N/A',
                bed_number: adm.bed_number || 'N/A',
                discharge_id: adm.discharge_id || 'N/A',
                total_amount: 0,
                paid_amount: 0,
                status: 'PAID' as const,
                reason: adm.reason,
                diagnosis: adm.diagnosis,
              };
            }
          })
        );
        setDischarges(dischargeList);
        setFilteredDischarges(dischargeList);
      } else {
        setError(data.message || 'Failed to load discharged patients');
        toast.error(data.message || 'Failed to load discharged patients');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading data');
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Discharge ID', 'Patient', 'Admission Date', 'Discharge Date', 'Ward', 'Bed', 'Total Bill (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Status'];
    const rows = filteredDischarges.map(d => {
      const outstanding = d.total_amount - d.paid_amount;
      return [
        d.discharge_id,
        d.patient_name,
        new Date(d.admission_date).toLocaleDateString(),
        new Date(d.discharge_date).toLocaleDateString(),
        d.ward_name,
        d.bed_number,
        d.total_amount.toFixed(2),
        d.paid_amount.toFixed(2),
        outstanding.toFixed(2),
        d.status,
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'discharge-summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export completed', { description: 'Discharge summary exported as CSV' });
  };

  const viewDetail = (discharge: DischargeAdmission) => {
    setSelectedDischarge(discharge);
    setDetailOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const calculateStayDays = (admissionDate: string, dischargeDate: string) => {
    const start = new Date(admissionDate);
    const end = new Date(dischargeDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
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
        <Button onClick={fetchDischarges}>Retry</Button>
      </div>
    );
  }

  if (!tenantLoading && !isDischargeSummaryEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Discharge Summary feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Discharge Summary</h1>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient or discharge ID..."
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

        {filteredDischarges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matching records found.' : 'No discharged patients found.'}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Discharge ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Admission Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Discharge Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Ward / Bed</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Total Bill</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDischarges.map((discharge) => (
                    <tr
                      key={discharge.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => viewDetail(discharge)}
                    >
                      <td className="px-4 py-3 border border-gray-200 font-mono text-xs">{discharge.discharge_id}</td>
                      <td className="px-4 py-3 border border-gray-200 font-medium">{discharge.patient_name}</td>
                      <td className="px-4 py-3 border border-gray-200">{formatDate(discharge.admission_date)}</td>
                      <td className="px-4 py-3 border border-gray-200">{formatDate(discharge.discharge_date)}</td>
                      <td className="px-4 py-3 border border-gray-200">{discharge.ward_name} / {discharge.bed_number}</td>
                      <td className="px-4 py-3 border border-gray-200">₹{discharge.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 border border-gray-200">
                        {discharge.status === 'PAID' ? (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">Partial</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
              Showing {filteredDischarges.length} of {discharges.length} discharged patients
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer (Sheet) */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Discharge Summary</SheetTitle>
          </SheetHeader>
          {selectedDischarge && (
            <div className="space-y-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discharge ID</span>
                  <span className="font-mono font-medium">{selectedDischarge.discharge_id}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Patient</span>
                  <span className="font-medium">{selectedDischarge.patient_name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Patient ID</span>
                  <span>{selectedDischarge.patient_id}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Stay Details
                </h3>
                <div className="flex justify-between">
                  <span className="text-gray-500">Admission</span>
                  <span>{formatDate(selectedDischarge.admission_date)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">Discharge</span>
                  <span>{formatDate(selectedDischarge.discharge_date)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">Length of Stay</span>
                  <span>{calculateStayDays(selectedDischarge.admission_date, selectedDischarge.discharge_date)} days</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Ward & Bed
                </h3>
                <div className="flex justify-between">
                  <span>Ward</span>
                  <span>{selectedDischarge.ward_name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Bed</span>
                  <span>{selectedDischarge.bed_number}</span>
                </div>
              </div>

              {(selectedDischarge.reason || selectedDischarge.diagnosis) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Clinical Summary</h3>
                  {selectedDischarge.reason && <p><span className="text-gray-500">Reason:</span> {selectedDischarge.reason}</p>}
                  {selectedDischarge.diagnosis && <p className="mt-1"><span className="text-gray-500">Diagnosis:</span> {selectedDischarge.diagnosis}</p>}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Billing Summary</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total Amount</span>
                    <span className="font-bold">₹{selectedDischarge.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount</span>
                    <span>₹{selectedDischarge.paid_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span>Outstanding</span>
                    <span className={selectedDischarge.total_amount - selectedDischarge.paid_amount === 0 ? 'text-green-600' : 'text-red-600'}>
                      ₹{(selectedDischarge.total_amount - selectedDischarge.paid_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}