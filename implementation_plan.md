# CivicSync --- Antigravity Project README

> **Tagline:** One city. One plan. No unnecessary digging.\
> **Supporting phrase:** Dig once. Build smarter.

## 1. Project overview

CivicSync is a civic infrastructure coordination and transparency
platform that connects citizens, contractors, and municipal authorities
through one shared system.

It helps municipal teams identify potentially conflicting public-works
schedules, review project documentation, coordinate alternative
timelines, track project progress, and respond to citizen reports.
Residents can discover nearby projects and understand how construction
may affect their neighbourhood.

### Mission

Make public infrastructure more coordinated, transparent, and
citizen-centric.

### Core value proposition

-   **Coordinate:** Detect potentially conflicting construction
    schedules before work begins.
-   **Make visible:** Give residents access to project details,
    locations, timelines, and status.
-   **Build accountability:** Track complaints, inspections, completion
    requests, and municipal decisions.

### Important scope and trust notes

-   This is a hackathon prototype. Clearly label simulated/sample data.
-   Do not claim the application is connected to real municipal systems
    or that uploaded permits have been verified against government
    databases unless such integrations genuinely exist.
-   A detected conflict is a warning for review, not an automatic
    determination that two projects cannot coexist.
-   Citizen complaints are allegations until reviewed. Unverified
    complaints must not be treated as proven misconduct.
-   Do not automatically move a contractor's confirmed schedule merely
    because a higher-priority project is submitted.
-   Municipal personnel are responsible for feasibility assessment and
    official decisions.

------------------------------------------------------------------------

## 2. User roles and portals

Build one public landing page with clear entry points for three
role-based experiences.

### A. Citizen portal

Citizens should be able to:

1.  Explore public works on a map and in a searchable list.
2.  Search by project name, road, or locality.
3.  Optionally use their current location or manually enter a locality.
4.  View projects within a configurable default radius of 5 km, sorted
    by distance.
5.  View each project's purpose, department, contractor, planned dates,
    current status, latest update, and relevant public information.
6.  Submit a report about a project, including a category, description,
    and optional photo.
7.  Track the status of reports they submit.
8.  Submit general road feedback or suggest a needed improvement.
9.  View alternative-route information only if the application has
    sufficient reliable route data. Do not invent routes.

**Location privacy and failure handling**

-   Location access must be optional.
-   If a user denies location permission, allow locality or road search
    instead.
-   Do not block project browsing or issue reporting because GPS is
    unavailable.
-   Explain why location is requested and use it only for the
    nearby-project experience.
-   A project outside the selected radius may still affect a citizen;
    allow manual search and map exploration.

### B. Contractor dashboard

Contractors should be able to:

1.  Create and edit proposed projects.
2.  Submit project details:
    -   Project name and description
    -   Department and work category (e.g., water pipeline, electricity,
        drainage, road extension)
    -   Road/segment and map location or affected area
    -   Planned start and end dates
    -   Expected duration, if useful
    -   Work details, including heavy-equipment usage or access
        constraints
    -   Supporting photographs
    -   Permission/contract documents
3.  View document review status.
4.  See potential scheduling conflicts and the reason for each warning.
5.  Compare proposed alternative schedules.
6.  Accept or reject a proposed schedule change, with an optional
    reason.
7.  Track municipal review, project status, completion requests, and
    relevant complaints.

A contractor's proposed schedule must not become an approved schedule
until the appropriate municipal review/approval step has occurred.

### C. Municipal dashboard

Municipal staff should be able to:

1.  Review submitted projects and supporting documents.
2.  Mark documents as pending, verified, rejected, missing, or expired;
    include a reason for rejection where relevant.
3.  Review conflict warnings and proposed alternative schedules.
4.  Approve, reject, or request corrections to projects.
5.  Handle feasibility assessments, dependencies, operational
    constraints, and official priority decisions.
