import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  detectConflicts,
  suggestAlternativeSchedule,
  validateDateRange,
  CONFLICT_ACTIVE_STATUSES
} from './services/conflictEngine.js';
import {
  computeContractorLeaderboard,
  MIN_ELIGIBLE_PROJECTS
} from './services/scoringEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database Paths
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'civicsync_db.json');
const SEED_FILE = path.join(DATA_DIR, 'initial_seed.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Database state with JSON file persistence
let db = null;

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else if (fs.existsSync(SEED_FILE)) {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      db = JSON.parse(raw);
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } else {
      db = {
        contractors: [],
        roadSegments: [],
        projects: [],
        historicalProjects: [],
        complaints: [],
        suggestions: [],
        scheduleProposals: [],
        auditLogs: []
      };
    }
  } catch (err) {
    console.error('Error loading DB, reverting to initial seed:', err);
    const raw = fs.readFileSync(SEED_FILE, 'utf-8');
    db = JSON.parse(raw);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting DB to disk:', err);
  }
}

// Initial DB load
loadDb();

const DEFAULT_USERS = [

  {
    id: 'usr-citizen-1',
    name: 'Priya Sharma',
    email: 'citizen@civicsync.org',
    password: 'demo',
    role: 'citizen',
    locality: 'MG Road Corridor',
    badge: 'Verified Resident'
  },
  {
    id: 'usr-contractor-1',
    name: 'Rajesh Verma',
    email: 'contractor@apexcivil.org',
    password: 'demo',
    role: 'contractor',
    contractorId: 'cont-2',
    contractorName: 'Apex Civil Infrastructure',
    badge: 'Class-A Licensed Contractor'
  },
  {
    id: 'usr-municipal-1',
    name: 'Dr. Ananya Mehta',
    email: 'officer@citygov.org',
    password: 'demo',
    role: 'municipal',
    designation: 'Chief Works Engineer',
    department: 'Urban Infrastructure Authority',
    badge: 'Municipal Authority'
  }
];

// Helper to ensure users are initialized
function ensureUsers() {
  if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
    db.users = [...DEFAULT_USERS];
    saveDb();
  }
}
ensureUsers();

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Helper to log audit activity
function logAudit(actor, action) {
  const entry = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    actor: actor || 'System Officer',
    action
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 100) db.auditLogs.pop();
  saveDb();
  return entry;
}


// ==========================================
// 0. AUTHENTICATION & ROLE MANAGEMENT
// ==========================================
app.get('/api/auth/personas', (req, res) => {
  res.json({
    personas: (db.users || DEFAULT_USERS).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      contractorName: u.contractorName,
      designation: u.designation,
      badge: u.badge
    }))
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);

  // If user doesn't exist, create on the fly with specified role
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email: cleanEmail,
      password: password || 'demo',
      role: role || 'citizen',
      badge: role === 'municipal' ? 'Municipal Staff' : role === 'contractor' ? 'Registered Contractor' : 'Verified Resident',
      contractorId: role === 'contractor' ? 'cont-2' : undefined,
      contractorName: role === 'contractor' ? 'Apex Civil Infrastructure' : undefined
    };
    if (!db.users) db.users = [];
    db.users.push(user);
    saveDb();
  }

  // If role is passed and user's role is different, update role for demo agility
  if (role && user.role !== role) {
    user.role = role;
    saveDb();
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contractorId: user.contractorId,
      contractorName: user.contractorName,
      designation: user.designation,
      department: user.department,
      badge: user.badge
    },
    token: `civic-jwt-${user.id}-${Date.now()}`
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role, contractorName, department } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password: password || 'demo',
    role,
    contractorId: role === 'contractor' ? 'cont-2' : undefined,
    contractorName: contractorName || (role === 'contractor' ? 'Independent Contractor' : undefined),
    department: department || (role === 'municipal' ? 'Public Works Division' : undefined),
    badge: role === 'municipal' ? 'Municipal Staff' : role === 'contractor' ? 'Registered Contractor' : 'Verified Citizen'
  };

  if (!db.users) db.users = [];
  db.users.push(newUser);
  logAudit(newUser.name, `Registered new account as ${role}.`);
  saveDb();

  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      contractorId: newUser.contractorId,
      contractorName: newUser.contractorName,
      department: newUser.department,
      badge: newUser.badge
    },
    token: `civic-jwt-${newUser.id}-${Date.now()}`
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided.' });
  }
  const token = authHeader.split(' ')[1];
  // Extract user ID from token
  const parts = token.split('-');
  const userId = parts.slice(2, -1).join('-') || parts[2];
  const user = (db.users || []).find(u => token.includes(u.id)) || (db.users || [])[0];

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid user.' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contractorId: user.contractorId,
      contractorName: user.contractorName,
      designation: user.designation,
      department: user.department,
      badge: user.badge
    }
  });
});


