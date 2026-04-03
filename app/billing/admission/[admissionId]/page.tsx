'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Receipt, Calendar, Bed, Building2, User, AlertCircle } from 'lucide-react';

interface BillItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  bill_id: number;
  bill_created_at: string;
}

interface BillData {
  admission: {
    id: number;
    date: string;
    discharge_date: string | null;
    status: string;
    ward: string;
    bed: string;
  };
  bill_summary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  };
  bills: { id: number; bill_number: string }[];
  items: BillItem[];
}

export default function AdmissionBillPage() {
  const params = useParams();
  const router = useRouter();
  const admissionId = params.admissionId as string;
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment dialog
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);

  // Discharge ID generation
  const [dischargeId, setDischargeId] = useState<string | null>(null);
  const [showDischargeIdDialog, setShowDischargeIdDialog] = useState(false);
  const [generatingDischargeId, setGeneratingDischargeId] = useState(false);
  const hasGeneratedIdRef = useRef(false); // Prevent multiple generation calls



  // Inside app/billing/admission/[admissionId]/page.tsx
// useEffect(() => {
//   const updateBill = async () => {
//     try {
//       await fetch('/api/billing/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ admissionId }),
//       });
//       // Then refresh the bill data
//       fetchBill();
//     } catch (err) {
//       console.error('Bill auto‑update failed', err);
//     }
//   };
//   updateBill();
// }, [admissionId]);

  useEffect(() => {
    fetchBill();
  }, [admissionId]);

  // After billData updates, check if fully paid and generate discharge ID if needed
  useEffect(() => {
    if (billData && billData.bill_summary.remainingAmount === 0 && !hasGeneratedIdRef.current) {
      generateDischargeId();
    }
  }, [billData]);

  const fetchBill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing?admissionId=${admissionId}`);
      const data = await res.json();
      if (data.success) {
        setBillData(data.data);
      } else {
        setError(data.message || 'Failed to load bill');
        toast.error(data.message || 'Failed to load bill');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the bill');
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateDischargeId = async () => {
    if (hasGeneratedIdRef.current) return;
    hasGeneratedIdRef.current = true;
    setGeneratingDischargeId(true);
    try {
      const res = await fetch('/api/billing/generate-discharge-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId }),
      });
      const data = await res.json();
      if (data.success) {
        setDischargeId(data.data.dischargeId);
        setShowDischargeIdDialog(true);
        toast.success('Discharge ID generated');
      } else {
        toast.error(data.message || 'Failed to generate discharge ID');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate discharge ID');
    } finally {
      setGeneratingDischargeId(false);
    }
  };

  const openPaymentDialog = () => {
    if (billData?.bill_summary.remainingAmount) {
      setPaymentAmount(billData.bill_summary.remainingAmount.toString());
    } else {
      setPaymentAmount('');
    }
    setPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!billData) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const billId = billData.bills[0]?.id;
    if (!billId) {
      toast.error('No bill found for this admission');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          amount,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment recorded');
        setPaymentOpen(false);
        fetchBill(); // refresh bill data
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center">{error}</p>
        <Button onClick={() => router.push('/billing/admitted-patients')}>
          Back to Patients
        </Button>
      </div>
    );
  }

  if (!billData) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/billing/admitted-patients')}
        className="mb-4"
      >
        ← Back to Patients
      </Button>

      {/* Bill Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Bill for Admission #{billData.admission.id}</span>
            {getStatusBadge(billData.bill_summary.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Admission Date</p>
                <p className="font-medium">{formatDate(billData.admission.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Ward</p>
                <p className="font-medium">{billData.admission.ward}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Bed</p>
                <p className="font-medium">{billData.admission.bed}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium capitalize">{billData.admission.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bill Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billData.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.medicine_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                  <TableCell>₹{item.total_price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Amount</span>
              <span className="font-bold">₹{billData.bill_summary.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount</span>
              <span className="font-bold">₹{billData.bill_summary.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Remaining</span>
              <span className="text-green-600">₹{billData.bill_summary.remainingAmount.toFixed(2)}</span>
            </div>
          </div>
          {billData.bill_summary.remainingAmount > 0 && (
            <Button className="mt-4 w-full" onClick={openPaymentDialog}>
              <Receipt className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the amount and payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge ID Dialog */}
      <Dialog open={showDischargeIdDialog} onOpenChange={setShowDischargeIdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge ID Generated</DialogTitle>
            <DialogDescription>
              The bill is fully paid. A discharge ID has been generated for this admission.
              Please keep this ID for the discharge process.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-100 rounded text-center">
            <p className="text-lg font-mono font-bold">{dischargeId}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDischargeIdDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}