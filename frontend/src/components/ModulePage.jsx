import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '../context/AuthContext';
import { hmsModuleConfigs } from '../data/hmsModules';
import { AlertCircle, CheckCircle2, Edit2, PlusCircle, Search, Trash2 } from 'lucide-react';

const getEmptyForm = (fields) => {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.type === 'select' ? field.options?.[0] || '' : '';
    return accumulator;
  }, {});
};

const formatValue = (value, key) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (typeof value === 'string' && (key === 'created_at' || key.includes('date'))) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  return value;
};

const ModulePage = () => {
  const router = useRouter();
  const { moduleKey } = router.query || {};

  const config = hmsModuleConfigs[moduleKey];

  const emptyForm = useMemo(() => getEmptyForm(config?.fields || []), [config]);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setFormData(getEmptyForm(config?.fields || []));
    setEditingId(null);
  }, [config]);

  const fetchRecords = async (query = '') => {
    if (!config) return;
    try {
      setError('');
      const params = query ? { search: query } : {};
      const res = await api.get(`/modules/${moduleKey}`, { params });
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !config) {
      if (!config) setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchRecords(searchTerm);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [router.isReady, config, searchTerm]);

  if (!router.isReady) {
    return (
      <div className="table-panel">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading module...</div>
      </div>
    );
  }



  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(getEmptyForm(config?.fields || []));
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleEdit = (record) => {
    const nextForm = config.fields.reduce((accumulator, field) => {
      const value = record[field.name];
      accumulator[field.name] = value === null || value === undefined ? '' : String(value);
      return accumulator;
    }, {});

    setEditingId(record.id);
    setFormData(nextForm);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this record?')) {
      return;
    }

    try {
      await api.delete(`/modules/${moduleKey}/${recordId}`);
      setSuccess('Record deleted successfully.');
      fetchRecords(searchTerm);
    } catch (requestError) {
      console.error('Delete failed:', requestError);
      setError(requestError.response?.data?.message || 'Unable to delete record.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/modules/${moduleKey}/${editingId}`, formData);
        setSuccess(`${config.title} record updated successfully.`);
      } else {
        await api.post(`/modules/${moduleKey}`, formData);
        setSuccess(`${config.title} record created successfully.`);
      }

      resetForm();
      fetchRecords(searchTerm);
    } catch (requestError) {
      console.error('Save failed:', requestError);
      setError(requestError.response?.data?.message || 'Unable to save record.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="table-panel">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>Unknown module.</span>
        </div>
        <Link href="/dashboard" className="btn" style={{ width: 'auto', marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="table-panel">
      <div className="table-header-actions">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {config.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>{config.description}</p>
        </div>

        <div className="search-input-wrapper">
          <input
            type="text"
            className="form-control"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Search size={18} className="input-icon" />
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-panel" style={{ marginBottom: '2rem' }}>
        <div className="form-grid">
          {config.fields.map((field) => (
            <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'form-grid-full' : ''}`}>
              <label className="form-label">
                {field.label}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  className="form-control"
                  name={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={{ minHeight: '100px' }}
                />
              ) : field.type === 'select' ? (
                <select
                  className="form-control"
                  name={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  type={field.type === 'number' ? 'number' : field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange}
                  disabled={saving}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn" style={{ width: 'auto', minWidth: '160px' }} disabled={saving}>
            <PlusCircle size={18} />
            <span>{saving ? 'Saving...' : editingId ? 'Update Record' : 'Add Record'}</span>
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={resetForm} disabled={saving}>
            Reset
          </button>
        </div>
      </form>

      <div className="custom-table-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <ClipboardListPlaceholder />
            </div>
            <h3>No records found</h3>
            <p style={{ marginTop: '0.5rem' }}>Create the first entry to get started.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {config.columns.map((column) => {
                    const value = formatValue(record[column.key], column.key);
                    const textValue = String(value);

                    return (
                      <td key={column.key} title={textValue}>
                        {textValue.length > 80 ? `${textValue.slice(0, 80)}...` : value}
                      </td>
                    );
                  })}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
                        onClick={() => handleEdit(record)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ width: 'auto', padding: '0.5rem 0.75rem', background: 'var(--danger)' }}
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ClipboardListPlaceholder = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M10 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
    <path d="M8 9h8" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </svg>
);

export default ModulePage;