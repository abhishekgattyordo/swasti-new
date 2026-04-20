'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Filter, Calendar, Building2, Bed, User, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

interface Admission {
  id: number;
  patient_id: string;
  admission_date: string;
  discharge_date: string | null;
  status: string;
  reason: string;
  diagnosis: string;
  patient_name: string;
  patient_phone: string;
  ward_name: string;
  bed_number: string;
  billStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
  total_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
}

export default function AdmittedPatientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    patientName: '',
    patientId: '',
    admissionDate: '',
    ward: '',
    bed: '',
    reason: '',
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isAdmittedBillingEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.BILLING,
  BILLING_FEATURES.ADMITTED_PATIENT_BILLING
);

useEffect(() => {
  if (!tenantLoading && !isAdmittedBillingEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    fetchAdmissions();
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

  const fetchAdmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/helpdesk/admissions?status=active');
      const data = await res.json();
      if (data.success) {
        let admissionsList: Admission[] = data.data;
        const admissionsWithBillStatus = await Promise.all(
          admissionsList.map(async (adm) => {
            try {
              const billRes = await fetch(`/api/billing?admissionId=${adm.id}`);
              const billData = await billRes.json();
              if (billData.success && billData.data?.bill_summary) {
                const summary = billData.data.bill_summary;
                if (summary.remainingAmount === 0) {
                  return { ...adm, billStatus: 'PAID' as const, total_amount: summary.totalAmount, paid_amount: summary.paidAmount, remaining_amount: summary.remainingAmount };
                } else if (summary.status === 'PARTIAL') {
                  return { ...adm, billStatus: 'PARTIAL' as const, total_amount: summary.totalAmount, paid_amount: summary.paidAmount, remaining_amount: summary.remainingAmount };
                } else {
                  return { ...adm, billStatus: 'UNPAID' as const, total_amount: summary.totalAmount, paid_amount: summary.paidAmount, remaining_amount: summary.remainingAmount };
                }
              } else {
                return { ...adm, billStatus: 'UNPAID' as const };
              }
            } catch (err) {
              console.error(`Failed to fetch bill for admission ${adm.id}`, err);
              return { ...adm, billStatus: 'UNPAID' as const };
            }
          })
        );
        const unpaidAdmissions = admissionsWithBillStatus.filter(adm => adm.billStatus !== 'PAID');
        setAdmissions(unpaidAdmissions);
      } else {
        setError(data.message || 'Failed to load admissions');
        toast.error(data.message || 'Failed to load admissions');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Patient', 'Patient ID', 'Admission Date', 'Ward', 'Bed', 'Reason', 'Total Bill (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Status'];
    const rows = filteredAdmissions.map(adm => {
      const total = adm.total_amount || 0;
      const paid = adm.paid_amount || 0;
      const outstanding = total - paid;
      return [
        adm.patient_name,
        adm.patient_id,
        new Date(adm.admission_date).toLocaleDateString(),
        adm.ward_name || 'N/A',
        adm.bed_number || 'N/A',
        adm.reason || '',
        total.toFixed(2),
        paid.toFixed(2),
        outstanding.toFixed(2),
        adm.billStatus || 'UNPAID',
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'admitted-patients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export completed', { description: 'Admitted patients list exported as CSV' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
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
      patientId: '',
      admissionDate: '',
      ward: '',
      bed: '',
      reason: '',
    });
    setOpenFilter(null);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const matchPatientName = adm.patient_name.toLowerCase().includes(filters.patientName.toLowerCase());
      const matchPatientId = adm.patient_id.toLowerCase().includes(filters.patientId.toLowerCase());
      const matchAdmissionDate = filters.admissionDate
        ? adm.admission_date.startsWith(filters.admissionDate)
        : true;
      const matchWard = (adm.ward_name || '').toLowerCase().includes(filters.ward.toLowerCase());
      const matchBed = (adm.bed_number || '').toLowerCase().includes(filters.bed.toLowerCase());
      const matchReason = (adm.reason || '').toLowerCase().includes(filters.reason.toLowerCase());
      return matchPatientName && matchPatientId && matchAdmissionDate && matchWard && matchBed && matchReason;
    });
  }, [admissions, filters]);

  const FilterPopover = ({ column, placeholder, label }: { column: keyof typeof filters; placeholder: string; label: string }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

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
        <Button onClick={fetchAdmissions}>Retry</Button>
      </div>
    );
  }

  if (!tenantLoading && !isAdmittedBillingEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Admitted Patient Billing feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Admitted Patients</h1>
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

        {filteredAdmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {hasActiveFilters ? 'No matching admissions found.' : 'No active admissions with unpaid/partial bills.'}
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
                        <User className="w-3 h-3" />
                        PATIENT
                        <FilterPopover column="patientName" placeholder="Filter by name..." label="Patient Name" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        PATIENT ID
                        <FilterPopover column="patientId" placeholder="Filter by ID..." label="Patient ID" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        ADMISSION DATE
                        <FilterPopover column="admissionDate" placeholder="YYYY-MM-DD" label="Admission Date" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        WARD
                        <FilterPopover column="ward" placeholder="Filter by ward..." label="Ward" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        BED
                        <FilterPopover column="bed" placeholder="Filter by bed..." label="Bed" />
                      </div>
                    </TableHead>
                    <TableHead className="border">
                      <div className="flex items-center gap-1">
                        REASON
                        <FilterPopover column="reason" placeholder="Filter by reason..." label="Reason" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.map((admission) => (
                    <TableRow
                      key={admission.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => router.push(`/billing/admission/${admission.id}`)}
                    >
                      <TableCell className="border font-medium">{admission.patient_name}</TableCell>
                      <TableCell className="border text-gray-600">{admission.patient_id}</TableCell>
                      <TableCell className="border">{formatDate(admission.admission_date)}</TableCell>
                      <TableCell className="border">{admission.ward_name || '—'}</TableCell>
                      <TableCell className="border">{admission.bed_number || '—'}</TableCell>
                      <TableCell className="border text-gray-600 max-w-xs truncate">{admission.reason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
              Showing {filteredAdmissions.length} of {admissions.length} active admissions (unpaid/partial bills)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}