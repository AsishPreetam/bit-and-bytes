import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building, 
  HardHat, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Clock, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

import { useModalBehavior } from '../hooks/useModalBehavior';

export default function ProjectDetailModal({ project, isOpen, onClose, onReportIssue }) {
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose);

  if (!isOpen || !project) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Approved/Planned':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Proposed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Awaiting Inspection':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Delayed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Inspection Failed':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
        <div className="pr-10 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(project.status)}`}>
              {project.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {project.id}
            </span>
            {project.heavyEquipment && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Truck className="w-3 h-3 text-amber-600" />
                Heavy Machinery Active
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {project.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{project.roadSegment}</span>
          </div>
        </div>

        {/* Clean Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Department</span>
            <span className="font-semibold text-slate-900 block">{project.department}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Contractor</span>
            <span className="font-semibold text-slate-900 block">{project.contractorName}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Planned Schedule</span>
            <span className="font-semibold text-slate-900 font-mono block">{project.startDate} to {project.endDate}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Traffic Impact</span>
            <span className="font-medium text-slate-700 block">{project.laneImpact || 'Standard single lane staging'}</span>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-6 space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Scope & Purpose
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            {project.purpose}
          </p>
        </div>

        {/* Latest Update */}
        <div className="mb-6 space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Latest Update</span>
          </h4>
          <div className="text-xs text-slate-700 bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl">
            {project.latestUpdate || 'No status changes recorded.'}
          </div>
        </div>

        {/* Completion Ticket Details (if any) */}
        {project.completionTicket && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
            <strong className="text-amber-900 block font-semibold">Contractor Completion Request Docket</strong>
            <p className="text-amber-800">{project.completionTicket.contractorNotes}</p>
            {project.completionTicket.flaggedForComplaints && (
              <div className="text-[11px] font-medium text-rose-700 pt-1">
                Notice: Flagged for reviewer due to active citizen reports on this corridor.
              </div>
            )}
          </div>
        )}

        {/* Supporting Documents (Section 2.A & 2.B) */}
        <div className="mb-6 space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Public Permits & Review Documents ({project.documents?.length || 0})
          </h4>
          
          <div className="space-y-2">
            {(project.documents || []).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{doc.name}</span>
                  <span className="text-[11px] text-slate-500">{doc.type} • Uploaded {doc.uploadDate}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onReportIssue) onReportIssue(project);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Submit Report on This Project</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
