/**
 * CivicSync Contractor Scoring Engine
 * Adheres strictly to Section 6 of the Specification.
 *
 * Formula:
 * eligibleProjects = completedProjects + unsuccessfulProjects (known final outcomes only)
 * completionRate = completedProjects / eligibleProjects
 * verifiedComplaintRate = projectsWithVerifiedComplaints / eligibleProjects
 * verifiedComplaintFreeRate = 1 - verifiedComplaintRate
 * performanceScore = 100 * (0.60 * completionRate + 0.40 * verifiedComplaintFreeRate)
 *
 * Eligibility threshold: minimum 5 eligible projects.
 * Tie breakers:
 * 1. Higher completion rate
 * 2. Lower verified complaint rate
 * 3. Higher eligible project count
 */

export const MIN_ELIGIBLE_PROJECTS = 5;

// Statuses that represent a definitive final outcome
export const COMPLETED_STATUS = 'Completed';
export const FAILED_OUTCOME_STATUSES = ['Inspection Failed', 'Terminated', 'Unsuccessful'];

export function computeContractorLeaderboard(contractors, allProjects, allComplaints) {
  const leaderboard = [];

  for (const contractor of contractors) {
    // Collect projects belonging to this contractor
    const contractorProjects = allProjects.filter(
      p => p.contractorId === contractor.id || (p.contractorName && p.contractorName.toLowerCase() === contractor.name.toLowerCase())
    );

    // Filter for eligible projects with known final outcome
    const completedProjects = contractorProjects.filter(p => p.status === COMPLETED_STATUS);
    const unsuccessfulProjects = contractorProjects.filter(p => FAILED_OUTCOME_STATUSES.includes(p.status));

    const eligibleCount = completedProjects.length + unsuccessfulProjects.length;

    // Check verified complaints against contractor's eligible projects
    // Only complaints with status === 'Verified' or 'Resolved' (having been verified) count
    // Count PROJECTS with >= 1 verified complaint
    const verifiedComplaints = allComplaints.filter(c =>
      (c.status === 'Verified' || c.status === 'Resolved') &&
      contractorProjects.some(p => p.id === c.projectId)
    );

    const projectsWithVerifiedComplaints = new Set(
      verifiedComplaints.map(c => c.projectId)
    ).size;

    // Is contractor eligible for featured ranking?
    const isEligible = eligibleCount >= MIN_ELIGIBLE_PROJECTS;

    let completionRate = 0;
    let verifiedComplaintRate = 0;
    let verifiedComplaintFreeRate = 1;
    let performanceScore = 0;

    if (eligibleCount > 0) {
      completionRate = completedProjects.length / eligibleCount;
      verifiedComplaintRate = projectsWithVerifiedComplaints / eligibleCount;
      // Cap rate between 0 and 1
      verifiedComplaintRate = Math.min(1, Math.max(0, verifiedComplaintRate));
      verifiedComplaintFreeRate = 1 - verifiedComplaintRate;

      const rawScore = 100 * (0.60 * completionRate + 0.40 * verifiedComplaintFreeRate);
      performanceScore = Number(rawScore.toFixed(1));
    }

    leaderboard.push({
      contractorId: contractor.id,
      name: contractor.name,
      registrationNumber: contractor.registrationNumber,
      specialty: contractor.specialty,
      contactEmail: contractor.contactEmail,
      completedCount: completedProjects.length,
      unsuccessfulCount: unsuccessfulProjects.length,
      eligibleProjects: eligibleCount,
      activeProjectsCount: contractorProjects.filter(p => p.status === 'Active').length,
      totalAssignedProjects: contractorProjects.length,
      projectsWithVerifiedComplaints,
      completionRate: Number((completionRate * 100).toFixed(1)),
      verifiedComplaintRate: Number((verifiedComplaintRate * 100).toFixed(1)),
      verifiedComplaintFreeRate: Number((verifiedComplaintFreeRate * 100).toFixed(1)),
      performanceScore,
      isEligible,
      eligibilityNote: isEligible
        ? 'Qualified for Top-Performing Leaderboard (meets min 5 completed/evaluated projects)'
        : `Pending Qualification (${eligibleCount}/${MIN_ELIGIBLE_PROJECTS} eligible completed projects)`,
    });
  }

  // Sort according to Section 6 specification:
  // Primary: performanceScore DESC
  // Tie-breaker 1: completionRate DESC
  // Tie-breaker 2: verifiedComplaintRate ASC
  // Tie-breaker 3: eligibleProjects DESC
  leaderboard.sort((a, b) => {
    // Put eligible contractors first, then sort by score
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    if (b.performanceScore !== a.performanceScore) {
      return b.performanceScore - a.performanceScore;
    }
    if (b.completionRate !== a.completionRate) {
      return b.completionRate - a.completionRate;
    }
    if (a.verifiedComplaintRate !== b.verifiedComplaintRate) {
      return a.verifiedComplaintRate - b.verifiedComplaintRate;
    }
    return b.eligibleProjects - a.eligibleProjects;
  });

  // Assign ranks
  return leaderboard.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
