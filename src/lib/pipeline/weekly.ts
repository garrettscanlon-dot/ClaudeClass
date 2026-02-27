import { createClient } from "@supabase/supabase-js";
import { syncSalesforce } from "@/lib/integrations/salesforce/sync";
import { syncLinear } from "@/lib/integrations/linear/sync";
import { syncGong } from "@/lib/integrations/gong/sync";
import { analyzeTeamMember } from "@/lib/ai/weekly-analysis";
import { generateTeamRollup } from "@/lib/ai/team-rollup";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Get the Monday of the current week (YYYY-MM-DD)
 */
function getWeekOf(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export interface PipelineResult {
  weekOf: string;
  sync: {
    salesforce: { recordsSynced: number } | { error: string };
    linear: { recordsSynced: number } | { error: string };
    gong: { recordsSynced: number } | { error: string };
  };
  analyses: Array<{
    memberId: string;
    memberName: string;
    status: "success" | "error";
    error?: string;
    slackDraft?: string;
  }>;
  teamRollup: { status: "success" | "error"; error?: string; slackDraft?: string };
}

export async function runWeeklyPipeline(): Promise<PipelineResult> {
  const weekOf = getWeekOf();
  const supabase = getServiceClient();

  // 1. Sync all data sources (in parallel)
  const [sfResult, linearResult, gongResult] = await Promise.allSettled([
    syncSalesforce(),
    syncLinear(),
    syncGong(),
  ]);

  const syncResults = {
    salesforce:
      sfResult.status === "fulfilled"
        ? { recordsSynced: sfResult.value.recordsSynced }
        : { error: sfResult.reason?.message ?? "Unknown error" },
    linear:
      linearResult.status === "fulfilled"
        ? { recordsSynced: linearResult.value.recordsSynced }
        : { error: linearResult.reason?.message ?? "Unknown error" },
    gong:
      gongResult.status === "fulfilled"
        ? { recordsSynced: gongResult.value.recordsSynced }
        : { error: gongResult.reason?.message ?? "Unknown error" },
  };

  // 2. Get all team members
  const { data: members } = await supabase
    .from("team_members")
    .select("id, full_name");

  if (!members?.length) {
    throw new Error("No team members found");
  }

  // 3. Analyze each member (in parallel)
  const analysisResults = await Promise.allSettled(
    members.map((m) => analyzeTeamMember(m.id, weekOf)),
  );

  const analyses = members.map((member, i) => {
    const result = analysisResults[i];
    if (result.status === "fulfilled") {
      return {
        memberId: member.id,
        memberName: member.full_name,
        status: "success" as const,
        slackDraft: result.value.slack_draft,
      };
    }
    return {
      memberId: member.id,
      memberName: member.full_name,
      status: "error" as const,
      error: result.reason?.message ?? "Unknown error",
    };
  });

  // 4. Generate team rollup
  let teamRollup: PipelineResult["teamRollup"];
  try {
    const rollup = await generateTeamRollup(weekOf);
    teamRollup = { status: "success", slackDraft: rollup.team_slack_draft };
  } catch (error) {
    teamRollup = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return { weekOf, sync: syncResults, analyses, teamRollup };
}
