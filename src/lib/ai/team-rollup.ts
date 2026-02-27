import { createClient } from "@supabase/supabase-js";
import { getAnthropicClient } from "./client";
import { TEAM_ROLLUP_SYSTEM_PROMPT } from "./prompts";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface TeamRollupResult {
  top_risks: Array<{
    account_name: string;
    owner_name: string;
    score: number;
    status: "red" | "yellow" | "green";
    reasoning: string;
  }>;
  team_priorities: Array<{
    account_name: string;
    action: string;
    urgency: string;
    reasoning: string;
  }>;
  patterns: string[];
  summary_stats: {
    mrr_at_risk: number;
    renewals_30d: number;
    expansion_pipeline: number;
    open_tickets: number;
  };
  team_slack_draft: string;
}

export async function generateTeamRollup(weekOf: string): Promise<TeamRollupResult> {
  const supabase = getServiceClient();

  // Get all weekly analyses for this week
  const { data: analyses } = await supabase
    .from("weekly_analyses")
    .select("*, team_members(full_name)")
    .eq("week_of", weekOf);

  if (!analyses?.length) {
    throw new Error(`No analyses found for week of ${weekOf}`);
  }

  // Get all health scores for context
  const { data: scores } = await supabase
    .from("health_scores")
    .select("*, sf_accounts(name, mrr)")
    .eq("week_of", weekOf);

  const memberAnalyses = analyses.map((a) => ({
    member_name: (a.team_members as { full_name: string } | null)?.full_name ?? "Unknown",
    top_risk_reasoning: a.top_risk_reasoning,
    priorities: a.priorities,
    summary_stats: a.summary_stats,
  }));

  const healthScoreContext = (scores ?? []).map((s) => ({
    account_name: (s.sf_accounts as { name: string; mrr: number } | null)?.name ?? "Unknown",
    mrr: (s.sf_accounts as { name: string; mrr: number } | null)?.mrr ?? 0,
    score: s.score,
    status: s.status,
    delta: s.delta,
    reasoning: s.reasoning,
  }));

  const userPrompt = `Analyze the following team data for week of ${weekOf}.

Individual analyses:
${JSON.stringify(memberAnalyses, null, 2)}

All health scores:
${JSON.stringify(healthScoreContext, null, 2)}

Team size: ${analyses.length} members
Team channel: #psc-team`;

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: TEAM_ROLLUP_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const result: TeamRollupResult = JSON.parse(textContent.text);

  // Store team rollup
  await supabase.from("team_rollups").upsert(
    {
      week_of: weekOf,
      top_risks: result.top_risks,
      team_priorities: result.team_priorities,
      patterns: result.patterns,
      team_slack_draft: result.team_slack_draft,
      summary_stats: result.summary_stats,
    },
    { onConflict: "week_of" },
  );

  return result;
}
