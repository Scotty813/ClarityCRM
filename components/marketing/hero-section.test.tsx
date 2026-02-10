import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./hero-section";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";

function renderWithProvider(ui: React.ReactElement) {
  return render(<AuthModalProvider>{ui}</AuthModalProvider>);
}

describe("HeroSection", () => {
  it("renders the badge", () => {
    renderWithProvider(<HeroSection />);
    expect(screen.getByText("Now in Public Beta")).toBeInTheDocument();
  });

  it("renders the headline", () => {
    renderWithProvider(<HeroSection />);
    expect(screen.getByText(/The CRM that brings/)).toBeInTheDocument();
    expect(screen.getByText("clarity")).toBeInTheDocument();
  });

  it("renders both CTA buttons", () => {
    renderWithProvider(<HeroSection />);
    expect(screen.getByText("Start Free Trial")).toBeInTheDocument();
    expect(screen.getByText("Watch Demo")).toBeInTheDocument();
  });
});
