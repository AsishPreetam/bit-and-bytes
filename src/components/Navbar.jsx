import React, { useState } from 'react';
import { 
  Layers, 
  User, 
  HardHat, 
  Building2, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePortal, setActivePortal, onNavigateSection }) {
  const { user, setAuthModalOpen, requireRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Explore Projects', href: '#explore-projects' },
    { label: 'Top Contractors', href: '#top-contractors' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  const handleLinkClick = (href, e) => {
    e.preventDefault();
    if (activePortal !== 'landing') {
      setActivePortal('landing');
    }
    setMobileMenuOpen(false);
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePortalSwitch = (portal) => {
    if (portal === 'contractor') {
      requireRole('contractor', () => {
        setActivePortal('contractor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      if (user?.role === 'contractor') {
        setActivePortal('contractor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (portal === 'municipal') {
      requireRole('municipal', () => {
        setActivePortal('municipal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      if (user?.role === 'municipal') {
        setActivePortal('municipal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActivePortal(portal);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'municipal':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'contractor':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => handlePortalSwitch('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Civic<span className="text-emerald-600">Sync</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Dig Once
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(link.href, e)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-full transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Portal Entry Points + User Auth Status */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Citizen Portal */}
            <button
              onClick={() => handlePortalSwitch('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePortal === 'citizen'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen</span>
            </button>

            {/* Contractor Portal */}
            <button
              onClick={() => handlePortalSwitch('contractor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePortal === 'contractor'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Contractor</span>
            </button>

            {/* Municipal Portal */}
            <button
              onClick={() => handlePortalSwitch('municipal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePortal === 'municipal'
                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Municipal</span>
            </button>

            {/* Dedicated Auth Page */}
            <button
              onClick={() => handlePortalSwitch('auth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePortal === 'auth'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auth Page</span>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Auth User State Pill & Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                    <div className="p-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {user.badge || user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActivePortal('auth');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left font-medium cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dedicated Auth Page</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left font-medium cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quick Persona Modal</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setActivePortal('auth');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => {
                if (user) {
                  setUserDropdownOpen(!userDropdownOpen);
                } else {
                  setActivePortal('auth');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {user ? user.role : 'Sign In'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(link.href, e)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider">Portals</p>
            <button
              onClick={() => handlePortalSwitch('citizen')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Citizen Portal</span>
            </button>
            <button
              onClick={() => handlePortalSwitch('contractor')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800"
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Contractor Portal</span>
            </button>
            <button
              onClick={() => handlePortalSwitch('municipal')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-800"
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Municipal Command Portal</span>
            </button>
            <button
              onClick={() => handlePortalSwitch('auth')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Dedicated Auth Page</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
