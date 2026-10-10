import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Users } from 'lucide-react';

export default function ProjectStatistics({ stats, loading }) {
  const statCards = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects ?? '3',
      icon: Activity,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Potential Conflicts Flagged',
      value: stats?.potentialConflicts ?? '2',
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Completed Projects',
      value: stats?.completedProjects ?? '3',
      icon: CheckCircle,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: 'Contractors Synchronized',
      value: stats?.participatingContractors ?? '6',
      icon: Users,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <section className="py-12 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Lucid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Project overview
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Sample data</span>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="clean-card p-6 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500">
                      {card.label}
                    </span>
                    <div className={`p-2 rounded-xl border ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {loading ? (
                      <span className="inline-block w-8 h-8 rounded bg-slate-100 animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
