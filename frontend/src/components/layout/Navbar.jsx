import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'HR & Employees',
  '/employees/new': 'Add Employee',
  '/products': 'Inventory',
  '/products/new': 'Add Product',
  '/sales': 'Sales & Orders',
  '/sales/new': 'Create Order',
  '/reports': 'Reports',
  '/profile': 'My Profile',
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const title = Object.entries(routeTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Digital ERP';

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="font-display font-bold text-white text-base leading-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{greeting}, {user?.name?.split(' ')[0]}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs text-slate-400 font-mono">
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <span className="text-white text-xs font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </button>
      </div>
    </header>
  );
}
