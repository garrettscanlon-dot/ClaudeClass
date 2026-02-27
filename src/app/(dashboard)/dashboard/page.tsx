import { createClient } from "@/lib/supabase/server";
import { StatCards } from "@/components/dashboard/stat-cards";
import { PriorityQueue } from "@/components/dashboard/priority-queue";
import { AccountHealthPanel } from "@/components/dashboard/account-health-panel";
import { SlackDraft } from "@/components/dashboard/slack-draft";
import type { HealthScore, Priority, SfAccount, SummaryStats } from "@/types";

function getWeekOf(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const weekOf = getWeekOf();

  // Fetch data in parallel
  const [accountsResult, analysisResult, scoresResult] = await Promise.all([
    supabase
      .from("sf_accounts")
      .select("*")
      .eq("owner_id", user.id)
      .order("name"),
    supabase
      .from("weekly_analyses")
      .select("*")
      .eq("member_id", user.id)
      .eq("week_of", weekOf)
      .single(),
    supabase
      .from("health_scores")
      .select("*")
      .eq("week_of", weekOf),
  ]);

  const accounts = (accountsResult.data ?? []) as SfAccount[];
  const analysis = analysisResult.data;
  const allScores = (scoresResult.data ?? []) as HealthScore[];

  // Filter health scores to only this member's accounts
  const accountIds = new Set(accounts.map((a) => a.id));
  const healthScores = allScores.filter((s) => accountIds.has(s.account_id));

  const priorities = (analysis?.priorities ?? []) as Priority[];
  const summaryStats = analysis?.summary_stats as SummaryStats | null;
  const slackDraft = analysis?.slack_draft ?? null;

  return (
    <div className="space-y-5">
      <StatCards stats={summaryStats} />

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-5">
          <PriorityQueue priorities={priorities} />
          <SlackDraft draft={slackDraft} />
        </div>

        <AccountHealthPanel accounts={accounts} healthScores={healthScores} />
      </div>
    </div>
  );
}
