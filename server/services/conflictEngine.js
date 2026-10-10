/**
 * CivicSync Conflict Detection & Alternative Scheduling Engine
 *
 * Rules:
 * 1. Road segment match (case-insensitive normalized identifier)
 * 2. Overlapping date intervals: A.startDate <= B.endDate AND B.startDate <= A.endDate
 * 3. Relevant status: Proposed, Under Review, Approved/Planned, Active
 *    (Completed, Cancelled, Rejected do not participate in future conflicts)
 * 4. Validation: reject invalid dates or endDate < startDate
 */

// Statuses that actively occupy a road segment
export const CONFLICT_ACTIVE_STATUSES = [
  'Proposed',
  'Under Review',
  'Approved/Planned',
  'Active',
  'Awaiting Inspection'
];

/**
 * Validates date strings (YYYY-MM-DD)
 */
export function validateDateRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { valid: false, error: 'Start date and End date are required.' };
  }
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Dates must be valid calendar dates (YYYY-MM-DD).' };
  }

  // Normalize to pure calendar days at midnight UTC
  const startISO = start.toISOString().split('T')[0];
  const endISO = end.toISOString().split('T')[0];

  if (startISO > endISO) {
    return { valid: false, error: 'End date cannot be earlier than start date.' };
  }

  return { valid: true, startISO, endISO };
}

/**
 * Checks if two date intervals overlap inclusively:
 * A.startDate <= B.endDate AND B.startDate <= A.endDate
 */
export function datesOverlap(startA, endA, startB, endB) {
  return startA <= endB && startB <= endA;
}

/**
 * Calculates overlap date span in string format
 */
export function getOverlapWindow(startA, endA, startB, endB) {
  const overlapStart = startA > startB ? startA : startB;
  const overlapEnd = endA < endB ? endA : endB;
  return { overlapStart, overlapEnd };
}

/**
 * Detect conflicts for a given project (or proposed project attributes)
 * against an existing pool of projects.
 */
export function detectConflicts(projectCandidate, allProjects) {
  const conflicts = [];
  const roadSegment = (projectCandidate.roadSegment || '').trim().toLowerCase();

  if (!roadSegment) return conflicts;

  const dateVal = validateDateRange(projectCandidate.startDate, projectCandidate.endDate);
  if (!dateVal.valid) return conflicts;

  const { startISO: candStart, endISO: candEnd } = dateVal;
  const candidateStatus = projectCandidate.status || 'Proposed';

  // If candidate status is cancelled or completed, it does not conflict
  if (!CONFLICT_ACTIVE_STATUSES.includes(candidateStatus)) {
    return conflicts;
  }

  for (const existing of allProjects) {
    // Don't compare a project with itself
    if (projectCandidate.id && existing.id === projectCandidate.id) continue;

    // Check status eligibility
    if (!CONFLICT_ACTIVE_STATUSES.includes(existing.status)) continue;

    // Check road segment match
    const existingSegment = (existing.roadSegment || '').trim().toLowerCase();
    if (existingSegment !== roadSegment) continue;

    // Check inclusive date overlap
    if (datesOverlap(candStart, candEnd, existing.startDate, existing.endDate)) {
      const { overlapStart, overlapEnd } = getOverlapWindow(
        candStart,
        candEnd,
        existing.startDate,
        existing.endDate
      );

      // Determine severity:
      // Direct high-risk conflict if both projects involve excavation or heavy equipment
      const heavyCandidate = Boolean(projectCandidate.heavyEquipment);
      const heavyExisting = Boolean(existing.heavyEquipment);
      const isHighSeverity = heavyCandidate || heavyExisting || existing.status === 'Active';

      conflicts.push({
        id: `conf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        candidateProjectId: projectCandidate.id || 'PROPOSED_NEW',
        candidateProjectName: projectCandidate.name || 'Proposed Work',
        candidateDepartment: projectCandidate.department,
        candidateContractor: projectCandidate.contractorName,
        candidateDates: `${candStart} to ${candEnd}`,
        existingProjectId: existing.id,
        existingProjectName: existing.name,
        existingDepartment: existing.department,
        existingContractor: existing.contractorName,
        existingDates: `${existing.startDate} to ${existing.endDate}`,
        existingStatus: existing.status,
        roadSegment: existing.roadSegment,
        overlapStart,
        overlapEnd,
        severity: isHighSeverity ? 'HIGH' : 'MEDIUM',
        type: existingSegment === roadSegment ? 'Direct Road Corridor Conflict' : 'Nearby Corridor Conflict',
        explanation: `Both "${projectCandidate.name || 'Proposed Work'}" (${projectCandidate.department}) and "${existing.name}" (${existing.department}) have requested work on segment "${existing.roadSegment}" during overlapping dates (${overlapStart} to ${overlapEnd}). Simultaneous excavation risks traffic gridlock, utility strikes, and repeated road resurfacing damage.`,
        suggestedNextAction: 'Review timeline in municipal coordination dashboard. Propose non-overlapping alternative schedule window or phase sequencing before approving.'
      });
    }
  }

  return conflicts;
}

/**
 * Suggests an alternative non-conflicting date window for a proposed project
 * preserving its duration.
 */
export function suggestAlternativeSchedule(projectCandidate, allProjects) {
  const roadSegment = (projectCandidate.roadSegment || '').trim().toLowerCase();
  const dateVal = validateDateRange(projectCandidate.startDate, projectCandidate.endDate);
  if (!dateVal.valid) return null;

  const start = new Date(dateVal.startISO);
  const end = new Date(dateVal.endISO);
  const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  // Collect all conflicting intervals on this road segment
  const segmentProjects = allProjects.filter(p =>
    (p.id !== projectCandidate.id) &&
    CONFLICT_ACTIVE_STATUSES.includes(p.status) &&
    (p.roadSegment || '').trim().toLowerCase() === roadSegment
  ).sort((a, b) => a.endDate.localeCompare(b.endDate));

  if (segmentProjects.length === 0) return null;

  // Option 1: Right after the latest conflicting project ends (+ 2 days buffer for road settling/inspection)
  const latestProject = segmentProjects[segmentProjects.length - 1];
  const altStartDate = new Date(latestProject.endDate);
  altStartDate.setDate(altStartDate.getDate() + 3); // 3-day recovery buffer

  const altEndDate = new Date(altStartDate);
  altEndDate.setDate(altEndDate.getDate() + durationDays);

  const proposedStart = altStartDate.toISOString().split('T')[0];
  const proposedEnd = altEndDate.toISOString().split('T')[0];

  return {
    originalStart: dateVal.startISO,
    originalEnd: dateVal.endISO,
    durationDays,
    proposedStart,
    proposedEnd,
    rationale: `Schedules the work immediately following completion of "${latestProject.name}" with a 3-day municipal buffer. Eliminates road-segment contention while preserving full ${durationDays}-day planned duration.`
  };
}
