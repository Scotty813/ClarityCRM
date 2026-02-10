const logos = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Wonka",
  "Stark",
];

export function LogoBar() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by teams at
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
