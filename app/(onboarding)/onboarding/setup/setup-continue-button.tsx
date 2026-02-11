"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/actions/profiles";

export function SetupContinueButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);

    try {
      await completeOnboarding();
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleContinue} disabled={loading} size="lg" className="w-full">
      {loading ? "Finishing up..." : "Continue to dashboard"}
    </Button>
  );
}
