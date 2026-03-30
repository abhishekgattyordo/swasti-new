'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface MedicineImportProps {
  onSuccess?: () => void;
}

export default function MedicineImport({ onSuccess }: MedicineImportProps) {
  const [importing, setImporting] = useState(false);

  // Download template Excel file
  const downloadTemplate = () => {
    const headers = [
      'Name', 'Generic Name', 'Brand Name', 'Category', 'Unit',
      'Purchase Price', 'Selling Price', 'MRP', 'Tax %'
    ];
    const sampleRow = [
      'Paracetamol', 'Acetaminophen', 'Tylenol', 'Pain Relief', 'Tablet',
      50, 80, 100, 18
    ];
    const wsData = [headers, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');
    XLSX.writeFile(wb, 'medicine_template.xlsx');
  };

  // Handle file upload and import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        throw new Error('Excel file has no data rows');
      }

      // Parse rows (skip header)
      const medicines = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue; // skip empty rows

        const medicine = {
          name: row[0]?.toString().trim(),
          genericName: row[1]?.toString().trim() || undefined,
          brandName: row[2]?.toString().trim() || undefined,
          category: row[3]?.toString().trim(),
          unit: row[4]?.toString().trim(),
          purchasePrice: parseFloat(row[5]),
          sellingPrice: parseFloat(row[6]),
          mrp: row[7] ? parseFloat(row[7]) : undefined,
          taxPercent: row[8] ? parseFloat(row[8]) : 0,
        };

        if (!medicine.name || !medicine.category || !medicine.unit ||
            isNaN(medicine.purchasePrice) || isNaN(medicine.sellingPrice)) {
          throw new Error(`Row ${i+1} missing required fields: name, category, unit, purchase price, selling price`);
        }
        medicines.push(medicine);
      }

      if (medicines.length === 0) {
        throw new Error('No valid medicine data found');
      }

      const response = await fetch('/api/pharmacy/medicines/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Import failed');
      }
      toast.success(result.message);
      if (onSuccess) onSuccess(); // refresh the parent list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
      // Reset file input
      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <>
      <Button variant="outline" onClick={downloadTemplate}>
        <Upload className="h-4 w-4 mr-2" />
        Template
      </Button>
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('excel-upload')?.click()}
        disabled={importing}
      >
        {importing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {importing ? 'Importing...' : 'Import Excel'}
      </Button>
    </>
  );
}