import Link from "next/link";
import {
  mockTeamRisks,
  mockTeamPatterns,
  mockTeamAnalyses,
  mockTeamSummaryStats,
} from "@/lib/mock-data";

export default function DemoTeamPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Team Overview</h1>
        <p className="text-sm text-gray-400">
          Week of 2026-02-23 &middot; 8 team members
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total MRR at Risk", value: `$${Math.round(mockTeamSummaryStats.mrr_at_risk / 1000)}K` },
          { label: "Team Renewals (30d)", value: `$${Math.round(mockTeamSummaryStats.renewals_30d / 1000)}K` },
          { label: "Expansion Pipeline", value: `$${Math.round(mockTeamSummaryStats.expansion_pipeline / 1000)}K` },
          { label: "Total Open Tickets", value: String(mockTeamSummaryStats.open_tickets) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {label}
            </p>
            <p className="mt-1 text-[22px] font-bold text-gray-800">{value}</p>
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
            {mockTeamRisks.map((risk, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    risk.status === "red"
                      ? "bg-red"
                      : risk.status === "yellow"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
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
            ))}
          </div>

          {/* Patterns */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-gray-800">
                Patterns & Themes
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {mockTeamPatterns.map((pattern, i) => (
                <li key={i} className="px-4 py-2.5 text-[13px] text-gray-600">
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Member Cards */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Team Members
          </h2>
          {mockTeamAnalyses.map((m) => (
            <Link
              key={m.member_id}
              href={m.member_id === "demo-user" ? "/demo" : "#"}
              className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue text-[10px] font-semibold text-white">
                  {m.member_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{m.member_name}</p>
                  <p className="text-[11px] text-gray-400">
                    {m.account_count} accounts
                    {m.red_count > 0 && (
                      <span className="ml-1 text-red">{m.red_count} at risk</span>
                    )}
                    {m.yellow_count > 0 && (
                      <span className="ml-1 text-yellow">{m.yellow_count} watch</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-600 line-clamp-2">
                Top risk: {m.top_risk_reasoning}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
