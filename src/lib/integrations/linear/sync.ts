import { createClient } from "@supabase/supabase-js";
import { linearQuery } from "./client";
import { TEAM_ISSUES_QUERY } from "./queries";
import { matchIssueToAccount, buildAccountNameMap } from "./matcher";
import type { LinearUsersData } from "./types";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function syncLinear(): Promise<{ recordsSynced: number }> {
  const supabase = getServiceClient();
  let totalSynced = 0;

  // Get team members
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("id, email");

  if (membersError || !members?.length) {
    throw new Error(`Failed to fetch team members: ${membersError?.message}`);
  }

  // Build account name map for matching
  const accountNames = await buildAccountNameMap();

  // Fetch issues for each member
  for (const member of members) {
    const data = await linearQuery<LinearUsersData>(TEAM_ISSUES_QUERY, {
      email: member.email,
    });

    const user = data.users.nodes[0];
    if (!user) continue;

    // Update Linear user ID
    await supabase
      .from("team_members")
      .update({ linear_user_id: user.id })
      .eq("id", member.id);

    // Upsert issues
    for (const issue of user.assignedIssues.nodes) {
      const labels = issue.labels.nodes.map((l) => l.name);

      const accountId = await matchIssueToAccount(
        issue.id,
        labels,
        issue.project?.name ?? null,
        accountNames,
      );

      await supabase.from("linear_issues").upsert(
        {
          linear_id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          status: issue.state.name,
          status_type: issue.state.type,
          priority: issue.priority,
          priority_label: issue.priorityLabel,
          assignee_id: member.id,
          account_id: accountId,
          project_name: issue.project?.name ?? null,
          labels,
          due_date: issue.dueDate,
          created_at: issue.createdAt,
          updated_at: issue.updatedAt,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "linear_id" },
      );
      totalSynced++;
    }
  }

  return { recordsSynced: totalSynced };
}
