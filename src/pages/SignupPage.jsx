import React, { useState } from 'react';
import { 
  User, 
  HardHat, 
  Building2, 
  ArrowLeft, 
  UserPlus, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Layers, 
  AlertCircle, 
  Check, 
  LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage({ onNavigateHome, onNavigateLogin, onAuthenticatedRole, initialRole = 'citizen' }) {
  const { signup } = useAuth();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('Urban Infrastructure Directorate');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email address are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const u = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role: activeRole,
        contractorName: activeRole === 'contractor' ? organization.trim() || 'Independent Infrastructure' : undefined,
        department: activeRole === 'municipal' ? department.trim() || 'Urban Infrastructure Directorate' : undefined
      });
      setSuccessMessage(`Account created successfully for ${u.name}! Redirecting to ${u.role} portal...`);
      setTimeout(() => {
        if (onAuthenticatedRole) onAuthenticatedRole(u.role);
      }, 600);
    } catch (err) {
      setError(err.message || 'Account registration failed.');
      setLoading(false);
    }
  };

  const roleConfigs = [
    {
      id: 'citizen',
      label: 'Citizen Portal',
      icon: User,
      badge: 'Public Resident',
      tagline: 'Track projects, view roadworks, report street defects'
    },
    {
      id: 'contractor',
      label: 'Contractor Portal',
      icon: HardHat,
      badge: 'Licensed Contractor',
      tagline: 'Dig Once coordination, schedule permits, upload quality certificates'
    },
    {
      id: 'municipal',
      label: 'Municipal Command',
      icon: Building2,
      badge: 'Civic Authority',
      tagline: 'Review conflict engine alerts, issue permits, inspect sites'
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
                Registration Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
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
              <span>New Account Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your CivicSync Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
              Join the unified civic platform to collaborate on road excavations and urban infrastructure.
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

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">

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

            <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@workmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {activeRole === 'contractor' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contracting Firm Name</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Apex Civil Works Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {activeRole === 'municipal' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipal Department / Zone</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Zone 4 Works Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
                By registering, you agree to comply with the unified Dig Once street coordination protocol and public reporting standards.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              </button>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Log in to existing account →
                </button>
              </div>
            </form>

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
