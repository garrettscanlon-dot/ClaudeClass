import type {
  SfAccount,
  SfOpportunity,
  SfContact,
  LinearIssue,
  GongCall,
  HealthScore,
  Priority,
  SummaryStats,
  TeamRisk,
  WeeklyAnalysis,
} from "@/types";

const WEEK_OF = "2026-02-23";

export const mockMember = {
  id: "demo-user",
  full_name: "Alex Rivera",
  email: "alex.rivera@solvhealth.com",
  role: "member" as const,
};

export const mockAccounts: SfAccount[] = [
  {
    id: "acc-1",
    salesforce_id: "001x000001",
    name: "Mesa Urgent Care",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "Enterprise",
    mrr: 45000,
    arr: 540000,
    industry: "Healthcare",
    last_activity_date: "2026-02-05",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-2",
    salesforce_id: "001x000002",
    name: "Sonoran Health",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "Enterprise",
    mrr: 35000,
    arr: 420000,
    industry: "Healthcare",
    last_activity_date: "2026-02-18",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-3",
    salesforce_id: "001x000003",
    name: "Valley Medical Group",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "Mid-Market",
    mrr: 32000,
    arr: 384000,
    industry: "Healthcare",
    last_activity_date: "2026-02-10",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-4",
    salesforce_id: "001x000004",
    name: "Desert Care Network",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "Mid-Market",
    mrr: 15000,
    arr: 180000,
    industry: "Healthcare",
    last_activity_date: "2026-02-04",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-5",
    salesforce_id: "001x000005",
    name: "Phoenix Family Health",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "Mid-Market",
    mrr: 22000,
    arr: 264000,
    industry: "Healthcare",
    last_activity_date: "2026-02-21",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-6",
    salesforce_id: "001x000006",
    name: "Scottsdale Wellness",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "SMB",
    mrr: 8000,
    arr: 96000,
    industry: "Healthcare",
    last_activity_date: "2026-02-20",
    synced_at: "2026-02-23T13:00:00Z",
  },
  {
    id: "acc-7",
    salesforce_id: "001x000007",
    name: "Flagstaff Urgent Care",
    owner_id: "demo-user",
    salesforce_owner_id: "005x1",
    account_type: "SMB",
    mrr: 5000,
    arr: 60000,
    industry: "Healthcare",
    last_activity_date: "2026-02-22",
    synced_at: "2026-02-23T13:00:00Z",
  },
];