6.  Review citizen reports and feedback.
7.  Review contractor completion requests and record inspection
    outcomes.
8.  View project delays, unresolved reports, and performance summaries.
9.  Turn suitable citizen suggestions into proposals for municipal
    feasibility assessment.
10. Publish approved projects for contractors to apply for, if that
    workflow is enabled in the prototype.

For the hackathon, document verification and municipal decisions may be
simulated, but the interface must clearly indicate that the actions are
demo actions rather than real government verification.

------------------------------------------------------------------------

## 3. Project status lifecycle

Use consistent statuses across all interfaces.

Suggested primary lifecycle:

`Proposed → Under Review → Approved/Planned → Active → Awaiting Inspection → Completed`

Additional statuses:

-   Changes Requested
-   Rejected
-   Delayed
-   On Hold
-   Cancelled
-   Inspection Failed

Rules:

-   A contractor can submit a project, but municipal approval controls
    whether it becomes an approved public project.
-   Only planned or active projects should normally participate in
    future scheduling-conflict detection.
-   Cancelled and completed projects should not create new future
    scheduling conflicts.
-   A contractor's completion request changes the status to **Awaiting
    Inspection**, not directly to **Completed**.
-   Only an authorized municipal reviewer can mark the project completed
    after reviewing the completion evidence/inspection.
-   If inspection fails, record the reason and return the project to an
    appropriate state, such as Active or Inspection Failed.
-   Record status changes with timestamps and the actor responsible
    where feasible.

------------------------------------------------------------------------

## 4. Conflict detection and schedule resolution

### Conflict detection

Compare a newly proposed or edited project with relevant existing
projects.

For the hackathon MVP, flag a potential conflict when:

1.  Both projects affect the same road-segment identifier; and
2.  Their planned date intervals overlap; and
3.  Both projects have a relevant status, such as Proposed, Under
    Review, Approved/Planned, or Active, according to the chosen policy.

Use a consistent inclusive calendar-date rule:

`A.startDate <= B.endDate AND B.startDate <= A.endDate`

Normalize date values and validate them before comparison. Reject
invalid dates and end dates earlier than start dates.

For a future enhancement, use map geometry/affected areas to flag nearby
projects. Do not treat a radius match alone as proof of a definite
conflict. Separate: - **Direct conflict:** Same road segment and
overlapping dates. - **Potential nearby conflict:** Nearby affected
areas or shared access routes requiring human review.

### Conflict result

Every conflict should show:

-   Both project names and IDs
-   Road/segment
-   Overlapping dates
-   Departments/contractors
-   Conflict type and explanation
-   Current statuses
-   Suggested next action

### Alternative scheduling

The system may suggest an alternative date range that: - Preserves the
proposed project duration. - Avoids known conflicting dates on the
relevant segment. - Respects explicitly entered dependencies or
constraints, where implemented.

Show the recommendation as a proposal, not an automatic decision.
Municipal staff decide feasibility and official priority. Notify
affected contractors of proposed changes and record their acceptance,
rejection, or objection.

### Priority and verification rules

Do **not** automatically transfer an existing contractor's time slot to
a later, higher-priority submission. The three-day period, if shown, is
a target for municipal review---not a rule that automatically
reallocates schedules. Any approved change must have a recorded reason
and follow municipal review.

------------------------------------------------------------------------

## 5. Completion verification and complaint handling

### Completion workflow

1.  Contractor marks work as ready for inspection and submits a
    completion ticket, optional photos, and notes.
2.  The project becomes **Awaiting Inspection**.
3.  Municipal staff review the ticket and any relevant open reports.
4.  Staff record an inspection outcome:
    -   Approved: project becomes Completed.
    -   Rejected/needs more work: record a reason and return it to an
        appropriate active or inspection-failed status.
5.  The decision and timestamp are visible in the project history.

### Complaint workflow

Suggested complaint statuses:

`Submitted → Under Review → Verified / Rejected → Resolved / Closed`

