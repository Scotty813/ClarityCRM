import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SetupTaskCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SetupTaskCard({ icon: Icon, title, description }: SetupTaskCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{title}</p>
          <Badge variant="secondary" className="text-xs">
            Coming soon
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