export const mockHealthScores: HealthScore[] = [
  {
    id: "hs-1",
    account_id: "acc-1",
    week_of: WEEK_OF,
    score: 28,
    status: "red",
    previous_score: 45,
    delta: -17,
    signals: { activity_trend: -22, days_since_contact: 18, open_tickets: 1, renewal_days_out: 14, gong_sentiment: "negative", expansion_signals: false },
    reasoning: "Renewal in 14 days with usage down 22% W/W. No contact in 18 days. Last Gong call flagged billing concerns.",
  },
  {
    id: "hs-2",
    account_id: "acc-2",
    week_of: WEEK_OF,
    score: 35,
    status: "red",
    previous_score: 53,
    delta: -18,
    signals: { activity_trend: -10, days_since_contact: 5, open_tickets: 3, renewal_days_out: 90, gong_sentiment: "negative", expansion_signals: false },
    reasoning: "NPS dropped 18 pts this week. 3 open support tickets with high priority. Recent call revealed frustration with onboarding delays.",
  },
  {
    id: "hs-3",
    account_id: "acc-3",
    week_of: WEEK_OF,
    score: 48,
    status: "yellow",
    previous_score: 62,
    delta: -14,
    signals: { activity_trend: -40, days_since_contact: 13, open_tickets: 0, renewal_days_out: 60, gong_sentiment: null, expansion_signals: false },
    reasoning: "Usage down 40% this month. Champion (Sarah Chen) on parental leave — no clear interim contact identified.",
  },
  {
    id: "hs-4",
    account_id: "acc-4",
    week_of: WEEK_OF,
    score: 52,
    status: "yellow",
    previous_score: 55,
    delta: -3,
    signals: { activity_trend: 0, days_since_contact: 19, open_tickets: 1, renewal_days_out: 120, gong_sentiment: "neutral", expansion_signals: false },
    reasoning: "Implementation ticket DCN-112 open 18 days with no Linear update since Feb 4. Risk of stalled implementation.",
  },
  {
    id: "hs-5",
    account_id: "acc-5",
    week_of: WEEK_OF,
    score: 82,
    status: "green",
    previous_score: 75,
    delta: 7,
    signals: { activity_trend: 15, days_since_contact: 2, open_tickets: 0, renewal_days_out: null, gong_sentiment: "positive", expansion_signals: true },
    reasoning: "Strong engagement — 3 calls last week, all positive. Discussing 2 new location rollouts. Champion actively advocating internally.",
  },
  {
    id: "hs-6",
    account_id: "acc-6",
    week_of: WEEK_OF,
    score: 76,
    status: "green",
    previous_score: 74,
    delta: 2,
    signals: { activity_trend: 5, days_since_contact: 3, open_tickets: 0, renewal_days_out: null, gong_sentiment: "positive", expansion_signals: false },
    reasoning: "Healthy and stable. Usage consistent, regular check-ins, no open issues.",
  },
  {
    id: "hs-7",
    account_id: "acc-7",
    week_of: WEEK_OF,
    score: 88,
    status: "green",
    previous_score: 85,
    delta: 3,
    signals: { activity_trend: 10, days_since_contact: 1, open_tickets: 0, renewal_days_out: null, gong_sentiment: "positive", expansion_signals: true },
    reasoning: "Fully ramped, high adoption. Just asked about adding a second location — expansion opportunity.",
  },
];

export const mockPriorities: Priority[] = [
  {
    account_id: "acc-1",
    account_name: "Mesa Urgent Care",
    action: "Schedule renewal call this week",
    urgency: "critical",
    reasoning: "Renewal in 14 days · Usage down 22% W/W · No contact in 18 days",
  },
  {
    account_id: "acc-2",
    account_name: "Sonoran Health",
    action: "Flag for churn risk · Loop in support lead",
    urgency: "critical",
    reasoning: "NPS dropped 18 pts · 3 open support tickets this week",
  },
  {
    account_id: "acc-3",
    account_name: "Valley Medical Group",
    action: "Identify interim champion contact",
    urgency: "high",
    reasoning: "Usage down 40% this month · Champion on leave",
  },
  {
    account_id: "acc-4",
    account_name: "Desert Care Network",
    action: "Unblock implementation — check Linear #DCN-112",
    urgency: "high",
    reasoning: "Implementation ticket open 18 days · No Linear update since Feb 4",
  },
  {
    account_id: "acc-5",
    account_name: "Phoenix Family Health",
    action: "Share new location proposal with champion",
    urgency: "medium",
    reasoning: "Expansion signal — discussing 2 new location rollouts",
  },
];

export const mockSummaryStats: SummaryStats = {
  mrr_at_risk: 127000,
  renewals_30d: 52000,
  expansion_pipeline: 38000,
  open_tickets: 4,
};

export const mockSlackDraft = `Monday Morning Playbook — Alex Rivera — Feb 23, 2026

Mesa Urgent Care is my top risk this week. Their renewal is in 14 days but usage dropped 22% W/W and I haven't had contact in 18 days. My last Gong call flagged billing concerns that haven't been resolved. I'm scheduling a renewal call ASAP and looping in our billing team.

This week's priorities:
1. Mesa Urgent Care — Schedule renewal call this week. Usage is declining and renewal is in 14 days with no recent engagement.
2. Sonoran Health — Flag for churn risk and loop in support lead. NPS dropped 18 points with 3 open high-priority tickets.
3. Valley Medical Group — Identify interim champion. Sarah Chen is on leave and usage has dropped 40% with no one driving adoption internally.

Bright spot: Phoenix Family Health is discussing 2 new location rollouts — strong expansion opportunity worth $22K additional MRR.`;

