import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { SectionDivider } from "./section-divider";
import { AuthModalTrigger } from "@/components/auth/auth-modal-trigger";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 border-tertiary/20 bg-tertiary/10 text-tertiary"
          >
            Now in Public Beta
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            The CRM that brings{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              clarity
            </span>{" "}
            to your pipeline
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Stop drowning in spreadsheets. ClarityCRM gives your team a single,
            beautiful workspace to manage contacts, track deals, and close
            faster.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <AuthModalTrigger
              mode="signup"
              size="lg"
              className="rounded-full bg-gradient-to-r from-gradient-from to-gradient-to px-8 text-primary-foreground hover:opacity-90"
            >
              Start Free Trial
              <ArrowRight className="ml-1 size-4" />
            </AuthModalTrigger>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8"
            >
              <Play className="mr-1 size-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      <SectionDivider fillClassName="fill-background" />
    </section>
  );
}
