const db = require('../config/db');

const countTable = async (table) => {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM "${table}"`);
  return rows[0]?.total || 0;
};

exports.summary = async (req, res) => {
  try {
    const [patients, departments, doctors, appointments, admissions, medicalRecords, laboratoryTests, pharmacyItems, billingRecords, payments, employees, recentPatients] = await Promise.all([
      countTable('patients'),
      countTable('departments'),
      countTable('doctors'),
      countTable('appointments'),
      countTable('admissions'),
      countTable('medical_records'),
      countTable('laboratory_tests'),
      countTable('pharmacy_items'),
      countTable('billing_records'),
      countTable('payments'),
      countTable('employees'),
      db.query('SELECT * FROM patients ORDER BY created_at DESC LIMIT 5'),
    ]);

    const [todayAppointmentsRows] = await db.query(
      "SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = CURRENT_DATE AND status <> 'Cancelled'"
    );

    const [revenueRows] = await db.query(
      'SELECT COALESCE(SUM(consultation_charges + laboratory_charges + pharmacy_charges + admission_charges), 0) AS totalRevenue FROM billing_records'
    );

    const [pharmacyAlertRows] = await db.query(
      "SELECT COUNT(*) AS total FROM pharmacy_items WHERE stock_quantity <= 10 OR status IN ('Low Stock', 'Out of Stock', 'Expired') OR (expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '30 days')"
    );

    const [labRequestRows] = await db.query(
      "SELECT COUNT(*) AS total FROM laboratory_tests WHERE status <> 'Completed'"
    );


    res.json({
      totalPatients: patients,
      totalDepartments: departments,
      totalDoctors: doctors,
      totalAppointments: appointments,
      totalAdmissions: admissions,
      totalMedicalRecords: medicalRecords,
      totalLaboratoryTests: laboratoryTests,
      totalPharmacyItems: pharmacyItems,
      totalBillingRecords: billingRecords,
      totalPayments: payments,
      totalEmployees: employees,
      todayAppointments: todayAppointmentsRows[0]?.total || 0,
      revenue: Number(revenueRows[0]?.totalRevenue || 0),
      pharmacyAlerts: pharmacyAlertRows[0]?.total || 0,
      labRequests: labRequestRows[0]?.total || 0,
      recentPatients: recentPatients[0],
    });
  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};