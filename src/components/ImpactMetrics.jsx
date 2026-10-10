import React from 'react';
import { GitMerge, CheckCircle, Clock, ShieldCheck, AlertCircle, BarChart2 } from 'lucide-react';

export default function ImpactMetrics({ stats, loading }) {
  const metrics = [
    {
      label: 'Potential Conflicts Detected',
      value: stats?.conflictsDetected ?? '2',
      icon: GitMerge,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      detail: 'Overlapping corridor intervals flagged prior to digging',
      type: 'Simulated Engine Metric'
    },
    {
      label: 'Resolved via Schedule Changes',
      value: stats?.conflictsResolved ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      detail: 'Clashes averted through accepted date adjustments',
      type: 'Recorded Events'
    },
    {
      label: 'Awaiting Physical Inspection',
      value: stats?.projectsAwaitingInspection ?? '1',
      icon: Clock,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      detail: 'Completed works pending municipal field sign-off',
      type: 'Active Queue'
    },
    {
      label: 'Verified Complaints Resolved',
      value: stats?.verifiedComplaintsResolved ?? 0,
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      detail: 'Citizen reports investigated and officially closed',
      type: 'Audit Ledger'
    },
    {
      label: 'Delayed Projects Under Watch',
      value: stats?.delayedProjects ?? 0,
      icon: AlertCircle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      detail: 'Work packages experiencing active delays',
      type: 'Field Flag'
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>System Outcomes</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Civic Infrastructure Impact Metrics
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Transparent systemic indicators tracking schedule deconfliction, inspection backlogs, and community issue resolutions.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 max-w-sm">
            <strong className="text-slate-900 block mb-0.5">Measurement Distinction:</strong>
            Resolutions require recorded contractor acceptance or municipal inspection sign-off. Clearly distinguished from prototype simulations.
          </div>
        </div>

        {/* 5 Clean Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="clean-card p-5 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {m.type}
                    </span>
                    <div className={`p-2 rounded-xl border ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                    {loading ? (
                      <span className="inline-block w-8 h-8 rounded bg-slate-100 animate-pulse" />
                    ) : (
                      m.value
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mb-2 leading-snug">
                    {m.label}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2.5 border-t border-slate-100">
                  {m.detail}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
