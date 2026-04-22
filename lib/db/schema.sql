-- =====================================================
-- 1. Enable required extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. Single function for updated_at triggers
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 3. Create tables (order matters due to foreign keys)
-- =====================================================

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    date_joined DATE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    qualifications JSONB DEFAULT '[]'::jsonb,
    experience INTEGER,
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'inactive')),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_license ON doctors(license_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_department ON doctors(department);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON doctors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default specialties
INSERT INTO specialties (name, department) VALUES
('Cardiology', 'Cardiology Department'),
('Neurology', 'Neurology Department'),
('Pediatrics', 'Pediatrics Department'),
('Oncology', 'Oncology Center'),
('Orthopedics', 'Orthopedics Center'),
('Dermatology', 'Diagnostics'),
('Psychiatry', 'Psychiatry Department'),
('Radiology', 'Diagnostics'),
('Surgery', 'Surgery Department'),
('Internal Medicine', 'Internal Medicine Department'),
('Emergency Medicine', 'Emergency Department'),
('Anesthesiology', 'Surgery Department'),
('Pathology', 'Diagnostics'),
('Ophthalmology', 'Ophthalmology Department')
ON CONFLICT (name) DO NOTHING;

-- Insert default departments
INSERT INTO departments (name) VALUES
('Cardiology Department'),
('Neurology Department'),
('Pediatrics Department'),
('Surgery Department'),
('Emergency Department'),
('Intensive Care Unit'),
('Diagnostics'),
('Oncology Center'),
('Orthopedics Center'),
('Psychiatry Department'),
('Ophthalmology Department'),
('Internal Medicine Department')
ON CONFLICT (name) DO NOTHING;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id BIGINT PRIMARY KEY,
    full_name_en VARCHAR(100) NOT NULL,
    full_name_hi VARCHAR(100),
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(6) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
    registration_step INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by_doctor_id INTEGER REFERENCES doctors(id)
);

CREATE INDEX IF NOT EXISTS idx_patients_pincode ON patients(pincode);
CREATE INDEX IF NOT EXISTS idx_patients_state ON patients(state);
CREATE INDEX IF NOT EXISTS idx_patients_city ON patients(city);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    allergy VARCHAR(100) NOT NULL,
    chronic_condition VARCHAR(100) NOT NULL,
    medications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON medical_history(patient_id);

-- Insurance Details table
CREATE TABLE IF NOT EXISTS insurance_details (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    insurance_provider VARCHAR(100),
    policy_number VARCHAR(50),
    valid_until DATE,
    group_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_insurance_details_patient_id ON insurance_details(patient_id);

CREATE TRIGGER update_insurance_details_updated_at 
    BEFORE UPDATE ON insurance_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_registrations_patient_id ON registrations(patient_id);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.patient_id = CAST(EXTRACT(EPOCH FROM NOW()) * 1000 AS BIGINT) * 10000 + FLOOR(RANDOM() * 10000)::INT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_patient_id_trigger
    BEFORE INSERT ON patients
    FOR EACH ROW
    WHEN (NEW.patient_id IS NULL)
    EXECUTE FUNCTION generate_patient_id();

-- Function to generate registration ID
CREATE OR REPLACE FUNCTION generate_registration_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.registration_id = 'REG-' || UPPER(SUBSTRING(MD5(EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_registration_id_trigger
    BEFORE INSERT ON registrations
    FOR EACH ROW
    WHEN (NEW.registration_id IS NULL)
    EXECUTE FUNCTION generate_registration_id();

-- View registration_details
CREATE OR REPLACE VIEW registration_details AS
SELECT 
    p.patient_id,
    p.full_name_en,
    p.full_name_hi,
    p.dob,
    p.gender,
    p.address,
    p.city,
    p.state,
    p.country,
    p.pincode,
    p.phone,
    p.email,
    p.blood_group,
    p.registration_step,
    p.created_at,
    p.updated_at,
    i.insurance_provider,
    i.policy_number,
    i.valid_until,
    i.group_id,
    r.registration_id,
    r.status as registration_status,
    r.completed_at
FROM patients p
LEFT JOIN insurance_details i ON p.patient_id = i.patient_id
LEFT JOIN registrations r ON p.patient_id = r.patient_id;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'pharmacy', 'helpdesk', 'billing')),
    patient_id VARCHAR(50) UNIQUE,
    auth_user_id UUID UNIQUE,
    doctor_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_patient_id ON users(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Emergency Contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id),
    name VARCHAR(255),
    relation VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Bed configuration tables
-- =====================================================

CREATE TABLE IF NOT EXISTS floors (
    id SERIAL PRIMARY KEY,
    floor_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('General', 'Semi-Special', 'Special', 'VIP', 'ICU', 'Pediatric')),
    patient_category VARCHAR(50) NOT NULL CHECK (patient_category IN ('Male', 'Female', 'Children', 'Mixed')),
    description TEXT,
    daily_rate NUMERIC(10,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, room_number)
);

CREATE TABLE IF NOT EXISTS beds (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    bed_number VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    floor_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance', 'reserved')),
    patient_category VARCHAR(50) NOT NULL,
    attributes JSONB,
    occupied_by BIGINT REFERENCES patients(patient_id),
    occupied_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, bed_number)
);