export const mockOpportunities: SfOpportunity[] = [
  { id: "opp-1", salesforce_id: "006x1", account_id: "acc-1", name: "Mesa UC - Annual Renewal 2026", stage: "Negotiation", amount: 540000, close_date: "2026-03-09", opp_type: "Renewal", probability: 60, next_step: "Schedule renewal call" },
  { id: "opp-2", salesforce_id: "006x2", account_id: "acc-5", name: "Phoenix FH - 2 New Locations", stage: "Discovery", amount: 264000, close_date: "2026-06-01", opp_type: "Expansion", probability: 30, next_step: "Send proposal" },
  { id: "opp-3", salesforce_id: "006x3", account_id: "acc-7", name: "Flagstaff - Second Location", stage: "Qualification", amount: 60000, close_date: "2026-05-15", opp_type: "Expansion", probability: 20, next_step: "Discovery call" },
];

export const mockContacts: SfContact[] = [
  { id: "con-1", salesforce_id: "003x1", account_id: "acc-1", name: "Dr. James Martinez", email: "jmartinez@mesauc.com", title: "Medical Director", is_champion: true, last_contacted: "2026-02-05" },
  { id: "con-2", salesforce_id: "003x2", account_id: "acc-1", name: "Lisa Tran", email: "ltran@mesauc.com", title: "Operations Manager", is_champion: false, last_contacted: "2026-02-05" },
  { id: "con-3", salesforce_id: "003x3", account_id: "acc-2", name: "Michael Okafor", email: "mokafor@sonoranhealth.com", title: "VP Operations", is_champion: true, last_contacted: "2026-02-18" },
  { id: "con-4", salesforce_id: "003x4", account_id: "acc-3", name: "Sarah Chen", email: "schen@valleymed.com", title: "Director of Innovation", is_champion: true, last_contacted: "2026-02-10" },
  { id: "con-5", salesforce_id: "003x5", account_id: "acc-5", name: "Rachel Kim", email: "rkim@phoenixfh.com", title: "CEO", is_champion: true, last_contacted: "2026-02-21" },
];

export const mockLinearIssues: LinearIssue[] = [
  { id: "li-1", linear_id: "lin-1", identifier: "CS-44", title: "Billing discrepancy — Mesa UC overcharged $2,400", description: null, status: "In Progress", status_type: "started", priority: 2, priority_label: "High", assignee_id: "demo-user", account_id: "acc-1", project_name: null, labels: ["Mesa Urgent Care", "Billing"], due_date: "2026-02-28", created_at: "2026-02-18T10:00:00Z", updated_at: "2026-02-21T14:00:00Z" },
  { id: "li-2", linear_id: "lin-2", identifier: "CS-51", title: "Onboarding delays — Sonoran new provider setup", description: null, status: "In Progress", status_type: "started", priority: 2, priority_label: "High", assignee_id: "demo-user", account_id: "acc-2", project_name: null, labels: ["Sonoran Health"], due_date: "2026-02-25", created_at: "2026-02-12T09:00:00Z", updated_at: "2026-02-20T16:00:00Z" },
  { id: "li-3", linear_id: "lin-3", identifier: "CS-52", title: "API rate limiting affecting Sonoran check-in kiosks", description: null, status: "Todo", status_type: "unstarted", priority: 1, priority_label: "Urgent", assignee_id: "demo-user", account_id: "acc-2", project_name: null, labels: ["Sonoran Health", "Bug"], due_date: null, created_at: "2026-02-19T11:00:00Z", updated_at: "2026-02-19T11:00:00Z" },
  { id: "li-4", linear_id: "lin-4", identifier: "DCN-112", title: "EMR integration stalled — missing API credentials", description: null, status: "In Progress", status_type: "started", priority: 3, priority_label: "Medium", assignee_id: "demo-user", account_id: "acc-4", project_name: "DCN Implementation", labels: ["Desert Care Network"], due_date: "2026-02-15", created_at: "2026-02-05T08:00:00Z", updated_at: "2026-02-04T10:00:00Z" },
];

