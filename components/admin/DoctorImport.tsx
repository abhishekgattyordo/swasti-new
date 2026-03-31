'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { doctorsApi } from '@/lib/api/doctors';

interface DoctorImportProps {
  onSuccess?: () => void;
}

export default function DoctorImport({ onSuccess }: DoctorImportProps) {
  const [importing, setImporting] = useState(false);

  // Download template Excel file
  const downloadTemplate = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Specialty', 'Department',
      'License Number', 'Date of Birth (YYYY-MM-DD)', 'Date Joined (YYYY-MM-DD)',
      'Address', 'City', 'State', 'Zip Code', 'Country',
      'Qualifications (comma separated)', 'Experience (years)', 'Bio', 'Status (active/on-leave)'
    ];

    const sampleRows = [
      [
        'John', 'Doe', 'john.doe@example.com', '+1234567890', 'Cardiology',
        'Cardiology Department', 'MED123456', '1980-05-15', '2023-01-10',
        '123 Main St', 'Springfield', 'IL', '62701', 'USA',
        'MD, FACC', '15', 'Experienced cardiologist with focus on interventional cardiology.', 'active'
      ],
    
    ];

    // Combine headers and all sample rows correctly
    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doctors');
    XLSX.writeFile(wb, 'doctor_template.xlsx');
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

      if (rows.length < 2) {
        throw new Error('Excel file has no data rows');
      }

      // Parse rows (skip header)
      const doctors = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0]) continue; // skip empty rows

        // Helper to safely get cell value as string
        const getString = (index: number) => row[index]?.toString().trim() || '';

        const doctor = {
          firstName: getString(0),
          lastName: getString(1),
          email: getString(2),
          phone: getString(3),
          specialty: getString(4),
          department: getString(5),
          licenseNumber: getString(6),
          dateOfBirth: row[7] ? new Date(row[7]).toISOString().split('T')[0] : undefined,
          dateJoined: row[8] ? new Date(row[8]).toISOString().split('T')[0] : undefined,
          address: getString(9) || undefined,
          city: getString(10) || undefined,
          state: getString(11) || undefined,
          zipCode: getString(12) || undefined,
          country: getString(13) || undefined,
          qualifications: row[14] ? String(row[14]).split(',').map(s => s.trim()).filter(Boolean) : [],
          experience: row[15] ? parseInt(String(row[15]), 10) : undefined,
          bio: getString(16) || undefined,
          status: getString(17).toLowerCase() === 'on-leave' ? 'on-leave' : 'active',
        };

        // Validate required fields
        if (!doctor.firstName || !doctor.lastName || !doctor.email || !doctor.phone ||
            !doctor.specialty || !doctor.department || !doctor.licenseNumber || !doctor.dateJoined) {
          throw new Error(`Row ${i + 1} missing required fields: first name, last name, email, phone, specialty, department, license number, date joined`);
        }

        // Validate email format (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(doctor.email)) {
          throw new Error(`Row ${i + 1} has invalid email: ${doctor.email}`);
        }

        // Validate date formats
        if (doctor.dateOfBirth && isNaN(new Date(doctor.dateOfBirth).getTime())) {
          throw new Error(`Row ${i + 1} has invalid date of birth: ${doctor.dateOfBirth}`);
        }
        if (doctor.dateJoined && isNaN(new Date(doctor.dateJoined).getTime())) {
          throw new Error(`Row ${i + 1} has invalid date joined: ${doctor.dateJoined}`);
        }

        doctors.push(doctor);
      }

      if (doctors.length === 0) {
        throw new Error('No valid doctor data found');
      }

      // Call the bulk import API
      const result = await doctorsApi.importDoctors(doctors);
      if (!result.success) {
        throw new Error(result.message || 'Import failed');
      }
      toast.success(result.message);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
      // Reset file input
      const fileInput = document.getElementById('doctor-upload') as HTMLInputElement;
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
        id="doctor-upload"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('doctor-upload')?.click()}
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