CREATE INDEX idx_wards_floor_id ON wards(floor_id);
CREATE INDEX idx_rooms_ward_id ON rooms(ward_id);
CREATE INDEX idx_beds_ward_id ON beds(ward_id);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(status);

CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON floors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON wards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Pharmacy tables (including sales)
-- =====================================================

CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2),
    tax_percent NUMERIC(5,2) DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_medicines_updated_at 
    BEFORE UPDATE ON medicines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    gst_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    gst_no VARCHAR(50),
    payment_mode VARCHAR(50),
    subtotal NUMERIC(10,2) NOT NULL,
    tax_total NUMERIC(10,2) NOT NULL,
    grand_total NUMERIC(10,2) NOT NULL,
    is_delivered BOOLEAN DEFAULT false,
    stock_updated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_purchases_updated_at 
    BEFORE UPDATE ON purchases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id),
    batch_no VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    tax_percent NUMERIC(5,2) DEFAULT 0 NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER REFERENCES medicines(id),
    batch_no VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    delivered_manual INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(medicine_id, batch_no)
);

CREATE TRIGGER update_stock_updated_at 
    BEFORE UPDATE ON stock 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sales tables (MUST be before ip_bills)
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(patient_id),
    walkin_name VARCHAR(255),
    doctor_name VARCHAR(255),
    walkin_phone VARCHAR(50),
    walkin_address TEXT,
    sale_date DATE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    tax_total NUMERIC(10,2) NOT NULL,
    discount_total NUMERIC(10,2) DEFAULT 0,
    grand_total NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(50),
    prescription_id INTEGER,
    stock_updated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id),
    batch_no VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    tax_percent NUMERIC(5,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Admissions and Billing tables (AFTER sales)
-- =====================================================

CREATE TABLE IF NOT EXISTS admissions (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id),
    admission_date DATE NOT NULL,
    discharge_date DATE,
    ward_id INTEGER REFERENCES wards(id),
    room_id INTEGER REFERENCES rooms(id),
    bed_id INTEGER REFERENCES beds(id),
    reason TEXT,
    diagnosis TEXT,
    status VARCHAR(20) DEFAULT 'active',
    discharge_id VARCHAR(50) UNIQUE,
    primary_consultant VARCHAR(255),
    consultant_dept VARCHAR(255),
    wing VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ip_bills (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    patient_id VARCHAR(50),
    admission_id INTEGER UNIQUE REFERENCES admissions(id),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    paid_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ip_bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES ip_bills(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    sale_item_id INTEGER REFERENCES sale_items(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ip_payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES ip_bills(id),
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(20),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT NOW()
);

-- Trigger to update bill total
CREATE OR REPLACE FUNCTION update_bill_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ip_bills
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM ip_bill_items
    WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bill_items_changed AFTER INSERT OR DELETE OR UPDATE ON ip_bill_items
FOR EACH ROW EXECUTE FUNCTION update_bill_total();

-- Ward Transfers table
CREATE TABLE IF NOT EXISTS ward_transfers (
    id SERIAL PRIMARY KEY,
    admission_id INTEGER NOT NULL REFERENCES admissions(id),
    ward_id INTEGER NOT NULL REFERENCES wards(id),
    from_date DATE NOT NULL,
    to_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pharmacy Prescriptions table
CREATE TABLE IF NOT EXISTS pharmacy_prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(patient_id),
    doctor_id INTEGER REFERENCES doctors(id),
    consultation_id VARCHAR(50) UNIQUE NOT NULL,
    prescription_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_pharmacy_prescriptions_updated_at 
    BEFORE UPDATE ON pharmacy_prescriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES pharmacy_prescriptions(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id),
    prescribed_qty INTEGER NOT NULL,
    dispensed_qty INTEGER DEFAULT 0,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_patient_id ON pharmacy_prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON pharmacy_prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON pharmacy_prescriptions(status);
CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine_id ON prescription_items(medicine_id);

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    batch_no VARCHAR(100) NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_adjustments_medicine_id ON stock_adjustments(medicine_id);
CREATE INDEX idx_stock_adjustments_batch_no ON stock_adjustments(batch_no);

-- =====================================================
-- Doctor Availability and Appointments
-- =====================================================

CREATE TABLE IF NOT EXISTS doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id BIGINT REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    consultation_type VARCHAR(20) CHECK (consultation_type IN ('in-person', 'teleconsultation')),
    consultation_fee NUMERIC(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    invoice_number VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Visit details (clinical notes)
CREATE TABLE IF NOT EXISTS visit_details (
    id SERIAL PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis TEXT,
    icd10_code VARCHAR(20),
    clinical_notes TEXT,
    follow_up_date DATE,
    patient_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_visit_details_updated_at
    BEFORE UPDATE ON visit_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vitals
CREATE TABLE IF NOT EXISTS vitals (
    id SERIAL PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    bp VARCHAR(20),
    hr INTEGER,
    temp NUMERIC(4,2),
    weight NUMERIC(5,2),
    rr INTEGER,
    spo2 INTEGER,
    recorded_by VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Doctor's prescriptions (per appointment) - renamed to avoid conflict
CREATE TABLE IF NOT EXISTS doctor_prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    recorded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lab tables
CREATE TABLE IF NOT EXISTS lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name TEXT NOT NULL,
    test_code TEXT NOT NULL,
    category TEXT,
    price NUMERIC,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT,
    patient_id TEXT,
    patient_name TEXT,
    visit_type TEXT,
    visit_id TEXT,
    admission_id TEXT,
    admission_date DATE,
    ward_id INTEGER,
    bed_id INTEGER,
    tests JSONB,
    total_amount NUMERIC,
    status TEXT DEFAULT 'Ordered',
    order_date DATE,
    collected_date DATE,
    completed_date DATE,
    billing_entry_id TEXT,
    results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table (JWT rotation/revocation)
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_user_id ON auth_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_expires_at ON auth_refresh_tokens(expires_at);

-- =====================================================
-- Insert test users (passwords: text123, doctor456, help123)
-- =====================================================

INSERT INTO users (email, password, full_name_en, role, patient_id) VALUES
('admin@gmail.com', crypt('text123', gen_salt('bf')), 'Admin User', 'admin', NULL),
('patient@gmail.com', crypt('text123', gen_salt('bf')), 'John Doe', 'patient', '17719220477275068'),
('doctor@example.com', crypt('doctor456', gen_salt('bf')), 'Dr. Sarah Smith', 'doctor', NULL),
('pharmacy@gmail.com', crypt('text123', gen_salt('bf')), 'MedPlus Pharmacy', 'pharmacy', NULL),
('helpdesk@hospital.com', crypt('help123', gen_salt('bf')), 'Help Desk Support', 'helpdesk', NULL),
('billing@hospital.com', crypt('text123', gen_salt('bf')), 'Billing User', 'billing', NULL)
ON CONFLICT (email) DO NOTHING;
