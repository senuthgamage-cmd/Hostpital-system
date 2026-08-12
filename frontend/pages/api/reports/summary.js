import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';

const countTable = async (table) => {
  const rows = await query(`SELECT COUNT(*) AS total FROM "${table}"`);
  return Number(rows[0]?.total || 0);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = verifyAuth(req, res);
  if (!user) return; // verifyAuth already handled the 401 response

  try {
    const [
      patientsCount,
      departmentsCount,
      doctorsCount,
      appointmentsCount,
      admissionsCount,
      medicalRecordsCount,
      laboratoryTestsCount,
      pharmacyItemsCount,
      billingRecordsCount,
      paymentsCount,
      employeesCount,
      recentPatients
    ] = await Promise.all([
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
      query('SELECT * FROM patients ORDER BY created_at DESC LIMIT 5'),
    ]);

    const todayAppointmentsRows = await query(
      "SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = CURRENT_DATE AND status <> 'Cancelled'"
    );

    const revenueRows = await query(
      'SELECT COALESCE(SUM(consultation_charges + laboratory_charges + pharmacy_charges + admission_charges), 0) AS total_revenue FROM billing_records'
    );

    const pharmacyAlertRows = await query(
      "SELECT COUNT(*) AS total FROM pharmacy_items WHERE stock_quantity <= 10 OR status IN ('Low Stock', 'Out of Stock', 'Expired') OR (expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '30 days')"
    );

    const labRequestRows = await query(
      "SELECT COUNT(*) AS total FROM laboratory_tests WHERE status <> 'Completed'"
    );

    return res.status(200).json({
      totalPatients: patientsCount,
      totalDepartments: departmentsCount,
      totalDoctors: doctorsCount,
      totalAppointments: appointmentsCount,
      totalAdmissions: admissionsCount,
      totalMedicalRecords: medicalRecordsCount,
      totalLaboratoryTests: laboratoryTestsCount,
      totalPharmacyItems: pharmacyItemsCount,
      totalBillingRecords: billingRecordsCount,
      totalPayments: paymentsCount,
      totalEmployees: employeesCount,
      todayAppointments: Number(todayAppointmentsRows[0]?.total || 0),
      revenue: Number(revenueRows[0]?.total_revenue || 0),
      pharmacyAlerts: Number(pharmacyAlertRows[0]?.total || 0),
      labRequests: Number(labRequestRows[0]?.total || 0),
      recentPatients: recentPatients,
    });
  } catch (error) {
    console.error('Summary report error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
