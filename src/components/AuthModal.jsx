import React, { useState } from 'react';
import { 
  X, 
  User, 
  HardHat, 
  Building2, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail,
  Sparkles
} from 'lucide-react';
import { useAuth, DEFAULT_PERSONAS } from '../context/AuthContext';
import { useModalBehavior } from '../hooks/useModalBehavior';

export default function AuthModal({ isOpen, onClose, onAuthenticatedRole }) {
  const { user, login, signup, switchPersona, requiredRoleForModal } = useAuth();
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose);
  
  const [activeTab, setActiveTab] = useState('quick-persona'); // 'quick-persona', 'signin', 'signup'
  const [selectedRole, setSelectedRole] = useState(requiredRoleForModal || 'citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPersona = (role) => {
    switchPersona(role);
    if (onAuthenticatedRole) onAuthenticatedRole(role);
    onClose();
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const u = await login(email, password, selectedRole);
      if (onAuthenticatedRole) onAuthenticatedRole(u.role);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const u = await signup({
        name,
        email,
        password,
        role: selectedRole,
        contractorName: selectedRole === 'contractor' ? organization || 'Independent Civil Works' : undefined,
        department: selectedRole === 'municipal' ? organization || 'Urban Works Authority' : undefined
      });
      if (onAuthenticatedRole) onAuthenticatedRole(u.role);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden">
        
        {/* Soft decorative background tint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-2 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Authentication</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {requiredRoleForModal
              ? `${requiredRoleForModal.charAt(0).toUpperCase() + requiredRoleForModal.slice(1)} Access Required`
              : 'Sign in to CivicSync'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Choose a verified demo persona below or sign in with your account.
          </p>
        </div>

        {/* Clean Tabs */}
        <div className="relative z-10 flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quick-persona')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'quick-persona'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1-Click Demo Personas
          </button>
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Tab 1: 1-Click Demo Personas (Instant login for test reviewers) */}
        {activeTab === 'quick-persona' && (
          <div className="relative z-10 space-y-3">
            <p className="text-xs text-slate-500 font-medium mb-1">
              Select an interface role to access immediately:
            </p>

            {/* Persona 1: Citizen */}
            <button
              onClick={() => handleSelectPersona('citizen')}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                user?.role === 'citizen'
                  ? 'border-emerald-300 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Priya Sharma</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Citizen
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Explore road works, report local issues, submit ideas</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Persona 2: Contractor */}
            <button
              onClick={() => handleSelectPersona('contractor')}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                user?.role === 'contractor'
                  ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Rajesh Verma</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Contractor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Apex Civil Infrastructure • Propose projects & test clashes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Persona 3: Municipal Officer */}
            <button
              onClick={() => handleSelectPersona('municipal')}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                user?.role === 'municipal'
                  ? 'border-sky-300 bg-sky-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Dr. Ananya Mehta</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Municipal Staff
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Chief Works Engineer • Review permits, resolve conflicts, inspect</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        )}

        {/* Tab 2: Standard Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="relative z-10 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Portal Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'citizen', label: 'Citizen' },
                  { role: 'contractor', label: 'Contractor' },
                  { role: 'municipal', label: 'Municipal' }
                ].map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role)}
                    className={`py-2 rounded-xl font-medium border text-center transition-all cursor-pointer ${
                      selectedRole === r.role
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>
        )}

        {/* Tab 3: Create Account Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="relative z-10 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'citizen', label: 'Citizen' },
                  { role: 'contractor', label: 'Contractor' },
                  { role: 'municipal', label: 'Municipal' }
                ].map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role)}
                    className={`py-2 rounded-xl font-medium border text-center transition-all cursor-pointer ${
                      selectedRole === r.role
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedRole !== 'citizen' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {selectedRole === 'contractor' ? 'Contracting Firm Name' : 'Municipal Department'}
                </label>
                <input
                  type="text"
                  placeholder={selectedRole === 'contractor' ? 'e.g. Apex Civil Works Ltd' : 'e.g. Road Works Division'}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