Include: - Project association, if known - Category (incomplete work,
delay, poor workmanship, other) - Description and optional evidence -
Submission date - Review status - Municipal response or resolution
notes - Timestamps for status changes

### Complaints versus completion

If a contractor submits a completion request while relevant complaints
remain unresolved:

-   Flag the completion ticket for municipal review.
-   Show the relevant complaint and evidence to the authorized reviewer.
-   Do not automatically reject completion merely because a complaint
    exists.
-   Do not automatically mark the project completed based only on the
    contractor's claim.
-   Let the municipal reviewer record the inspection decision and
    reasoning.

Unverified complaints must not count as verified complaints in
contractor performance scoring.

------------------------------------------------------------------------

## 6. Top-performing contractor scoring system

Show a **Top Performing Contractors** leaderboard on the public landing
page.

### Eligibility

-   Use projects whose outcomes can reasonably be evaluated.
-   Exclude cancelled projects and projects still in progress from the
    eligible-project denominator.
-   Apply a configurable minimum of **5 eligible projects** before a
    contractor qualifies for the featured leaderboard.
-   Clearly label the leaderboard as sample/demo data when applicable.
-   Explain the scoring formula via a "How rankings work" link.

### Metrics

For each contractor, calculate:

`eligibleProjects = completedProjects + other eligible projects with a known outcome`

The implementation must define this consistently. For the MVP, a
practical definition is all non-cancelled projects with a final outcome
(Completed or a recorded unsuccessful/failed outcome). Exclude Proposed,
Under Review, Planned, Active, On Hold, and other unresolved projects.

`completionRate = completedProjects / eligibleProjects`

`verifiedComplaintRate = projectsWithVerifiedComplaints / eligibleProjects`

Count **projects with one or more verified complaints**, not the raw
number of complaint submissions, so repeated reports about one project
do not inflate the penalty. Do not count unresolved or rejected
complaints as verified complaints.

`verifiedComplaintFreeRate = 1 - verifiedComplaintRate`

`performanceScore = 100 × (0.60 × completionRate + 0.40 × verifiedComplaintFreeRate)`

Clamp/round the display score to a sensible precision (e.g., one decimal
place). Use the same formula for all contractors.

### Example

A contractor has 10 eligible projects: - 8 completed - 2 eligible
projects not completed successfully - 1 project has at least one
verified complaint

Then: - Completion rate = 8 / 10 = 0.80 - Verified complaint-free rate =
1 − 1 / 10 = 0.90 - Score = 100 × (0.60 × 0.80 + 0.40 × 0.90) = **84.0 /
100**

### Leaderboard display

Each contractor card should show: - Rank - Contractor name - Performance
score - Completed projects - Eligible projects - Completion rate -
Number of projects with verified complaints

Sort by performance score descending. For ties, prefer: 1. Higher
completion rate 2. Lower verified complaint rate 3. Higher number of
eligible projects

Never rank a contractor using unverified allegations. If the dataset is
simulated, visibly label the leaderboard as illustrative demo data.

------------------------------------------------------------------------

## 7. Landing page --- required section order

Follow this exact order.

### 1. Navbar and portal entry

-   CivicSync logo/name
-   About
-   Explore Projects
-   Top Contractors
-   How It Works
-   Sign in / portal access
-   Clear entry points for Citizen, Contractor, and Municipal users

### 2. Hero section

**Primary headline:**\
"One city. One plan. No unnecessary digging."

**Description:**\
"CivicSync brings citizens, contractors and municipal authorities
together to coordinate public works, detect scheduling conflicts and
keep communities informed."

**Supporting phrases:** - "Dig once. Build smarter." - "Every project
visible. Every delay accountable." - "Your street. Your city. Your right
to know." - "Less disruption. More transparency."

**Primary calls to action:** - Explore Projects - Contractor Portal

