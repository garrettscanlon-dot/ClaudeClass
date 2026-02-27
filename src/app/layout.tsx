import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monday Morning Playbook — Solv Health",
  description:
    "Weekly digest and prioritization tool for Partner Success Consultants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-sm leading-relaxed">{children}</body>
    </html>
  );
}
