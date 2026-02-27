import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncGong } from "@/lib/integrations/gong/sync";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: member } = await supabase
      .from("team_members").select("role").eq("id", user.id).single();
    if (member?.role !== "lead") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: logEntry } = await supabase
    .from("sync_logs")
    .insert({ source: "gong", status: "started" })
    .select("id")
    .single();

  try {
    const result = await syncGong();
    await supabase.from("sync_logs").update({
      status: "completed",
      records_synced: result.recordsSynced,
      completed_at: new Date().toISOString(),
    }).eq("id", logEntry?.id);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("sync_logs").update({
      status: "failed",
      error_message: message,
      completed_at: new Date().toISOString(),
    }).eq("id", logEntry?.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
