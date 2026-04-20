

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Download, Menu, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/pharmacy/Sidebar";
import { purchasesApi } from "@/lib/api/purchasesApi";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

// Types for stock item
interface StockItem {
  id: number;
  medicine_id: number;
  medicineName: string;
  batch: string;
  expiryDate: string;
  availableQty: number;
  reorderLevel: number;
  purchasePrice: number | string;
  mrp: number | string;
  delivered: number | string;
}

// Helper to normalize API response
const normalizeResponse = (res: any): { success: boolean; data: StockItem[] } => {
  const payload = res?.data?.success !== undefined ? res.data : res;
  return {
    success: payload?.success ?? false,
    data: payload?.data ?? [],
  };
};

// Helper for stock status
function getStockStatus(item: {
  expiryDate: string;
  availableQty: number;
  reorderLevel?: number;
}) {
  const now = new Date();
  const exp = new Date(item.expiryDate);
  const daysToExpiry = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysToExpiry <= 0)
    return {
      label: "Expired",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  if (item.availableQty === 0)
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  if (daysToExpiry <= 30)
    return {
      label: "Expiring Soon",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  if (item.reorderLevel && item.availableQty <= item.reorderLevel)
    return {
      label: "Low Stock",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  return {
    label: "OK",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
}

export default function CurrentStockPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isCurrentStockEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.CURRENT_STOCK
);

useEffect(() => {
  if (!tenantLoading && !isCurrentStockEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (search) params.search = search;
        if (lowStockOnly) params.lowStock = true;

        const response = await purchasesApi.getStock(params);
        console.log("API response:", response);
        const { success, data } = normalizeResponse(response);
        if (success) {
          setStockItems(data);
          setError(null);
        } else {
          setError("Failed to load stock");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [search, lowStockOnly]);

  const handleExportCSV = () => {
    toast.success("Export started", {
      description: "Your stock report will be downloaded shortly.",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!tenantLoading && !isCurrentStockEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Current Stock feature is not enabled for {tenant?.name}.
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
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Spacer for mobile menu */}
              <div className="w-8 lg:hidden"></div>

              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Stock
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stockItems.length} batch entries
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search medicine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="lowStock"
                    checked={lowStockOnly}
                    onCheckedChange={(checked) =>
                      setLowStockOnly(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="lowStock"
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    Low stock only
                  </Label>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Table - Desktop */}
            {/* Stock Table - Always visible, scrollable on mobile */}
<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Medicine</TableHead>
          <TableHead className="whitespace-nowrap">Batch</TableHead>
          <TableHead className="whitespace-nowrap">Expiry Date</TableHead>
          <TableHead className="whitespace-nowrap">Available Qty</TableHead>
          <TableHead className="whitespace-nowrap">Reorder Level</TableHead>
          <TableHead className="whitespace-nowrap">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
              No stock items found matching your filters
            </TableCell>
          </TableRow>
        ) : (
          stockItems.map((s) => {
            const status = getStockStatus(s);
            const isExpired = new Date(s.expiryDate) < new Date();
            return (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => setSelectedItem(s)}
              >
                <TableCell className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {s.medicineName}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {s.batch}
                </TableCell>
                <TableCell
                  className={`whitespace-nowrap ${
                    isExpired
                      ? "text-red-600 dark:text-red-400 font-medium"
                      : ""
                  }`}
                >
                  {s.expiryDate.split("T")[0]}
                </TableCell>
                <TableCell
                  className={`whitespace-nowrap ${
                    s.availableQty === 0
                      ? "text-red-600 dark:text-red-400 font-bold"
                      : "font-medium"
                  }`}
                >
                  {s.availableQty}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {s.reorderLevel}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </div>
</div>

            {/* Mobile Cards */}
            

            {/* Detail Drawer */}
            <Sheet
              open={!!selectedItem}
              onOpenChange={() => setSelectedItem(null)}
            >
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Batch Details</SheetTitle>
                </SheetHeader>
                {selectedItem && (
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Medicine
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedItem.medicineName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Batch
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedItem.batch}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Expiry Date
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          new Date(selectedItem.expiryDate) < new Date()
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {selectedItem.expiryDate.split("T")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Available Qty
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          selectedItem.availableQty === 0
                            ? "text-red-600 dark:text-red-400 font-bold"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {selectedItem.availableQty}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Reorder Level
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedItem.reorderLevel}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Purchase Price
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{Number(selectedItem.purchasePrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        MRP
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{Number(selectedItem.mrp).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <Badge className={getStockStatus(selectedItem).className}>
                        {getStockStatus(selectedItem).label}
                      </Badge>
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