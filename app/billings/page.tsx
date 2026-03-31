'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Receipt, Search } from 'lucide-react';
import { toast } from 'sonner';

interface BillItem {
  id: number;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Bill {
  id: number;
  bill_number: string;
  patient_id: string;
  patient_name: string | null;
  admission_id: number | null;
  total_amount: number;
  paid_amount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  created_at: string;
  items: BillItem[];
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'ALL' ? `/api/billing/bills?status=${statusFilter}` : '/api/billing/bills';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        // Convert numeric strings to numbers
        const billsWithNumbers = data.data.map((bill: any) => ({
          ...bill,
          total_amount: parseFloat(bill.total_amount) || 0,
          paid_amount: parseFloat(bill.paid_amount) || 0,
          items: bill.items.map((item: any) => ({
            ...item,
            unit_price: parseFloat(item.unit_price) || 0,
            total_price: parseFloat(item.total_price) || 0,
          })),
        }));
        setBills(billsWithNumbers);
      } else {
        toast.error('Failed to load bills');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error loading bills');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    const remaining = bill.total_amount - bill.paid_amount;
    setPaymentAmount(remaining.toFixed(2));
    setPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedBill) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: selectedBill.id,
          amount,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment recorded');
        setPaymentOpen(false);
        fetchBills(); // refresh list
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
      case 'UNPAID':
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-amber-100 text-amber-800">Partial</Badge>;
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">IP Billing</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Bills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bills</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchBills()}>
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">No bills found</CardContent>
            </Card>
          ) : (
            bills.map((bill) => (
              <Card
                key={bill.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedBill?.id === bill.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedBill(bill)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{bill.bill_number}</p>
                      <p className="text-sm text-gray-500">
                        {bill.patient_name || 'Walk-in Patient'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(bill.status)}
                      <p className="font-bold mt-2">₹{bill.total_amount.toFixed(2)}</p>
                      {bill.paid_amount > 0 && (
                        <p className="text-xs text-gray-500">
                          Paid: ₹{bill.paid_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentDialog(bill);
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bill Details */}
        <div>
          {selectedBill && (
            <Card>
              <CardHeader>
                <CardTitle>Bill Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill Number:</span>
                    <span className="font-medium">{selectedBill.bill_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patient:</span>
                    <span>{selectedBill.patient_name || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Admission ID:</span>
                    <span>{selectedBill.admission_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{new Date(selectedBill.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBill.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.medicine_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>₹{item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                        <TableCell>₹{selectedBill.total_amount.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Bill Total:</span>
                <span className="font-bold">₹{selectedBill.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Already Paid:</span>
                <span>₹{selectedBill.paid_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className="text-green-600 font-bold">
                  ₹{(selectedBill.total_amount - selectedBill.paid_amount).toFixed(2)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium">Amount to Pay</label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                <Button onClick={handlePayment} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Payment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}