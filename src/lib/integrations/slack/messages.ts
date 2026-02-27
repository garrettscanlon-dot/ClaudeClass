/**
 * Format a team member's weekly analysis into a Slack message (mrkdwn format).
 * Used as a fallback if the AI-generated draft needs formatting.
 */
export function formatMemberSlackMessage(
  memberName: string,
  weekOf: string,
  slackDraft: string,
): string {
  // The AI already generates a well-formatted message.
  // This wrapper adds consistent header/footer if missing.
  if (!slackDraft.includes("Monday Morning Playbook")) {
    return `:clipboard: *Monday Morning Playbook — ${memberName} — ${weekOf}*\n\n${slackDraft}`;
  }
  return slackDraft;
}

/**
 * Format the team rollup into a Slack message.
 */
export function formatTeamSlackMessage(
  weekOf: string,
  teamSlackDraft: string,
): string {
  if (!teamSlackDraft.includes("Team Summary")) {
    return `:chart_with_upwards_trend: *Monday Morning Playbook — Team Summary — ${weekOf}*\n\n${teamSlackDraft}`;
  }
  return teamSlackDraft;
}
