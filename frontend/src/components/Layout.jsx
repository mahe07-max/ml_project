import { Link, NavLink } from 'react-router-dom';
import { Leaf, LogOut, MapPinned, Sprout, BarChart3, BadgeCheck } from 'lucide-react';

export default function Layout({ children, user, onLogout }) {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/predict', label: 'AI Prediction', icon: Sprout },
    { to: '/markets', label: 'Market Prices', icon: MapPinned },
    { to: '/recommendation', label: 'Recommendations', icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f6faf6]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-green text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-agri-dark">AgriWise AI</div>
              <div className="text-xs text-slate-500">Market Intelligence</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 text-sm font-medium ${isActive ? 'text-agri-green' : 'text-slate-600 hover:text-agri-dark'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden rounded-full bg-agri-accent px-3 py-1 text-xs font-medium text-agri-dark sm:block">
                  {user.full_name}
                </div>
                <button onClick={onLogout} className="button-secondary gap-2 px-3 py-2 text-sm">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button-secondary px-4 py-2.5 text-sm">Login</Link>
                <Link to="/register" className="button-primary px-4 py-2.5 text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