export const mockGongCalls: GongCall[] = [
  { id: "gc-1", gong_id: "gong-1", title: "Mesa UC — Billing Review", started_at: "2026-02-05T16:00:00Z", duration_seconds: 1800, owner_id: "demo-user", account_id: "acc-1", participants: [{ name: "Alex Rivera", email: "alex.rivera@solvhealth.com", role: "internal" }, { name: "Lisa Tran", email: "ltran@mesauc.com", role: "external" }], direction: "outbound", transcript_summary: "Lisa raised concerns about a $2,400 billing discrepancy from January. She mentioned Dr. Martinez is frustrated and considering alternatives. Alex committed to resolving the billing issue within 48 hours and scheduling a follow-up with the medical director to discuss the renewal." },
  { id: "gc-2", gong_id: "gong-2", title: "Sonoran Health — Support Escalation", started_at: "2026-02-18T15:00:00Z", duration_seconds: 2400, owner_id: "demo-user", account_id: "acc-2", participants: [{ name: "Alex Rivera", email: "alex.rivera@solvhealth.com", role: "internal" }, { name: "Michael Okafor", email: "mokafor@sonoranhealth.com", role: "external" }], direction: "inbound", transcript_summary: "Michael expressed frustration with onboarding delays for 3 new providers. He mentioned their NPS survey results dropped significantly. The API rate limiting issue is affecting their busiest kiosk location. Alex escalated to engineering and committed to a resolution timeline by EOW." },
  { id: "gc-3", gong_id: "gong-3", title: "Phoenix FH — Expansion Discussion", started_at: "2026-02-21T14:00:00Z", duration_seconds: 2700, owner_id: "demo-user", account_id: "acc-5", participants: [{ name: "Alex Rivera", email: "alex.rivera@solvhealth.com", role: "internal" }, { name: "Rachel Kim", email: "rkim@phoenixfh.com", role: "external" }], direction: "outbound", transcript_summary: "Rachel is very enthusiastic about expanding to 2 new locations in Tempe and Gilbert. She's seen strong patient adoption at the current location and wants to replicate the setup. Discussed timeline of Q2 rollout. Rachel will present the proposal to her board next week. Strong champion behavior — she's advocating for Solv internally." },
  { id: "gc-4", gong_id: "gong-4", title: "Scottsdale Wellness — Monthly Check-in", started_at: "2026-02-20T10:00:00Z", duration_seconds: 1200, owner_id: "demo-user", account_id: "acc-6", participants: [{ name: "Alex Rivera", email: "alex.rivera@solvhealth.com", role: "internal" }, { name: "Tom Harris", email: "tharris@scottsdalewellness.com", role: "external" }], direction: "outbound", transcript_summary: "Routine monthly check-in. Tom is happy with the platform, no issues. Usage is steady. Brief discussion about upcoming flu season prep and whether they'll need additional capacity. Overall positive and stable." },
];

// Team lead mock data
export const mockTeamMembers = [
  { id: "demo-user", full_name: "Alex Rivera", email: "alex.rivera@solvhealth.com", role: "member" },
  { id: "tm-2", full_name: "Jordan Lee", email: "jordan.lee@solvhealth.com", role: "member" },
  { id: "tm-3", full_name: "Priya Sharma", email: "priya.sharma@solvhealth.com", role: "member" },
  { id: "tm-4", full_name: "Marcus Johnson", email: "marcus.johnson@solvhealth.com", role: "member" },
  { id: "tm-5", full_name: "Emily Chen", email: "emily.chen@solvhealth.com", role: "member" },
  { id: "tm-6", full_name: "David Okonkwo", email: "david.okonkwo@solvhealth.com", role: "member" },
  { id: "tm-7", full_name: "Sofia Martinez", email: "sofia.martinez@solvhealth.com", role: "member" },
  { id: "tm-8", full_name: "Chris Park", email: "chris.park@solvhealth.com", role: "member" },
  { id: "tm-lead", full_name: "Garrett Scanlon", email: "garrett.scanlon@solvhealth.com", role: "lead" },
];

