import React from 'react';
import Dashboard from '../../src/components/Dashboard';
import PatientList from '../../src/components/PatientList';

export default function PatientsPage() {
  return (
    <Dashboard>
      <PatientList />
    </Dashboard>
  );
}
