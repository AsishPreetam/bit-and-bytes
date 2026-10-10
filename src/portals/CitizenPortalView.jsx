import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Lightbulb, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  ThumbsUp,
  Calendar
} from 'lucide-react';
import ProjectDetailModal from '../components/ProjectDetailModal';
import ReportIssueModal from '../components/ReportIssueModal';
import SuggestImprovementModal from '../components/SuggestImprovementModal';
import { useAuth } from '../context/AuthContext';
import { 
  reverseGeocodeGeoapify, 
  calculateHaversineDistance, 
  formatVicinityDistance 
} from '../services/geoapify';

export default function CitizenPortalView({ 
  projects, 
  complaints, 
  suggestions, 
  onBackToLanding, 
  onUpvoteSuggestion,
  onRefreshData 
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [preselectedProjectForReport, setPreselectedProjectForReport] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [locationNotice, setLocationNotice] = useState(null);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'my-reports', 'suggestions'

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        const geoInfo = await reverseGeocodeGeoapify(coords.lat, coords.lng);
        setLocationAddress(geoInfo);
        setLocationNotice(`📍 Showing works within ${radiusKm} km of ${geoInfo.locality || 'your location'}.`);
      },
      () => {
        setLocationNotice('Location access was not granted. Showing all city projects.');
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleSelectPresetArea = async (lat, lng, name) => {
    const coords = { lat, lng };
    setUserLocation(coords);
    const geoInfo = await reverseGeocodeGeoapify(lat, lng);
    setLocationAddress(geoInfo);
    setLocationNotice(`📍 Showing works in vicinity of ${name}.`);
  };

  const processedProjects = (projects || []).map((p) => {
    let distanceKm = null;
    if (userLocation && p.lat && p.lng) {
      distanceKm = calculateHaversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
    }
    return { ...p, distanceKm };
  });

  const filteredProjects = processedProjects.filter((p) => {
    if (statusFilter !== 'All') {
      if (p.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name && p.name.toLowerCase().includes(q);
      const matchRoad = p.roadSegment && p.roadSegment.toLowerCase().includes(q);
      const matchDept = p.department && p.department.toLowerCase().includes(q);
      const matchCont = p.contractorName && p.contractorName.toLowerCase().includes(q);
      if (!matchName && !matchRoad && !matchDept && !matchCont) return false;
    }

    if (userLocation && p.distanceKm != null && radiusKm !== 'all') {
      if (p.distanceKm > Number(radiusKm)) return false;
    }

    return true;
  });

  if (userLocation) {
    filteredProjects.sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
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
                  Citizen Portal
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {user ? `${user.name} (${user.role})` : 'Public Resident View'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore local road works, track issue reports, and propose civic improvements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setPreselectedProjectForReport(null);
                setReportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => setSuggestModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
              <span>Suggest Improvement</span>
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Public Works ({filteredProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'my-reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Track Reports ({(complaints || []).length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'suggestions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Community Ideas ({(suggestions || []).length})
          </button>
        </div>

        {/* Tab 1: Explore Works */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="clean-card p-4 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search road corridor, agency, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {['All', 'Active', 'Approved/Planned', 'Delayed', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRequestLocation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 cursor-pointer ${
                  userLocation
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{userLocation ? 'GPS Radius Active' : 'Filter by Radius'}</span>
              </button>
            </div>

            {locationNotice && (
              <div className="text-xs text-sky-700 p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <span>{locationNotice}</span>
                <button onClick={() => setLocationNotice(null)} className="underline cursor-pointer">Dismiss</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="clean-card p-6 bg-white flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {p.status}
                        </span>

                        {p.distanceKm != null && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5 text-sky-600" />
                            {formatVicinityDistance(p.distanceKm)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {p.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-3">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{p.roadSegment}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {p.purpose}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Agency: <strong className="text-slate-800">{p.contractorName}</strong></span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 text-xs">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Track Citizen Reports */}
        {activeTab === 'my-reports' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Submitted Community Reports</h3>
                <p className="text-xs text-slate-500">Track investigation decisions recorded by municipal inspectors.</p>
              </div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                + New Report
              </button>
            </div>

            <div className="space-y-3">
              {(complaints || []).map((c) => (
                <div key={c.id} className="clean-card p-5 bg-white flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                      <span className="text-xs font-mono text-slate-400">Ticket #{c.id}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{c.projectName}</h4>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">"{c.description}"</p>
                    <div className="text-[11px] text-slate-500">
                      Category: <strong className="text-slate-700 capitalize">{c.category}</strong> • Locality: {c.locality}
                    </div>
                  </div>

                  <div className="sm:max-w-xs shrink-0 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-semibold text-slate-900 block text-[11px]">Municipal Status:</span>
                    <p className="text-slate-600 text-xs">{c.municipalResponse || 'Under review by municipal engineering dispatch.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Community Ideas */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="clean-card p-4 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Community Civic Recommendations</h3>
                <p className="text-xs text-slate-500">Endorse recommendations for municipal engineers to review.</p>
              </div>
              <button
                onClick={() => setSuggestModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
              >
                + Suggest Idea
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(suggestions || []).map((s) => (
                <div key={s.id} className="clean-card p-6 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        s.status === 'Converted to Proposal'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {s.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">#{s.id}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{s.title}</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">"{s.description}"</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] truncate max-w-[150px]">{s.road}</span>
                    <button
                      onClick={() => onUpvoteSuggestion(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-sky-800 font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{s.upvotes || 0} Endorse</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onReportIssue={(proj) => {
          setPreselectedProjectForReport(proj);
          setReportModalOpen(true);
        }}
      />

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        projects={projects}
        preselectedProject={preselectedProjectForReport}
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
    </div>
  );
}