// ==========================================
// 1. PUBLIC STATS & IMPACT METRICS (Landing page Sections 3 & 9)
// ==========================================
app.get('/api/stats', (req, res) => {
  const allProjects = db.projects || [];
  const allComplaints = db.complaints || [];

  const activeProjects = allProjects.filter(p => p.status === 'Active').length;
  const completedProjects = allProjects.filter(p => p.status === 'Completed').length;
  const awaitingInspection = allProjects.filter(p => p.status === 'Awaiting Inspection').length;
  const delayedProjects = allProjects.filter(p => p.status === 'Delayed').length;

  // Compute active conflicts across all active/planned projects
  const conflicts = [];
  const processedPairs = new Set();

  for (const proj of allProjects) {
    const projConflicts = detectConflicts(proj, allProjects);
    for (const c of projConflicts) {
      const pairKey = [c.candidateProjectId, c.existingProjectId].sort().join(':::');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        conflicts.push(c);
      }
    }
  }

  // Count participating contractors
  const contractorIds = new Set(allProjects.map(p => p.contractorId).filter(Boolean));
  const participatingContractors = contractorIds.size || (db.contractors || []).length;

  // Resolved conflicts via accepted schedule changes
  const resolvedProposals = (db.scheduleProposals || []).filter(p => p.status === 'Accepted').length;

  // Verified complaints resolved
  const verifiedComplaintsResolved = allComplaints.filter(c => c.status === 'Resolved').length;
  const totalVerifiedComplaints = allComplaints.filter(c => c.status === 'Verified' || c.status === 'Resolved').length;

  res.json({
    activeProjects,
    potentialConflicts: conflicts.length,
    completedProjects,
    participatingContractors,
    // Section 9 Impact Metrics
    conflictsDetected: conflicts.length + resolvedProposals,
    conflictsResolved: resolvedProposals,
    projectsAwaitingInspection: awaitingInspection,
    verifiedComplaintsResolved,
    totalVerifiedComplaints,
    delayedProjects,
    totalTrackedProjects: allProjects.length,
    isDemoData: true,
    dataDisclaimer: 'Simulated civic sample dataset for prototype demonstration.'
  });
});

// ==========================================
// 2. CONTRACTOR LEADERBOARD (Section 5 & 6)
// ==========================================
app.get('/api/contractors/leaderboard', (req, res) => {
  // Combine current projects + historical completed/failed projects for realistic evaluation
  const combinedProjects = [...(db.projects || []), ...(db.historicalProjects || [])];
  const leaderboard = computeContractorLeaderboard(db.contractors || [], combinedProjects, db.complaints || []);

  res.json({
    leaderboard,
    minEligibleCutoff: MIN_ELIGIBLE_PROJECTS,
    formulaExplanation: {
      completionRateWeight: '60%',
      verifiedComplaintFreeWeight: '40%',
      formula: 'Score = 100 × (0.60 × (Completed / Eligible) + 0.40 × (1 - ProjectsWithVerifiedComplaints / Eligible))',
      qualificationRule: 'Minimum 5 non-cancelled projects with recorded outcomes required for featured ranking.'
    },
    isDemoData: true
  });
});

