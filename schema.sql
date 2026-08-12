-- PostgreSQL / Neon-compatible schema

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS pharmacy_items;
DROP TABLE IF EXISTS laboratory_tests;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  medical_history TEXT DEFAULT NULL,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  schedule VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  doctor_name VARCHAR(120) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Booked',
  notes TEXT DEFAULT NULL,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admissions (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  ward VARCHAR(100) DEFAULT NULL,
  admission_type VARCHAR(50) DEFAULT NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Admitted',
  notes TEXT DEFAULT NULL,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_records (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  diagnosis VARCHAR(255) DEFAULT NULL,
  prescriptions TEXT DEFAULT NULL,
  treatment_history TEXT DEFAULT NULL,
  medical_reports TEXT DEFAULT NULL,
  record_date DATE NOT NULL,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE laboratory_tests (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  test_name VARCHAR(120) NOT NULL,
  sample_collection_status VARCHAR(50) DEFAULT 'Pending',
  result_entry TEXT DEFAULT NULL,
  report_generation TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Requested',
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pharmacy_items (
  id SERIAL PRIMARY KEY,
  medicine_name VARCHAR(150) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  expiry_date DATE DEFAULT NULL,
  prescription_processing TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Available',
  unit_price NUMERIC(10,2) DEFAULT 0.00,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE billing_records (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(120) NOT NULL,
  consultation_charges NUMERIC(10,2) DEFAULT 0.00,
  laboratory_charges NUMERIC(10,2) DEFAULT 0.00,
  pharmacy_charges NUMERIC(10,2) DEFAULT 0.00,
  admission_charges NUMERIC(10,2) DEFAULT 0.00,
  invoice_number VARCHAR(80) NOT NULL,
  status VARCHAR(50) DEFAULT 'Unpaid',
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(80) NOT NULL,
  patient_name VARCHAR(120) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Recorded',
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(80) NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  attendance VARCHAR(50) DEFAULT 'Present',
  leave_records TEXT DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  recorded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) DEFAULT NULL,
  entity_id INT DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, name) VALUES
(1, 'Admin'),
(2, 'Receptionist'),
(3, 'Doctor'),
(4, 'Nurse'),
(5, 'Laboratory Staff'),
(6, 'Pharmacist'),
(7, 'Accountant');

INSERT INTO users (id, username, password, role_id, full_name) VALUES
(1, 'admin', '$2a$10$w10leB6/XVMHBNIc0RDWK.Vf63uRr0kgtH7OkG88SGpwrP6seVnwm', 1, 'System Administrator');

INSERT INTO departments (id, name, description, recorded_by) VALUES
(1, 'General Medicine', 'Primary care and routine consultations', 1),
(2, 'Laboratory', 'Diagnostic and testing services', 1),
(3, 'Pharmacy', 'Medicine dispensing and stock control', 1),
(4, 'Billing', 'Invoices, payments, and revenue tracking', 1);
