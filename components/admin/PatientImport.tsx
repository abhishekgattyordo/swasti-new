'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { patientsApi } from '@/lib/api/registration'; // adjust import

interface PatientImportProps {
  onSuccess?: () => void;
}

export default function PatientImport({ onSuccess }: PatientImportProps) {
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      'Full Name (English)', 'Full Name (Hindi)', 'Date of Birth (YYYY-MM-DD)', 'Gender',
      'Address', 'City', 'State', 'Country', 'Pincode', 'Phone', 'Email', 'Blood Group',
      'Allergies (comma separated)', 'Chronic Conditions (comma separated)',
      'Current Medications', 'Insurance Provider', 'Policy Number', 'Valid Until (YYYY-MM-DD)', 'Group ID'
    ];
    const sampleRow = [
      'Rajesh Kumar', 'राजेश कुमार', '1990-01-01', 'Male',
      '123 Main St', 'Mumbai', 'Maharashtra', 'India', '400001',
      '9876543210', 'rajesh@gmail.com', 'O+',
      'Pollen, Dust', 'Diabetes Type 2', 'Metformin 500mg daily',
      'LIC', 'POL12345', '2025-12-31', 'GRP001'
    ];
    const wsData = [headers, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patients');
    XLSX.writeFile(wb, 'patient_template.xlsx');
  };

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

      if (rows.length < 2) throw new Error('Excel file has no data rows');

      const patients = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue; // skip empty rows

        const patient = {
          fullNameEn: row[0]?.toString().trim(),
          fullNameHi: row[1]?.toString().trim() || undefined,
          dob: row[2] ? new Date(row[2]).toISOString().split('T')[0] : '',
          gender: row[3]?.toString().trim().toLowerCase(),
          address: row[4]?.toString().trim(),
          city: row[5]?.toString().trim(),
          state: row[6]?.toString().trim(),
          country: row[7]?.toString().trim() || 'India',
          pincode: row[8]?.toString().trim(),
          phone: row[9]?.toString().trim(),
          email: row[10]?.toString().trim(),
          blood_group: row[11]?.toString().trim() || undefined,
          allergies: row[12] ? row[12].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          chronicConditions: row[13] ? row[13].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          medications: row[14]?.toString().trim() || undefined,
          insuranceProvider: row[15]?.toString().trim() || undefined,
          policyNumber: row[16]?.toString().trim() || undefined,
          validUntil: row[17] ? new Date(row[17]).toISOString().split('T')[0] : undefined,
          groupId: row[18]?.toString().trim() || undefined,
        };

        // Basic validation
        if (!patient.fullNameEn || !patient.dob || !patient.gender || !patient.address ||
            !patient.city || !patient.state || !patient.pincode || !patient.phone || !patient.email) {
          throw new Error(`Row ${i+1} missing required fields (name, DOB, gender, address, city, state, pincode, phone, email)`);
        }

        patients.push(patient);
      }

      if (patients.length === 0) throw new Error('No valid patient data found');

      const response = await patientsApi.bulkImport(patients); // we'll add this method
      if (!response.success) throw new Error(response.message || 'Import failed');
      toast.success(response.message);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
      const fileInput = document.getElementById('patient-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <>
      <Button variant="outline" onClick={downloadTemplate}>
        <Upload className="h-4 w-4 mr-2" /> Template
      </Button>
      <input
        type="file"
        id="patient-upload"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('patient-upload')?.click()}
        disabled={importing}
      >
        {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
        {importing ? 'Importing...' : 'Import Excel'}
      </Button>
    </>
  );
}