import React from 'react';
import { GitMerge, Eye, CheckSquare, Layers } from 'lucide-react';

export default function WhatCivicSyncDoes() {
  const cards = [
    {
      title: 'Coordinate',
      icon: GitMerge,
      iconStyle: 'bg-amber-100 text-amber-700',
      detail: 'Flag overlapping work on the same street.'
    },
    {
      title: 'Make visible',
      icon: Eye,
      iconStyle: 'bg-sky-100 text-sky-700',
      detail: 'View project locations, dates, and status.'
    },
    {
      title: 'Build accountability',
      icon: CheckSquare,
      iconStyle: 'bg-emerald-100 text-emerald-700',
      detail: 'Track reports, inspections, and approvals.'
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
            One place to coordinate public works, share updates, and track reports.
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
                  <div className="mb-5">
                    <div className={`p-3 rounded-2xl ${card.iconStyle}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {card.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
