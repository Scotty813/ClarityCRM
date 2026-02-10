"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "./auth-modal-context";

type ButtonProps = React.ComponentProps<typeof Button>;

interface AuthModalTriggerProps extends ButtonProps {
  mode: "login" | "signup";
}

export function AuthModalTrigger({
  mode,
  onClick,
  ...props
}: AuthModalTriggerProps) {
  const { open } = useAuthModal();

  return (
    <Button
      onClick={(e) => {
        open(mode);
        onClick?.(e);
      }}
      {...props}
    />
  );
}
