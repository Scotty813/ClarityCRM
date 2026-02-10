import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/constants";

export function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="pt-6">
        {/* Stars */}
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-tertiary text-tertiary"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-sm leading-relaxed text-muted-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-tertiary/10 text-xs font-semibold text-tertiary">
              {testimonial.avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-primary">
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
