import React, { useState } from 'react';
import { api } from '../context/AuthContext';
import { User, Calendar, Phone, Mail, MapPin, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    medical_history: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { first_name, last_name, date_of_birth, gender } = formData;
    if (!first_name.trim() || !last_name.trim() || !date_of_birth || !gender) {
      setError('First name, Last name, Date of birth, and Gender are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/patients', formData);
      setSuccess('Patient registered successfully with ID: ' + response.data.patientId);
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        medical_history: ''
      });
    } catch (err) {
      console.error('Failed to register patient:', err);
      setError(err.response?.data?.message || 'Failed to register patient. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-panel">
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Patient Registration
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Enter patient demographics and medical details to create a new electronic health record.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          {/* First Name */}
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="first_name"
                className="form-control"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
              />
              <User size={18} className="input-icon" />
            </div>
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
              <User size={18} className="input-icon" />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <div className="input-wrapper">
              <input
                type="date"
                name="date_of_birth"
                className="form-control"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={loading}
              />
              <Calendar size={18} className="input-icon" />
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select
              name="gender"
              className="form-control"
              style={{ paddingLeft: '1rem' }} // select drop-down doesn't need left icon as much
              value={formData.gender}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <Phone size={18} className="input-icon" />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <Mail size={18} className="input-icon" />
            </div>
          </div>

          {/* Address */}
          <div className="form-group form-grid-full">
            <label className="form-label">Residential Address</label>
            <div className="input-wrapper">
              <textarea
                name="address"
                className="form-control"
                style={{ height: '80px', resize: 'vertical', paddingLeft: '2.75rem' }}
                placeholder="Street Address, City, State, ZIP Code"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
              <MapPin size={18} className="input-icon" style={{ alignSelf: 'flex-start', marginTop: '0.875rem' }} />
            </div>
          </div>

          {/* Medical History */}
          <div className="form-group form-grid-full">
            <label className="form-label">Primary Medical History & Notes</label>
            <div className="input-wrapper">
              <textarea
                name="medical_history"
                className="form-control"
                style={{ height: '120px', resize: 'vertical', paddingLeft: '2.75rem' }}
                placeholder="Allergies, chronic conditions, current medications..."
                value={formData.medical_history}
                onChange={handleChange}
                disabled={loading}
              />
              <ClipboardList size={18} className="input-icon" style={{ alignSelf: 'flex-start', marginTop: '0.875rem' }} />
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto' }}
            disabled={loading}
            onClick={() => setFormData({
              first_name: '',
              last_name: '',
              date_of_birth: '',
              gender: 'Male',
              phone: '',
              email: '',
              address: '',
              medical_history: ''
            })}
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            className="btn"
            style={{ width: 'auto', minWidth: '180px' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
