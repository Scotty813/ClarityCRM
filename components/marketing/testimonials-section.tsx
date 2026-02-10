import { testimonials } from "@/lib/constants";
import { TestimonialCard } from "./testimonial-card";

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Loved by teams who sell smarter
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don&apos;t take our word for it — hear from the teams that switched
            to ClarityCRM and never looked back.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
