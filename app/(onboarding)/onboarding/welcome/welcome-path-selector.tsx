"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PathSelectionCard } from "@/components/onboarding/path-selection-card";
import { pathOptions, type SelectedPath } from "@/lib/constants/onboarding";
import { updateSelectedPath } from "@/lib/actions/profiles";

interface WelcomePathSelectorProps {
  defaultPath?: SelectedPath;
}

export function WelcomePathSelector({ defaultPath }: WelcomePathSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedPath | null>(
    defaultPath ?? null
  );
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);

    try {
      await updateSelectedPath(selected);
      router.push("/onboarding/organization");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pathOptions.map((option) => (
          <PathSelectionCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selected === option.value}
            onSelect={() => setSelected(option.value)}
          />
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selected || loading}
        size="lg"
        className="w-full"
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
