"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  userName: string;
  role: string;
}

export function TopNav({ userName, role }: TopNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-[15px] font-bold tracking-tight text-blue">
          Monday Morning Playbook
        </Link>
        <span className="border-l border-gray-200 pl-3 text-[13px] text-gray-400">
          {today}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {role === "lead" && (
          <Link href="/team">
            <Button variant="outline" size="sm">
              Team View
            </Button>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-[13px] text-gray-600">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-blue text-xs font-semibold text-white">
                {initials}
              </div>
              {userName}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
