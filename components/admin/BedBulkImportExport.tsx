"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface BedBulkImportExportProps {
  wardId?: number;
  onImportSuccess: () => void;
}

export function BedBulkImportExport({ wardId, onImportSuccess }: BedBulkImportExportProps) {
  const [importing, setImporting] = useState(false);





  

  const downloadTemplate = () => {
    const headers = [
      "Floor Number",
      "Ward Name",
      "Daily Rate (₹)",
      "Bed Number",
      "Type",
      "Patient Category",
      "Room Number",
      "Status",
    ];
    const sampleRows = [
      [11, "General Ward", 500, "A-101", "General", "Mixed", "101", "available"],
      [12, "General Ward", 500, "A-102", "General", "Mixed", "102", "available"],
      [13, "ICU", 2000, "ICU-01", "ICU", "Mixed", "", "available"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beds Template");
    XLSX.writeFile(wb, "bed_import_template.xlsx");
  };

  // ---------- Full configuration Import (does NOT require ward) ----------
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (jsonRows.length === 0) throw new Error("No data rows found");

      // Group rows by floor_number and ward_name
      const floorsMap = new Map();

      for (const row of jsonRows) {
        const floorNumber = row["Floor Number"];
        const wardName = row["Ward Name"]?.trim();
        const dailyRate = row["Daily Rate (₹)"];
        const bedNumber = row["Bed Number"]?.trim();
        const bedType = row["Type"]?.trim();
        const patientCategory = row["Patient Category"]?.trim();
        const roomNumber = row["Room Number"]?.trim() || undefined;
        const status = row["Status"]?.trim().toLowerCase() || "available";

        if (!floorNumber || !wardName || !bedNumber || !bedType || !patientCategory) {
          throw new Error(`Missing required data in row: ${JSON.stringify(row)}`);
        }

        if (!floorsMap.has(floorNumber)) {
          floorsMap.set(floorNumber, {
            floor_number: floorNumber,
            name: `Floor ${floorNumber}`, // optional, you could add a column for floor name
            wards: new Map(),
          });
        }
        const floor = floorsMap.get(floorNumber);
        if (!floor.wards.has(wardName)) {
          floor.wards.set(wardName, {
            name: wardName,
            type: bedType, // assuming the first bed defines the ward type (adjust if needed)
            patient_category: patientCategory,
            daily_rate: dailyRate,
            beds: [],
          });
        }
        const ward = floor.wards.get(wardName);
        ward.beds.push({
          bed_number: bedNumber,
          room_number: roomNumber,
          status: status,
          patient_category: patientCategory,
        });
      }

      // Convert to the expected full payload format
      const payload = {
        type: "full",
        data: Array.from(floorsMap.values()).map((floor: any) => ({
          floor_number: floor.floor_number,
          name: floor.name,
          wards: Array.from(floor.wards.values()).map((ward: any) => ({
            name: ward.name,
            type: ward.type,
            patient_category: ward.patient_category,
            daily_rate: ward.daily_rate,
            beds: ward.beds.map((bed: any) => ({
              bed_number: bed.bed_number,
              room_number: bed.room_number,
              status: bed.status,
              patient_category: bed.patient_category,
            })),
          })),
        })),
      };

      const res = await fetch("/api/bed-config/import-full/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      onImportSuccess(); // refresh all data (floors, wards, beds)
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
      const fileInput = document.getElementById("bulk-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={downloadTemplate}>
        <Download className="h-4 w-4 mr-2" /> Excel Template
      </Button>
      {/* <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        title={!wardId ? "Select a ward first" : ""}
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        Export Excel
      </Button> */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("bulk-upload")?.click()}
        disabled={importing}
      >
        {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        Import Excel
      </Button>
      <input
        id="bulk-upload"
        type="file"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        onChange={handleImport}
      />
    </div>
  );
}