import { createClient } from "@supabase/supabase-js";
import { getAnthropicClient } from "./client";
import { WEEKLY_ANALYSIS_SYSTEM_PROMPT } from "./prompts";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface AnalysisResult {
  health_scores: Array<{
    account_name: string;
    account_salesforce_id: string;
    score: number;
    status: "red" | "yellow" | "green";
    signals: Record<string, unknown>;
    reasoning: string;
  }>;
  top_risk: {
    account_name: string;
    account_salesforce_id: string;
    reasoning: string;
  };
  priorities: Array<{
    account_name: string;
    account_salesforce_id: string;
    action: string;
    urgency: string;
    reasoning: string;
  }>;
  summary_stats: {
    mrr_at_risk: number;
    renewals_30d: number;
    expansion_pipeline: number;
    open_tickets: number;
  };
  slack_draft: string;
}

export async function analyzeTeamMember(
  memberId: string,
  weekOf: string,
): Promise<AnalysisResult> {
  const supabase = getServiceClient();

  // Gather all data for this member
  const { data: member } = await supabase
    .from("team_members")
    .select("full_name, email")
    .eq("id", memberId)
    .single();

  const { data: accounts } = await supabase
    .from("sf_accounts")
    .select("*")
    .eq("owner_id", memberId);

  if (!accounts?.length) {
    throw new Error(`No accounts found for member ${memberId}`);
  }

  const accountIds = accounts.map((a) => a.id);

  // Fetch related data in parallel
  const [oppsResult, activitiesResult, contactsResult, issuesResult, callsResult, prevScoresResult] =
    await Promise.all([
      supabase.from("sf_opportunities").select("*").in("account_id", accountIds),
      supabase.from("sf_activities").select("*").in("account_id", accountIds),
      supabase.from("sf_contacts").select("*").in("account_id", accountIds),
      supabase.from("linear_issues").select("*").eq("assignee_id", memberId),
      supabase.from("gong_calls").select("*").eq("owner_id", memberId),
      supabase.from("health_scores").select("*").in("account_id", accountIds),
    ]);

  // Build context for Claude
  const accountContexts = accounts.map((account) => {
    const opps = oppsResult.data?.filter((o) => o.account_id === account.id) ?? [];
    const activities = activitiesResult.data?.filter((a) => a.account_id === account.id) ?? [];
    const contacts = contactsResult.data?.filter((c) => c.account_id === account.id) ?? [];
    const issues = issuesResult.data?.filter((i) => i.account_id === account.id) ?? [];
    const calls = callsResult.data?.filter((c) => c.account_id === account.id) ?? [];
    const prevScore = prevScoresResult.data?.find((s) => s.account_id === account.id);

    return {
      name: account.name,
      salesforce_id: account.salesforce_id,
      mrr: account.mrr,
      arr: account.arr,
      industry: account.industry,
      last_activity_date: account.last_activity_date,
      days_since_activity: account.last_activity_date
        ? Math.floor(
            (Date.now() - new Date(account.last_activity_date).getTime()) / (1000 * 60 * 60 * 24),
          )
        : null,
      renewals: opps
        .filter((o) => o.opp_type === "Renewal" || o.stage?.toLowerCase().includes("renewal"))
        .map((o) => ({
          name: o.name,
          close_date: o.close_date,
          amount: o.amount,
          stage: o.stage,
          probability: o.probability,
        })),
      expansion_opps: opps
        .filter((o) => o.opp_type === "Expansion" || o.opp_type === "Upsell")
        .map((o) => ({ name: o.name, amount: o.amount, stage: o.stage })),
      recent_activities: activities.slice(0, 10).map((a) => ({
        subject: a.subject,
        date: a.activity_date,
        type: a.activity_type,
        status: a.status,
      })),
      contacts: contacts.map((c) => ({
        name: c.name,
        title: c.title,
        is_champion: c.is_champion,
      })),
      open_tickets: issues.map((i) => ({
        identifier: i.identifier,
        title: i.title,
        status: i.status,
        priority_label: i.priority_label,
        created_at: i.created_at,
      })),
      recent_calls: calls.slice(0, 5).map((c) => ({
        title: c.title,
        date: c.started_at,
        duration_minutes: c.duration_seconds ? Math.round(c.duration_seconds / 60) : null,
        transcript_excerpt: c.transcript_summary?.slice(0, 2000),
      })),
      previous_health_score: prevScore
        ? { score: prevScore.score, status: prevScore.status }
        : null,
    };
  });

  const userPrompt = `Analyze the following portfolio for ${member?.full_name} (${member?.email}) as of ${weekOf}.

Accounts:
${JSON.stringify(accountContexts, null, 2)}

Current date: ${weekOf}
Team channel: #psc-team`;

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: WEEKLY_ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const result: AnalysisResult = JSON.parse(textContent.text);

  // Store health scores
  for (const hs of result.health_scores) {
    const account = accounts.find((a) => a.salesforce_id === hs.account_salesforce_id);
    if (!account) continue;

    const prevScore = prevScoresResult.data?.find((s) => s.account_id === account.id);

    await supabase.from("health_scores").upsert(
      {
        account_id: account.id,
        week_of: weekOf,
        score: hs.score,
        status: hs.status,
        previous_score: prevScore?.score ?? null,
        delta: prevScore ? hs.score - prevScore.score : null,
        signals: hs.signals,
        reasoning: hs.reasoning,
      },
      { onConflict: "account_id,week_of" },
    );
  }

  // Store weekly analysis
  const riskAccount = accounts.find(
    (a) => a.salesforce_id === result.top_risk.account_salesforce_id,
  );

  const priorities = result.priorities.map((p) => {
    const acc = accounts.find((a) => a.salesforce_id === p.account_salesforce_id);
    return {
      account_id: acc?.id ?? "",
      account_name: p.account_name,
      action: p.action,
      urgency: p.urgency,
      reasoning: p.reasoning,
    };
  });

  await supabase.from("weekly_analyses").upsert(
    {
      member_id: memberId,
      week_of: weekOf,
      top_risk_account_id: riskAccount?.id ?? null,
      top_risk_reasoning: result.top_risk.reasoning,
      priorities,
      slack_draft: result.slack_draft,
      summary_stats: result.summary_stats,
    },
    { onConflict: "member_id,week_of" },
  );

  return result;
}
