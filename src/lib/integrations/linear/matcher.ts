import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Matches a Linear issue to a Salesforce account using labels and project names.
 * Priority: manual override > label match > project match > null
 */
export async function matchIssueToAccount(
  linearIssueId: string,
  labels: string[],
  projectName: string | null,
  accountNames: Map<string, string>, // lowercase name -> account UUID
): Promise<string | null> {
  const supabase = getServiceClient();

  // 1. Check manual overrides
  const { data: override } = await supabase
    .from("ticket_account_mappings")
    .select("account_id")
    .eq("linear_issue_id", linearIssueId)
    .single();

  if (override?.account_id) {
    return override.account_id;
  }

  // 2. Match labels against account names (fuzzy)
  for (const label of labels) {
    const labelLower = label.toLowerCase().trim();

    // Exact match
    const exact = accountNames.get(labelLower);
    if (exact) return exact;

    // Partial match (label contains account name or vice versa)
    for (const [accountName, accountId] of accountNames) {
      if (labelLower.includes(accountName) || accountName.includes(labelLower)) {
        return accountId;
      }
    }
  }

  // 3. Match project name
  if (projectName) {
    const projLower = projectName.toLowerCase().trim();
    for (const [accountName, accountId] of accountNames) {
      if (projLower.includes(accountName) || accountName.includes(projLower)) {
        return accountId;
      }
    }
  }

  return null;
}

/**
 * Build a lookup map of lowercase account names to UUIDs
 */
export async function buildAccountNameMap(): Promise<Map<string, string>> {
  const supabase = getServiceClient();
  const { data: accounts } = await supabase
    .from("sf_accounts")
    .select("id, name");

  const map = new Map<string, string>();
  for (const account of accounts ?? []) {
    map.set(account.name.toLowerCase(), account.id);
  }
  return map;
}
