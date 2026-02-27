import Link from "next/link";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-[15px] font-bold tracking-tight text-blue">
            Monday Morning Playbook
          </Link>
          <span className="border-l border-gray-200 pl-3 text-[13px] text-gray-400">
            {today}
          </span>
          <span className="rounded border border-amber-300 bg-yellow-light px-2 py-0.5 text-[11px] font-medium text-yellow">
            Demo Mode
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo/team"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Team View
          </Link>
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-blue text-xs font-semibold text-white">
              AR
            </div>
            Alex Rivera
          </div>
        </div>
      </nav>

      {/* Integration Status */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-white px-6 py-2">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Integrations
        </span>
        {["Salesforce", "Linear", "Gong", "Slack"].map((name) => (
          <span
            key={name}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              name === "Gong"
                ? "border-amber-300 bg-yellow-light text-yellow"
                : "border-emerald-300 bg-green-light text-green"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${name === "Gong" ? "bg-yellow" : "bg-green"}`}
            />
            {name}
          </span>
        ))}
        <span className="ml-auto rounded border border-amber-300 bg-yellow-light px-2.5 py-0.5 text-xs text-yellow">
          Gong data delayed up to 6 hrs — call signals may be incomplete
        </span>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