Use a suitable infrastructure/city visual, with strong contrast and
responsive layout.

### 3. Public project statistics

Show database-derived counts where possible: - Active projects -
Potential scheduling conflicts - Completed projects - Participating
contractors

If using seeded data, label it as demo/sample data. Do not claim
real-world impact or actual savings without evidence.

### 4. What CivicSync does

Use three concise cards: - **Coordinate:** Detect potentially
conflicting construction schedules. - **Make visible:** Publish project
details, dates, and status for residents. - **Build accountability:**
Track reports, inspections, and completion decisions.

Include the description:

"CivicSync is a civic infrastructure coordination platform designed to
bring citizens, contractors and municipal authorities onto one shared
system. It helps coordinate public works, improve project visibility and
support accountable execution."

### 5. Top-performing contractors

Display a ranked list of eligible contractors using the scoring formula
in Section 6. Include score, completed/eligible projects, completion
rate, and projects with verified complaints. Provide a "How rankings
work" explanation. Use clearly labelled demo data until real data
exists.

### 6. Interactive map and nearby projects

-   Map with project markers
-   Search by road, locality, or project name
-   Filters for Planned, Active, Delayed, and Completed
-   Project cards with contractor/department, dates, and status
-   "View all projects" action

### 7. How CivicSync works

1.  Register a project.
2.  Detect and coordinate potential conflicts.
3.  Track progress and citizen reports.
4.  Verify completion.

### 8. Citizen reporting and feedback

Heading: **"Your neighbourhood deserves better."**

Copy: "Report a problem, follow its status and help municipal
authorities understand what needs attention."

Buttons: - Report an Issue - Suggest an Improvement

### 9. Impact metrics

Possible metrics: - Potential conflicts detected - Conflicts resolved
through accepted schedule changes - Projects awaiting inspection -
Verified complaints resolved - Delayed projects

Only present a conflict as resolved when a schedule change or other
resolution has been recorded. Clearly distinguish simulated metrics from
actual measured outcomes.

### 10. Final call to action and footer

Suggested headline: **"A better city begins with better coordination."**

Include links to: - About CivicSync - Explore Projects - Citizen
Portal - Contractor Portal - Municipal Portal - Contact/Feedback -
Privacy - Terms

All visible buttons should work. Do not leave dead links or imply that
unfinished features are functional.

------------------------------------------------------------------------

## 8. Recommended implementation approach

Use the team's existing strengths and keep the system simple enough to
complete in a 24-hour, two-person hackathon.

Suggested stack: - Frontend: React + Vite - Styling: Tailwind CSS or an
existing styling system the team knows - Backend: Node.js + Express, or
Supabase if the team is already comfortable with it - Database: MongoDB
Atlas or Supabase database - Map: Leaflet + OpenStreetMap - Hosting:
public frontend URL plus a reachable backend/database

Prefer one reliable, deployable application over a large collection of
unfinished services.

### Minimum acceptance criteria

-   The public landing page loads at a public URL.
-   All portal entry points navigate to the correct pages.
-   Sample projects persist after refresh.
-   Project creation validates required fields and dates.
-   Conflict detection identifies overlapping schedules on the same road
    segment.
-   Conflict results explain the reason for each warning.
-   Alternative schedules are proposals and do not silently overwrite
    confirmed schedules.
-   Citizens can browse/search projects without sharing GPS location.
-   Citizens can submit a report and see its status.
-   Municipal users can review documents, complaints, and completion
    tickets in the demo workflow.
-   Projects only become Completed after municipal approval in the
    application.
-   Contractor rankings are calculated from data using the documented
    formula.
-   Unverified complaints do not affect verified-complaint scoring.
-   The landing page labels simulated figures clearly.
-   The deployed application can be tested without local setup.

### Final development principle

Prioritize a working end-to-end workflow, reliable deployment, and a
clear demonstration of conflict detection. Add optional polish only
after the critical paths work.