app.get('/api/contractors', (req, res) => {
  res.json(db.contractors || []);
});

app.get('/api/road-segments', (req, res) => {
  res.json(db.roadSegments || []);
});

// ==========================================
// 3. CONFLICTS ENGINE (Section 4)
// ==========================================
app.get('/api/conflicts', (req, res) => {
  const allProjects = db.projects || [];
  const conflicts = [];
  const processedPairs = new Set();

  for (const proj of allProjects) {
    const projConflicts = detectConflicts(proj, allProjects);
    for (const c of projConflicts) {
      const pairKey = [c.candidateProjectId, c.existingProjectId].sort().join(':::');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        conflicts.push(c);
      }
    }
  }

  res.json({
    totalConflicts: conflicts.length,
    conflicts
  });
});

// Dry-run conflict detection before project submission
app.post('/api/projects/check-conflicts', (req, res) => {
  const { name, roadSegment, startDate, endDate, heavyEquipment, id, department } = req.body;

  const dateVal = validateDateRange(startDate, endDate);
  if (!dateVal.valid) {
    return res.status(400).json({ error: dateVal.error });
  }

  const candidate = {
    id: id || 'PREVIEW',
    name: name || 'Proposed Public Works',
    roadSegment,
    department: department || 'General Works',
    startDate: dateVal.startISO,
    endDate: dateVal.endISO,
    heavyEquipment: Boolean(heavyEquipment),
    status: 'Proposed'
  };

  const conflicts = detectConflicts(candidate, db.projects || []);
  const alternativeSchedule = conflicts.length > 0
    ? suggestAlternativeSchedule(candidate, db.projects || [])
    : null;

  res.json({
    hasConflict: conflicts.length > 0,
    conflictCount: conflicts.length,
    conflicts,
    suggestedAlternative: alternativeSchedule
  });
});

// ==========================================
// 4. PROJECTS CRUD & WORKFLOWS (Sections 2, 3, 4, 5)
// ==========================================
app.get('/api/projects', (req, res) => {
  let list = [...(db.projects || [])];
  const { search, status, roadSegment, department, contractorId, lat, lon, radiusKm } = req.query;

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.roadSegment && p.roadSegment.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.contractorName && p.contractorName.toLowerCase().includes(q)) ||
      (p.purpose && p.purpose.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'All') {
    list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (roadSegment && roadSegment !== 'All') {
    list = list.filter(p => p.roadSegment === roadSegment);
  }

  if (department && department !== 'All') {
    list = list.filter(p => p.department === department);
  }

  if (contractorId && contractorId !== 'All') {
    list = list.filter(p => p.contractorId === contractorId);
  }

  // Location radius filter (Section 2.A: configurable default 5km, sorted by distance)
  if (lat && lon) {
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const maxDistance = parseFloat(radiusKm) || 5;

    if (!isNaN(userLat) && !isNaN(userLon)) {
      list = list.map(p => {
        const dist = (p.lat && p.lng)
          ? calculateDistanceKm(userLat, userLon, p.lat, p.lng)
          : 999;
        return { ...p, distanceKm: dist };
      })
      .filter(p => p.distanceKm <= maxDistance)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    }
  }

  res.json(list);
});

app.get('/api/projects/:id', (req, res) => {
  const project = (db.projects || []).find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  // Find linked complaints
  const linkedComplaints = (db.complaints || []).filter(c => c.projectId === project.id);

  // Find active conflicts
  const conflicts = detectConflicts(project, db.projects || []);

  // Find pending proposals
  const proposals = (db.scheduleProposals || []).filter(p => p.projectId === project.id);

  res.json({
    ...project,
    complaints: linkedComplaints,
    conflicts,
    proposals
  });
});

