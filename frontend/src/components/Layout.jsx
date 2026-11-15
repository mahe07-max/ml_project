import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Leaf, LogOut, MapPinned, Sprout, BarChart3, BadgeCheck, Menu, X } from 'lucide-react';

export default function Layout({ children, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/predict', label: 'AI Prediction', icon: Sprout },
    { to: '/markets', label: 'Market Prices', icon: MapPinned },
    { to: '/recommendation', label: 'Recommendations', icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-agri-cream">
      <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/95 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-agri-green text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-bold tracking-tight text-agri-dark sm:text-xl">AgriWise AI</div>
              <div className="hidden text-xs text-slate-500 sm:block">Market intelligence for farmers</div>
            </div>
          </Link>

          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full z-50 flex-col gap-1 border-b border-slate-200 bg-white p-3 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-emerald-50 text-agri-green' : 'text-slate-600 hover:bg-slate-50 hover:text-agri-dark'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            {!user && (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:hidden">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="button-secondary px-3 py-2 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="button-primary px-3 py-2 text-sm">Get Started</Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden rounded-full bg-agri-accent px-3 py-1 text-xs font-medium text-agri-dark sm:block">
                  {user.full_name}
                </div>
                <button onClick={() => { setMenuOpen(false); onLogout(); }} className="button-secondary gap-2 px-3 py-2 text-sm">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button-secondary hidden px-4 py-2.5 text-sm sm:inline-flex">Login</Link>
                <Link to="/register" className="button-primary hidden px-4 py-2.5 text-sm sm:inline-flex">Get Started</Link>
              </>
            )}
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
