import React from 'react';
import Dashboard from '../../src/components/Dashboard';
import PatientRegistration from '../../src/components/PatientRegistration';

export default function RegisterPage() {
  return (
    <Dashboard>
      <PatientRegistration />
    </Dashboard>
  );
}
