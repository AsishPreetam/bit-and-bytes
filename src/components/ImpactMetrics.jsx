import React from 'react';
import { GitMerge, CheckCircle, Clock, ShieldCheck, AlertCircle, BarChart2 } from 'lucide-react';

export default function ImpactMetrics({ stats, loading }) {
  const metrics = [
    {
      label: 'Potential conflicts',
      value: stats?.conflictsDetected ?? '2',
      icon: GitMerge,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Schedule changes recorded',
      value: stats?.conflictsResolved ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Awaiting inspection',
      value: stats?.projectsAwaitingInspection ?? '1',
      icon: Clock,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: 'Verified reports resolved',
      value: stats?.verifiedComplaintsResolved ?? 0,
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      label: 'Delayed projects',
      value: stats?.delayedProjects ?? 0,
      icon: AlertCircle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
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
              <span>Project outcomes</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Recorded outcomes
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Key project, inspection, and report totals.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 max-w-sm">
            Only recorded changes and inspections count.
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

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
