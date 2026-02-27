import { NextResponse } from "next/server";
import { runWeeklyPipeline } from "@/lib/pipeline/weekly";
import {
  postSlackMessage,
  closeSlackMcpClient,
} from "@/lib/integrations/slack/mcp-client";
import {
  formatMemberSlackMessage,
  formatTeamSlackMessage,
} from "@/lib/integrations/slack/messages";

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Run full pipeline (sync + analyze)
    const result = await runWeeklyPipeline();

    // 2. Post to Slack via MCP
    const slackChannel = process.env.SLACK_CHANNEL_ID ?? "#psc-team";
    const slackErrors: string[] = [];

    // Post individual member summaries (8 separate posts)
    for (const analysis of result.analyses) {
      if (analysis.status === "success" && analysis.slackDraft) {
        try {
          const message = formatMemberSlackMessage(
            analysis.memberName,
            result.weekOf,
            analysis.slackDraft,
          );
          await postSlackMessage(slackChannel, message);
        } catch (error) {
          slackErrors.push(
            `Failed to post for ${analysis.memberName}: ${error instanceof Error ? error.message : "Unknown"}`,
          );
        }
      }
    }

    // Post team rollup
    if (result.teamRollup.status === "success" && result.teamRollup.slackDraft) {
      try {
        const message = formatTeamSlackMessage(result.weekOf, result.teamRollup.slackDraft);
        await postSlackMessage(slackChannel, message);
      } catch (error) {
        slackErrors.push(
          `Failed to post team rollup: ${error instanceof Error ? error.message : "Unknown"}`,
        );
      }
    }

    // Clean up MCP client
    await closeSlackMcpClient();

    return NextResponse.json({
      success: true,
      weekOf: result.weekOf,
      syncResults: result.sync,
      analysesCompleted: result.analyses.filter((a) => a.status === "success").length,
      analysesFailed: result.analyses.filter((a) => a.status === "error").length,
      teamRollup: result.teamRollup.status,
      slackErrors: slackErrors.length > 0 ? slackErrors : undefined,
    });
  } catch (error) {
    await closeSlackMcpClient();
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
