import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Compass, 
  User, 
  HardHat, 
  Building2, 
  Mail, 
  X
} from 'lucide-react';

export default function FooterSection({ onNavigatePortal, onScrollToSection }) {
  const [modalContent, setModalContent] = useState(null);

  const handleOpenInfoModal = (title, content) => {
    setModalContent({ title, content });
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 relative">
      
      {/* Call to Action Banner (Exact Headline from Section 7.10) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="clean-card p-8 sm:p-14 bg-white text-center mb-16 border border-slate-200/90 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              One City • One Plan
            </span>

            {/* Exact Headline from Section 7.10 */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              A better city begins with better coordination.
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Coordinate public works and keep residents informed.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onScrollToSection('#explore-projects')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                <span>Explore City Projects</span>
              </button>

              <button
                onClick={() => onNavigatePortal('municipal')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Access Municipal Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns (All Required Links from Section 7.10) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200 text-xs">
          
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Civic<span className="text-emerald-600">Sync</span></span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Public works, coordinated.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Navigation
            </span>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  onClick={() => onScrollToSection('#about')}
                  className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
                >
                  About CivicSync
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('#explore-projects')}
                  className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
                >
                  Explore Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('#top-contractors')}
                  className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
                >
                  Top Contractors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('#how-it-works')}
                  className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Role Portals
            </span>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  onClick={() => onNavigatePortal('citizen')}
                  className="hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Citizen Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePortal('contractor')}
                  className="hover:text-amber-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contractor Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePortal('municipal')}
                  className="hover:text-sky-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Municipal Portal</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Civic Trust & Legal
            </span>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  onClick={() => handleOpenInfoModal('Contact & Feedback', 'For civic questions or coordination inquiries, contact the CivicSync team at team@civicsync.org. You can also use the Suggest an Improvement form on the homepage!')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact / Feedback</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenInfoModal('Privacy Policy', 'CivicSync respects citizen privacy: Location access is strictly optional. Denying location does not block any functionality. Citizen complaints are protected under due process and never treated as verified misconduct without investigation.')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenInfoModal('Terms of Service', 'CivicSync is a civic coordination platform prototype. Simulated sample data is clearly labeled. Confirmed contractor schedules are never automatically altered without municipal review.')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 CivicSync Platform. Prototype demonstration build.
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dig-Once Standard • Due Process Certified</span>
          </div>
        </div>

      </div>

      {modalContent && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setModalContent(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <button
              onClick={() => setModalContent(null)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-2">{modalContent.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{modalContent.content}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
