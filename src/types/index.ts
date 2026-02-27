// Shared app types

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "member" | "lead";
  salesforce_user_id: string | null;
  linear_user_id: string | null;
  gong_user_id: string | null;
  slack_user_id: string | null;
}

export interface SfAccount {
  id: string;
  salesforce_id: string;
  name: string;
  owner_id: string;
  salesforce_owner_id: string;
  account_type: string | null;
  mrr: number | null;
  arr: number | null;
  industry: string | null;
  last_activity_date: string | null;
  synced_at: string;
}

export interface SfOpportunity {
  id: string;
  salesforce_id: string;
  account_id: string;
  name: string;
  stage: string;
  amount: number | null;
  close_date: string | null;
  opp_type: string | null;
  probability: number | null;
  next_step: string | null;
}

export interface SfActivity {
  id: string;
  salesforce_id: string;
  account_id: string;
  owner_id: string;
  subject: string | null;
  status: string | null;
  priority: string | null;
  activity_date: string | null;
  description: string | null;
  activity_type: string | null;
}

export interface SfContact {
  id: string;
  salesforce_id: string;
  account_id: string;
  name: string;
  email: string | null;
  title: string | null;
  is_champion: boolean;
  last_contacted: string | null;
}

export interface LinearIssue {
  id: string;
  linear_id: string;
  identifier: string;
  title: string;
  description: string | null;
  status: string;
  status_type: string;
  priority: number | null;
  priority_label: string | null;
  assignee_id: string | null;
  account_id: string | null;
  project_name: string | null;
  labels: string[];
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface GongCall {
  id: string;
  gong_id: string;
  title: string | null;
  started_at: string;
  duration_seconds: number | null;
  owner_id: string | null;
  account_id: string | null;
  participants: GongParticipant[];
  direction: string | null;
  transcript_summary: string | null;
}

export interface GongParticipant {
  name: string;
  email: string;
  role: string;
}

export interface HealthScore {
  id: string;
  account_id: string;
  week_of: string;
  score: number;
  status: "red" | "yellow" | "green";
  previous_score: number | null;
  delta: number | null;
  signals: HealthSignals;
  reasoning: string;
}

export interface HealthSignals {
  activity_trend: number;
  days_since_contact: number;
  open_tickets: number;
  renewal_days_out: number | null;
  gong_sentiment: string | null;
  expansion_signals: boolean;
}

export interface WeeklyAnalysis {
  id: string;
  member_id: string;
  week_of: string;
  top_risk_account_id: string | null;
  top_risk_reasoning: string | null;
  priorities: Priority[];
  slack_draft: string;
  summary_stats: SummaryStats | null;
}

export interface Priority {
  account_id: string;
  account_name: string;
  action: string;
  urgency: "critical" | "high" | "medium" | "low";
  reasoning: string;
}

export interface SummaryStats {
  mrr_at_risk: number;
  renewals_30d: number;
  expansion_pipeline: number;
  open_tickets: number;
}

export interface TeamRollup {
  id: string;
  week_of: string;
  top_risks: TeamRisk[];
  team_priorities: Priority[];
  patterns: string[] | null;
  team_slack_draft: string;
  summary_stats: SummaryStats | null;
}

export interface TeamRisk {
  account_id: string;
  account_name: string;
  owner_name: string;
  score: number;
  status: "red" | "yellow" | "green";
  reasoning: string;
}
