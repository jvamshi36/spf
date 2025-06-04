import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const navLinks = [
  { to: '/dashboard', text: 'Dashboard', icon: '📊', roles: 'user' },
  { to: '/allowances', text: 'Allowances', icon: '💸', roles: 'user' },
  { to: '/miscellaneous', text: 'Miscellaneous', icon: '🧾', roles: 'user' },
  { to: '/profile', text: 'Profile', icon: '👤', roles: 'user' },
  { to: '/admin', text: 'Admin', icon: '🛠️', roles: [1] },
  { to: '/admin/users', text: 'Users', icon: '👥', roles: [1] },
  { to: '/admin/roles', text: 'Roles', icon: '🔑', roles: [1] },
  { to: '/admin/routes', text: 'Routes', icon: '🗺️', roles: [1] },
  { to: '/admin/analytics', text: 'Analytics', icon: '📈', roles: [1] },
  { to: '/admin/settings', text: 'Settings', icon: '⚙️', roles: [1] },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) return null;
  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity ${sidebarOpen ? 'block' : 'hidden'} md:hidden`} onClick={() => setSidebarOpen(false)} />
      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:hidden flex flex-col`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <span className="text-2xl font-bold text-primary tracking-wide">Ethical</span>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.filter(l => {
              if (l.roles === 'user') return user.roleLevel >= 2;
              return l.roles.includes(user.roleLevel);
            }).map(link => {
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center px-6 py-3 rounded-lg transition font-semibold text-base gap-3 min-h-[44px]
                      ${active ? 'bg-primary text-white shadow' : 'text-muted hover:bg-primary/10 hover:text-primary'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-30">
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <span className="text-2xl font-bold text-primary tracking-wide">Ethical</span>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.filter(l => {
              if (l.roles === 'user') return user.roleLevel >= 2;
              return l.roles.includes(user.roleLevel);
            }).map(link => {
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center px-6 py-3 rounded-lg transition font-semibold text-base gap-3 min-h-[44px]
                      ${active ? 'bg-primary text-white shadow' : 'text-muted hover:bg-primary/10 hover:text-primary'}
                    `}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar; 