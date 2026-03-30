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
    const sampleRow = [
      'John', 'Doe', 'john.doe@gmail.com', '+1234567890', 'Cardiology',
      'Cardiology Department', 'MED12345', '1980-05-15', '2023-01-10',
      '123 Main St', 'Springfield', 'IL', '62701', 'USA',
      'MD, FACC', '15', 'Experienced cardiologist.', 'active'
    ];
    const wsData = [headers, sampleRow];
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
        if (!row[0]) continue; // skip empty rows

        // Map columns according to template order
        const doctor = {
          firstName: row[0]?.toString().trim(),
          lastName: row[1]?.toString().trim(),
          email: row[2]?.toString().trim(),
          phone: row[3]?.toString().trim(),
          specialty: row[4]?.toString().trim(),
          department: row[5]?.toString().trim(),
          licenseNumber: row[6]?.toString().trim(),
          dateOfBirth: row[7] ? new Date(row[7]).toISOString().split('T')[0] : undefined,
          dateJoined: row[8] ? new Date(row[8]).toISOString().split('T')[0] : undefined,
          address: row[9]?.toString().trim() || undefined,
          city: row[10]?.toString().trim() || undefined,
          state: row[11]?.toString().trim() || undefined,
          zipCode: row[12]?.toString().trim() || undefined,
          country: row[13]?.toString().trim() || undefined,
          qualifications: row[14] ? row[14].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          experience: row[15] ? parseInt(row[15]) : undefined,
          bio: row[16]?.toString().trim() || undefined,
          status: row[17]?.toString().trim() === 'on-leave' ? 'on-leave' : 'active',
        };

        // Validate required fields
        if (!doctor.firstName || !doctor.lastName || !doctor.email || !doctor.phone ||
            !doctor.specialty || !doctor.department || !doctor.licenseNumber || !doctor.dateJoined) {
          throw new Error(`Row ${i+1} missing required fields: first name, last name, email, phone, specialty, department, license number, date joined`);
        }

        doctors.push(doctor);
      }

      if (doctors.length === 0) {
        throw new Error('No valid doctor data found');
      }

      // Use the API method
      const result = await doctorsApi.importDoctors(doctors);
      if (!result.success) {
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