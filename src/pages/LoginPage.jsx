import React, { useState } from 'react';
import { 
  User, 
  HardHat, 
  Building2, 
  ArrowLeft, 
  LogIn, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  Layers,
  AlertCircle,
  Check,
  UserPlus,
  X
} from 'lucide-react';
import { useAuth, DEFAULT_PERSONAS } from '../context/AuthContext';

export default function LoginPage({ onNavigateHome, onNavigateSignup, onAuthenticatedRole, initialRole = 'citizen' }) {
  const { login, switchPersona } = useAuth();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentPersona = (Array.isArray(DEFAULT_PERSONAS)
    ? DEFAULT_PERSONAS.find(p => p.role === activeRole)
    : DEFAULT_PERSONAS?.[activeRole]) || {
    name: activeRole === 'contractor' ? 'Rajesh Verma' : activeRole === 'municipal' ? 'Dr. Ananya Mehta' : 'Priya Sharma',
    email: activeRole === 'contractor' ? 'contractor@apexcivil.org' : activeRole === 'municipal' ? 'officer@citygov.org' : 'citizen@civicsync.org',
    role: activeRole,
    organization: activeRole === 'contractor' ? 'Apex Civil Infrastructure' : activeRole === 'municipal' ? 'Urban Infrastructure Authority' : 'Civic Advocate'
  };

  const handleQuickPersonaLogin = (role) => {
    setLoading(true);
    setError('');
    const targetPersona = (Array.isArray(DEFAULT_PERSONAS)
      ? DEFAULT_PERSONAS.find(p => p.role === role)
      : DEFAULT_PERSONAS?.[role]) || currentPersona;
    setTimeout(() => {
      switchPersona(role);
      setSuccessMessage(`Logged in as ${targetPersona.name}! Redirecting to ${role} portal...`);
      setTimeout(() => {
        if (onAuthenticatedRole) onAuthenticatedRole(role);
      }, 600);
    }, 300);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const u = await login(email, password, activeRole);
      setSuccessMessage(`Welcome back, ${u.name}! Redirecting to ${u.role} portal...`);
      setTimeout(() => {
        if (onAuthenticatedRole) onAuthenticatedRole(u.role);
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const roleConfigs = [
    {
      id: 'citizen',
      label: 'Citizen Portal',
      icon: User,
      badge: 'Public Resident',
      tagline: 'Browse projects and report issues'
    },
    {
      id: 'contractor',
      label: 'Contractor Portal',
      icon: HardHat,
      badge: 'Licensed Contractor',
      tagline: 'Submit projects and track reviews'
    },
    {
      id: 'municipal',
      label: 'Municipal Command',
      icon: Building2,
      badge: 'Civic Authority',
      tagline: 'Review projects and citizen reports'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-500 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Civic<span className="text-emerald-600">Sync</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Sign In Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateSignup}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            {/* X Close Button */}
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2.5 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Role-Based Login</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to CivicSync
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
              Choose a workspace to continue.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {roleConfigs.map((r) => {
              const Icon = r.icon;
              const isSelected = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setActiveRole(r.id); setError(''); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/10 shadow-sm'
                      : 'bg-white/70 border-slate-200/90 hover:border-slate-300 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${
                      isSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{r.label}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{r.tagline}</p>
                </button>
              );
            })}
          </div>

          {/* Main Login Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">

            {/* Quick 1-Click Persona Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-sky-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                  {currentPersona.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{currentPersona.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-white border border-slate-200 text-slate-600">
                      Verified Demo Persona
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {currentPersona.organization || currentPersona.department || 'Active Resident'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickPersonaLogin(activeRole)}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo sign in</span>
              </button>
            </div>

            {/* Form Area */}
            <div className="p-6 sm:p-8">

              {/* Status Notifications */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4 max-w-md mx-auto text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentPersona.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Default demo: {currentPersona.email}</span>
                    <button
                      type="button"
                      onClick={() => setEmail(currentPersona.email)}
                      className="text-emerald-700 hover:underline cursor-pointer font-medium"
                    >
                      Fill demo email
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-600 font-medium text-[11px]">Remember on this computer</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Demo mode: Use 1-Click Demo Login above or any password!')}
                    className="text-emerald-700 hover:underline text-[11px] cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer mt-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{loading ? 'Authenticating...' : `Sign In as ${roleConfigs.find(r => r.id === activeRole)?.label}`}</span>
                </button>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={onNavigateSignup}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Create a new account →
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-400">
        <p>CivicSync Infrastructure Network • Unified Municipal Dig Once Platform • Chennai & Bengaluru</p>
      </footer>

    </div>
  );
}
