import Link from "next/link";
import type { HealthScore, SfAccount } from "@/types";

interface AccountHealthPanelProps {
  accounts: SfAccount[];
  healthScores: HealthScore[];
  basePath?: string;
}

export function AccountHealthPanel({
  accounts,
  healthScores,
  basePath = "/account",
}: AccountHealthPanelProps) {
  // Sort accounts: red first, then yellow, then green, then unscored
  const statusOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 };

  const accountsWithScores = accounts.map((account) => {
    const score = healthScores.find((hs) => hs.account_id === account.id);
    return { account, score };
  });

  accountsWithScores.sort((a, b) => {
    const aOrder = a.score ? statusOrder[a.score.status] ?? 3 : 3;
    const bOrder = b.score ? statusOrder[b.score.status] ?? 3 : 3;
    return aOrder - bOrder;
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
        <span className="text-[13px] font-semibold text-gray-800">
          Account Health
        </span>
        <span className="text-xs text-gray-400">
          {accounts.length} accounts
        </span>
      </div>

      {accountsWithScores.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-gray-400">
          No accounts synced yet.
        </div>
      ) : (
        accountsWithScores.map(({ account, score }) => (
          <Link
            key={account.id}
            href={`${basePath}/${account.id}`}
            className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50 last:border-b-0"
          >
            <div
              className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                score?.status === "red"
                  ? "bg-red"
                  : score?.status === "yellow"
                    ? "bg-amber-500"
                    : score?.status === "green"
                      ? "bg-emerald-500"
                      : "bg-gray-300"
              }`}
            />
            <div className="flex-1">
              <p className="text-[13px] font-semibold">{account.name}</p>
              <p className="text-[11px] text-gray-400">
                {account.mrr
                  ? `$${Math.round(account.mrr / 1000)}K MRR`
                  : "No MRR data"}
                {account.industry ? ` · ${account.industry}` : ""}
              </p>
            </div>
            {score && (
              <>
                <span
                  className={`rounded-xl px-2 py-0.5 text-[11px] font-semibold ${
                    score.status === "red"
                      ? "bg-red-light text-red"
                      : score.status === "yellow"
                        ? "bg-yellow-light text-yellow"
                        : "bg-green-light text-green"
                  }`}
                >
                  {score.score}
                </span>
                <span
                  className={`w-11 text-right text-xs font-semibold ${
                    score.delta && score.delta > 0
                      ? "text-green"
                      : score.delta && score.delta < 0
                        ? "text-red"
                        : "text-gray-400"
                  }`}
                >
                  {score.delta
                    ? `${score.delta > 0 ? "+" : ""}${score.delta}`
                    : "--"}
                </span>
              </>
            )}
          </Link>
        ))
      )}
    </div>
  );
}
