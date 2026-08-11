import React from 'react';
import Dashboard from '../../src/components/Dashboard';
import DashboardOverview from '../../src/components/DashboardOverview';

export default function DashboardPage() {
  return (
    <Dashboard>
      <DashboardOverview />
    </Dashboard>
  );
}
