import React from 'react';
import { X, Award, ShieldCheck, Calculator, AlertCircle } from 'lucide-react';
import { useModalBehavior } from '../hooks/useModalBehavior';

export default function RankingsExplainerModal({ isOpen, onClose }) {
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">How Contractor Rankings Work</h3>
            <p className="text-xs text-slate-500 mt-0.5">Section 6 Objective Scoring Standard</p>
          </div>
        </div>

        {/* Lucid Explainer Body */}
        <div className="space-y-5 text-xs sm:text-sm text-slate-600">
          
          {/* Eligibility */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Eligibility Rule</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contractors qualify for the featured public board after completing a minimum of <strong>5 eligible projects</strong> with definitive outcomes. In-progress or cancelled projects are excluded.
            </p>
          </div>

          {/* Formula */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Formula Calculation</span>
            </div>
            
            <div className="p-3 rounded-xl bg-white font-mono text-xs text-emerald-800 border border-emerald-100 font-semibold">
              Score = 100 × ( 0.60 × CompletionRate + 0.40 × VerifiedComplaintFreeRate )
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              • <strong>Completion Rate (60% weight):</strong> Completed projects / Eligible projects.<br />
              • <strong>Complaint-Free Rate (40% weight):</strong> 1 - (Projects with $\ge 1$ verified complaints / Eligible projects).
            </p>
          </div>

          {/* Due Process Safeguard */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Due Process Protection</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Citizen complaints are treated as allegations until officially reviewed. Unverified or rejected complaints never penalize a contractor. Multiple reports on a single project are counted once.
            </p>
          </div>

          {/* Official Benchmark */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <strong className="text-slate-900 block font-semibold">Example Benchmark (Apex Civil):</strong>
            <p>10 eligible projects (8 completed, 2 unsuccessful, 1 with verified complaint).</p>
            <p className="font-mono text-slate-800 font-semibold pt-1">
              Score = 100 × (0.60 × 0.80 + 0.40 × 0.90) = <span className="text-emerald-700">84.0 / 100</span>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close Explainer
          </button>
        </div>

      </div>
    </div>
  );
}