app.post('/api/projects', (req, res) => {
  const {
    name,
    department,
    contractorId,
    contractorName,
    roadSegment,
    startDate,
    endDate,
    purpose,
    heavyEquipment,
    laneImpact,
    documents
  } = req.body;

  if (!name || !department || !roadSegment || !purpose) {
    return res.status(400).json({ error: 'Name, department, road segment, and purpose are required.' });
  }

  const dateVal = validateDateRange(startDate, endDate);
  if (!dateVal.valid) {
    return res.status(400).json({ error: dateVal.error });
  }

  // Match road segment lat/lng if not explicitly passed
  const segment = (db.roadSegments || []).find(s => s.name === roadSegment);
  const lat = segment ? segment.lat + (Math.random() - 0.5) * 0.005 : 12.9716;
  const lng = segment ? segment.lng + (Math.random() - 0.5) * 0.005 : 77.5946;

  // Resolve contractor name
  let assignedContractorName = contractorName;
  if (!assignedContractorName && contractorId) {
    const c = (db.contractors || []).find(x => x.id === contractorId);
    if (c) assignedContractorName = c.name;
  }
  if (!assignedContractorName) assignedContractorName = 'Independent Civil Works';

  const newProject = {
    id: `PRJ-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    department: department.trim(),
    contractorId: contractorId || 'cont-1',
    contractorName: assignedContractorName,
    roadSegment: roadSegment.trim(),
    roadSegmentId: segment ? segment.id : `SEG-${Date.now().toString().slice(-3)}`,
    purpose: purpose.trim(),
    // Rule: contractor proposed schedule MUST NOT become approved until municipal review
    status: 'Proposed',
    startDate: dateVal.startISO,
    endDate: dateVal.endISO,
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5)),
    heavyEquipment: Boolean(heavyEquipment),
    laneImpact: laneImpact || 'Standard single lane staging',
    latestUpdate: 'Project proposed by contractor. Awaiting municipal documentation and schedule review.',
    documents: Array.isArray(documents) ? documents.map((d, i) => ({
      id: `DOC-${Date.now()}-${i}`,
      name: d.name || 'Supporting Permit',
      type: d.type || 'Permit',
      status: 'Pending',
      uploadDate: new Date().toISOString().split('T')[0],
      notes: 'Submitted with project application'
    })) : [
      {
        id: `DOC-${Date.now()}-0`,
        name: 'Proposed Work Schedule & Scope NOC',
        type: 'Permit',
        status: 'Pending',
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Submitted for verification'
      }
    ],
    history: [
      {
        timestamp: new Date().toISOString(),
        actor: assignedContractorName,
        action: 'Proposed project submitted for municipal assessment.'
      }
    ]
  };

  // Run conflict detection on submission
  const detected = detectConflicts(newProject, db.projects || []);
  if (detected.length > 0) {
    newProject.latestUpdate = `CONFLICT WARNING: ${detected.length} potential scheduling conflict(s) detected on ${newProject.roadSegment}.`;
    newProject.history.push({
      timestamp: new Date().toISOString(),
      actor: 'CivicSync Conflict Engine',
      action: `Flagged ${detected.length} conflict(s). Requires municipal resolution.`
    });
  }

  db.projects.unshift(newProject);
  logAudit(assignedContractorName, `Submitted proposed project "${newProject.name}" on ${newProject.roadSegment}.`);
  saveDb();

  res.status(201).json({
    project: newProject,
    conflicts: detected,
    suggestedAlternative: detected.length > 0 ? suggestAlternativeSchedule(newProject, db.projects || []) : null
  });
});

// Update project status (Municipal review action)
app.put('/api/projects/:id/status', (req, res) => {
  const { status, actor, note } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const validStatuses = [
    'Proposed',
    'Under Review',
    'Approved/Planned',
    'Active',
    'Awaiting Inspection',
    'Completed',
    'Changes Requested',
    'Rejected',
    'Delayed',
    'On Hold',
    'Cancelled',
    'Inspection Failed'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  // Prevent marking completed without formal inspection workflow
  if (status === 'Completed' && project.status !== 'Awaiting Inspection') {
    return res.status(400).json({
      error: 'Projects can only be marked Completed via the formal municipal completion inspection workflow.'
    });
  }

  const oldStatus = project.status;
  project.status = status;
  if (note) project.latestUpdate = note;

  const actorName = actor || 'Municipal Staff';
  project.history.push({
    timestamp: new Date().toISOString(),
    actor: actorName,
    action: `Status transitioned from "${oldStatus}" to "${status}". Note: ${note || 'Standard municipal review.'}`
  });

  logAudit(actorName, `Updated project "${project.name}" status to "${status}".`);
  saveDb();

  res.json(project);
});

// Municipal proposes an alternative schedule (Section 4)
app.post('/api/projects/:id/propose-schedule', (req, res) => {
  const { proposedStart, proposedEnd, reason, actor } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const dateVal = validateDateRange(proposedStart, proposedEnd);
  if (!dateVal.valid) {
    return res.status(400).json({ error: dateVal.error });
  }

  const proposal = {
    id: `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId: project.id,
    projectName: project.name,
    contractorId: project.contractorId,
    roadSegment: project.roadSegment,
    originalDates: `${project.startDate} to ${project.endDate}`,
    proposedDates: `${dateVal.startISO} to ${dateVal.endISO}`,
    proposedStart: dateVal.startISO,
    proposedEnd: dateVal.endISO,
    reason: reason || 'Recommended alternative window to resolve road corridor congestion.',
    status: 'Pending Contractor Response',
    contractorResponse: null,
    contractorReason: null,
    createdAt: new Date().toISOString()
  };

  db.scheduleProposals.unshift(proposal);

  project.history.push({
    timestamp: new Date().toISOString(),
    actor: actor || 'Municipal Coordinator',
    action: `Proposed alternative schedule: ${proposal.proposedDates}. Awaiting contractor review.`
  });

  logAudit(actor || 'Municipal Coordinator', `Proposed alternative schedule for "${project.name}": ${proposal.proposedDates}.`);
  saveDb();

  res.json({ message: 'Alternative schedule proposed to contractor.', proposal });
});

