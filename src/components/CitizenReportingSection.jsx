import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  ThumbsUp, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';
import ReportIssueModal from './ReportIssueModal';
import SuggestImprovementModal from './SuggestImprovementModal';

export default function CitizenReportingSection({ 
  projects, 
  complaints, 
  suggestions, 
  onUpvoteSuggestion, 
  onRefreshData 
}) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent-reports');

  return (
    <section className="py-20 bg-slate-50/50 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Callout Card (Exact Heading & Copy from Section 7.8) */}
        <div className="clean-card p-8 sm:p-12 bg-white mb-12 border border-slate-200/90 relative overflow-hidden">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Citizen Channel</span>
            </div>

            {/* Exact Heading from Section 7.8 */}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Your neighbourhood deserves better.
            </h2>

            {/* Exact Copy from Section 7.8 */}
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Report a problem, follow its status and help municipal authorities understand what needs attention.
            </p>

            {/* Exact Buttons from Section 7.8 */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report an Issue</span>
              </button>

              <button
                onClick={() => setSuggestModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs transform hover:-translate-y-0.5"
              >
                <Lightbulb className="w-4 h-4 text-sky-600" />
                <span>Suggest an Improvement</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reports are officially evaluated by municipal inspectors before findings are confirmed.</span>
            </p>
          </div>
        </div>

        {/* Live Public Feedback Activity Tracker */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recent-reports')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'recent-reports'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                Recent Issue Reports ({(complaints || []).length})
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'suggestions'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                Community Road Ideas ({(suggestions || []).length})
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-400">
              * Live Municipal Triage Queue
            </span>
          </div>

          {activeTab === 'recent-reports' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(complaints || []).slice(0, 6).map((c) => (
                <div key={c.id} className="clean-card p-5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : c.status === 'Resolved'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : c.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">#{c.id}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {c.projectName}
                    </h4>
                    
                    <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                      "{c.description}"
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="text-slate-500 flex items-center justify-between">
                      <span>Category: <strong className="text-slate-800 capitalize">{c.category}</strong></span>
                      <span>By: {c.submittedBy}</span>
                    </div>
                    {c.municipalResponse && (
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-[11px]">
                        <strong className="text-emerald-700 block mb-0.5">Municipal Action:</strong>
                        {c.municipalResponse}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(suggestions || []).map((s) => (
                <div key={s.id} className="clean-card p-5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        s.status === 'Converted to Proposal'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {s.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">#{s.id}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {s.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                      "{s.description}"
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] truncate max-w-[150px]">
                      {s.road}
                    </span>

                    <button
                      onClick={() => onUpvoteSuggestion && onUpvoteSuggestion(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-sky-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{s.upvotes || 0} Endorse</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        projects={projects}
        onReportSubmitted={() => {
          if (onRefreshData) onRefreshData();
        }}
      />

      <SuggestImprovementModal
        isOpen={suggestModalOpen}
        onClose={() => setSuggestModalOpen(false)}
        onSuggestionSubmitted={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </section>
  );
}
