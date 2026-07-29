import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Search, UserCheck, AlertCircle, FileText, ClipboardList } from 'lucide-react';

const PatientList = () => {
	const [patients, setPatients] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchPatients = async (query = '') => {
		setLoading(true);
		setError('');
		try {
			const response = await api.get(`/patients?search=${query}`);
			setPatients(response.data);
		} catch (err) {
			console.error('Error fetching patients:', err);
			setError('Failed to fetch patients database. Please verify connection.');
		} finally {
			setLoading(false);
		}
	};

	// Real-time search effect with simple debounce
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			fetchPatients(searchTerm);
		}, 400);

		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm]);

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<div className="table-panel">
			<div className="table-header-actions">
				<div>
					<h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
						Patient Directory
					</h3>
					<p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
						Browse, search and view clinical profiles of all registered patients.
					</p>
				</div>
        
				{/* Search Input */}
				<div className="search-input-wrapper">
					<input
						type="text"
						className="form-control"
						placeholder="Search by name, email or phone..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Search size={18} className="input-icon" />
				</div>
			</div>

			{error && (
				<div className="alert alert-error" style={{ marginBottom: '2rem' }}>
					<AlertCircle size={20} />
					<span>{error}</span>
				</div>
			)}

			<div className="custom-table-wrapper">
				{loading ? (
					<div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
						Loading patients database...
					</div>
				) : patients.length === 0 ? (
					<div className="empty-state">
						<ClipboardList size={48} className="empty-state-icon" />
						<h3>No Records Found</h3>
						<p style={{ marginTop: '0.5rem' }}>
							{searchTerm ? `No matches found for "${searchTerm}"` : 'No patient records currently in system.'}
						</p>
					</div>
				) : (
					<table className="custom-table">
						<thead>
							<tr>
								<th>Patient Name</th>
								<th>DOB</th>
								<th>Gender</th>
								<th>Phone Number</th>
								<th>Email Address</th>
								<th>Staff Recorder</th>
								<th>Notes / History</th>
							</tr>
						</thead>
						<tbody>
							{patients.map((patient) => (
								<tr key={patient.id}>
									<td style={{ fontWeight: 600 }}>
										{patient.first_name} {patient.last_name}
									</td>
									<td>{formatDate(patient.date_of_birth)}</td>
									<td>
										<span className="badge badge-gender">{patient.gender}</span>
									</td>
									<td>{patient.phone || <em style={{ color: 'var(--text-muted)' }}>N/A</em>}</td>
									<td>{patient.email || <em style={{ color: 'var(--text-muted)' }}>N/A</em>}</td>
									<td style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
											<UserCheck size={14} />
											<span>{patient.registered_by_name || 'System'}</span>
										</div>
									</td>
									<td style={{ maxWidth: '300px' }}>
										<div style={{ 
											fontSize: '0.85rem', 
											color: 'var(--text-secondary)',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}} title={patient.medical_history}>
											{patient.medical_history || <em style={{ color: 'var(--text-muted)' }}>No medical history notes</em>}
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

export default PatientList;