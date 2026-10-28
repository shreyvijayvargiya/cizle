# Create Project

By @maarifkhatri91@gmail.com · general
Language: en · Domains: finance, education, health · Source: P01

Source page: https://prompts.chat

```
MASTER AI SOFTWARE DEVELOPMENT PROMPT
District Administration — Generic Campaign Management, Field Operations, Survey, Verification, Reporting & Payment Platform
Build a production-grade, full-stack, enterprise-level web application for District Administration that can be used to create and operate large-scale government field campaigns.
The platform must support campaigns involving:
•	One department.
•	Multiple departments.
•	Joint inter-department teams.
•	Senior officers.
•	Supervisors.
•	Field officers.
•	Reserve/backup employees.
•	Institutions.
•	Villages.
•	Wards.
•	Mohallas.
•	Households.
•	Other configurable target entities.
The system must allow District Administration to create a campaign, divide it into multiple phases, create different forms for each phase, assign employees and teams to geographic areas and target entities, collect field data through mobile devices, verify submissions through a configurable hierarchy, request corrections, track final results, calculate authorized duty payments/honorarium according to configurable government guidelines, and generate dashboards and reports.
The system must be generic.
Do not hard-code the application for Census only.
Census 2027 should be implemented as an example campaign type.
Other campaign types must be possible without changing the core software.
Examples:
•	Census 2027.
•	School Inspection.
•	Hospital Inspection.
•	Road Survey.
•	Flood Damage Survey.
•	Village Survey.
•	PDS Inspection.
•	Anganwadi Inspection.
•	Infrastructure Survey.
•	Government Scheme Verification.
•	Disaster Assessment.
•	Public Grievance Field Verification.
•	Any future district campaign.
________________________________________
1. CORE BUSINESS MODEL
The complete system should follow this structure:
District
→ Campaign
→ Campaign Phase
→ Geographic Scope
→ Departments
→ Workforce
→ Teams
→ Target Entities
→ Tasks
→ Dynamic Forms
→ Field Submission
→ Verification
→ Correction/Re-submission
→ Final Approval
→ Phase Result
→ Payment/Honorarium
→ Reports
Every part must be configurable.
________________________________________
2. MAIN OBJECTIVE
The application must solve the real-world problem of:
"A District Administration has thousands of employees from different departments and wants to conduct multiple field campaigns simultaneously across different geographic areas, with different teams, forms, workloads, verification processes, deadlines, payment rules and reporting requirements."
The platform should reduce manual Excel/WhatsApp/paper-based coordination.
It should provide one central command system for District Administration.
________________________________________
3. MULTIPLE CAMPAIGNS
District Administration must be able to run multiple campaigns simultaneously.
Example:
•	Census 2027.
•	School Inspection.
•	Road Survey.
•	Flood Assessment.
•	Drinking Water Survey.
Each campaign is independent.
Each campaign can have:
•	Different departments.
•	Different employees.
•	Different geographic areas.
•	Different forms.
•	Different workflow.
•	Different deadlines.
•	Different payment rules.
•	Different target entities.
•	Different reporting structure.
________________________________________
4. MULTI-PHASE CAMPAIGN
Every campaign can have multiple phases.
Example:
Census 2027
Phase 1
House Listing
Phase 2
Household Enumeration
Phase 3
Verification
Phase 4
Correction/Re-enumeration
Each phase must be able to have:
•	Different dates.
•	Different forms.
•	Different workforce.
•	Different teams.
•	Different geographic assignments.
•	Different instructions.
•	Different workload.
•	Different verification workflow.
•	Different payment rules.
•	Different results.
Do not assume that all phases use the same employees or form.
________________________________________
5. CAMPAIGN TYPES
Create configurable campaign types.
Examples:
•	Census.
•	Inspection.
•	Survey.
•	Verification.
•	Enumeration.
•	Monitoring.
•	Assessment.
•	Disaster response.
•	Infrastructure survey.
•	Custom.
Admin can create a new campaign type.
________________________________________
6. ORGANIZATIONAL HIERARCHY
The organization must be configurable.
Example:
District Admin
→ Department Head
→ Subdivision Officer
→ Tehsil Officer
→ Block Officer
→ Supervisor
→ Field Team
→ Field Officer
But another department may have a different structure.
Therefore do not hard-code hierarchy levels.
Use:
OrganizationNode
with configurable parent/child relationships.
________________________________________
7. GEOGRAPHIC HIERARCHY
Support flexible geographic hierarchy.
Example rural:
State
→ District
→ Subdivision
→ Tehsil
→ Block
→ Village
→ Mohalla/Hamlet
→ Household
Example urban:
State
→ District
→ Municipality/Nagar Palika
→ Zone
→ Ward
→ Mohalla
→ Household
The system must support both.
Do not assume every area has the same structure.
________________________________________
8. GEOGRAPHIC MASTER DATA
Create geographic master data management.
Admin can manage:
•	District.
•	Subdivision.
•	Tehsil.
•	Block.
•	Municipality.
•	Ward.
•	Village.
•	Mohalla.
•	GPS coordinates.
•	Boundary/polygon where available.
Support bulk import through:
•	CSV.
•	Excel.
•	Government master-data API where available.
Validate duplicate geographic records.
________________________________________
9. TARGET ENTITY ENGINE
Do not make "household" the only target.
Create a generic target entity system.
Possible entities:
•	Household.
•	Person.
•	School.
•	Hospital.
•	Road.
•	Village.
•	Shop.
•	Anganwadi.
•	Government building.
•	Water source.
•	Custom entity.
Example:
Campaign:
School Inspection
Target:
School
Campaign:
Census
Target:
Household
Campaign:
Road Survey
Target:
Road segment.
________________________________________
10. ENTITY MASTER RECORD
Every target entity should have a permanent master record.
Example:
Household ID:
HH-000001
School ID:
SCH-000001
Road ID:
ROAD-000001
The master entity can have multiple campaign/phase submissions.
This prevents duplication.
________________________________________
11. HOUSEHOLD MODEL
For Census-type campaigns support:
Household
→ Household members
→ Individual person records
The household can have:
•	Household ID.
•	Address.
•	Geographic hierarchy.
•	House number.
•	GPS.
•	Status.
•	Source.
•	Phase history.
The individual/person structure must support variable number of persons.
________________________________________
12. EMPLOYEE MASTER
Create a central employee database.
Fields:
•	Employee ID.
•	Name.
•	Mobile number.
•	Designation.
•	Department.
•	Office.
•	Posting location.
•	District.
•	Subdivision.
•	Tehsil.
•	Block.
•	Role.
•	Employment status.
•	Availability.
•	Reserve status.
•	Training status.
Employee ID should be unique.
Mobile number should be unique where applicable.
________________________________________
13. BULK EMPLOYEE IMPORT
Support import of thousands of employees.
Formats:
•	Excel.
•	CSV.
Before import:
•	Validate.
•	Detect duplicate Employee IDs.
•	Detect duplicate mobile numbers.
•	Detect missing fields.
•	Detect invalid departments.
•	Show row-level errors.
Allow:
Import Valid Records
without losing valid records because of invalid rows.
________________________________________
14. EMPLOYEE AVAILABILITY
Employee status:
•	Available.
•	Assigned.
•	On Duty.
•	On Leave.
•	Unavailable.
•	Reserve.
•	Activated Reserve.
•	Released.
•	Suspended.
Campaign assignment must check availability.
Prevent incompatible double assignment.
________________________________________
15. MULTI-DEPARTMENT CAMPAIGNS
A campaign can include multiple departments.
Example:
School Inspection:
•	Education.
•	PWD.
•	Food.
•	Revenue.
Each department can have different responsibilities.
________________________________________
16. JOINT TEAMS
Create a team engine.
A team can contain employees from different departments.
Example:
Team 001:
•	Revenue employee.
•	Education employee.
•	PWD employee.
Each team has:
•	Team ID.
•	Team leader.
•	Members.
•	Department.
•	Geographic responsibility.
•	Campaign.
•	Phase.
•	Status.
________________________________________
17. TEAM FORMATION
Allow:
Manual
Admin selects employees.
Automatic
System creates teams based on configured rules.
Rules may include:
•	Team size.
•	Department combination.
•	Geographic area.
•	Designation.
•	Skill.
•	Availability.
•	Workload.
________________________________________
18. TEAM LEADER
Team leader can:
•	See team members.
•	See assigned tasks.
•	Monitor progress.
•	Review team-level work where authorized.
•	Report employee absence.
•	Request replacement.
•	Submit team reports.
Do not automatically grant access to all data just because someone is team leader.
Permissions must still apply.
________________________________________
19. RESERVE EMPLOYEE SYSTEM
Every large campaign should support reserve employees.
Reserve employees can replace active staff when necessary.
Reasons:
•	Leave.
•	Illness.
•	Transfer.
•	Emergency.
•	Administrative requirement.
•	Other authorized reasons.
Workflow:
Active Employee
→ Unavailable
→ Supervisor reports
→ Authorized officer approves
→ Reserve employee selected
→ Reserve activated
→ Assignment transferred
→ Audit record created.
________________________________________
20. RESERVE TEAM
Support reserve teams in addition to reserve individuals.
Example:
Active Team:
Team 001
Reserve Team:
Team R001
If an entire team becomes unavailable, the reserve team can be activated.
________________________________________
21. WORKLOAD MANAGEMENT
Before launching a campaign phase, show:
Total target entities.
Required workforce.
Available workforce.
Reserve workforce.
Expected workload per employee.
Expected workload per team.
Example:
Targets:
1,000,000
Teams:
10,000
Average:
100 targets/team.
Allow authorized admins to adjust distribution.
________________________________________
22. WORKLOAD BALANCING
Support:
•	Equal distribution.
•	Geographic distribution.
•	Random distribution.
•	Manual distribution.
•	Skill-based distribution.
•	Workload balancing.
The system should detect overloaded employees/teams.
Example:
Employee A:
300 tasks
Employee B:
80 tasks
Show warning.
________________________________________
23. RANDOM ASSIGNMENT
Support random assignment where required.
Example:
10,000 schools
1,000 officers
System randomly assigns schools.
Prevent duplicate assignments.
Allow administrators to preview before activation.
Maintain assignment history.
________________________________________
24. GEOGRAPHIC ASSIGNMENT
Tasks can be assigned based on:
•	District.
•	Subdivision.
•	Tehsil.
•	Block.
•	Village.
•	Ward.
•	Mohalla.
•	GPS boundary.
Support polygon-based geographic assignment where feasible.
________________________________________
25. CAMPAIGN CREATION WIZARD
Create a professional multi-step wizard.
Step 1
Campaign details.
Step 2
Campaign type.
Step 3
Geographic scope.
Step 4
Departments.
Step 5
Workforce.
Step 6
Teams.
Step 7
Target entities.
Step 8
Form.
Step 9
Assignment.
Step 10
Verification workflow.
Step 11
Payment rules.
Step 12
Guidelines/documents.
Step 13
Preview.
Step 14
Launch.
________________________________________
26. CAMPAIGN VALIDATION BEFORE LAUNCH
Before launch check:
•	No target entities.
•	No teams.
•	No officers.
•	Missing form.
•	Missing mandatory questions.
•	Missing geographic assignment.
•	Missing verification workflow.
•	Missing payment configuration where required.
•	Employee conflicts.
•	Duplicate assignments.
•	Insufficient workforce.
•	Invalid dates.
Show warnings and errors.
Do not allow launch when critical requirements are missing.
________________________________________
27. DYNAMIC FORM BUILDER
District Admin must create forms without coding.
Question types:
•	Short text.
•	Long text.
•	Integer.
•	Decimal.
•	Percentage.
•	Currency/amount.
•	Date.
•	Date/time.
•	Yes/No.
•	Radio.
•	Checkbox.
•	Dropdown.
•	Multi-select.
•	Image.
•	Multiple image.
•	Video.
•	File.
•	GPS.
•	Signature.
•	Rating.
•	Table.
•	Repeating group.
•	Calculated field.
________________________________________
28. FORM SECTIONS
Forms can contain sections.
Example:
School Inspection:
1.	School Information.
2.	Infrastructure.
3.	PWD.
4.	Food.
5.	Education.
6.	Final Remarks.
________________________________________
29. CONDITIONAL QUESTIONS
Support rules.
Example:
IF:
Building damaged = YES
THEN:
Show:
•	Damage type.
•	Damage severity.
•	Damage photo.
•	Repair estimate.
Otherwise hide these fields.
Create a visual condition builder.
________________________________________
30. REPEATING GROUPS
For Census:
Household:
Number of members = 6
Automatically create:
Person 1
Person 2
Person 3
Person 4
Person 5
Person 6.
Support nested repeating data where required.
________________________________________
31. FORM VALIDATION
Each question can have:
•	Required.
•	Minimum.
•	Maximum.
•	Length.
•	Regex.
•	Allowed options.
•	Dependency.
•	Evidence requirement.
•	GPS requirement.
Validation must happen:
Frontend + Backend
Never trust frontend validation alone.
________________________________________
32. FORM VERSIONING
Forms must be versioned.
Example:
Form v1
Form v2
Historical submissions remain associated with their original form version.
Changing a form must not change old submissions.
________________________________________
33. CAMPAIGN FORM
Each phase can have its own form.
Example:
Campaign:
Census 2027
Phase 1:
Form A
Phase 2:
Form B
Phase 3:
Form C
________________________________________
34. FIELD OFFICER MOBILE APP
Build a mobile-first PWA.
Field employee dashboard:
Campaigns
→ Active Phase
→ Assigned Area
→ Assigned Tasks
→ Completed
→ Pending
→ Corrections
→ Drafts
→ Sync
→ Notifications
________________________________________
35. FIELD TASK
Each task contains:
•	Task ID.
•	Campaign.
•	Phase.
•	Target.
•	Geographic location.
•	Assigned team.
•	Assigned employee.
•	Deadline.
•	Priority.
•	Status.
•	Instructions.
________________________________________
36. TASK STATUS
Use:
•	Not Started.
•	Assigned.
•	Accepted.
•	In Progress.
•	Draft.
•	Submitted.
•	Under Verification.
•	Correction Required.
•	Resubmitted.
•	Approved.
•	Rejected.
•	Reassigned.
•	Overdue.
•	Completed.
________________________________________
37. FIELD DATA COLLECTION
Field officer should be able to:
•	Open task.
•	Start task.
•	Fill form.
•	Save draft.
•	Resume later.
•	Capture GPS.
•	Capture image.
•	Upload video.
•	Add remarks.
•	Submit.
________________________________________
38. GPS
When configured:
Capture:
•	Latitude.
•	Longitude.
•	Accuracy.
•	Timestamp.
Optionally calculate distance from target location.
Configurable:
•	Warning.
•	Supervisor review.
•	Block submission.
________________________________________
39. PHOTO
Support:
•	Camera.
•	Gallery.
•	Multiple images.
•	Compression.
•	Preview.
•	Retake.
Associate image with:
•	Campaign.
•	Phase.
•	Task.
•	Question.
•	Employee.
________________________________________
40. VIDEO
Support:
•	Record.
•	Select.
•	Preview.
•	Upload.
•	Progress.
•	Retry.
•	Maximum size.
•	Maximum duration.
Use object storage.
Do not store large videos directly in PostgreSQL.
________________________________________
41. OFFLINE MODE
Mobile application must work with poor connectivity.
Use:
•	PWA.
•	IndexedDB.
•	Local draft.
•	Offline task list.
•	Sync queue.
Status:
Online
Offline
Syncing
Synced
Failed.
________________________________________
42. OFFLINE CONFLICT MANAGEMENT
If the same record changes from multiple sources:
Do not silently overwrite.
Create conflict:
Conflict requires review.
Maintain version history.
________________________________________
43. SUBMISSION
Before final submission:
Show review page.
Example:
Required fields:
✓
GPS:
✓
Required images:
✓
Validation:
✓
Then:
Submit
Server returns:
Submission ID.
Never show successful submission before server confirmation.
________________________________________
44. VERIFICATION ENGINE
Create configurable workflow.
Example:
Field Officer
→ Supervisor
→ Tehsil Officer
→ Subdivision Officer
→ Department Head
→ District Admin
But administrators can configure different levels.
________________________________________
45. VERIFICATION ACTIONS
Reviewer can:
•	Approve.
•	Reject.
•	Request correction.
•	Add comment.
•	Escalate.
•	Reassign.
•	View history.
________________________________________
46. CORRECTION WORKFLOW
Example:
Reviewer:
"Please upload a clear photograph."
Status:
Correction Required.
Employee receives notification.
Employee edits only permitted fields.
Resubmits.
Reviewer receives notification.
________________________________________
47. DATA VERSIONING
Every submission must preserve:
•	Version.
•	Answers.
•	Files.
•	GPS.
•	User.
•	Timestamp.
•	Changes.
•	Reason.
Never destroy historical versions.
________________________________________
48. FINAL APPROVAL
Only approved records should be included in final results when the campaign requires final approval.
Allow reports to distinguish:
•	Preliminary.
•	Submitted.
•	Verified.
•	Final Approved.
________________________________________
49. DATA QUALITY ENGINE
Create automatic quality checks.
Examples:
•	Duplicate household.
•	Duplicate task.
•	Missing GPS.
•	Impossible values.
•	Inconsistent totals.
•	Required evidence missing.
•	Conflicting phase data.
•	Unusual completion speed.
•	Repeated identical GPS coordinates where suspicious.
•	Excessive submissions in a short time.
Flag anomalies for review.
Do not automatically accuse an employee of misconduct.
Mark:
Data Quality Exception
________________________________________
50. EXCEPTION MANAGEMENT
Create a central Exception Center.
Examples:
•	Missing household.
•	Duplicate household.
•	GPS issue.
•	Incomplete form.
•	Conflicting data.
•	Overdue task.
•	Employee unavailable.
•	Team unavailable.
•	Payment failure.
•	Sync failure.
Admin can assign exceptions.
________________________________________
51. CENSUS 2027 EXAMPLE
Create Census 2027 as a sample campaign.
Do not invent official Census questions.
Use placeholder/configurable forms or officially supplied forms.
Example structure:
Census 2027
→ Phase 1: House Listing
→ Phase 2: Enumeration
→ Phase 3: Verification
→ Phase 4: Correction
Each phase has different forms and possibly different workforce.
________________________________________
52. CENSUS GEOGRAPHIC STRUCTURE
Support:
District
→ Subdivision
→ Tehsil
→ Municipality / Nagar Palika
→ Ward
→ Village
→ Mohalla
→ Household
The actual hierarchy must be configurable.
________________________________________
53. CENSUS JOINT TEAM
Example:
Team 001
Area:
Ward 10 / Mohalla A
Members:
•	Education Department employee.
•	Revenue Department employee.
•	Municipal employee.
The team visits households within its assigned area.
________________________________________
54. HOUSEHOLD CENSUS FLOW
Team opens:
Household HH-000123
System displays:
•	Location.
•	Address.
•	Previous phase information if authorized.
•	Current phase form.
Team collects required information.
Submits.
Result goes through configured verification workflow.
________________________________________
55. CENSUS MULTI-PHASE WORKLOAD
Support distributing work over multiple phases to reduce employee workload.
Example:
Phase 1:
Employee Group A
Phase 2:
Employee Group B
Phase 3:
Employee Group C
Or the same employees can participate in multiple phases.
The system must support both.
________________________________________
56. PAYMENT/HONORARIUM ENGINE
Create a dedicated payment module.
IMPORTANT:
Never hard-code government payment amounts.
Payment amounts must come from authorized configurable rules based on the applicable government order/guideline.
________________________________________
57. PAYMENT RULE
Payment rule fields:
•	Campaign.
•	Phase.
•	Role.
•	Department if applicable.
•	Duty type.
•	Calculation method.
•	Amount/rate.
•	Effective date.
•	Government order reference.
•	Version.
•	Approval status.
________________________________________
58. PAYMENT CALCULATION
Possible calculation models:
•	Fixed amount.
•	Per day.
•	Per task.
•	Per approved household.
•	Role-based.
•	Phase-based.
•	Component-based.
Do not assume these are legally applicable.
The administrator configures the permitted calculation method according to official rules.
________________________________________
59. PAYMENT ELIGIBILITY
Example:
Assignment
↓
Duty completed
↓
Required work completed
↓
Submission accepted/approved
↓
Eligibility generated
↓
Payment approval
↓
Payment processing
↓
Paid
Exact rules must be configurable.
________________________________________
60. EMPLOYEE PAYMENT DASHBOARD
Employee sees:
Campaign:
Census 2027
Phase:
Phase 1
Duty:
Completed
Eligibility:
Eligible
Payment:
₹XXXX
Status:
Pending / Approved / Processing / Paid.
Sensitive financial information must be protected.
________________________________________
61. PAYMENT STATUS
Statuses:
•	Not Eligible.
•	Pending Eligibility.
•	Eligible.
•	Pending Approval.
•	Approved.
•	Processing.
•	Paid.
•	Failed.
•	Returned.
•	On Hold.
•	Disputed.
________________________________________
62. PAYMENT REMINDERS
If payment is pending:
Send:
•	In-app notification.
•	SMS where configured.
•	Email where configured.
Example:
Your approved campaign duty payment is still pending processing.
Do not make unverified claims about payment timing.
________________________________________
63. PAYMENT EXCEPTIONS
Support:
•	Failed payments.
•	Incorrect records.
•	Missing approval.
•	Duplicate payment prevention.
•	Hold.
•	Retry.
•	Resolution.
Maintain complete audit trail.
________________________________________
64. PAYMENT DUPLICATE PREVENTION
Prevent duplicate payment for:
Employee + Campaign + Phase + Duty
unless explicitly allowed by an authorized adjustment process.
________________________________________
65. ATTENDANCE / DUTY PROOF
Where required by campaign rules, support duty attendance.
Possible methods:
•	Start duty.
•	End duty.
•	GPS.
•	Team leader confirmation.
•	Supervisor approval.
•	Task completion.
Do not assume attendance equals payment eligibility.
Make it configurable.
________________________________________
66. TRAINING
Track:
•	Training assigned.
•	Training completed.
•	Training date.
•	Training material.
•	Assessment.
•	Certification.
A campaign phase can optionally require training before assignment.
________________________________________
67. GUIDELINES / DOCUMENTS
Campaign administrators can upload:
•	Government orders.
•	Guidelines.
•	SOPs.
•	Training documents.
•	Circulars.
•	Forms.
•	Payment orders.
Documents should be versioned.
________________________________________
68. NOTIFICATION ENGINE
Support:
•	In-app.
•	SMS.
•	Email.
•	Push notifications.
Notifications:
•	New task.
•	New campaign.
•	Phase starting.
•	Deadline.
•	Overdue.
•	Correction.
•	Approval.
•	Reassignment.
•	Reserve activation.
•	Payment update.
________________________________________
69. ESCALATION ENGINE
Create configurable escalation.
Example:
Task overdue by 2 days:
→ Supervisor notification.
Overdue by 4 days:
→ Tehsil Officer.
Overdue by 7 days:
→ District Admin.
The escalation schedule must be configurable.
________________________________________
70. REMINDER ENGINE
Support scheduled reminders.
Examples:
7 days before deadline.
3 days before.
1 day before.
Due date.
Overdue.
Payment pending for X days.
________________________________________
71. DISTRICT COMMAND DASHBOARD
Create a professional command center.
Show:
Campaigns
Total.
Active.
Completed.
Delayed.
Workforce
Total.
Assigned.
Available.
Reserve.
Unavailable.
Tasks
Total.
Completed.
Pending.
Overdue.
Correction.
Verification
Submitted.
Under review.
Approved.
Rejected.
Payment
Eligible.
Approved.
Paid.
Pending.
Failed.
________________________________________
72. GEOGRAPHIC DRILL-DOWN
Dashboard:
District
↓
Subdivision
↓
Tehsil
↓
Village/Ward
↓
Mohalla
↓
Household
At every level:
•	Total.
•	Assigned.
•	Completed.
•	Pending.
•	Verified.
•	Exceptions.
________________________________________
73. MAP
Provide interactive map.
Show:
•	Assigned areas.
•	Completed targets.
•	Pending targets.
•	Exceptions.
•	GPS submissions where authorized.
Use clustering for large datasets.
Do not attempt to render millions of points simultaneously.
________________________________________
74. DEPARTMENT DASHBOARD
Department Head sees:
•	Campaign participation.
•	Employees.
•	Teams.
•	Workload.
•	Completion.
•	Verification.
•	Exceptions.
•	Payment.
Only authorized department data.
________________________________________
75. SUBDIVISION / TEHSIL DASHBOARD
Show local progress.
Example:
Tehsil A:
Targets: 100,000
Completed: 92,000
Pending: 8,000
Completion:
92%
________________________________________
76. TEAM DASHBOARD
Team Leader sees:
•	Members.
•	Assigned targets.
•	Completed.
•	Pending.
•	Corrections.
•	Overdue.
•	Sync status.
________________________________________
77. EMPLOYEE DASHBOARD
Employee sees:
•	My campaigns.
•	My phases.
•	My tasks.
•	My progress.
•	Corrections.
•	Notifications.
•	Payment.
•	Guidelines.
________________________________________
78. REPORTING ENGINE
Create configurable reports.
Reports:
•	Campaign.
•	Phase.
•	Department.
•	Employee.
•	Team.
•	Geography.
•	Target entity.
•	Verification.
•	Exception.
•	Payment.
•	Workforce.
•	Productivity.
________________________________________
79. REPORT FILTERS
Filters:
•	Campaign.
•	Phase.
•	Date.
•	Department.
•	Employee.
•	Team.
•	District.
•	Subdivision.
•	Tehsil.
•	Village.
•	Ward.
•	Mohalla.
•	Status.
________________________________________
80. EXPORT
Support:
•	Excel.
•	CSV.
•	PDF.
Large reports must be generated asynchronously.
________________________________________
81. REPORT SCHEDULING
Allow authorized users to schedule reports.
Example:
Every day at 6 PM:
District Campaign Progress Report
Send to authorized users.
________________________________________
82. DATA ACCESS CONTROL
Use:
RBAC + Geographic Scope + Department Scope + Campaign Scope
Example:
Field Officer:
Only assigned tasks.
Tehsil Officer:
Authorized tehsil.
Department Head:
Authorized department.
District Admin:
District-wide.
Never rely only on frontend restrictions.
________________________________________
83. SUPER ADMIN
Super Admin manages:
•	Districts.
•	Departments.
•	Users.
•	Roles.
•	Permissions.
•	System settings.
•	Master data.
•	Integrations.
________________________________________
84. DISTRICT ADMIN
District Admin can:
•	Create campaigns.
•	Create phases.
•	Create forms.
•	Select departments.
•	Manage workforce.
•	Create teams.
•	Assign areas.
•	Assign tasks.
•	Configure verification.
•	Configure payment rules where authorized.
•	Monitor progress.
•	Approve/review data.
•	Generate reports.
________________________________________
85. DEPARTMENT HEAD
Can:
•	View department campaigns.
•	Manage department workforce.
•	Review submissions.
•	Verify data.
•	Monitor department performance.
•	Generate authorized reports.
________________________________________
86. FIELD OFFICER
Can:
•	Login.
•	View assigned duties.
•	Collect field data.
•	Capture GPS.
•	Capture media.
•	Save drafts.
•	Submit.
•	Correct.
•	Resubmit.
•	View payment status.
•	View guidelines.
________________________________________
87. PAYMENT OFFICER
Can:
•	Review eligibility.
•	Approve payment.
•	Process payment.
•	View failures.
•	Retry authorized payments.
•	Generate payment reports.
Do not give payment officers unnecessary household-data access.
________________________________________
88. SYSTEM SECURITY
Implement:
•	Password hashing.
•	Secure authentication.
•	OTP.
•	Session security.
•	JWT or secure session architecture.
•	Refresh token rotation where applicable.
•	Rate limiting.
•	API authorization.
•	Input validation.
•	File validation.
•	Secure headers.
•	CORS.
•	CSRF protection where applicable.
•	SQL injection protection.
•	XSS protection.
•	Audit logs.
________________________________________
89. DATA PRIVACY
Collect only officially required information.
Sensitive information should have:
•	Strict access control.
•	Encryption where appropriate.
•	Audit logs.
•	Retention rules.
•	Export restrictions.
Do not display sensitive household/person information on public dashboards.
________________________________________
90. AUDIT LOG
Record every important operation.
Examples:
•	Login.
•	OTP.
•	Campaign creation.
•	Phase creation.
•	Form changes.
•	Employee assignment.
•	Team creation.
•	Household assignment.
•	Submission.
•	Correction.
•	Approval.
•	Reassignment.
•	Reserve activation.
•	Payment calculation.
•	Payment approval.
•	Payment processing.
•	Export.
Audit log should be immutable for normal users.
________________________________________
91. SYSTEM LOGGING
Use structured application logs.
Separate:
•	Application logs.
•	Security logs.
•	Audit logs.
•	Error logs.
Do not expose internal errors to users.
________________________________________
92. DATABASE
Use:
PostgreSQL
ORM:
Prisma
Design a normalized schema.
Important entities:
•	State.
•	District.
•	Department.
•	OrganizationNode.
•	GeographicNode.
•	User.
•	Employee.
•	Role.
•	Permission.
•	Campaign.
•	CampaignPhase.
•	CampaignDepartment.
•	CampaignGeography.
•	TargetEntity.
•	Household.
•	Person.
•	Team.
•	TeamMember.
•	ReserveEmployee.
•	Task.
•	TaskAssignment.
•	Form.
•	FormVersion.
•	FormSection.
•	FormQuestion.
•	FormOption.
•	FormCondition.
•	Submission.
•	SubmissionVersion.
•	SubmissionAnswer.
•	SubmissionFile.
•	GPSRecord.
•	Verification.
•	CorrectionRequest.
•	Exception.
•	PaymentRule.
•	PaymentRuleVersion.
•	EmployeePayment.
•	PaymentComponent.
•	PaymentTransaction.
•	Notification.
•	GuidelineDocument.
•	Training.
•	AuditLog.
•	Report.
•	ReportJob.
Use appropriate:
•	Foreign keys.
•	Unique constraints.
•	Indexes.
•	Soft deletion where appropriate.
•	Timestamps.
________________________________________
93. DATA RETENTION
Build configurable retention policies.
Different records may have different retention requirements.
Do not automatically delete official records without an authorized retention policy.
________________________________________
94. BACKUP
Design:
•	Automated database backups.
•	Point-in-time recovery where supported.
•	Object storage backup.
•	Backup monitoring.
•	Restore testing.
________________________________________
95. DISASTER RECOVERY
Document:
•	Recovery procedure.
•	Backup restoration.
•	Database recovery.
•	File recovery.
•	Queue recovery.
•	Disaster scenarios.
________________________________________
96. SCALABILITY
Design for:
•	50,000+ employees.
•	Millions of targets.
•	Millions of submissions.
•	Large file uploads.
•	Thousands of concurrent mobile users.
Use:
•	Pagination.
•	Cursor pagination where appropriate.
•	Database indexes.
•	Redis.
•	Queue workers.
•	Object storage.
•	Background jobs.
•	Horizontal scaling.
•	Database connection pooling.
________________________________________
97. BACKGROUND JOB SYSTEM
Use:
Redis + BullMQ or equivalent.
Jobs:
•	Report generation.
•	Excel export.
•	PDF generation.
•	Notifications.
•	SMS.
•	Email.
•	Image processing.
•	Video processing.
•	Payment processing integration.
•	Reminder jobs.
•	Escalation.
•	Data aggregation.
________________________________________
98. FILE STORAGE
Use:
•	S3-compatible storage.
Store only metadata in PostgreSQL.
Metadata:
•	File ID.
•	Name.
•	Type.
•	Size.
•	Storage path.
•	Upload user.
•	Campaign.
•	Phase.
•	Task.
•	Question.
•	Timestamp.
Use signed URLs for private files.
________________________________________
99. MOBILE PERFORMANCE
Optimize for:
•	Low-end Android devices.
•	Slow networks.
•	Limited storage.
•	Intermittent connectivity.
Avoid unnecessary animations.
Keep forms lightweight.
Compress images.
Use resumable uploads where practical.
________________________________________
100. ACCESSIBILITY
Support:
•	High contrast.
•	Large touch targets.
•	Keyboard navigation.
•	Screen readers.
•	Proper labels.
•	Accessible validation messages.
________________________________________
101. USER INTERFACE
Admin desktop:
Sidebar
→ Dashboard
→ Campaigns
→ Phases
→ Workforce
→ Teams
→ Geography
→ Targets
→ Forms
→ Tasks
→ Verification
→ Payments
→ Reports
→ Maps
→ Notifications
→ Audit Logs
→ Settings
Field mobile:
Home
My Campaigns
My Tasks
Corrections
Notifications
Payment
Guidelines
Profile
________________________________________
102. DESIGN STYLE
Use a professional government administration design.
Primary:
Navy/blue.
Secondary:
White/gray.
Use:
•	Tables.
•	Cards.
•	Status badges.
•	Charts.
•	Maps.
•	Progress bars.
Avoid excessive decorative UI.
Prioritize usability.
________________________________________
103. BULK OPERATIONS
Admin must be able to:
•	Import employees.
•	Import geography.
•	Import target entities.
•	Assign teams in bulk.
•	Reassign tasks in bulk.
•	Activate reserve employees in bulk.
•	Generate reports in bulk.
Always show confirmation before large operations.
________________________________________
104. BULK OPERATION SAFETY
For every bulk action:
1.	Preview.
2.	Validate.
3.	Show number of affected records.
4.	Confirm.
5.	Execute.
6.	Show result.
7.	Provide error report.
8.	Record audit event.
________________________________________
105. SEARCH
Global search across authorized data:
•	Campaign.
•	Employee.
•	Team.
•	Household.
•	Institution.
•	Task.
•	Submission.
•	Geographic area.
________________________________________
106. DUPLICATE DETECTION
Detect:
•	Duplicate employee.
•	Duplicate target.
•	Duplicate household.
•	Duplicate task.
•	Duplicate assignment.
•	Duplicate payment.
Do not automatically delete records.
Flag them for review.
________________________________________
107. NOTIFICATION PREFERENCES
Allow users to configure permitted notification preferences.
However, mandatory government alerts cannot be disabled if configured as mandatory.
________________________________________
108. API ARCHITECTURE
Use a clean REST API or equivalent.
Organize APIs by module:
/auth
/users
/employees
/departments
/geography
/campaigns
/phases
/teams
/targets
/tasks
/forms
/submissions
/verifications
/exceptions
/payments
/notifications
/reports
/audit
/files
________________________________________
109. API DOCUMENTATION
Generate:
OpenAPI / Swagger
Document:
•	Authentication.
•	Request.
•	Response.
•	Errors.
•	Permissions.
________________________________________
110. ERROR HANDLING
Use consistent API responses.
Example:
{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "Required fields are missing."
}
}
Never expose:
•	Database errors.
•	Stack traces.
•	Secrets.
•	Internal infrastructure details.
________________________________________
111. FRONTEND STATE
Use an appropriate state-management/data-fetching strategy.
Use:
•	Server-side fetching where appropriate.
•	Query caching.
•	Optimistic updates only when safe.
•	Offline state.
________________________________________
112. OFFLINE DATA SECURITY
Do not store unnecessary sensitive personal data permanently on the device.
Encrypt/local-protect sensitive offline storage where practical.
Provide device/session expiration.
________________________________________
113. SESSION SECURITY
Support:
•	Session timeout.
•	Device/session management.
•	Logout all devices where authorized.
•	Token revocation.
•	Suspicious login detection.
________________________________________
114. OTP SECURITY
OTP:
•	Expiration.
•	Rate limiting.
•	Attempt limit.
•	Resend cooldown.
•	Secure storage.
•	Audit logging.
Never store OTP in plain text longer than necessary.
________________________________________
115. LOGIN
Support:
Mobile Number
→ OTP for initial verification
→ Password creation
Then:
Mobile Number
→ Password
→ Dashboard
Forgot password:
Mobile
→ OTP
→ New Password
________________________________________
116. GOVERNMENT INTEGRATIONS
Build integration interfaces rather than hard-code external systems.
Possible future integrations:
•	SMS gateway.
•	Government employee master database.
•	Official GIS.
•	Payment/treasury system.
•	Identity/authentication system.
•	Email.
•	Notification gateway.
Use adapters/interfaces so providers can be changed.
________________________________________
117. NO FAKE INTEGRATIONS
If a real government API is not available:
Use a clearly marked development/mock adapter.
Do not pretend that a fake integration is real.
________________________________________
118. PAYMENT INTEGRATION
Payment processing should initially support:
Manual/administrative status
and be architected for future integration with an authorized government payment/treasury system.
Do not invent a government payment API.
________________________________________
119. IMPORT/EXPORT SECURITY
Exports must respect authorization.
Do not allow field officers to export all district data.
Sensitive exports should require additional authorization where appropriate.
Log every export.
________________________________________
120. DATA QUALITY DASHBOARD
Show:
•	Missing data.
•	Invalid data.
•	Duplicate data.
•	GPS exceptions.
•	Correction rates.
•	Rejection rates.
•	Unusual activity.
________________________________________
121. PRODUCTIVITY METRICS
Show:
•	Tasks completed per day.
•	Average task duration.
•	Completion rate.
•	Correction rate.
•	Approval rate.
•	Overdue rate.
Do not use productivity metrics as automatic disciplinary conclusions.
________________________________________
122. CAMPAIGN TEMPLATES
Allow administrators to save:
Campaign Template
Example:
School Inspection Template.
When creating a new campaign:
Use Template
Then modify:
•	Form.
•	Departments.
•	Geography.
•	Workforce.
•	Dates.
•	Payment.
________________________________________
123. FORM TEMPLATE LIBRARY
Allow reusable forms.
Examples:
•	Inspection form.
•	Survey form.
•	Household form.
•	Verification form.
Forms must remain versioned.
________________________________________
124. WORKFLOW TEMPLATE
Allow reusable workflows.
Example:
Field Officer
→ Supervisor
→ Department Head
→ District Admin.
Save as:
Standard Inspection Workflow.
________________________________________
125. PAYMENT TEMPLATE
Allow authorized users to reuse payment structures.
Example:
Field Duty Payment Template.
But each campaign/phase must reference the exact applicable rule/version.
________________________________________
126. CAMPAIGN PAUSE
Admin can pause a campaign.
When paused:
•	No new tasks can start.
•	Existing drafts remain safe.
•	Admin can resume later.
Clearly display:
Campaign Paused.
________________________________________
127. CAMPAIGN EXTENSION
Authorized admin can extend deadline.
Require:
•	New date.
•	Reason.
•	Approval if configured.
Record audit history.
________________________________________
128. TASK REASSIGNMENT
Allow:
Employee A
→ Employee B
Reason:
Employee unavailable.
Maintain full history.
________________________________________
129. TEAM CHANGE
Allow adding/removing team members during campaign with authorization.
Do not rewrite old historical assignments.
________________________________________
130. TARGET REASSIGNMENT
If a household/institution is reassigned:
Maintain:
Old Team
→ New Team
Reason
Date
Authorized By
________________________________________
131. FINALIZATION
When a phase is finalized:
•	Prevent normal editing.
•	Allow authorized correction workflow only.
•	Lock official result.
•	Preserve historical versions.
________________________________________
132. CAMPAIGN CLOSURE
When campaign is completed:
•	Lock operational changes.
•	Finalize reports.
•	Finalize payment eligibility.
•	Preserve audit logs.
•	Archive according to retention policy.
________________________________________
133. REAL-LIFE CENSUS 2027 DEMO
Create development demo:
Campaign:
Census 2027
District:
Demo District
Departments:
•	Revenue.
•	Education.
•	Municipal Administration.
•	Panchayat.
Create sample:
•	2 subdivisions.
•	4 tehsils.
•	3 municipalities.
•	10 villages.
•	20 wards.
•	50 mohallas.
•	500 households.
•	100 employees.
•	20 teams.
•	5 reserve teams.
Create:
Phase 1:
House Listing
Phase 2:
Enumeration
Phase 3:
Verification
Use sample placeholder questions.
Clearly label:
DEMO DATA — NOT OFFICIAL CENSUS DATA
________________________________________
134. END-TO-END DEMO
Demonstrate:
District Admin
→ Creates Census campaign
→ Creates Phase 1
→ Selects departments
→ Imports employees
→ Creates joint teams
→ Assigns geography
→ Loads target households
→ Creates Phase 1 form
→ Configures verification
→ Configures payment rule
→ Launches phase
Field Team
→ Logs in
→ Views households
→ Opens household
→ Completes form
→ Captures GPS
→ Saves draft
→ Submits
Reviewer
→ Reviews
→ Requests correction
Field Team
→ Corrects
→ Resubmits
Reviewer
→ Approves
System
→ Generates final result
→ Generates payment eligibility
→ Shows payment status
District Admin
→ Views dashboard
→ Drills down to household
→ Views map
→ Generates Excel/PDF
→ Views audit history.
________________________________________
135. TESTING
Create:
Unit Tests
For:
•	Assignment.
•	Permissions.
•	Form validation.
•	GPS.
•	Payment calculation.
•	Workflow.
Integration Tests
For:
•	Authentication.
•	Campaign.
•	Teams.
•	Forms.
•	Submission.
•	Verification.
•	Payment.
E2E Tests
Test complete campaign lifecycle.
________________________________________
136. LOAD TESTING
Test realistic loads.
At minimum test:
•	50,000 employees.
•	Large task volumes.
•	Large submission volumes.
•	Concurrent mobile users.
•	Large report generation.
•	Large file uploads.
Identify bottlenecks.
________________________________________
137. DATABASE INDEXING
Create indexes for frequently queried:
•	Employee ID.
•	Mobile.
•	Campaign ID.
•	Phase ID.
•	Team ID.
•	Geographic ID.
•	Target ID.
•	Task status.
•	Submission status.
•	Payment status.
•	Created date.
Review query plans for large tables.
________________________________________
138. ARCHITECTURE
Preferred stack:
Frontend
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
PWA
IndexedDB
Backend
NestJS
TypeScript
Database
PostgreSQL
Prisma
Cache / Queue
Redis
BullMQ
Storage
S3-compatible storage
Maps
Provider abstraction supporting:
OpenStreetMap / Mapbox / Google Maps
________________________________________
139. PROJECT STRUCTURE
Use a clean modular architecture.
Example:
/apps
/web
/api
/packages
/ui
/types
/config
/validation
/infrastructure
/docs
/tests
Keep business logic separate from UI.
________________________________________
140. ENVIRONMENT VARIABLES
Create:
.env.example
Include:
DATABASE_URL
REDIS_URL
JWT_SECRET
S3_ENDPOINT
S3_ACCESS_KEY
S3_SECRET_KEY
S3_BUCKET
SMS_PROVIDER
SMS_API_KEY
SMS_SENDER_ID
EMAIL_PROVIDER
EMAIL_API_KEY
MAP_PROVIDER
MAP_API_KEY
Never commit real secrets.
________________________________________
141. DOCKER
Provide:
Dockerfile
docker-compose.yml
Services:
•	Web.
•	API.
•	PostgreSQL.
•	Redis.
•	Object storage for local development.
________________________________________
142. DEVELOPMENT README
Provide complete instructions:
1.	Install dependencies.
2.	Configure .env.
3.	Start PostgreSQL.
4.	Start Redis.
5.	Run migrations.
6.	Seed database.
7.	Start backend.
8.	Start frontend.
9.	Login using demo credentials.
10.	Run tests.
________________________________________
143. SEED DATA
Create realistic but clearly fake development data.
Include:
•	Admin.
•	Department Heads.
•	Supervisors.
•	Field Officers.
•	Reserve employees.
•	Departments.
•	Geographic hierarchy.
•	Teams.
•	Households.
•	Campaigns.
•	Phases.
•	Forms.
•	Tasks.
Never use real personal information.
________________________________________
144. DEMO CREDENTIALS
Provide development-only demo accounts.
Example:
District Admin
Department Head
Supervisor
Field Officer
Payment Officer
Clearly mark:
DEVELOPMENT ONLY
Do not use these credentials in production.
________________________________________
145. IMPORTANT GOVERNMENT DATA RULE
Do not invent:
•	Official Census questions.
•	Government payment amounts.
•	Government orders.
•	Government employee records.
•	Official geographic datasets.
•	Government APIs.
•	Official Census procedures.
Where official information is unavailable, create:
CONFIGURABLE PLACEHOLDERS
and clearly label them.
________________________________________
146. IMPORTANT DESIGN RULE
Do not create separate applications for:
•	Census.
•	School inspection.
•	Road survey.
•	Flood survey.
Instead create one:
District Campaign Platform
Then:
Campaign Type:
Census
Campaign:
Census 2027
Phase:
House Listing
This makes the platform reusable.
________________________________________
147. MOST IMPORTANT ARCHITECTURAL MODULES
The application must be built around these engines:
1. Campaign Engine
Campaigns and phases.
2. Organization Engine
Departments and hierarchy.
3. Geography Engine
District/tehsil/village/ward/mohalla.
4. Workforce Engine
Employees and availability.
5. Team Engine
Joint teams and reserve teams.
6. Target Entity Engine
Households, schools, roads, etc.
7. Assignment Engine
Assign targets to teams/employees.
8. Form Engine
Dynamic forms and versions.
9. Field Data Engine
Mobile data collection.
10. Offline Sync Engine
Mobile offline operation.
11. Verification Engine
Review and approval.
12. Exception Engine
Data quality and operational exceptions.
13. Payment Engine
Configurable government-guideline-based payment.
14. Notification Engine
SMS/email/push/in-app.
15. Reporting Engine
Dashboards and reports.
16. Audit Engine
Complete history.
________________________________________
148. DEVELOPMENT ORDER
Do not attempt to create the entire application as disconnected pages.
Build in this order:
Phase A — Foundation
•	Architecture.
•	Database.
•	Authentication.
•	RBAC.
•	Organization.
•	Geography.
Phase B — Campaign
•	Campaign.
•	Phase.
•	Department.
•	Workforce.
•	Team.
Phase C — Target & Assignment
•	Target entities.
•	Household.
•	Geographic assignment.
•	Task engine.
•	Workload.
Phase D — Forms
•	Form builder.
•	Dynamic questions.
•	Conditions.
•	Repeating groups.
•	Validation.
•	Versioning.
Phase E — Mobile
•	Field officer UI.
•	Offline.
•	GPS.
•	Image.
•	Video.
•	Sync.
Phase F — Workflow
•	Verification.
•	Correction.
•	Resubmission.
•	Approval.
•	Exceptions.
Phase G — Payment
•	Payment rules.
•	Eligibility.
•	Approval.
•	Status.
•	Reminders.
•	Exceptions.
Phase H — Intelligence
•	Dashboards.
•	Maps.
•	Analytics.
•	Reports.
•	Exports.
Phase I — Production
•	Security.
•	Testing.
•	Load testing.
•	Monitoring.
•	Backups.
•	Disaster recovery.
•	Docker.
•	Documentation.
________________________________________
149. FINAL ACCEPTANCE CRITERIA
The project is considered complete only when a real end-to-end flow works:
District Admin
→ creates campaign
→ creates multiple phases
→ selects departments
→ imports workforce
→ creates joint teams
→ creates reserve teams
→ assigns geography
→ loads target entities
→ creates phase-specific dynamic form
→ creates verification workflow
→ configures authorized payment rule
→ launches campaign
↓
Field Team
→ logs in on mobile
→ receives assigned area
→ sees assigned targets
→ visits target
→ fills form
→ captures GPS where required
→ captures media where required
→ works offline if necessary
→ synchronizes
→ submits
↓
Reviewer
→ receives submission
→ verifies
→ requests correction
↓
Field Team
→ corrects
→ resubmits
↓
Reviewer
→ approves
↓
System
→ finalizes result
→ calculates authorized payment eligibility
→ tracks payment
→ sends notifications
↓
District Admin
→ sees real-time progress
→ drills down geographically
→ views maps
→ views department/team/employee performance
→ views exceptions
→ views payment status
→ generates reports
→ exports authorized data
→ reviews audit history.
________________________________________
150. FINAL INSTRUCTION TO THE AI DEVELOPER
Do not build a toy project.
Do not build only frontend screens.
Do not use hard-coded arrays for core business data.
Do not make fake buttons.
Do not create disconnected demo pages.
Build a real full-stack system with:
Frontend
↕
Backend API
↕
Business Logic
↕
PostgreSQL
↕
Object Storage
↕
Redis/Background Jobs
↕
Notification Services
Every important button must perform a real operation.
Every important record must be persisted.
Every permission must be enforced on the backend.
Every official submission must be versioned.
Every important change must be audited.
Every large operation must be designed for scale.
Every mobile workflow must consider poor connectivity.
Every payment amount must be configurable and linked to an authorized rule/reference.
Every campaign must be configurable.
Every phase must be independently configurable.
Every form must be dynamically configurable.
Every organization/geographic hierarchy must be configurable.
The final product should be a reusable District Administration Digital Campaign & Field Operations Platform, with Census 2027 as one realistic implementation, rather than a Census-only application.
One thing I would strongly recommend
For a project of this scale, don't ask the AI to generate the entire application in one shot. Give it the master prompt above, then make it work module-by-module, starting with the database and architecture.
The most important foundation is:
Organization → Geography → Workforce → Campaign → Phase → Team → Target → Task → Form → Submission → Verification → Result → Payment
If that data model is correct, the rest of the application can evolve without needing to rebuild it later
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
