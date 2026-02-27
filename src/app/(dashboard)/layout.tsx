import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/nav/top-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get team member details
  const { data: member } = await supabase
    .from("team_members")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav
        userName={member?.full_name ?? user.email ?? "User"}
        role={member?.role ?? "member"}
      />
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
