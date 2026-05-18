import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console // 3IN1 TRADER",
  description: "Manage connected API exchanges, configure risk boundaries, and track real-time mirrors.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f0e8] relative flex overflow-hidden">
      {/* Subtle global noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />
      <main className="flex-1 w-full relative overflow-y-auto">{children}</main>
    </div>
  );
}
