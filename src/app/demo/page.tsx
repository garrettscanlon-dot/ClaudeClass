import { StatCards } from "@/components/dashboard/stat-cards";
import { PriorityQueue } from "@/components/dashboard/priority-queue";
import { AccountHealthPanel } from "@/components/dashboard/account-health-panel";
import { SlackDraft } from "@/components/dashboard/slack-draft";
import {
  mockAccounts,
  mockHealthScores,
  mockPriorities,
  mockSummaryStats,
  mockSlackDraft,
} from "@/lib/mock-data";

export default function DemoPage() {
  return (
    <div className="space-y-5">
      <StatCards stats={mockSummaryStats} />

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-5">
          <PriorityQueue priorities={mockPriorities} />
          <SlackDraft draft={mockSlackDraft} />
        </div>

        <AccountHealthPanel
          accounts={mockAccounts}
          healthScores={mockHealthScores}
          basePath="/demo/account"
        />
      </div>
    </div>
  );
}
