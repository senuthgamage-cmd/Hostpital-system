import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Users, Calendar, ShieldAlert, PlusCircle, Search, DollarSign, FlaskConical, Pill } from 'lucide-react';
import Link from 'next/link';

const DashboardOverview = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/summary');
        setSummary(response.data);
        setPatientCount(response.data.totalPatients || 0);
        setRecentPatients(response.data.recentPatients || []);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Patients</h3>
            <p>{loading ? '...' : patientCount}</p>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Users size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Today's Appts</h3>
            <p>{loading ? '...' : summary.todayAppointments || 0}</p>
          </div>
          <div className="stat-icon-wrapper indigo">
            <Calendar size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pharmacy Alerts</h3>
            <p>{loading ? '...' : summary.pharmacyAlerts || 0}</p>
          </div>
          <div className="stat-icon-wrapper green">
            <ShieldAlert size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Revenue</h3>
            <p>{loading ? '...' : `$${Number(summary.revenue || 0).toLocaleString()}`}</p>
          </div>
          <div className="stat-icon-wrapper cyan">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Lab Requests</h3>
            <p>{loading ? '...' : summary.labRequests || 0}</p>
          </div>
          <div className="stat-icon-wrapper indigo">
            <FlaskConical size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Medicines</h3>
            <p>{loading ? '...' : summary.totalPharmacyItems || 0}</p>
          </div>
          <div className="stat-icon-wrapper green">
            <Pill size={28} />
          </div>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Recent Patients Table */}
        <div className="table-panel" style={{ height: 'fit-content' }}>
          <div className="table-header-actions">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}>
              Recently Registered Patients
            </h3>
            <Link href="/dashboard/patients" className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              View All
            </Link>
          </div>

          <div className="custom-table-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading recent patients...</div>
            ) : recentPatients.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No patients registered in the system yet.</p>
                <Link href="/dashboard/register" className="btn" style={{ width: 'auto', marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <PlusCircle size={16} />
                  <span>Register First Patient</span>
                </Link>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Date Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td style={{ fontWeight: 600 }}>{patient.first_name} {patient.last_name}</td>
                      <td>
                        <span className="badge badge-gender">{patient.gender}</span>
                      </td>
                      <td>{patient.phone || patient.email || 'N/A'}</td>
                      <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="table-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Quick Actions
          </h3>
          
          <Link href="/dashboard/register" className="btn" style={{ justifyContent: 'flex-start' }}>
            <PlusCircle size={20} />
            <span>Register New Patient</span>
          </Link>

          <Link href="/dashboard/patients" className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: '#fff' }}>
            <Search size={20} />
            <span>Search Patient Directory</span>
          </Link>

          <div style={{ 
            marginTop: '1rem', 
            padding: '1.25rem', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)'
          }}>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>System Tip</h4>
            Make sure to record accurate medical history. This info is visible to all assigned doctors and nurses.
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
