import { SectionDivider } from "./section-divider";

const showcaseItems = [
  {
    title: "Visualize every deal at a glance",
    description:
      "Drag-and-drop pipeline boards let you see exactly where every opportunity stands. Color-coded stages, revenue forecasts, and smart filters give your team X-ray vision into the sales process.",
    imageAlt: "Pipeline board showing deals across stages",
  },
  {
    title: "Automate the busywork, focus on selling",
    description:
      "Set up rules in seconds: auto-assign leads, trigger follow-up emails, and get notified when deals go cold. Clarity handles the repetitive tasks so your team can spend time where it matters.",
    imageAlt: "Automation rules builder interface",
  },
];

export function FeatureShowcase() {
  return (
    <section className="relative bg-secondary">
      <SectionDivider fillClassName="fill-secondary" flip />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="space-y-24 lg:space-y-32">
          {showcaseItems.map((item, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={item.title}
                className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-16 ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Image placeholder */}
                <div className="flex-1">
                  <div className="aspect-[4/3] rounded-xl border border-border/50 bg-gradient-to-br from-tertiary/5 to-tertiary/10">
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50">
                      {item.imageAlt}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SectionDivider fillClassName="fill-background" />
    </section>
  );
}