// Contractor responds to proposed schedule change (Section 4)
app.post('/api/projects/:id/respond-schedule', (req, res) => {
  const { proposalId, action, reason, contractorName } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const proposal = (db.scheduleProposals || []).find(p => p.id === proposalId && p.projectId === project.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Schedule proposal not found.' });
  }

  if (action === 'accept') {
    proposal.status = 'Accepted';
    proposal.contractorResponse = 'Accepted';
    proposal.contractorReason = reason || 'Agreed to shift timeline.';

    // Safely update project dates only upon explicit contractor acceptance!
    project.startDate = proposal.proposedStart;
    project.endDate = proposal.proposedEnd;
    project.latestUpdate = `Timeline rescheduled to ${project.startDate} to ${project.endDate} following accepted coordination.`;

    project.history.push({
      timestamp: new Date().toISOString(),
      actor: contractorName || project.contractorName,
      action: `Accepted alternative schedule: ${project.startDate} to ${project.endDate}. Conflict resolved.`
    });

    logAudit(contractorName || project.contractorName, `Accepted schedule adjustment for "${project.name}".`);
  } else if (action === 'reject') {
    proposal.status = 'Rejected';
    proposal.contractorResponse = 'Rejected';
    proposal.contractorReason = reason || 'Contractor unable to shift crew mobilization dates.';

    project.history.push({
      timestamp: new Date().toISOString(),
      actor: contractorName || project.contractorName,
      action: `Declined alternative schedule change. Reason: ${reason || 'Operational constraints.'}`
    });

    logAudit(contractorName || project.contractorName, `Declined schedule adjustment for "${project.name}".`);
  } else {
    return res.status(400).json({ error: 'Action must be "accept" or "reject".' });
  }

  saveDb();
  res.json({ message: `Proposal ${proposal.status}.`, proposal, project });
});

