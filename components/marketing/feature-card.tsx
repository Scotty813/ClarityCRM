import { Card, CardContent } from "@/components/ui/card";
import type { Feature } from "@/lib/constants";

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <Card className="border-border/50 bg-card transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-tertiary/10">
          <Icon className="size-5 text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}
