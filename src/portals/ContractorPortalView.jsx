import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Plus, 
  GitMerge, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  Truck, 
  Send,
  Upload,
  Check,
  X
} from 'lucide-react';
import { 
  createProject, 
  checkConflictsDryRun, 
  respondToScheduleProposal, 
  requestCompletion 
} from '../api';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useAuth } from '../context/AuthContext';

export default function ContractorPortalView({ 
  projects, 
  contractors, 
  roadSegments, 
  onBackToLanding, 
  onRefreshData 
}) {
  const { user } = useAuth();
  const [selectedContractorId, setSelectedContractorId] = useState(user?.contractorId || 'cont-2');
  const [activeTab, setActiveTab] = useState('my-projects'); // 'my-projects', 'new-project', 'conflicts-proposals'
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'Water Supply & Sewerage Board',
    roadSegment: 'MG Road Corridor - Sector 4 to 8',
    startDate: '',
    endDate: '',
    purpose: '',
    heavyEquipment: false,
    laneImpact: 'Single lane cordoned for night work',
  });

  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(null);

  // Completion Request State
  const [completionTargetProject, setCompletionTargetProject] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionCertificate, setCompletionCertificate] = useState('LAB-DENSITY-PASS-98.5%');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);

  // Schedule Response State
  const [respondingProposalId, setRespondingProposalId] = useState(null);
  const [responseReason, setResponseReason] = useState('');

  const activeContractor = (contractors || []).find(c => c.id === selectedContractorId) || { name: user?.contractorName || 'Apex Civil Infrastructure' };
  const contractorProjects = (projects || []).filter(
    p => p.contractorId === selectedContractorId || (p.contractorName && p.contractorName.toLowerCase() === activeContractor.name?.toLowerCase())
  );

  const contractorProposals = contractorProjects.flatMap(p => 
    (p.proposals || []).filter(prop => prop.status === 'Pending Contractor Response').map(prop => ({ ...prop, project: p }))
  );

  // Dry-run conflict check
  useEffect(() => {
    if (formData.roadSegment && formData.startDate && formData.endDate) {
      if (formData.startDate <= formData.endDate) {
        setDryRunLoading(true);
        checkConflictsDryRun({
          name: formData.name,
          roadSegment: formData.roadSegment,
          startDate: formData.startDate,
          endDate: formData.endDate,
          heavyEquipment: formData.heavyEquipment,
          department: formData.department
        })
        .then(res => {
          setDryRunResult(res);
          setDryRunLoading(false);
        })
        .catch(() => {
          setDryRunLoading(false);
        });
      }
    } else {
      setDryRunResult(null);
    }
  }, [formData.roadSegment, formData.startDate, formData.endDate, formData.heavyEquipment]);

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(null);

    if (!formData.name || !formData.startDate || !formData.endDate || !formData.purpose) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        ...formData,
        contractorId: selectedContractorId,
        contractorName: activeContractor.name,
      };

      const result = await createProject(payload);
      setFormSuccess(result);
      setFormData({
        name: '',
        department: 'Water Supply & Sewerage Board',
        roadSegment: 'MG Road Corridor - Sector 4 to 8',
        startDate: '',
        endDate: '',
        purpose: '',
        heavyEquipment: false,
        laneImpact: 'Single lane cordoned for night work',
      });
      setDryRunResult(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setFormError(err.message || 'Failed to submit proposed project.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleScheduleResponse = async (projectId, proposalId, action) => {
    try {
      await respondToScheduleProposal(projectId, {
        proposalId,
        action,
        reason: responseReason.trim() || (action === 'accept' ? 'Agreed to shift schedule.' : 'Contractor crew committed elsewhere.'),
        contractorName: activeContractor.name
      });
      setRespondingProposalId(null);
      setResponseReason('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error responding to proposal: ' + err.message);
    }
  };

  const handleRequestCompletionSubmit = async (e) => {
    e.preventDefault();
    if (!completionTargetProject) return;

    setCompletionSubmitting(true);
    try {
      await requestCompletion(completionTargetProject.id, {
        contractorNotes: completionNotes.trim() || 'Work executed according to municipal specification. Site cleared.',
        evidencePhoto: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80',
        densityCertificate: completionCertificate,
        contractorName: activeContractor.name
      });
      setCompletionTargetProject(null);
      setCompletionNotes('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to request completion: ' + err.message);
    } finally {
      setCompletionSubmitting(false);
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
                  Contractor Portal
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {activeContractor.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit public works proposals, run clash pre-checks, and file completion inspection dockets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 hidden sm:block">Firm:</label>
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              {(contractors || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'my-projects'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assigned Projects ({contractorProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('new-project')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'new-project'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose Work</span>
          </button>
          <button
            onClick={() => setActiveTab('conflicts-proposals')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'conflicts-proposals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Coordination Notices ({contractorProposals.length})</span>
          </button>
        </div>

        {/* Tab 1: Projects List */}
        {activeTab === 'my-projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractorProjects.map((p) => (
              <div
                key={p.id}
                className="clean-card p-6 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      p.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : p.status === 'Awaiting Inspection'
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        : p.status === 'Inspection Failed'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">ID: {p.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {p.name}
                  </h3>

                  <div className="text-xs text-slate-500 font-medium mb-3">
                    Corridor: <span className="text-slate-700">{p.roadSegment}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {p.purpose}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>Schedule:</span>
                      <strong className="text-slate-800 font-mono">{p.startDate} → {p.endDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {p.status === 'Active' && (
                    <button
                      onClick={() => setCompletionTargetProject(p)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Ready for Inspection</span>
                    </button>
                  )}

                  {p.status === 'Awaiting Inspection' && (
                    <div className="p-2 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 text-center font-medium">
                      Awaiting Municipal Field Sign-Off
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedProject(p)}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    View Dossier & Permits
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Propose Work with Live Clash Detector */}
        {activeTab === 'new-project' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="clean-card p-6 sm:p-8 bg-white space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Propose New Public Works Project</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Projects enter in "Proposed" status. Municipal approval controls transition to active execution.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <strong className="block font-semibold">Registered: {formSuccess.project?.id}</strong>
                    <p>Status set to Proposed. Awaiting municipal schedule & permit review.</p>
                  </div>
                )}

                <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 8 Potable Water Feeder Main Replacement"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                      >
                        <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
                        <option value="City Power & Energy Corporation">City Power & Energy Corporation</option>
                        <option value="Urban Drainage Authority">Urban Drainage Authority</option>
                        <option value="Municipal Road Extension & Paving">Municipal Road Extension & Paving</option>
                        <option value="Urban Telecom & Smart Infrastructure">Urban Telecom & Smart Infrastructure</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Road Corridor *</label>
                      <select
                        value={formData.roadSegment}
                        onChange={(e) => setFormData({ ...formData, roadSegment: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-900"
                      >
                        {(roadSegments || []).map((seg) => (
                          <option key={seg.id} value={seg.name}>
                            {seg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scope & Purpose *</label>
                    <textarea
                      rows={3}
                      placeholder="Explain engineering objectives and materials..."
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="contractorHeavyEq"
                      checked={formData.heavyEquipment}
                      onChange={(e) => setFormData({ ...formData, heavyEquipment: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                    />
                    <label htmlFor="contractorHeavyEq" className="text-slate-700 cursor-pointer flex items-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Requires Heavy Excavation Machinery</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{formSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Live Clash Pre-Check Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="clean-card p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <GitMerge className="w-4 h-4 text-amber-600" />
                    <span>Real-Time Clash Check</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Automatic</span>
                </div>

                {!formData.startDate || !formData.endDate ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Enter planned start and end dates to check for corridor conflicts.
                  </p>
                ) : dryRunLoading ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Evaluating corridor schedule on {formData.roadSegment}...
                  </p>
                ) : dryRunResult?.hasConflict ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <strong className="block font-bold">Corridor Conflict Flagged: {dryRunResult.conflictCount} Clash</strong>
                      <p className="text-[11px] text-rose-700">Dates overlap with an active project on this street.</p>
                    </div>

                    {dryRunResult.conflicts.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-900 block">{c.existingProjectName}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">Dates: {c.overlapStart} to {c.overlapEnd}</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{c.explanation}</p>
                      </div>
                    ))}

                    {dryRunResult.suggestedAlternative && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                        <strong className="text-emerald-900 block font-bold">Suggested Alternative Window:</strong>
                        <div className="font-mono text-emerald-800 font-bold">
                          {dryRunResult.suggestedAlternative.proposedStart} → {dryRunResult.suggestedAlternative.proposedEnd}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            startDate: dryRunResult.suggestedAlternative.proposedStart,
                            endDate: dryRunResult.suggestedAlternative.proposedEnd
                          })}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Adopt Alternative Window
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <strong className="block font-bold">Road Corridor Clear</strong>
                    <p className="text-[11px] text-emerald-700">No overlapping projects during selected window.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Coordination Notices */}
        {activeTab === 'conflicts-proposals' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white">
              <h3 className="text-sm font-bold text-slate-900">Alternative Schedule Coordination Notices</h3>
              <p className="text-xs text-slate-500">
                Municipal coordinators may recommend shifting dates. Your schedule is never changed without explicit approval.
              </p>
            </div>

            {contractorProposals.length === 0 ? (
              <div className="clean-card p-12 bg-white text-center text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-800 font-bold">All Confirmed Dates Clear</p>
                <p>No pending schedule change proposals awaiting your review.</p>
              </div>
            ) : (
              contractorProposals.map((prop) => (
                <div key={prop.id} className="clean-card p-6 bg-white space-y-4 border-amber-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-base font-bold text-slate-900">{prop.projectName}</h4>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Awaiting Your Decision
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Current Window:</span>
                      <strong className="text-slate-900">{prop.originalDates}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 block">Proposed Window:</span>
                      <strong className="text-emerald-900">{prop.proposedDates}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Reason:</strong> {prop.reason}
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleScheduleResponse(prop.projectId, prop.id, 'reject')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Decline Change
                    </button>
                    <button
                      onClick={() => handleScheduleResponse(prop.projectId, prop.id, 'accept')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Accept & Reschedule
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Completion Request Modal */}
      {completionTargetProject && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setCompletionTargetProject(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setCompletionTargetProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Request Completion Inspection</h3>
            <p className="text-xs text-slate-500 mb-4">{completionTargetProject.name}</p>

            <form onSubmit={handleRequestCompletionSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                Note: Project status will move to <strong>Awaiting Inspection</strong> until municipal field engineers inspect and approve.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Completion Notes *</label>
                <textarea
                  rows={3}
                  placeholder="Detail completion of backfilling, asphalt compaction, and street clearing..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lab / Quality Certificate</label>
                <input
                  type="text"
                  value={completionCertificate}
                  onChange={(e) => setCompletionCertificate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletionTargetProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completionSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {completionSubmitting ? 'Submitting...' : 'Submit for Inspection'}
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