// Contractor requests completion (Section 5)
app.post('/api/projects/:id/request-completion', (req, res) => {
  const { contractorNotes, evidencePhoto, densityCertificate, contractorName } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  // Check unresolved complaints
  const openComplaints = (db.complaints || []).filter(
    c => c.projectId === project.id && (c.status === 'Submitted' || c.status === 'Under Review')
  );

  project.status = 'Awaiting Inspection';
  project.completionTicket = {
    submittedAt: new Date().toISOString(),
    contractorNotes: contractorNotes || 'Work executed according to municipal engineering codes. Site cleared.',
    evidencePhoto: evidencePhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80',
    densityCertificate: densityCertificate || 'INSP-PENDING-LAB-CORE',
    flaggedForComplaints: openComplaints.length > 0,
    openComplaintsCount: openComplaints.length
  };

  project.latestUpdate = openComplaints.length > 0
    ? `Awaiting Inspection. Note: ${openComplaints.length} citizen report(s) flagged for reviewer attention.`
    : 'Awaiting Municipal Inspection sign-off.';

  project.history.push({
    timestamp: new Date().toISOString(),
    actor: contractorName || project.contractorName,
    action: `Submitted completion inspection request. Status updated to Awaiting Inspection.`
  });

  logAudit(contractorName || project.contractorName, `Submitted completion request for "${project.name}".`);
  saveDb();

  res.json({
    message: 'Completion request submitted. Status set to Awaiting Inspection.',
    project,
    flaggedComplaints: openComplaints
  });
});

// Municipal staff inspects project (Section 5)
app.post('/api/projects/:id/inspect', (req, res) => {
  const { outcome, reason, inspectorName, certificateId } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.status !== 'Awaiting Inspection') {
    return res.status(400).json({ error: 'Only projects in "Awaiting Inspection" status can be inspected.' });
  }

  const inspector = inspectorName || 'Chief Municipal Inspector';

  if (outcome === 'Approved') {
    project.status = 'Completed';
    project.completedDate = new Date().toISOString().split('T')[0];
    project.inspectionOutcome = {
      outcome: 'Approved',
      inspector,
      decisionDate: new Date().toISOString(),
      reason: reason || 'All physical milestones, surface reinstatement, and safety checks verified.'
    };
    project.latestUpdate = `Completed: Certified by ${inspector} on ${project.completedDate}.`;

    project.history.push({
      timestamp: new Date().toISOString(),
      actor: inspector,
      action: `Inspection APPROVED. Project marked Completed. Certificate: ${certificateId || 'CERT-APPROVED-FINAL'}.`
    });

    logAudit(inspector, `Approved final inspection for "${project.name}". Project marked Completed.`);
  } else if (outcome === 'Rejected') {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A rejection reason is strictly required.' });
    }

    project.status = 'Inspection Failed';
    project.inspectionOutcome = {
      outcome: 'Rejected',
      inspector,
      decisionDate: new Date().toISOString(),
      reason: reason.trim()
    };
    project.latestUpdate = `Inspection Failed: ${reason.trim()}. Remediation required.`;

    project.history.push({
      timestamp: new Date().toISOString(),
      actor: inspector,
      action: `Inspection REJECTED. Reason: ${reason.trim()}. Status marked Inspection Failed.`
    });

    logAudit(inspector, `Rejected inspection for "${project.name}": ${reason.trim()}.`);
  } else {
    return res.status(400).json({ error: 'Outcome must be "Approved" or "Rejected".' });
  }

  saveDb();
  res.json({ message: `Inspection recorded: ${outcome}.`, project });
});

