import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
  fillClassName?: string;
  flip?: boolean;
};

export function SectionDivider({
  className,
  fillClassName = "fill-background",
  flip = false,
}: SectionDividerProps) {
  return (
    <div
      className={cn("relative -mt-px w-full overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={cn("block h-10 w-full sm:h-14", flip && "rotate-180")}
      >
        <path d="M0,0 L1440,60 L1440,60 L0,60 Z" className={fillClassName} />
      </svg>
    </div>
  );
}
