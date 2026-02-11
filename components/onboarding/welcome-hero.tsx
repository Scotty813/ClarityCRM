import { Target, Users, BarChart3, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

const ctaConfig = {
  leads: {
    icon: Target,
    title: "Start tracking leads",
    description: "Capture your first lead and watch your pipeline grow.",
  },
  customers: {
    icon: Users,
    title: "Add your first customer",
    description: "Import or create a customer record to get started.",
  },
  pipeline: {
    icon: BarChart3,
    title: "Build your first pipeline",
    description: "Set up deal stages and start tracking revenue.",
  },
  exploring: {
    icon: Compass,
    title: "Explore ClarityCRM",
    description: "Take a look around and discover what you can do.",
  },
} as const;

interface WelcomeHeroProps {
  userName: string | null;
  selectedPath: Profile["selected_path"];
  orgName?: string | null;
}

export function WelcomeHero({ userName, selectedPath, orgName }: WelcomeHeroProps) {
  const path = selectedPath ?? "exploring";
  const cta = ctaConfig[path];
  const Icon = cta.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome{userName ? `, ${userName}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {orgName
          ? `${orgName} is ready. Here\u2019s a good place to start.`
          : "Your workspace is ready. Here\u2019s a good place to start."}
      </p>

      <div className="mt-6 flex items-start gap-4 rounded-lg border border-border bg-background p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{cta.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {cta.description}
          </p>
          <Button size="sm" className="mt-4">
            Get started
          </Button>
        </div>
      </div>
    </div>
  );
}
