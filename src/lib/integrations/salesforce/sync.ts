import { createClient } from "@supabase/supabase-js";
import { sfQuery } from "./client";
import type {
  SfUserRecord,
  SfAccountRecord,
  SfOpportunityRecord,
  SfTaskRecord,
  SfContactRecord,
} from "./types";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function syncSalesforce(): Promise<{ recordsSynced: number }> {
  const supabase = getServiceClient();
  let totalSynced = 0;

  // 1. Get team member emails from Supabase
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("id, email");

  if (membersError || !members?.length) {
    throw new Error(`Failed to fetch team members: ${membersError?.message}`);
  }

  const emailList = members.map((m) => `'${m.email}'`).join(",");

  // 2. Resolve Salesforce User IDs
  const sfUsers = await sfQuery<SfUserRecord>(
    `SELECT Id, Email, Name FROM User WHERE Email IN (${emailList})`,
  );

  const emailToSfUserId = new Map(sfUsers.map((u) => [u.Email.toLowerCase(), u.Id]));
  const sfUserIdToMemberId = new Map<string, string>();

  // Update team_members with Salesforce IDs
  for (const member of members) {
    const sfUserId = emailToSfUserId.get(member.email.toLowerCase());
    if (sfUserId) {
      sfUserIdToMemberId.set(sfUserId, member.id);
      await supabase
        .from("team_members")
        .update({ salesforce_user_id: sfUserId })
        .eq("id", member.id);
    }
  }

  const sfUserIds = Array.from(sfUserIdToMemberId.keys());
  if (!sfUserIds.length) {
    throw new Error("No team members matched to Salesforce users");
  }

  const ownerIdList = sfUserIds.map((id) => `'${id}'`).join(",");

  // 3. Sync accounts
  const accounts = await sfQuery<SfAccountRecord>(
    `SELECT Id, Name, OwnerId, Type, AnnualRevenue, Industry, LastActivityDate, CreatedDate, LastModifiedDate
     FROM Account WHERE OwnerId IN (${ownerIdList})`,
  );

  for (const acc of accounts) {
    const memberId = sfUserIdToMemberId.get(acc.OwnerId);
    await supabase.from("sf_accounts").upsert(
      {
        salesforce_id: acc.Id,
        name: acc.Name,
        owner_id: memberId,
        salesforce_owner_id: acc.OwnerId,
        account_type: acc.Type,
        arr: acc.AnnualRevenue,
        mrr: acc.AnnualRevenue ? acc.AnnualRevenue / 12 : null,
        industry: acc.Industry,
        last_activity_date: acc.LastActivityDate,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "salesforce_id" },
    );
  }
  totalSynced += accounts.length;

  // Get account ID mapping for related objects
  const { data: dbAccounts } = await supabase
    .from("sf_accounts")
    .select("id, salesforce_id");
  const sfIdToDbId = new Map(dbAccounts?.map((a) => [a.salesforce_id, a.id]) ?? []);
  const accountIds = accounts.map((a) => `'${a.Id}'`).join(",");

  if (accounts.length > 0) {
    // 4. Sync opportunities
    const opps = await sfQuery<SfOpportunityRecord>(
      `SELECT Id, Name, AccountId, StageName, Amount, CloseDate, Type, Probability, NextStep
       FROM Opportunity WHERE AccountId IN (${accountIds}) AND IsClosed = false`,
    );

    for (const opp of opps) {
      await supabase.from("sf_opportunities").upsert(
        {
          salesforce_id: opp.Id,
          account_id: sfIdToDbId.get(opp.AccountId),
          name: opp.Name,
          stage: opp.StageName,
          amount: opp.Amount,
          close_date: opp.CloseDate,
          opp_type: opp.Type,
          probability: opp.Probability,
          next_step: opp.NextStep,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "salesforce_id" },
      );
    }
    totalSynced += opps.length;

    // 5. Sync activities (last 30 days)
    const tasks = await sfQuery<SfTaskRecord>(
      `SELECT Id, Subject, Status, Priority, ActivityDate, WhoId, WhatId, Description
       FROM Task WHERE OwnerId IN (${ownerIdList}) AND ActivityDate >= LAST_N_DAYS:30
       ORDER BY ActivityDate DESC`,
    );

    for (const task of tasks) {
      const accountSfId = task.WhatId; // WhatId is typically the Account/Opportunity
      await supabase.from("sf_activities").upsert(
        {
          salesforce_id: task.Id,
          account_id: accountSfId ? sfIdToDbId.get(accountSfId) : null,
          owner_id: null, // Will be resolved via account ownership
          subject: task.Subject,
          status: task.Status,
          priority: task.Priority,
          activity_date: task.ActivityDate,
          description: task.Description,
          activity_type: task.TaskSubtype || "Task",
          synced_at: new Date().toISOString(),
        },
        { onConflict: "salesforce_id" },
      );
    }
    totalSynced += tasks.length;

    // 6. Sync contacts
    const contacts = await sfQuery<SfContactRecord>(
      `SELECT Id, Name, Email, Title, AccountId, LastModifiedDate
       FROM Contact WHERE AccountId IN (${accountIds})`,
    );

    for (const contact of contacts) {
      await supabase.from("sf_contacts").upsert(
        {
          salesforce_id: contact.Id,
          account_id: sfIdToDbId.get(contact.AccountId),
          name: contact.Name,
          email: contact.Email,
          title: contact.Title,
          is_champion: false,
          last_contacted: null,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "salesforce_id" },
      );
    }
    totalSynced += contacts.length;
  }

  return { recordsSynced: totalSynced };
}
