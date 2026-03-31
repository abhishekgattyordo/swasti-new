'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { patientsApi } from '@/lib/api/registration';

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

    const sampleRows = [
      [
        'Rajesh Kumar', 'राजेश कुमार', '1990-01-01', 'Male',
        '123 Main St', 'Mumbai', 'Maharashtra', 'India', '400001',
        '9876543210', 'rajesh.kumar@example.com', 'O+',
        'Pollen, Dust', 'Diabetes Type 2', 'Metformin 500mg daily',
        'LIC', 'POL12345', '2025-12-31', 'GRP001'
      ],
    ];

    // Combine headers and all sample rows
    const wsData = [headers, ...sampleRows];
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
        if (!row || row.length === 0 || !row[0]) continue; // skip empty rows

        // Helper to safely get cell value as string
        const getString = (index: number) => row[index]?.toString().trim() || '';

        const patient = {
          fullNameEn: getString(0),
          fullNameHi: getString(1) || undefined,
          dob: row[2] ? new Date(row[2]).toISOString().split('T')[0] : '',
          gender: getString(3).toLowerCase(),
          address: getString(4),
          city: getString(5),
          state: getString(6),
          country: getString(7) || 'India',
          pincode: getString(8),
          phone: getString(9),
          email: getString(10),
          blood_group: getString(11) || undefined,
          allergies: row[12] ? String(row[12]).split(',').map(s => s.trim()).filter(Boolean) : [],
          chronicConditions: row[13] ? String(row[13]).split(',').map(s => s.trim()).filter(Boolean) : [],
          medications: getString(14) || undefined,
          insuranceProvider: getString(15) || undefined,
          policyNumber: getString(16) || undefined,
          validUntil: row[17] ? new Date(row[17]).toISOString().split('T')[0] : undefined,
          groupId: getString(18) || undefined,
        };

        // Validate required fields
        if (!patient.fullNameEn || !patient.dob || !patient.gender || !patient.address ||
            !patient.city || !patient.state || !patient.pincode || !patient.phone || !patient.email) {
          throw new Error(`Row ${i+1} missing required fields (full name, DOB, gender, address, city, state, pincode, phone, email)`);
        }

        // Validate gender
        if (!['male', 'female', 'other'].includes(patient.gender)) {
          throw new Error(`Row ${i+1} has invalid gender: ${patient.gender}. Must be Male/Female/Other`);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patient.email)) {
          throw new Error(`Row ${i+1} has invalid email: ${patient.email}`);
        }

        // Validate date formats
        if (isNaN(new Date(patient.dob).getTime())) {
          throw new Error(`Row ${i+1} has invalid date of birth: ${patient.dob}`);
        }
        if (patient.validUntil && isNaN(new Date(patient.validUntil).getTime())) {
          throw new Error(`Row ${i+1} has invalid valid-until date: ${patient.validUntil}`);
        }

        // Validate pincode (simple length check)
        if (!/^\d{6}$/.test(patient.pincode)) {
          throw new Error(`Row ${i+1} has invalid pincode: ${patient.pincode} (should be 6 digits)`);
        }

        // Validate phone (basic: 10 digits)
        if (!/^\d{10}$/.test(patient.phone)) {
          throw new Error(`Row ${i+1} has invalid phone number: ${patient.phone} (should be 10 digits)`);
        }

        patients.push(patient);
      }

      if (patients.length === 0) throw new Error('No valid patient data found');

      const response = await patientsApi.bulkImport(patients);
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