import React from 'react';
import { FilePlus2, GitMerge, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HowItWorks({ onSwitchPortal }) {
  const steps = [
    {
      number: '01',
      title: 'Register a project',
      icon: FilePlus2,
      style: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Contractors submit projects for municipal review.'
    },
    {
      number: '02',
      title: 'Detect and coordinate conflicts',
      icon: GitMerge,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Flag overlapping work on the same street.'
    },
    {
      number: '03',
      title: 'Track progress & citizen reports',
      icon: Activity,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Residents follow projects and report issues.'
    },
    {
      number: '04',
      title: 'Verify completion',
      icon: CheckCircle2,
      style: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Municipal staff inspect work before sign-off.'
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/50 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Four steps</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How CivicSync Works
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            From project proposal to verified completion.
          </p>
        </div>

        {/* 4 Clean Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="clean-card p-6 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xl font-bold font-mono text-slate-300">
                      {step.number}
                    </span>
                    <div className={`p-2.5 rounded-xl border ${step.style}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Lucid Test Link */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Access a workspace</h4>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSwitchPortal('contractor')}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold cursor-pointer"
            >
              Contractor sign in
            </button>
            <button
              onClick={() => onSwitchPortal('municipal')}
              className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold cursor-pointer"
            >
              Municipal sign in
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
