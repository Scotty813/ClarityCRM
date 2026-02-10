import { features } from "@/lib/constants";
import { FeatureCard } from "./feature-card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Everything you need to close more deals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed for modern sales teams. No bloat, no
            complexity — just the tools that actually move the needle.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
