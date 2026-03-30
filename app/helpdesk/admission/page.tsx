'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Patient {
  patient_id: string;
  full_name_en: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

interface Ward {
  id: number;
  name: string;
}

interface Room {
  id: number;
  room_number: string;
  name: string;
}

interface Bed {
  id: number;
  bed_number: string;
}

// Mock data
const MOCK_WARDS: Ward[] = [
  { id: 1, name: 'General Ward' },
  { id: 2, name: 'ICU' },
  { id: 3, name: 'Pediatric Ward' },
];

const MOCK_ROOMS: Record<number, Room[]> = {
  1: [
    { id: 101, room_number: '101', name: 'Room 101' },
    { id: 102, room_number: '102', name: 'Room 102' },
  ],
  2: [
    { id: 201, room_number: 'ICU-1', name: 'ICU 1' },
    { id: 202, room_number: 'ICU-2', name: 'ICU 2' },
  ],
  3: [
    { id: 301, room_number: 'P-1', name: 'Pediatric 1' },
    { id: 302, room_number: 'P-2', name: 'Pediatric 2' },
  ],
};

const MOCK_BEDS: Record<number, Bed[]> = {
  101: [
    { id: 1011, bed_number: '101-A' },
    { id: 1012, bed_number: '101-B' },
  ],
  102: [
    { id: 1021, bed_number: '102-A' },
    { id: 1022, bed_number: '102-B' },
  ],
  201: [
    { id: 2011, bed_number: 'ICU-1-A' },
    { id: 2012, bed_number: 'ICU-1-B' },
  ],
  202: [
    { id: 2021, bed_number: 'ICU-2-A' },
    { id: 2022, bed_number: 'ICU-2-B' },
  ],
  301: [
    { id: 3011, bed_number: 'P-1-A' },
    { id: 3012, bed_number: 'P-1-B' },
  ],
  302: [
    { id: 3021, bed_number: 'P-2-A' },
    { id: 3022, bed_number: 'P-2-B' },
  ],
};

const MOCK_PATIENTS: Patient[] = [
  {
    patient_id: 'P1001',
    full_name_en: 'John Doe',
    dob: '1985-05-15',
    gender: 'male',
    phone: '9876543210',
    email: 'john@example.com',
    address: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    patient_id: 'P1002',
    full_name_en: 'Jane Smith',
    dob: '1990-08-22',
    gender: 'female',
    phone: '9876543211',
    email: 'jane@example.com',
    address: '456 Oak Ave',
    city: 'Delhi',
    state: 'Delhi',
  },
];

export default function AdmissionForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Patient fields (for new patient)
    fullNameEn: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    // Admission fields
    admissionDate: new Date().toISOString().split('T')[0],
    wardId: '',
    roomId: '',
    bedId: '',
    reason: '',
    diagnosis: '',
  });

  // Dropdown options
  const [wards, setWards] = useState<Ward[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load mock wards on mount
  useEffect(() => {
    setLoadingWards(true);
    setTimeout(() => {
      setWards(MOCK_WARDS);
      setLoadingWards(false);
    }, 300);
  }, []);

  // Load rooms when ward changes
  useEffect(() => {
    if (formData.wardId) {
      const wardIdNum = parseInt(formData.wardId);
      setRooms(MOCK_ROOMS[wardIdNum] || []);
    } else {
      setRooms([]);
    }
  }, [formData.wardId]);

  // Load beds when room changes
  useEffect(() => {
    if (formData.roomId) {
      const roomIdNum = parseInt(formData.roomId);
      setBeds(MOCK_BEDS[roomIdNum] || []);
    } else {
      setBeds([]);
    }
  }, [formData.roomId]);

  const searchPatient = async () => {
    if (!phoneSearch.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    setLoadingPatient(true);
    setTimeout(() => {
      const found = MOCK_PATIENTS.find(p => p.phone === phoneSearch);
      if (found) {
        setPatientData(found);
        setFormData(prev => ({
          ...prev,
          fullNameEn: found.full_name_en,
          dob: found.dob,
          gender: found.gender,
          phone: found.phone,
          email: found.email,
          address: found.address,
          city: found.city,
          state: found.state,
        }));
        toast.success('Patient found');
      } else {
        toast.error('Patient not found');
        setPatientData(null);
      }
      setLoadingPatient(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const payload = {
        mode,
        ...(mode === 'existing'
          ? { patientId: patientData?.patient_id }
          : {
              fullNameEn: formData.fullNameEn,
              dob: formData.dob,
              gender: formData.gender,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              state: formData.state,
            }),
        admission: {
          admissionDate: formData.admissionDate,
          wardId: formData.wardId ? parseInt(formData.wardId) : null,
          roomId: formData.roomId ? parseInt(formData.roomId) : null,
          bedId: formData.bedId ? parseInt(formData.bedId) : null,
          reason: formData.reason,
          diagnosis: formData.diagnosis,
        },
      };
      console.log('Admission payload (mock):', payload);
      toast.success('Patient admitted successfully (mock)');
      setSubmitting(false);
      // Optionally redirect
      // router.push('/admissions');
    }, 800);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Admit Patient</h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'existing' | 'new')}>
        <TabsList className="mb-6">
          <TabsTrigger value="existing">Existing Patient</TabsTrigger>
          <TabsTrigger value="new">New Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter phone number"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={searchPatient} disabled={loadingPatient}>
              {loadingPatient ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {patientData && (
            <div className="border p-4 rounded-lg mb-6 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold mb-2">Patient Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="font-medium">Name:</span> {patientData.full_name_en}</p>
                <p><span className="font-medium">DOB:</span> {patientData.dob}</p>
                <p><span className="font-medium">Gender:</span> {patientData.gender}</p>
                <p><span className="font-medium">Phone:</span> {patientData.phone}</p>
                <p><span className="font-medium">Email:</span> {patientData.email}</p>
                <p className="col-span-2"><span className="font-medium">Address:</span> {patientData.address}, {patientData.city}, {patientData.state}</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.fullNameEn}
                onChange={(e) => setFormData({...formData, fullNameEn: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Gender *</Label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admission Details (common for both) */}
      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Admission Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Admission Date *</Label>
            <Input
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Ward</Label>
            <select
              value={formData.wardId}
              onChange={(e) => setFormData({...formData, wardId: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>{ward.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Room</Label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({...formData, roomId: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={!formData.wardId}
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.room_number} {room.name ? `- ${room.name}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Bed</Label>
            <select
              value={formData.bedId}
              onChange={(e) => setFormData({...formData, bedId: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={!formData.roomId}
            >
              <option value="">Select Bed</option>
              {beds.map((bed) => (
                <option key={bed.id} value={bed.id}>{bed.bed_number}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Reason for Admission</Label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Diagnosis (if known)</Label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              rows={2}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Admitting...' : 'Admit Patient'}
        </Button>
      </div>
    </div>
  );
}