// Municipal staff verifies / rejects project document (Section 2.C)
app.put('/api/projects/:id/documents/:docId', (req, res) => {
  const { status, notes, reviewerName } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const doc = (project.documents || []).find(d => d.id === req.params.docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const validDocStatuses = ['Pending', 'Verified', 'Rejected', 'Missing', 'Expired'];
  if (!validDocStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid document status: ${status}` });
  }

  doc.status = status;
  if (notes) doc.notes = notes;

  const actor = reviewerName || 'Municipal Document Reviewer';
  project.history.push({
    timestamp: new Date().toISOString(),
    actor,
    action: `Document "${doc.name}" marked as "${status}". ${notes ? `Note: ${notes}` : ''}`
  });

  logAudit(actor, `Updated document "${doc.name}" status to "${status}" on project "${project.name}".`);
  saveDb();

  res.json({ message: 'Document status updated.', document: doc, project });
});

// Add document to project
app.post('/api/projects/:id/documents', (req, res) => {
  const { name, type, notes } = req.body;
  const project = (db.projects || []).find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const newDoc = {
    id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: name || 'Supporting Clearance',
    type: type || 'Permit',
    status: 'Pending',
    uploadDate: new Date().toISOString().split('T')[0],
    notes: notes || 'Uploaded for municipal review'
  };

  if (!project.documents) project.documents = [];
  project.documents.push(newDoc);

  logAudit(project.contractorName, `Uploaded document "${newDoc.name}" to project "${project.name}".`);
  saveDb();

  res.status(201).json(newDoc);
});

// ==========================================
// 5. CITIZEN REPORTING & COMPLAINTS (Section 5 & 8)
// ==========================================
app.get('/api/reports', (req, res) => {
  res.json(db.complaints || []);
});

app.post('/api/reports', (req, res) => {
  const { projectId, category, description, photo, submittedBy, locality } = req.body;

  if (!description || !category) {
    return res.status(400).json({ error: 'Category and description are required.' });
  }

  let projectName = 'General Road Report';
  let contractorId = null;

  if (projectId) {
    const project = (db.projects || []).find(p => p.id === projectId);
    if (project) {
      projectName = project.name;
      contractorId = project.contractorId;
    }
  }

  const newReport = {
    id: `REP-${Date.now().toString().slice(-4)}`,
    projectId: projectId || null,
    projectName,
    contractorId,
    category: category.toLowerCase(),
    description: description.trim(),
    photo: photo || null,
    submittedBy: submittedBy || 'Concerned Resident',
    locality: locality || 'City Center',
    // Rule: Complaints are allegations until reviewed. Start as Submitted.
    status: 'Submitted',
    submissionDate: new Date().toISOString(),
    municipalResponse: 'Submitted to municipal dispatch queue. Pending inspection.',
    resolvedAt: null
  };

  db.complaints.unshift(newReport);
  logAudit(newReport.submittedBy, `Submitted citizen report on "${projectName}": ${category}.`);
  saveDb();

  res.status(201).json(newReport);
});

// Municipal updates complaint status
app.put('/api/reports/:id/status', (req, res) => {
  const { status, municipalResponse, reviewerName } = req.body;
  const report = (db.complaints || []).find(c => c.id === req.params.id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const validStatuses = ['Submitted', 'Under Review', 'Verified', 'Rejected', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  report.status = status;
  if (municipalResponse) report.municipalResponse = municipalResponse;
  if (status === 'Resolved') {
    report.resolvedAt = new Date().toISOString();
  }

  const actor = reviewerName || 'Municipal Inspector';
  logAudit(actor, `Updated report #${report.id} to "${status}".`);
  saveDb();

  res.json(report);
});

// ==========================================
// 6. CITIZEN SUGGESTIONS (Section 8)
// ==========================================
app.get('/api/suggestions', (req, res) => {
  res.json(db.suggestions || []);
});

app.post('/api/suggestions', (req, res) => {
  const { title, road, locality, description, submittedBy } = req.body;

  if (!title || !description || !road) {
    return res.status(400).json({ error: 'Title, road corridor, and description are required.' });
  }

  const newSuggestion = {
    id: `SUG-${Date.now().toString().slice(-4)}`,
    title: title.trim(),
    road: road.trim(),
    locality: locality || road.trim(),
    description: description.trim(),
    submittedBy: submittedBy || 'Local Resident',
    date: new Date().toISOString(),
    upvotes: 1,
    status: 'Pending Feasibility',
    proposalNotes: null
  };

  db.suggestions.unshift(newSuggestion);
  logAudit(newSuggestion.submittedBy, `Submitted road improvement idea: "${newSuggestion.title}".`);
  saveDb();

  res.status(201).json(newSuggestion);
});

app.post('/api/suggestions/:id/upvote', (req, res) => {
  const suggestion = (db.suggestions || []).find(s => s.id === req.params.id);
  if (!suggestion) {
    return res.status(404).json({ error: 'Suggestion not found.' });
  }
  suggestion.upvotes = (suggestion.upvotes || 0) + 1;
  saveDb();
  res.json(suggestion);
});

// Turn citizen suggestion into a municipal proposal project (Section 2.C item 9)
app.post('/api/suggestions/:id/convert-to-proposal', (req, res) => {
  const { officerName, department, targetRoadSegment } = req.body;
  const suggestion = (db.suggestions || []).find(s => s.id === req.params.id);

  if (!suggestion) {
    return res.status(404).json({ error: 'Suggestion not found.' });
  }

  suggestion.status = 'Converted to Proposal';
  suggestion.proposalNotes = `Adopted into municipal planning pipeline by ${officerName || 'Urban Planning Commission'}.`;

  // Create an official proposed project based on citizen idea!
  const segmentName = targetRoadSegment || suggestion.road;
  const segment = (db.roadSegments || []).find(s => s.name === segmentName);

  const proposedProject = {
    id: `PRJ-CITIZEN-${Date.now().toString().slice(-4)}`,
    name: `Citizen Initiative: ${suggestion.title}`,
    department: department || 'Municipal Road Extension & Paving',
    contractorId: 'cont-2',
    contractorName: 'Apex Civil Infrastructure',
    roadSegment: segmentName,
    roadSegmentId: segment ? segment.id : 'SEG-GENERIC',
    purpose: `Initiated from citizen suggestion #${suggestion.id}: ${suggestion.description}`,
    status: 'Proposed',
    startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
    lat: segment ? segment.lat : 12.9716,
    lng: segment ? segment.lng : 77.5946,
    heavyEquipment: false,
    laneImpact: 'Pedestrian corridor upgrade',
    latestUpdate: `Project drafted from citizen idea #${suggestion.id} with ${suggestion.upvotes} community endorsements.`,
    documents: [
      {
        id: `DOC-CIT-${Date.now()}`,
        name: 'Citizen Community Endorsement Brief',
        type: 'Feasibility Report',
        status: 'Verified',
        uploadDate: new Date().toISOString().split('T')[0],
        notes: `Backed by ${suggestion.upvotes} verified local residents`
      }
    ],
    history: [
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Municipal Planning Commission',
        action: `Converted citizen suggestion "${suggestion.title}" into official project proposal.`
      }
    ]
  };

  db.projects.unshift(proposedProject);
  logAudit(officerName || 'Municipal Planning', `Adopted citizen suggestion #${suggestion.id} into official project ${proposedProject.id}.`);
  saveDb();

  res.json({
    message: 'Citizen suggestion successfully converted into a municipal project proposal.',
    suggestion,
    project: proposedProject
  });
});

// ==========================================
// 7. AUDIT LOGS
// ==========================================
app.get('/api/audit-logs', (req, res) => {
  res.json(db.auditLogs || []);
});

// ==========================================
// 8. DEMO RESET ENDPOINT
// ==========================================
app.post('/api/reset-data', (req, res) => {
  try {
    const raw = fs.readFileSync(SEED_FILE, 'utf-8');
    db = JSON.parse(raw);
    saveDb();
    res.json({ message: 'Database successfully reset to pristine seed demonstration state.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset seed data: ' + err.message });
  }
});

// Serve static frontend in production if dist exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start Express server
app.listen(PORT, () => {
  console.log(`CivicSync Backend Engine running on http://localhost:${PORT}`);
});

