import React, { useState, useEffect } from 'react';
import { 
  fetchStats, 
  fetchLeaderboard, 
  fetchProjects, 
  fetchRoadSegments, 
  fetchContractors, 
  fetchReports, 
  fetchSuggestions, 
  fetchAuditLogs,
  upvoteSuggestion
} from './api';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProjectStatistics from './components/ProjectStatistics';
import WhatCivicSyncDoes from './components/WhatCivicSyncDoes';
import TopContractors from './components/TopContractors';
import InteractiveMapSection from './components/InteractiveMapSection';
import HowItWorks from './components/HowItWorks';
import CitizenReportingSection from './components/CitizenReportingSection';
import ImpactMetrics from './components/ImpactMetrics';
import FooterSection from './components/FooterSection';

import CitizenPortalView from './portals/CitizenPortalView';
import ContractorPortalView from './portals/ContractorPortalView';
import MunicipalPortalView from './portals/MunicipalPortalView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function AppContent() {
  const { user, authModalOpen, setAuthModalOpen, requireRole } = useAuth();
  const [activePortal, setActivePortal] = useState(() => {
    const raw = (window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '')).toLowerCase();
    if (['login', 'signup', 'auth', 'citizen', 'contractor', 'municipal'].includes(raw)) {
      return raw === 'auth' ? 'login' : raw;
    }
    return 'landing';
  });
  const [loginRole, setLoginRole] = useState('citizen');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePop = () => {
      const raw = (window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '')).toLowerCase();
      if (['login', 'signup', 'auth', 'citizen', 'contractor', 'municipal'].includes(raw)) {
        setActivePortal(raw === 'auth' ? 'login' : raw);
      } else {
        setActivePortal('landing');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    const targetUrl = activePortal === 'landing' ? '/' : `/${activePortal}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }, [activePortal]);

  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [projects, setProjects] = useState([]);
  const [roadSegments, setRoadSegments] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const loadAllData = async () => {
    try {
      const [
        statsData,
        leaderboardData,
        projectsData,
        roadData,
        contractorsData,
        reportsData,
        suggestionsData,
        logsData
      ] = await Promise.all([
        fetchStats(),
        fetchLeaderboard(),
        fetchProjects(),
        fetchRoadSegments(),
        fetchContractors(),
        fetchReports(),
        fetchSuggestions(),
        fetchAuditLogs()
      ]);

      setStats(statsData);
      setLeaderboard(leaderboardData.leaderboard || []);
      setProjects(projectsData);
      setRoadSegments(roadData);
      setContractors(contractorsData);
      setComplaints(reportsData);
      setSuggestions(suggestionsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpvoteSuggestion = async (id) => {
    try {
      const updated = await upvoteSuggestion(id);
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handlePortalEntry = (portal) => {
    if (portal === 'citizen' || user?.role === portal) {
      setActivePortal(portal);
    } else if (user) {
      requireRole(portal, () => setActivePortal(portal));
    } else {
      setLoginRole(portal);
      setActivePortal('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (selector) => {
    if (activePortal !== 'landing') {
      setActivePortal('landing');
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (activePortal === 'login' || activePortal === 'auth') {
    return (
      <LoginPage
        initialRole={loginRole}
        onNavigateHome={() => {
          setActivePortal('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSignup={() => {
          setActivePortal('signup');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAuthenticatedRole={(role) => {
          if (role === 'contractor') setActivePortal('contractor');
          else if (role === 'municipal') setActivePortal('municipal');
          else setActivePortal('citizen');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (activePortal === 'signup') {
    return (
      <SignupPage
        onNavigateHome={() => {
          setActivePortal('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLogin={() => {
          setActivePortal('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAuthenticatedRole={(role) => {
          if (role === 'contractor') setActivePortal('contractor');
          else if (role === 'municipal') setActivePortal('municipal');
          else setActivePortal('citizen');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Navbar and Portal Entry (Section 7.1) */}
      <Navbar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        onNavigateSection={handleScrollToSection}
      />

      <main className="flex-grow">
        {activePortal === 'landing' && (
          <>
            {/* 2. Hero Section (Section 7.2) */}
            <HeroSection
              onExploreProjects={() => handleScrollToSection('#explore-projects')}
              onOpenContractorPortal={() => handlePortalEntry('contractor')}
            />

            {/* 3. Public Project Statistics (Section 7.3) */}
            <ProjectStatistics stats={stats} loading={loading} />

            {/* 4. What CivicSync Does (Section 7.4) */}
            <WhatCivicSyncDoes />

            {/* 5. Top-Performing Contractors (Section 7.5 & Section 6) */}
            <TopContractors leaderboard={leaderboard} loading={loading} />

            {/* 6. Interactive Map and Nearby Projects (Section 7.6) */}
            <InteractiveMapSection
              projects={projects}
              onSelectProject={(proj) => console.log(proj)}
              onReportIssue={() => handleScrollToSection('#citizen-reports')}
            />

            {/* 7. How CivicSync Works (Section 7.7) */}
            <HowItWorks onSwitchPortal={handlePortalEntry} />

            {/* 8. Citizen Reporting and Feedback (Section 7.8) */}
            <div id="citizen-reports">
              <CitizenReportingSection
                projects={projects}
                complaints={complaints}
                suggestions={suggestions}
                onUpvoteSuggestion={handleUpvoteSuggestion}
                onRefreshData={loadAllData}
              />
            </div>

            {/* 9. Impact Metrics (Section 7.9) */}
            <ImpactMetrics stats={stats} loading={loading} />
          </>
        )}

        {/* Citizen Portal (Section 2.A) */}
        {activePortal === 'citizen' && (
          <CitizenPortalView
            projects={projects}
            complaints={complaints}
            suggestions={suggestions}
            onBackToLanding={() => {
              setActivePortal('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onUpvoteSuggestion={handleUpvoteSuggestion}
            onRefreshData={loadAllData}
          />
        )}

        {/* Contractor Portal (Section 2.B) */}
        {activePortal === 'contractor' && (
          <ContractorPortalView
            projects={projects}
            contractors={contractors}
            roadSegments={roadSegments}
            onBackToLanding={() => {
              setActivePortal('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRefreshData={loadAllData}
          />
        )}

        {/* Municipal Portal (Section 2.C) */}
        {activePortal === 'municipal' && (
          <MunicipalPortalView
            projects={projects}
            complaints={complaints}
            suggestions={suggestions}
            auditLogs={auditLogs}
            onBackToLanding={() => {
              setActivePortal('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRefreshData={loadAllData}
          />
        )}
      </main>

      {/* 10. Final Call to Action and Footer (Section 7.10) */}
      <FooterSection
        onNavigatePortal={handlePortalEntry}
        onScrollToSection={handleScrollToSection}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticatedRole={(role) => {
          if (role === 'contractor') setActivePortal('contractor');
          else if (role === 'municipal') setActivePortal('municipal');
          else setActivePortal('citizen');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
