// app/patient/medical-records/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/patient/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  FlaskConical,
  HeartPulse,
  Pill,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  Filter,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

// ---------- Types ----------
interface LabOrderTest {
  id: string;
  name: string;
  price: number;
}

interface LabOrderResult {
  test_id: string;
  result: string;
  entered_at: string;
}

interface LabOrder {
  id: string;
  order_id: string;
  patient_id: string;
  patient_name: string;
  visit_type: string;
  visit_id: string;
  tests: LabOrderTest[];
  total_amount: string;
  status: "Ordered" | "Collected" | "Completed";
  order_date: string;
  collected_date: string | null;
  completed_date: string | null;
  billing_entry_id: string;
  results: LabOrderResult[];
  created_at: string;
}

// Flattened record for display
interface MedicalRecord {
  id: string;            // test id
  orderId: string;       // lab order number
  name: string;          // test name
  date: string;          // order_date
  status: string;        // order status
  type: "lab";           // always lab for now
  result?: string;       // from results if available
  reference: string;     // order_id as ref
}

const statusColorMap: Record<string, string> = {
  Ordered: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200",
  Collected: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
};

interface ColumnFilter {
  column: string;
  value: string;
}

interface DateRangeFilter {
  from: string;
  to: string;
}

// Column Filter Popover
function ColumnFilterPopover({
  column,
  placeholder = "Filter...",
  options,
  onFilter,
  currentValue,
}: {
  column: string;
  placeholder?: string;
  options?: string[];
  onFilter: (column: string, value: string) => void;
  currentValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(currentValue || "");

  const handleApply = () => {
    onFilter(column, filterValue);
    setOpen(false);
  };

  const handleClear = () => {
    setFilterValue("");
    onFilter(column, "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            currentValue ? "text-green-600 dark:text-green-400" : "text-gray-400"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter by {column}</h4>
          {options ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilterValue(opt);
                    onFilter(column, opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentValue === opt
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                      : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder={placeholder}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-8"
              />
            </div>
          )}
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Date Range Filter Popover
function DateRangeFilterPopover({
  column,
  onFilter,
  currentRange,
}: {
  column: string;
  onFilter: (column: string, from: string, to: string) => void;
  currentRange?: { from: string; to: string };
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(currentRange?.from || "");
  const [to, setTo] = useState(currentRange?.to || "");

  const handleApply = () => {
    onFilter(column, from, to);
    setOpen(false);
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    onFilter(column, "", "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            currentRange?.from || currentRange?.to
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Date Range</h4>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MedicalRecordsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("last6months");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [dateFilters, setDateFilters] = useState<Record<string, DateRangeFilter>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof MedicalRecord; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);

  const getPatientId = (): string | null => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.patient_id || user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const patientId = getPatientId();
    if (!patientId) {
      setError("Patient not identified. Please log in.");
      setLoading(false);
      return;
    }

    const fetchLabOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/patient/lab-orders?patientId=${patientId}`);
        const result = await res.json();
        if (result.success) {
          setLabOrders(result.data);
        } else {
          setError(result.message || "Failed to load medical records");
        }
      } catch (err) {
        console.error(err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLabOrders();
  }, []);

  // Flatten lab orders
  const records: MedicalRecord[] = useMemo(() => {
    const flat: MedicalRecord[] = [];
    for (const order of labOrders) {
      for (const test of order.tests) {
        const resultEntry = order.results?.find((r) => r.test_id === test.id);
        flat.push({
          id: test.id,
          orderId: order.order_id,
          name: test.name,
          date: order.order_date,
          status: order.status,
          type: "lab",
          result: resultEntry?.result,
          reference: order.order_id,
        });
      }
    }
    return flat;
  }, [labOrders]);

  // Filtering and sorting (fixed for undefined values)
  const filteredRecords = useMemo(() => {
    let filtered = records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "all" || record.type === activeTab;

      const matchesColumnFilters = columnFilters.every((filter) => {
        let value: string | undefined;
        switch (filter.column) {
          case "name":
            value = record.name;
            break;
          case "status":
            value = record.status;
            break;
          case "orderId":
            value = record.orderId;
            break;
          default:
            return true;
        }
        return value?.toLowerCase().includes(filter.value.toLowerCase());
      });

      let matchesDateFilters = true;
      const dateRange = dateFilters.date;
      if (dateRange && (dateRange.from || dateRange.to)) {
        const recordDate = new Date(record.date);
        if (dateRange.from && new Date(recordDate) < new Date(dateRange.from)) matchesDateFilters = false;
        if (dateRange.to && new Date(recordDate) > new Date(dateRange.to)) matchesDateFilters = false;
      }
      return matchesSearch && matchesTab && matchesColumnFilters && matchesDateFilters;
    });

    // Sorting – handle undefined values safely
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortConfig.key] as string | number;
      let bVal: string | number = b[sortConfig.key] as string | number;

      if (sortConfig.key === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else {
        // Convert undefined to empty string for string comparisons
        if (aVal === undefined) aVal = "";
        if (bVal === undefined) bVal = "";
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [records, searchQuery, activeTab, columnFilters, dateFilters, sortConfig]);

  const handleSort = (key: keyof MedicalRecord) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof MedicalRecord }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.column !== column);
      return value ? [...filtered, { column, value }] : filtered;
    });
  };

  const handleDateRangeFilter = (column: string, from: string, to: string) => {
    setDateFilters((prev) => {
      const newFilters = { ...prev };
      if (from || to) {
        newFilters[column] = { from, to };
      } else {
        delete newFilters[column];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters([]);
    setDateFilters({});
    setSearchQuery("");
    setCategoryFilter("all");
    setActiveTab("all");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                My Medical Records
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Lab reports and test results
              </p>
            </div>
            {(columnFilters.length > 0 || Object.keys(dateFilters).length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-green-600 border-green-200"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Filters and Tabs */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search by test or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          {/* Records Table – no Actions column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px] border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 sm:px-6 py-3 font-medium border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        Test Name
                        <ColumnFilterPopover
                          column="name"
                          placeholder="Filter by test..."
                          onFilter={handleColumnFilter}
                          currentValue={columnFilters.find((f) => f.column === "name")?.value}
                        />
                        <SortIcon columnKey="name" />
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 font-medium border-r border-gray-200 dark:border-gray-700">
                      Order ID
                      <ColumnFilterPopover
                        column="orderId"
                        placeholder="Filter by order..."
                        onFilter={handleColumnFilter}
                        currentValue={columnFilters.find((f) => f.column === "orderId")?.value}
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 font-medium border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        Date
                        <DateRangeFilterPopover
                          column="date"
                          onFilter={handleDateRangeFilter}
                          currentRange={dateFilters.date}
                        />
                        <SortIcon columnKey="date" />
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 font-medium border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        Status
                        <ColumnFilterPopover
                          column="status"
                          options={["Ordered", "Collected", "Completed"]}
                          onFilter={handleColumnFilter}
                          currentValue={columnFilters.find((f) => f.column === "status")?.value}
                        />
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <FlaskConical className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{record.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {record.orderId}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 sm:px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <Badge className={statusColorMap[record.status] || "bg-gray-100 text-gray-800"}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                        {record.result || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Showing {filteredRecords.length} of {records.length} records
              </p>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button variant="outline" size="sm" disabled className="w-20 sm:w-auto">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled className="w-20 sm:w-auto">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}