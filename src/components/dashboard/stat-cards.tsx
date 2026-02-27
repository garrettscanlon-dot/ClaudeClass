import type { SummaryStats } from "@/types";

interface StatCardsProps {
  stats: SummaryStats | null;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

const statConfig = [
  { key: "mrr_at_risk" as const, label: "MRR at Risk", format: formatCurrency },
  { key: "renewals_30d" as const, label: "Renewal (Next 30 Days)", format: (v: number) => String(v) },
  { key: "expansion_pipeline" as const, label: "Expansion Pipeline", format: formatCurrency },
  { key: "open_tickets" as const, label: "Open Tickets", format: (v: number) => String(v) },
];

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {statConfig.map(({ key, label, format }) => (
        <div
          key={key}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-1 text-[22px] font-bold text-gray-800">
            {stats ? format(stats[key]) : "--"}
          </p>
        </div>
      ))}
    </div>
  );
}
