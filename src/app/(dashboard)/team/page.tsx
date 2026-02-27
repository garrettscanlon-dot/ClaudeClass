import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TeamRisk, Priority, SummaryStats } from "@/types";

function getWeekOf(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (member?.role !== "lead") redirect("/dashboard");

  const weekOf = getWeekOf();

  const [rollupResult, membersResult, analysesResult, scoresResult] = await Promise.all([
    supabase.from("team_rollups").select("*").eq("week_of", weekOf).single(),
    supabase.from("team_members").select("id, full_name, email, role"),
    supabase.from("weekly_analyses").select("*").eq("week_of", weekOf),
    supabase.from("health_scores").select("*, sf_accounts(name, mrr, owner_id)").eq("week_of", weekOf),
  ]);

  const rollup = rollupResult.data;
  const members = membersResult.data ?? [];
  const analyses = analysesResult.data ?? [];
  const scores = scoresResult.data ?? [];
  const rollupStats = rollup?.summary_stats as SummaryStats | null;
  const topRisks = (rollup?.top_risks ?? []) as TeamRisk[];
  const patterns = (rollup?.patterns ?? []) as string[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Team Overview</h1>
        <p className="text-sm text-gray-400">
          Week of {weekOf} &middot; {members.length} team members
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total MRR at Risk", value: rollupStats?.mrr_at_risk },
          { label: "Team Renewals (30d)", value: rollupStats?.renewals_30d },
          { label: "Expansion Pipeline", value: rollupStats?.expansion_pipeline },
          { label: "Total Open Tickets", value: rollupStats?.open_tickets },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-1 text-[22px] font-bold text-gray-800">
              {value != null
                ? typeof value === "number" && value > 100
                  ? `$${Math.round(value / 1000)}K`
                  : String(value)
                : "--"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-5">
          {/* Top Risks */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-gray-800">
                Top Risk Accounts
              </h2>
            </div>
            {topRisks.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-gray-400">
                No team rollup generated yet.
              </p>
            ) : (
              topRisks.map((risk, i) => (
                <div key={i} className="flex gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
                  <div
                    className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      risk.status === "red" ? "bg-red" : risk.status === "yellow" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold">{risk.account_name}</p>
                    <p className="text-[11px] text-gray-400">
                      Owned by {risk.owner_name} &middot; Score: {risk.score}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">{risk.reasoning}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Patterns */}
          {patterns.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3.5">
                <h2 className="text-[13px] font-semibold text-gray-800">
                  Patterns & Themes
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {patterns.map((pattern, i) => (
                  <li key={i} className="px-4 py-2.5 text-[13px] text-gray-600">
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Member Cards */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Team Members
          </h2>
          {members
            .filter((m) => m.role === "member")
            .map((m) => {
              const analysis = analyses.find((a) => a.member_id === m.id);
              const memberScores = scores.filter(
                (s) => (s.sf_accounts as { owner_id: string } | null)?.owner_id === m.id,
              );
              const redCount = memberScores.filter((s) => s.status === "red").length;
              const yellowCount = memberScores.filter((s) => s.status === "yellow").length;

              return (
                <div
                  key={m.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue text-[10px] font-semibold text-white">
                      {m.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{m.full_name}</p>
                      <p className="text-[11px] text-gray-400">
                        {memberScores.length} accounts
                        {redCount > 0 && (
                          <span className="ml-1 text-red">{redCount} at risk</span>
                        )}
                        {yellowCount > 0 && (
                          <span className="ml-1 text-yellow">{yellowCount} watch</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {analysis?.top_risk_reasoning && (
                    <p className="mt-2 text-[11px] text-gray-600 line-clamp-2">
                      Top risk: {analysis.top_risk_reasoning}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
