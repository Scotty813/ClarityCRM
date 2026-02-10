"use client";

import { createContext, useContext, useState, useCallback } from "react";

type AuthMode = "login" | "signup";

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthMode;
  confirmed: boolean;
  open: (mode: AuthMode) => void;
  close: () => void;
  switchMode: () => void;
  setConfirmed: (v: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [confirmed, setConfirmed] = useState(false);

  const open = useCallback((m: AuthMode) => {
    setMode(m);
    setConfirmed(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setConfirmed(false);
  }, []);

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setConfirmed(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, confirmed, open, close, switchMode, setConfirmed }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
