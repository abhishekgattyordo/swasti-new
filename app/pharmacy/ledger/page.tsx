

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Download, Menu, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/pharmacy/Sidebar';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

interface LedgerEntry {
  id: string;
  date: string;
  patientName: string;
  type: 'OP' | 'IP';
  medicine: string;
  batch: string;
  qty: number;
  unitPrice: number;
  tax: number;
  total: number;
  refId: string;
  status: 'Billed' | 'Returned' | 'Pending';
}

export default function LedgerPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'OP' | 'IP'>('all');
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]); // store all data
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  // Pagination state (client‑side)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isLedgerEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.LEDGER
);

useEffect(() => {
  if (!tenantLoading && !isLedgerEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  // Fetch all data once
  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        // No pagination params – fetch everything
        const res = await fetch('/api/pharmacy/ledger');
        const data = await res.json();
        if (data.success) {
          setAllEntries(data.data);
        } else {
          toast.error('Failed to load ledger');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while loading ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  // Apply filters whenever search, typeFilter, or allEntries change
  useEffect(() => {
    let filtered = allEntries;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.type === typeFilter);
    }

    // Filter by search (patient name or medicine)
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.patientName?.toLowerCase().includes(searchLower) ||
        e.medicine?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1); // reset to first page when filters change
  }, [search, typeFilter, allEntries]);

  // Paginate the filtered results
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredEntries.length / pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleTypeChange = (value: 'all' | 'OP' | 'IP') => {
    setTypeFilter(value);
  };

  const handleExport = () => {
    toast.success('Export started', {
      description: 'Your ledger report will be downloaded shortly.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Billed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Billed</Badge>;
      case 'Returned':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Returned</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (start > 2) {
        items.push(<PaginationItem key="ellipsis1"><span className="px-2">...</span></PaginationItem>);
      }

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (end < totalPages - 1) {
        items.push(<PaginationItem key="ellipsis2"><span className="px-2">...</span></PaginationItem>);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
          Pharmacy Ledger feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
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
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Ledger</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete transaction history</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search patient or medicine..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="OP">OP</SelectItem>
                    <SelectItem value="IP">IP</SelectItem>
                  </SelectContent>
                </Select>

                {/* Page size selector */}
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="10 / page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Desktop Table with vertical & horizontal lines */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Date</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Patient</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Type</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Medicine</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Batch</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Qty</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Unit Price</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Tax</TableHead>
                      <TableHead className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">Total</TableHead>
                      <TableHead className="last:border-r-0">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((e) => (
                      <TableRow
                        key={e.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => setSelectedEntry(e)}
                      >
                        <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          {e.date}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          {e.patientName}
                        </TableCell>
                        <TableCell className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          <Badge variant="outline" className={
                            e.type === 'OP'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                          }>
                            {e.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          {e.medicine}
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          {e.batch}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          {e.qty}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          ₹{e.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          ₹{e.tax.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                          ₹{e.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="last:border-r-0">
                          {getStatusBadge(e.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {paginatedEntries.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">No ledger entries found</div>
                )}
              </div>
            </div>

            {/* Mobile Cards (unchanged) */}
            <div className="md:hidden space-y-3">
              {paginatedEntries.map((e) => (
                <Card key={e.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEntry(e)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{e.patientName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{e.medicine}</p>
                      </div>
                      {getStatusBadge(e.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{e.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                        <Badge variant="outline" className={
                          e.type === 'OP'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                        }>
                          {e.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Batch</p>
                        <p className="font-medium text-gray-900 dark:text-white">{e.batch}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty</p>
                        <p className="font-medium text-gray-900 dark:text-white">{e.qty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                        <p className="font-medium text-gray-900 dark:text-white">₹{e.unitPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-bold text-green-600 dark:text-green-400">₹{e.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ref: {e.refId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {paginatedEntries.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No ledger entries found
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Detail Drawer (unchanged) */}
            <Sheet open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader><SheetTitle>Transaction Details</SheetTitle></SheetHeader>
                {selectedEntry && (
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Patient</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.patientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                      <Badge variant="outline" className={
                        selectedEntry.type === 'OP'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                      }>
                        {selectedEntry.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Medicine</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.medicine}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Batch</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.batch}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Quantity</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.qty}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Unit Price</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">₹{selectedEntry.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tax</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">₹{selectedEntry.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{selectedEntry.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Reference ID</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEntry.refId}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                      <span>{getStatusBadge(selectedEntry.status)}</span>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </main>
      </div>
    </div>
  );
}