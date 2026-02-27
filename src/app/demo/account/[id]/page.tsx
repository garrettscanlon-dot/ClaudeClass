import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  mockAccounts,
  mockHealthScores,
  mockOpportunities,
  mockContacts,
  mockLinearIssues,
  mockGongCalls,
} from "@/lib/mock-data";

interface AccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoAccountPage({ params }: AccountPageProps) {
  const { id } = await params;

  const account = mockAccounts.find((a) => a.id === id);
  if (!account) notFound();

  const healthScore = mockHealthScores.find((hs) => hs.account_id === id);
  const opps = mockOpportunities.filter((o) => o.account_id === id);
  const contacts = mockContacts.filter((c) => c.account_id === id);
  const issues = mockLinearIssues.filter((i) => i.account_id === id);
  const calls = mockGongCalls.filter((c) => c.account_id === id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-3">
          <Link href="/demo">
            <Button variant="outline" size="sm">Back</Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{account.name}</h1>
          {healthScore && (
            <span
              className={`rounded-xl px-2.5 py-0.5 text-xs font-semibold ${
                healthScore.status === "red"
                  ? "bg-red-light text-red"
                  : healthScore.status === "yellow"
                    ? "bg-yellow-light text-yellow"
                    : "bg-green-light text-green"
              }`}
            >
              Health: {healthScore.score}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {account.mrr ? `$${Math.round(account.mrr / 1000)}K MRR` : ""}
          {account.industry ? ` · ${account.industry}` : ""}
          {account.account_type ? ` · ${account.account_type}` : ""}
        </p>
      </div>

      {/* Health reasoning */}
      {healthScore?.reasoning && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-[13px] font-semibold text-gray-800">Health Assessment</h3>
          <p className="text-[13px] text-gray-600">{healthScore.reasoning}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        {/* Opportunities */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              Open Opportunities ({opps.length})
            </h3>
          </div>
          {opps.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No open opportunities</p>
          ) : (
            opps.map((opp) => (
              <div key={opp.id} className="border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                <p className="text-[13px] font-medium">{opp.name}</p>
                <p className="text-[11px] text-gray-400">
                  {opp.stage} · {opp.amount ? `$${opp.amount.toLocaleString()}` : "No amount"}
                  {opp.close_date ? ` · Closes ${opp.close_date}` : ""}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Key Contacts */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              Key Contacts ({contacts.length})
            </h3>
          </div>
          {contacts.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No contacts synced</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                <p className="text-[13px] font-medium">
                  {contact.name}
                  {contact.is_champion && (
                    <span className="ml-1.5 rounded bg-blue-light px-1.5 py-0.5 text-[10px] font-medium text-blue">
                      Champion
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-gray-400">
                  {contact.title ?? "No title"} · {contact.email ?? "No email"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Linear Tickets */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              Open Tickets ({issues.length})
            </h3>
          </div>
          {issues.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No linked tickets</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                <p className="text-[13px] font-medium">
                  <span className="font-mono text-gray-400">{issue.identifier}</span>{" "}
                  {issue.title}
                </p>
                <p className="text-[11px] text-gray-400">
                  {issue.status} · {issue.priority_label ?? "No priority"}
                  {issue.created_at &&
                    ` · ${Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24))}d old`}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Gong Calls */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-semibold text-gray-800">
              Recent Calls ({calls.length})
            </h3>
          </div>
          {calls.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">No calls recorded</p>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                <p className="text-[13px] font-medium">{call.title ?? "Untitled call"}</p>
                <p className="text-[11px] text-gray-400">
                  {new Date(call.started_at).toLocaleDateString()}
                  {call.duration_seconds
                    ? ` · ${Math.round(call.duration_seconds / 60)} min`
                    : ""}
                </p>
                {call.transcript_summary && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-gray-600">
                    {call.transcript_summary.slice(0, 200)}...
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
