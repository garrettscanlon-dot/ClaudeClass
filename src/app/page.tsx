import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to demo until Supabase is configured
  redirect("/demo");
}
