interface SyncStatus {
  source: string;
  status: "ok" | "warn" | "error" | "pending";
  message?: string;
}

interface IntegrationStatusProps {
  statuses: SyncStatus[];
}

export function IntegrationStatus({ statuses }: IntegrationStatusProps) {
  return (
    <div className="flex items-center gap-1.5 border-b border-gray-200 bg-white px-6 py-2">
      <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
        Integrations
      </span>
      {statuses.map((s) => (
        <span
          key={s.source}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            s.status === "ok"
              ? "border-emerald-300 bg-green-light text-green"
              : s.status === "warn"
                ? "border-amber-300 bg-yellow-light text-yellow"
                : s.status === "error"
                  ? "border-red-300 bg-red-light text-red"
                  : "border-gray-200 bg-gray-100 text-gray-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              s.status === "ok"
                ? "bg-green"
                : s.status === "warn"
                  ? "bg-yellow"
                  : s.status === "error"
                    ? "bg-red"
                    : "bg-gray-400"
            }`}
          />
          {s.source}
        </span>
      ))}
      {statuses.some((s) => s.message) && (
        <span className="ml-auto rounded border border-amber-300 bg-yellow-light px-2.5 py-0.5 text-xs text-yellow">
          {statuses.find((s) => s.message)?.message}
        </span>
      )}
    </div>
  );
}
