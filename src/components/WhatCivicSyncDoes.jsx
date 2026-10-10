import React from 'react';
import { GitMerge, Eye, CheckSquare, Layers } from 'lucide-react';

export default function WhatCivicSyncDoes() {
  const cards = [
    {
      title: 'Coordinate',
      icon: GitMerge,
      badge: 'Dig-Once Protocol',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      iconStyle: 'bg-amber-100 text-amber-700',
      coreSpec: 'Detect potentially conflicting construction schedules.',
      detail:
        'Prevents repeated road digging by flagging overlapping schedules on the same street before work starts.'
    },
    {
      title: 'Make visible',
      icon: Eye,
      badge: 'Public Transparency',
      badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200',
      iconStyle: 'bg-sky-100 text-sky-700',
      coreSpec: 'Publish project details, dates, and status for residents.',
      detail:
        'Gives residents a clear map and timeline of nearby public works, planned disruptions, and contractors.'
    },
    {
      title: 'Build accountability',
      icon: CheckSquare,
      badge: 'Verified Sign-Off',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconStyle: 'bg-emerald-100 text-emerald-700',
      coreSpec: 'Track reports, inspections, and completion decisions.',
      detail:
        'Requires official municipal engineer inspection before any project is marked completed.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Required Platform Description */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            What CivicSync Does
          </h2>

          {/* Exact required description from Section 7.4 */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            CivicSync is a civic infrastructure coordination platform designed to bring citizens, contractors and municipal authorities onto one shared system. It helps coordinate public works, improve project visibility and support accountable execution.
          </p>
        </div>

        {/* 3 Lucid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="clean-card p-8 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${card.iconStyle}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${card.badgeStyle}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs font-semibold text-emerald-700 mb-3 pb-3 border-b border-slate-100">
                    {card.coreSpec}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {card.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Shared System Workflow</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
