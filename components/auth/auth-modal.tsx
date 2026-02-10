"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModal } from "./auth-modal-context";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function AuthModal() {
  const { isOpen, mode, confirmed, close } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-md">
        {!confirmed && (
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription>
              {mode === "login"
                ? "Sign in to your ClarityCRM account"
                : "Get started with ClarityCRM for free"}
            </DialogDescription>
          </DialogHeader>
        )}
        {mode === "login" ? <LoginForm /> : <SignupForm />}
      </DialogContent>
    </Dialog>
  );
}
