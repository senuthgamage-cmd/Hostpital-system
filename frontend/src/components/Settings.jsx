import React, { useContext, useState } from 'react';
import { api, AuthContext } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, LockKeyhole } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.current_password || !formData.new_password) {
      setError('All password fields are required.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      setSuccess('Password updated successfully.');
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (requestError) {
      console.error('Password update failed:', requestError);
      setError(requestError.response?.data?.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-panel">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Account Settings
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Update your login password and manage your current session.
        </p>
      </div>

      <div className="table-panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-icon-wrapper indigo">
            <LockKeyhole size={24} />
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>{user?.full_name || 'Staff User'}</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{user?.role_name || 'Staff Member'}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-panel" style={{ padding: 0, background: 'transparent', border: 'none' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="current_password"
              className="form-control"
              value={formData.current_password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="new_password"
              className="form-control"
              value={formData.new_password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              className="form-control"
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn" style={{ width: 'auto', minWidth: '180px', marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default Settings;