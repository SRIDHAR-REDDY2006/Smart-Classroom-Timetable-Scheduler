import { Outlet, NavLink, useNavigate } from 'react-router-dom';

import Dashboard from './Dashboard';
import Faculty from './Faculty';
import Subjects from './Subjects';
import Classes from './Classes';
import Branches from './Branches';
import TimeSlots from './TimeSlots';
import TimeTables from './TimeTables';
import Approval from './Approval';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/faculty', label: 'Faculty', icon: '👨‍🏫' },
    { to: '/subjects', label: 'Subjects', icon: '📚' },
    { to: '/classes', label: 'Classes', icon: '🏫' },
    { to: '/branches', label: 'Branches', icon: '👥' },
    { to: '/timeslots', label: 'Time Slots', icon: '⏰' },
    { to: '/timetables', label: 'Time Tables', icon: '📅' },
    { to: '/approval', label: 'Approval', icon: '✅' },
  ];
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>📅 Timetable</h2>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-info">
          <p>{user.fullName || user.username}</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.role}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
