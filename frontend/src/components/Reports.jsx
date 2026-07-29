import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { AlertCircle, BarChart3, CalendarDays, DollarSign, FlaskConical, Pill, Users } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/reports/summary');
        setSummary(response.data);
      } catch (requestError) {
        console.error('Failed to load reports summary:', requestError);
        setError('Unable to load reports summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const reportCards = summary
    ? [
        { label: 'Patients', value: summary.totalPatients, icon: Users },
        { label: 'Today Appointments', value: summary.todayAppointments, icon: CalendarDays },
        { label: 'Revenue', value: `$${Number(summary.revenue || 0).toLocaleString()}`, icon: DollarSign },
        { label: 'Lab Requests', value: summary.labRequests, icon: FlaskConical },
        { label: 'Pharmacy Alerts', value: summary.pharmacyAlerts, icon: Pill },
        { label: 'Departments', value: summary.totalDepartments, icon: BarChart3 },
      ]
    : [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Reports and Analytics
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Snapshot of operational activity across the hospital system.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-info">
                  <h3>Loading</h3>
                  <p>...</p>
                </div>
              </div>
            ))
          : reportCards.map((card) => {
              const Icon = card.icon;
              return (
                <div className="stat-card" key={card.label}>
                  <div className="stat-info">
                    <h3>{card.label}</h3>
                    <p>{card.value}</p>
                  </div>
                  <div className="stat-icon-wrapper cyan">
                    <Icon size={28} />
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && summary && (
        <div className="table-panel">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem' }}>
            Module Totals
          </h3>
          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Patients', summary.totalPatients],
                  ['Doctors', summary.totalDoctors],
                  ['Appointments', summary.totalAppointments],
                  ['Admissions', summary.totalAdmissions],
                  ['Medical Records', summary.totalMedicalRecords],
                  ['Laboratory Tests', summary.totalLaboratoryTests],
                  ['Pharmacy Items', summary.totalPharmacyItems],
                  ['Billing Records', summary.totalBillingRecords],
                  ['Payments', summary.totalPayments],
                  ['Employees', summary.totalEmployees],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td style={{ fontWeight: 700 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;