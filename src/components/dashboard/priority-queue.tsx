"use client";

import type { Priority } from "@/types";

interface PriorityQueueProps {
  priorities: Priority[];
}

const urgencyColors: Record<string, string> = {
  critical: "red",
  high: "red",
  medium: "yellow",
  low: "green",
};

function formatMrr(mrr: number | null | undefined): string {
  if (!mrr) return "";
  if (mrr >= 1000) return `$${Math.round(mrr / 1000)}K MRR`;
  return `$${mrr} MRR`;
}

export function PriorityQueue({ priorities }: PriorityQueueProps) {
  if (!priorities.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <span className="text-[13px] font-semibold text-gray-800">
            Priority Queue
          </span>
        </div>
        <div className="py-8 text-center text-[13px] text-gray-400">
          Run an analysis to generate priorities.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
        <span className="text-[13px] font-semibold text-gray-800">
          Priority Queue
        </span>
        <span className="text-xs text-gray-400">
          {priorities.length} items &middot; ranked by urgency
        </span>
      </div>

      {priorities.map((priority, idx) => {
        const dotColor = urgencyColors[priority.urgency] ?? "gray";
        return (
          <div
            key={idx}
            className="flex gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0"
          >
            <div
              className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                dotColor === "red"
                  ? "bg-red"
                  : dotColor === "yellow"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-[13px] font-semibold">{priority.account_name}</p>
              <p className="mb-2 text-xs text-gray-600">{priority.reasoning}</p>
              <span className="inline-block rounded bg-blue-light px-2 py-0.5 text-xs font-medium text-blue">
                {priority.action}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