export const mockTeamRisks: TeamRisk[] = [
  { account_id: "acc-1", account_name: "Mesa Urgent Care", owner_name: "Alex Rivera", score: 28, status: "red", reasoning: "Renewal in 14 days with usage declining 22% and no contact in 18 days. Billing dispute unresolved." },
  { account_id: "t-acc-1", account_name: "Tucson Regional Medical", owner_name: "Jordan Lee", score: 31, status: "red", reasoning: "Champion departed 3 weeks ago. New POC unresponsive. Usage dropped 35% since departure." },
  { account_id: "acc-2", account_name: "Sonoran Health", owner_name: "Alex Rivera", score: 35, status: "red", reasoning: "NPS dropped 18 pts. 3 open high-priority tickets. VP Operations expressed frustration on last call." },
  { account_id: "t-acc-2", account_name: "Prescott Health Partners", owner_name: "Priya Sharma", score: 38, status: "red", reasoning: "Implementation stalled for 4 weeks. Budget holder requesting refund discussion. 2 escalation tickets." },
  { account_id: "t-acc-3", account_name: "Yuma Community Health", owner_name: "Marcus Johnson", score: 42, status: "yellow", reasoning: "Renewal in 22 days. Requested competitor pricing. Last call sentiment was neutral-negative." },
];

export const mockTeamPatterns = [
  "3 accounts showing significant usage decline (>20% W/W) — may indicate a platform issue worth investigating with Product",
  "Renewal cluster: 5 accounts renewing in the next 30 days totaling $1.2M ARR — schedule team renewal sprint",
  "Champion departure risk: 2 accounts lost primary champions this month — need champion backup strategy",
  "Support ticket volume up 40% vs. last week — coordinate with Support team lead on capacity",
];

export const mockTeamAnalyses = [
  { member_id: "demo-user", member_name: "Alex Rivera", top_risk_reasoning: "Mesa Urgent Care renewal in 14 days with declining usage and unresolved billing dispute", red_count: 2, yellow_count: 2, account_count: 7 },
  { member_id: "tm-2", member_name: "Jordan Lee", top_risk_reasoning: "Tucson Regional Medical lost their champion 3 weeks ago — usage down 35%", red_count: 1, yellow_count: 3, account_count: 8 },
  { member_id: "tm-3", member_name: "Priya Sharma", top_risk_reasoning: "Prescott Health Partners implementation stalled, budget holder requesting refund", red_count: 1, yellow_count: 1, account_count: 6 },
  { member_id: "tm-4", member_name: "Marcus Johnson", top_risk_reasoning: "Yuma Community Health renewal in 22 days, requested competitor pricing", red_count: 0, yellow_count: 2, account_count: 7 },
  { member_id: "tm-5", member_name: "Emily Chen", top_risk_reasoning: "Gilbert Pediatrics usage anomaly — 50% drop after admin change", red_count: 1, yellow_count: 1, account_count: 5 },
  { member_id: "tm-6", member_name: "David Okonkwo", top_risk_reasoning: "Chandler Medical Group delayed QBR 3 times — possible deprioritization", red_count: 0, yellow_count: 3, account_count: 8 },
  { member_id: "tm-7", member_name: "Sofia Martinez", top_risk_reasoning: "Tempe Wellness Center escalated to VP level over API downtime last week", red_count: 1, yellow_count: 0, account_count: 6 },
  { member_id: "tm-8", member_name: "Chris Park", top_risk_reasoning: "No major risks — portfolio healthy. Expansion opp with Peoria UC worth $18K MRR", red_count: 0, yellow_count: 1, account_count: 7 },
];

export const mockTeamSummaryStats: SummaryStats = {
  mrr_at_risk: 482000,
  renewals_30d: 1200000,
  expansion_pipeline: 186000,
  open_tickets: 23,
};
