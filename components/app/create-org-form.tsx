"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamSizeOptions, industryOptions } from "@/lib/constants/onboarding";
import { createAdditionalOrganization } from "@/lib/actions/organizations";

export function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await createAdditionalOrganization({
        name: name.trim(),
        teamSize: teamSize || undefined,
        industry: industry || undefined,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="org-name">Workspace name</Label>
        <Input
          id="org-name"
          placeholder="e.g. Acme Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="team-size">
          Team size{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Select value={teamSize} onValueChange={setTeamSize}>
          <SelectTrigger id="team-size">
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            {teamSizeOptions.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="industry">
          Industry{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {industryOptions.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || loading} className="flex-1">
          {loading ? "Creating..." : "Create organization"}
        </Button>
      </div>
    </form>
  );
}
