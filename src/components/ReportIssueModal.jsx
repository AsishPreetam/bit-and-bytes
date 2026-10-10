import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle, ShieldCheck, Camera } from 'lucide-react';
import { submitReport } from '../api';
import { useModalBehavior } from '../hooks/useModalBehavior';

export default function ReportIssueModal({ isOpen, onClose, projects, preselectedProject, onReportSubmitted }) {
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose);
  const [projectId, setProjectId] = useState(preselectedProject ? preselectedProject.id : '');
  const [category, setCategory] = useState('poor workmanship');
  const [locality, setLocality] = useState(preselectedProject ? preselectedProject.roadSegment : '');
  const [description, setDescription] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const categories = [
    { value: 'incomplete work', label: 'Incomplete Work / Abandoned Site' },
    { value: 'delay', label: 'Unreasonable Project Delay / Blocked Access' },
    { value: 'poor workmanship', label: 'Poor Workmanship / Loose Gravel' },
    { value: 'unauthorized digging', label: 'Unauthorized Digging / No Notice' },
    { value: 'other', label: 'Other Road Hazard' },
  ];

  const handleSimulatePhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please describe the issue.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        projectId: projectId || null,
        category,
        description: description.trim(),
        locality: locality.trim() || 'Central Road Network',
        submittedBy: submittedBy.trim() || 'Concerned Citizen',
        photo: photoPreview
      };

      const result = await submitReport(payload);
      setSuccessResult(result);
      if (onReportSubmitted) onReportSubmitted(result);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Report Successfully Logged</h3>
            <p className="text-xs text-slate-600">
              Reference Ticket: <strong>#{successResult.id}</strong>. Municipal staff will investigate before reviewing against contractor records.
            </p>
            <button
              onClick={() => {
                setSuccessResult(null);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Report an Issue</h3>
                <p className="text-xs text-slate-500">Alerts municipal dispatch and records ticket</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Project (Optional)</label>
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    const sel = (projects || []).find(p => p.id === e.target.value);
                    if (sel) setLocality(sel.roadSegment);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">General Road Hazard</option>
                  {(projects || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.roadSegment})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Road / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. MG Road Corridor near Metro Pillar 188"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue, hazards to pedestrians/drivers, blocked driveways..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name / Contact (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Priya S. / resident@email.com"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Due Process: Reports are logged as allegations until verified by municipal inspectors.</span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Issue'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
