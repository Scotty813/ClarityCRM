import { ArrowRight } from "lucide-react";
import { AuthModalTrigger } from "@/components/auth/auth-modal-trigger";

export function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-gradient-from to-gradient-to py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to bring clarity to your pipeline?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
          Join thousands of teams who closed more deals with less effort. Start
          your free 14-day trial — no credit card required.
        </p>
        <div className="mt-10">
          <AuthModalTrigger
            mode="signup"
            size="lg"
            variant="secondary"
            className="rounded-full px-8 text-primary"
          >
            Get Started for Free
            <ArrowRight className="ml-1 size-4" />
          </AuthModalTrigger>
        </div>
      </div>
    </section>
  );
}
