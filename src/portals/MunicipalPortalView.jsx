import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  GitMerge, 
  Clock, 
  ArrowLeft, 
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';
import { 
  updateProjectStatus, 
  proposeAlternativeSchedule, 
  inspectProject, 
  updateDocumentStatus, 
  updateReportStatus, 
  convertSuggestionToProposal 
} from '../api';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useAuth } from '../context/AuthContext';

export default function MunicipalPortalView({ 
  projects, 
  complaints, 
  suggestions, 
  onBackToLanding, 
  onRefreshData 
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('review-queue'); // 'review-queue', 'inspections', 'conflicts', 'citizen-triage', 'suggestions-incubator'
  const [selectedProject, setSelectedProject] = useState(null);

  // Modals state
  const [statusTargetProject, setStatusTargetProject] = useState(null);
  const [newStatus, setNewStatus] = useState('Approved/Planned');
  const [statusNote, setStatusNote] = useState('');

  const [proposeScheduleProject, setProposeScheduleProject] = useState(null);
  const [altStart, setAltStart] = useState('');
  const [altEnd, setAltEnd] = useState('');
  const [altReason, setAltReason] = useState('');

  const [inspectionTargetProject, setInspectionTargetProject] = useState(null);
  const [inspectionOutcome, setInspectionOutcome] = useState('Approved');
  const [inspectionReason, setInspectionReason] = useState('');
  const [inspectorName, setInspectorName] = useState(user?.name || 'Chief Municipal Inspector Verma');

  const [triageTargetComplaint, setTriageTargetComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState('Verified');
  const [municipalComplaintResponse, setMunicipalComplaintResponse] = useState('');

  const pendingProjects = (projects || []).filter(p => p.status === 'Proposed' || p.status === 'Under Review');
  const awaitingInspectionProjects = (projects || []).filter(p => p.status === 'Awaiting Inspection');
  const openComplaints = (complaints || []).filter(c => c.status === 'Submitted' || c.status === 'Under Review');

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusTargetProject) return;
    try {
      await updateProjectStatus(statusTargetProject.id, newStatus, statusNote, user?.name || 'Municipal Officer');
      setStatusTargetProject(null);
      setStatusNote('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleProposeScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!proposeScheduleProject || !altStart || !altEnd) return;
    try {
      await proposeAlternativeSchedule(proposeScheduleProject.id, {
        proposedStart: altStart,
        proposedEnd: altEnd,
        reason: altReason.trim() || 'Alternative dates proposed to resolve corridor overlap.',
        actor: user?.name || 'Municipal Coordinator'
      });
      setProposeScheduleProject(null);
      setAltStart('');
      setAltEnd('');
      setAltReason('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to propose schedule: ' + err.message);
    }
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!inspectionTargetProject) return;

    if (inspectionOutcome === 'Rejected' && !inspectionReason.trim()) {
      alert('A rejection reason is strictly required when denying completion.');
      return;
    }

    try {
      await inspectProject(inspectionTargetProject.id, {
        outcome: inspectionOutcome,
        reason: inspectionReason.trim(),
        inspectorName: inspectorName.trim()
      });
      setInspectionTargetProject(null);
      setInspectionReason('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to record inspection: ' + err.message);
    }
  };

  const handleVerifyDocument = async (projectId, docId, status) => {
    try {
      await updateDocumentStatus(projectId, docId, {
        status,
        notes: `Reviewed as ${status} by Municipal Engineering Division`,
        reviewerName: user?.name || 'Municipal Document Reviewer'
      });
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to update document: ' + err.message);
    }
  };

  const handleComplaintTriageSubmit = async (e) => {
    e.preventDefault();
    if (!triageTargetComplaint) return;
    try {
      await updateReportStatus(triageTargetComplaint.id, {
        status: complaintStatus,
        municipalResponse: municipalComplaintResponse.trim() || `Marked ${complaintStatus} following physical site assessment.`,
        reviewerName: user?.name || 'Ward Safety Inspector'
      });
      setTriageTargetComplaint(null);
      setMunicipalComplaintResponse('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to update complaint: ' + err.message);
    }
  };

  const handleConvertSuggestion = async (suggestionId, road) => {
    const officer = user?.name || 'Urban Planning Director';
    try {
      await convertSuggestionToProposal(suggestionId, {
        officerName: officer,
        department: 'Municipal Road Extension & Paving',
        targetRoadSegment: road
      });
      alert('Suggestion successfully converted into an official municipal project proposal!');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to convert: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Municipal Command Center
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {user ? `${user.name} (${user.badge || 'Authority'})` : 'Official Access'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted projects, resolve spatial scheduling clashes, inspect work, and triage citizen reports.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
            * Simulated Demo Administrative Console
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab('review-queue')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'review-queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review & Permits ({pendingProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'inspections'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-yellow-600" />
            <span>Completion Inspections ({awaitingInspectionProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'conflicts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5 text-amber-600" />
            <span>Conflict Center</span>
          </button>
          <button
            onClick={() => setActiveTab('citizen-triage')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'citizen-triage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>Citizen Triage ({openComplaints.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('suggestions-incubator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'suggestions-incubator'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Idea Incubator</span>
          </button>
        </div>

        {/* Tab 1: Review Queue */}
        {activeTab === 'review-queue' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Projects Awaiting Review</h3>
                <p className="text-xs text-slate-500">Approve public works or request adjustments before road mobilization.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {pendingProjects.length} pending
              </span>
            </div>

            {pendingProjects.length === 0 ? (
              <div className="clean-card p-12 bg-white text-center text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-800 font-bold">All Submissions Reviewed</p>
                <p>No new projects currently pending clearance.</p>
              </div>
            ) : (
              pendingProjects.map((p) => (
                <div key={p.id} className="clean-card p-6 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          {p.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {p.id}</span>
                        <span className="text-xs text-slate-500">• {p.department}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Corridor: {p.roadSegment} • Dates: {p.startDate} to {p.endDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setStatusTargetProject(p);
                          setNewStatus('Approved/Planned');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setStatusTargetProject(p);
                          setNewStatus('Changes Requested');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-amber-800 border border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Scope:</strong> {p.purpose}
                  </p>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Supporting Permits:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(p.documents || []).map((doc) => (
                        <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-900 block">{doc.name}</span>
                            <span className="text-[11px] text-slate-500">Status: {doc.status}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyDocument(p.id, doc.id, 'Verified')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyDocument(p.id, doc.id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Inspections */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Completion Inspection Queue</h3>
                <p className="text-xs text-slate-500">
                  Inspect completed road work and review active citizen complaints before marking Completed.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {awaitingInspectionProjects.length} awaiting inspection
              </span>
            </div>

            {awaitingInspectionProjects.length === 0 ? (
              <div className="clean-card p-12 bg-white text-center text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-800 font-bold">No Pending Inspections</p>
                <p>All completed works have been inspected and signed off.</p>
              </div>
            ) : (
              awaitingInspectionProjects.map((p) => {
                const linkedComplaints = (complaints || []).filter(
                  c => c.projectId === p.id && (c.status === 'Submitted' || c.status === 'Under Review')
                );

                return (
                  <div key={p.id} className="clean-card p-6 bg-white space-y-4 border-yellow-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200 inline-block mb-1">
                          Awaiting Inspection
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                        <div className="text-xs text-slate-500">Agency: {p.contractorName} • Corridor: {p.roadSegment}</div>
                      </div>

                      <button
                        onClick={() => {
                          setInspectionTargetProject(p);
                          setInspectionOutcome('Approved');
                          setInspectionReason('Surface reinstatement and density verified on site.');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Record Sign-Off
                      </button>
                    </div>

                    {p.completionTicket && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <strong className="text-slate-800 block">Contractor Notes:</strong>
                        <p className="text-slate-600">"{p.completionTicket.contractorNotes}"</p>
                      </div>
                    )}

                    {/* Surfacing Open Complaints directly */}
                    {linkedComplaints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                        <strong className="text-rose-900 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flagged: {linkedComplaints.length} Unresolved Citizen Report(s) on this project</span>
                        </strong>
                        {linkedComplaints.map(c => (
                          <p key={c.id} className="text-[11px] text-rose-800 bg-white/80 p-2 rounded-lg">
                            {c.category.toUpperCase()}: "{c.description}" (Reported by {c.submittedBy})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Conflicts Center */}
        {activeTab === 'conflicts' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white">
              <h3 className="text-sm font-bold text-slate-900">Corridor Conflict Warnings</h3>
              <p className="text-xs text-slate-500">
                Overlapping projects on the same road segment flagged for municipal coordination review.
              </p>
            </div>

            {projects.filter(p => p.status === 'Proposed' && p.latestUpdate?.includes('CONFLICT WARNING')).map(p => (
              <div key={p.id} className="clean-card p-6 bg-white space-y-4 border-amber-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Corridor Conflict: {p.roadSegment}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{p.name}</h4>
                    <p className="text-xs text-slate-500">Agency: {p.contractorName} • Dates: {p.startDate} to {p.endDate}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProposeScheduleProject(p);
                      const d = new Date(p.endDate);
                      d.setDate(d.getDate() + 7);
                      setAltStart(p.endDate);
                      setAltEnd(d.toISOString().split('T')[0]);
                      setAltReason('Shifts project immediately following prior contractor completion to avoid double digging.');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Propose Alternative Dates
                  </button>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {p.latestUpdate}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Citizen Report Triage */}
        {activeTab === 'citizen-triage' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Citizen Report Investigation Queue</h3>
                <p className="text-xs text-slate-500">Due Process: Unverified reports never count against contractors until marked Verified.</p>
              </div>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                {openComplaints.length} pending triage
              </span>
            </div>

            {openComplaints.map((c) => (
              <div key={c.id} className="clean-card p-5 bg-white flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {c.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{c.id}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{c.projectName}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">"{c.description}"</p>
                  <div className="text-[11px] text-slate-500">
                    Category: <strong className="text-slate-700 capitalize">{c.category}</strong> • Reporter: {c.submittedBy}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setTriageTargetComplaint(c);
                      setComplaintStatus('Verified');
                      setMunicipalComplaintResponse('Site inspected by Municipal Ward Officer. Violation confirmed. Contractor notified for remedial action.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer"
                  >
                    Verify Violation
                  </button>
                  <button
                    onClick={() => {
                      setTriageTargetComplaint(c);
                      setComplaintStatus('Resolved');
                      setMunicipalComplaintResponse('Contractor rectified condition. Sweeper clean-up complete and site verified clear.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => {
                      setTriageTargetComplaint(c);
                      setComplaintStatus('Rejected');
                      setMunicipalComplaintResponse('Inspection found contractor working within permitted hours and approved noise guidelines.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Reject Allegation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Idea Incubator */}
        {activeTab === 'suggestions-incubator' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white">
              <h3 className="text-sm font-bold text-slate-900">Community Idea Adoption</h3>
              <p className="text-xs text-slate-500">Convert high-priority citizen suggestions into official municipal project proposals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(suggestions || []).map((s) => (
                <div key={s.id} className="clean-card p-6 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        s.status === 'Converted to Proposal' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {s.status}
                      </span>
                      <span className="text-xs font-bold text-sky-700">👍 {s.upvotes || 0} votes</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{s.title}</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">"{s.description}"</p>
                    <div className="text-[11px] text-slate-500">Corridor: {s.road}</div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    {s.status === 'Converted to Proposal' ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center font-medium">
                        ✓ Adopted into Public Works Pipeline
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConvertSuggestion(s.id, s.road)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Adopt as Official Proposal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Decision Status Modal */}
      {statusTargetProject && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setStatusTargetProject(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <button 
              type="button"
              onClick={() => setStatusTargetProject(null)} 
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Update Project Decision</h3>
            <p className="text-xs text-slate-500 mb-4">{statusTargetProject.name}</p>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                >
                  <option value="Approved/Planned">Approved / Planned</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Changes Requested">Changes Requested</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Municipal Review Note</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 resize-none"
                  placeholder="Record justification..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusTargetProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Schedule Modal */}
      {proposeScheduleProject && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setProposeScheduleProject(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <button 
              type="button"
              onClick={() => setProposeScheduleProject(null)} 
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Propose Alternative Dates</h3>
            <p className="text-xs text-slate-500 mb-4">{proposeScheduleProject.name}</p>

            <form onSubmit={handleProposeScheduleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Start</label>
                  <input
                    type="date"
                    value={altStart}
                    onChange={(e) => setAltStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed End</label>
                  <input
                    type="date"
                    value={altEnd}
                    onChange={(e) => setAltEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rationale</label>
                <textarea
                  rows={2}
                  value={altReason}
                  onChange={(e) => setAltReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProposeScheduleProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {inspectionTargetProject && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setInspectionTargetProject(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <button 
              type="button"
              onClick={() => setInspectionTargetProject(null)} 
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Physical Completion Inspection</h3>
            <p className="text-xs text-slate-500 mb-4">{inspectionTargetProject.name}</p>

            <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInspectionOutcome('Approved')}
                  className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    inspectionOutcome === 'Approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ✓ Approve (Completed)
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionOutcome('Rejected')}
                  className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    inspectionOutcome === 'Rejected' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ✕ Reject (Failed)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Findings / Inspection Notes</label>
                <textarea
                  rows={3}
                  value={inspectionReason}
                  onChange={(e) => setInspectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 resize-none"
                  placeholder="Record compaction and surface restoration observations..."
                  required={inspectionOutcome === 'Rejected'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectionTargetProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Triage Complaint Modal */}
      {triageTargetComplaint && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setTriageTargetComplaint(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <button 
              type="button"
              onClick={() => setTriageTargetComplaint(null)} 
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Triage Report #{triageTargetComplaint.id}</h3>
            <p className="text-xs text-slate-500 mb-4">{triageTargetComplaint.category}</p>

            <form onSubmit={handleComplaintTriageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={complaintStatus}
                  onChange={(e) => setComplaintStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                >
                  <option value="Verified">Verified (Confirmed Violation)</option>
                  <option value="Resolved">Resolved (Remediated & Closed)</option>
                  <option value="Rejected">Rejected (Unsubstantiated)</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Municipal Action Note</label>
                <textarea
                  rows={3}
                  value={municipalComplaintResponse}
                  onChange={(e) => setMunicipalComplaintResponse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTriageTargetComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  Confirm Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      />

    </div>
  );
}
