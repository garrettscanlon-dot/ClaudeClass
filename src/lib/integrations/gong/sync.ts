import { createClient } from "@supabase/supabase-js";
import { getGongUsers, getGongCalls, getGongTranscripts } from "./client";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function syncGong(): Promise<{ recordsSynced: number }> {
  const supabase = getServiceClient();
  let totalSynced = 0;

  // 1. Get team members
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("id, email");

  if (membersError || !members?.length) {
    throw new Error(`Failed to fetch team members: ${membersError?.message}`);
  }

  // 2. Get Gong users and map to team members
  const gongUsersResponse = await getGongUsers();
  const emailToGongId = new Map(
    gongUsersResponse.users.map((u) => [u.emailAddress.toLowerCase(), u.id]),
  );
  const gongIdToMemberId = new Map<string, string>();

  for (const member of members) {
    const gongId = emailToGongId.get(member.email.toLowerCase());
    if (gongId) {
      gongIdToMemberId.set(gongId, member.id);
      await supabase
        .from("team_members")
        .update({ gong_user_id: gongId })
        .eq("id", member.id);
    }
  }

  // 3. Get calls from last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const callsResponse = await getGongCalls(
    sevenDaysAgo.toISOString(),
    now.toISOString(),
  );

  // Filter to calls involving team members
  const teamCalls = callsResponse.calls.filter((call) =>
    gongIdToMemberId.has(call.primaryUserId),
  );

  if (teamCalls.length === 0) {
    return { recordsSynced: 0 };
  }

  // 4. Get transcripts (batch up to 10 at a time to stay within limits)
  const callIds = teamCalls.map((c) => c.id);
  const transcriptMap = new Map<string, string>();

  for (let i = 0; i < callIds.length; i += 10) {
    const batch = callIds.slice(i, i + 10);
    const transcriptResponse = await getGongTranscripts(batch);

    for (const transcript of transcriptResponse.callTranscripts) {
      // Flatten transcript into readable text, truncate to 3000 chars
      const fullText = transcript.transcript
        .flatMap((entry) =>
          entry.sentences.map((s) => s.text),
        )
        .join(" ");
      transcriptMap.set(transcript.callId, fullText.slice(0, 3000));
    }
  }

  // 5. Build account lookup from contacts (match participant emails to accounts)
  const { data: contacts } = await supabase
    .from("sf_contacts")
    .select("email, account_id")
    .not("email", "is", null);

  const contactEmailToAccount = new Map(
    (contacts ?? []).map((c) => [c.email?.toLowerCase(), c.account_id]),
  );

  // 6. Upsert calls
  for (const call of teamCalls) {
    const memberId = gongIdToMemberId.get(call.primaryUserId);

    // Try to match to an account via external participant emails
    let accountId: string | null = null;
    for (const party of call.parties) {
      if (party.affiliation === "external" && party.emailAddress) {
        const matched = contactEmailToAccount.get(party.emailAddress.toLowerCase());
        if (matched) {
          accountId = matched;
          break;
        }
      }
    }

    const participants = call.parties.map((p) => ({
      name: p.name,
      email: p.emailAddress || "",
      role: p.affiliation,
    }));

    await supabase.from("gong_calls").upsert(
      {
        gong_id: call.id,
        title: call.title,
        started_at: call.started,
        duration_seconds: call.duration,
        owner_id: memberId,
        account_id: accountId,
        participants,
        direction: call.direction,
        transcript_summary: transcriptMap.get(call.id) || null,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "gong_id" },
    );
    totalSynced++;
  }

  return { recordsSynced: totalSynced };
}
