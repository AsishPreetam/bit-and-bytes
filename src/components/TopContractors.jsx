import React, { useState } from 'react';
import { Award, HelpCircle, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import RankingsExplainerModal from './RankingsExplainerModal';

export default function TopContractors({ leaderboard, loading }) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  const eligibleContractors = (leaderboard || []).filter(c => c.isEligible);
  const pendingContractors = (leaderboard || []).filter(c => !c.isEligible);

  return (
    <section id="top-contractors" className="py-20 bg-slate-50/50 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Public Accountability Index</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Top-Performing Contractors
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Transparent rankings calculated from verified project completion and verified citizen feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setExplainerOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>How rankings work</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>* Simulated Demo Data</span>
            </div>
          </div>
        </div>

        {/* Featured Contractors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleContractors.map((c) => {
              const rank = c.rank;
              const isTopRank = rank === 1;

              return (
                <div
                  key={c.contractorId}
                  className={`clean-card p-6 bg-white flex flex-col justify-between ${
                    isTopRank ? 'border-amber-300 ring-2 ring-amber-100' : ''
                  }`}
                >
                  <div>
                    {/* Card Top: Rank, Name & Score */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            rank === 1
                              ? 'bg-amber-100 text-amber-800'
                              : rank === 2
                              ? 'bg-slate-100 text-slate-700'
                              : rank === 3
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          #{rank}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">
                            {c.name}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            {c.specialty}
                          </span>
                        </div>
                      </div>

                      {/* Performance Score Badge */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-extrabold text-emerald-700">
                            {c.performanceScore}
                          </span>
                          <span className="text-[11px] text-slate-400">/100</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Civic Score
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, c.performanceScore))}%` }}
                      />
                    </div>

                    {/* Lucid 2x2 Metrics Table */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Completed Works</span>
                        <span className="font-bold text-slate-800">
                          {c.completedCount} <span className="font-normal text-slate-500">/ {c.eligibleProjects}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Completion Rate</span>
                        <span className="font-bold text-emerald-700">
                          {c.completionRate}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Verified Complaints</span>
                        <span className="font-semibold text-slate-700">
                          {c.projectsWithVerifiedComplaints === 0 ? '0 projects' : `${c.projectsWithVerifiedComplaints} project`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">Clean Record Rate</span>
                        <span className="font-bold text-sky-700">
                          {c.verifiedComplaintFreeRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Record</span>
                    </span>
                    <span>{c.registrationNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pending qualification info */}
        {pendingContractors.length > 0 && (
          <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Qualification benchmark:</strong> {pendingContractors.length} registered contractor(s) currently have fewer than 5 completed projects and will join the featured leaderboard upon reaching 5 eligible projects.
              </span>
            </div>
          </div>
        )}

      </div>

      <RankingsExplainerModal isOpen={explainerOpen} onClose={() => setExplainerOpen(false)} />
    </section>
  );
}
