import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  {
    group: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '◈', roles: ['admin', 'manager', 'employee'] },
    ],
  },
  {
    group: 'Modules',
    items: [
      { path: '/employees', label: 'HR & Employees', icon: '◉', roles: ['admin', 'manager'] },
      { path: '/products', label: 'Inventory', icon: '⬡', roles: ['admin', 'manager', 'employee'] },
      { path: '/sales', label: 'Sales & Orders', icon: '◈', roles: ['admin', 'manager'] },
      { path: '/reports', label: 'Reports', icon: '▣', roles: ['admin', 'manager'] },
    ],
  },
  {
    group: 'Account',
    items: [
      { path: '/profile', label: 'My Profile', icon: '○', roles: ['admin', 'manager', 'employee'] },
    ],
  },
];

const roleColors = {
  admin: 'badge-purple',
  manager: 'badge-blue',
  employee: 'badge-green',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredNav = navItems.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(user?.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          bg-slate-925 border-r border-slate-800/60
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'rgba(13, 17, 23, 0.97)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold font-display">D</span>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white tracking-wide">Digital ERP</div>
            <div className="text-xs text-slate-500">Enterprise Suite</div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-100 truncate">{user?.name}</div>
              <span className={`text-xs ${roleColors[user?.role] || 'badge-gray'} mt-0.5 inline-block`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {filteredNav.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-2 mb-2">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <span className="text-xs opacity-80">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <span className="text-xs">⊗</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
