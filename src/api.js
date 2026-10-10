/**
 * CivicSync Client API Service
 */

const API_BASE = '/api';

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function signupUser(userData) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Signup failed');
  }
  return res.json();
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchPersonas() {
  const res = await fetch(`${API_BASE}/auth/personas`);
  if (!res.ok) throw new Error('Failed to load demo personas');
  return res.json();
}


export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load civic statistics');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/contractors/leaderboard`);
  if (!res.ok) throw new Error('Failed to load contractor leaderboard');
  return res.json();
}

export async function fetchRoadSegments() {
  const res = await fetch(`${API_BASE}/road-segments`);
  if (!res.ok) throw new Error('Failed to load road segments');
  return res.json();
}

export async function fetchContractors() {
  const res = await fetch(`${API_BASE}/contractors`);
  if (!res.ok) throw new Error('Failed to load contractors');
  return res.json();
}

export async function fetchProjects(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, val);
    }
  });

  const url = `${API_BASE}/projects${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load public infrastructure projects');
  return res.json();
}

export async function fetchProjectById(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error(`Failed to load project details for ${id}`);
  return res.json();
}

export async function checkConflictsDryRun(data) {
  const res = await fetch(`${API_BASE}/projects/check-conflicts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Conflict simulation failed');
  }
  return res.json();
}

export async function createProject(projectData) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit proposed project');
  }
  return res.json();
}

export async function updateProjectStatus(projectId, status, note, actor = 'Municipal Staff') {
  const res = await fetch(`${API_BASE}/projects/${projectId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, actor })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project status');
  }
  return res.json();
}

export async function proposeAlternativeSchedule(projectId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/propose-schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to propose alternative schedule');
  }
  return res.json();
}

export async function respondToScheduleProposal(projectId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/respond-schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit schedule response');
  }
  return res.json();
}

export async function requestCompletion(projectId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/request-completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to request completion');
  }
  return res.json();
}

export async function inspectProject(projectId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to record inspection outcome');
  }
  return res.json();
}

export async function updateDocumentStatus(projectId, docId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update document status');
  }
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to load citizen reports');
  return res.json();
}

export async function submitReport(reportData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit citizen report');
  }
  return res.json();
}

export async function updateReportStatus(reportId, data) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update report status');
  }
  return res.json();
}

export async function fetchSuggestions() {
  const res = await fetch(`${API_BASE}/suggestions`);
  if (!res.ok) throw new Error('Failed to load citizen suggestions');
  return res.json();
}

export async function submitSuggestion(data) {
  const res = await fetch(`${API_BASE}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit road suggestion');
  }
  return res.json();
}

export async function upvoteSuggestion(id) {
  const res = await fetch(`${API_BASE}/suggestions/${id}/upvote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to upvote suggestion');
  return res.json();
}

export async function convertSuggestionToProposal(id, data) {
  const res = await fetch(`${API_BASE}/suggestions/${id}/convert-to-proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to convert suggestion into proposal');
  }
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchAllConflicts() {
  const res = await fetch(`${API_BASE}/conflicts`);
  if (!res.ok) throw new Error('Failed to fetch conflicts');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset-data`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo database');
  return res.json();
}
