import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthModalProvider, useAuthModal } from "./auth-modal-context";
import { AuthModal } from "./auth-modal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

function OpenButton({ mode }: { mode: "login" | "signup" }) {
  const { open } = useAuthModal();
  return (
    <button onClick={() => open(mode)}>Open {mode}</button>
  );
}

function renderModal() {
  return render(
    <AuthModalProvider>
      <OpenButton mode="login" />
      <OpenButton mode="signup" />
      <AuthModal />
    </AuthModalProvider>,
  );
}

describe("AuthModal", () => {
  it("opens in login mode", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("Open login"));

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your ClarityCRM account")).toBeInTheDocument();
  });

  it("opens in signup mode", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("Open signup"));

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("Get started with ClarityCRM for free")).toBeInTheDocument();
  });

  it("switches from login to signup mode", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("Open login"));
    expect(screen.getByText("Welcome back")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign up" }));
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("switches from signup to login mode", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("Open signup"));
    expect(screen.getByText("Create your account")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
