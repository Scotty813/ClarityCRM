"use client";

import { useEffect, useState } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardGreeting({ firstName }: { firstName: string | null }) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    setFormattedDate(getFormattedDate());
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting ? (
          <>
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </>
        ) : (
          // Invisible placeholder to prevent layout shift
          <span className="invisible">Good morning</span>
        )}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s what&apos;s happening today.
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground/70">
        {formattedDate ?? <span className="invisible">Monday, January 1</span>}
      </p>
    </div>
  );
}
