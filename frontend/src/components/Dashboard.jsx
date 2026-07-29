import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UserPlus size={20} />
              <span>Register Patient</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Patient Directory</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Reports</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>

          <li style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem' }}>
              HMS Modules
            </div>
          </li>
          {hmsModuleNav.map((module) => (
            <li key={module.key}>
              <NavLink to={`/dashboard/module/${module.key}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ClipboardList size={20} />
                <span>{module.label}</span>
              </NavLink>
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
