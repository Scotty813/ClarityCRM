"use client";

import { cn } from "@/lib/utils";
import { onboardingSteps } from "@/lib/constants/onboarding";

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {onboardingSteps.map(({ step, label }) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {step > 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      isCompleted || isActive
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < onboardingSteps.length && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
