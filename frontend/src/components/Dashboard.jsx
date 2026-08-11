import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { 
  Activity, 
  UserPlus, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  ClipboardList,
  FileText,
  Settings
} from 'lucide-react';
import { hmsModuleNav } from '../data/hmsModules';

const Dashboard = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get initials for profile avatar
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="dashboard-layout">
      <div className="bg-decor">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <Activity size={32} className="logo-icon" style={{ color: 'var(--accent-secondary)' }} />
          <span className="logo-text">CareFlow HMS</span>
        </div>

        <nav className="nav-list">
          <li>
            <Link href="/dashboard" className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/register" className={`nav-link ${router.pathname === '/dashboard/register' ? 'active' : ''}`}>
              <UserPlus size={20} />
              <span>Register Patient</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/patients" className={`nav-link ${router.pathname === '/dashboard/patients' ? 'active' : ''}`}>
              <Users size={20} />
              <span>Patient Directory</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/reports" className={`nav-link ${router.pathname === '/dashboard/reports' ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings" className={`nav-link ${router.pathname === '/dashboard/settings' ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </li>

          <li style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem' }}>
              HMS Modules
            </div>
          </li>
          {hmsModuleNav.map((module) => (
            <li key={module.key}>
              <Link href={`/dashboard/module/${module.key}`} className={`nav-link ${router.pathname === `/dashboard/module/[moduleKey]` || router.asPath.startsWith(`/dashboard/module/${module.key}`) ? 'active' : ''}`}>
                <ClipboardList size={20} />
                <span>{module.label}</span>
              </Link>
            </li>
          ))}
        </nav>

        {/* User profile and logout */}
        <div className="user-profile">
          <div className="user-avatar">
            {getInitials(user?.full_name)}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.full_name || 'Staff User'}</div>
            <div className="user-role">{user?.role_name || 'Staff'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-bar">
          <div className="page-title">
            <h2>Hospital Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>Portal Status:</span>
            <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
              Online
            </span>
          </div>
        </header>

        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
