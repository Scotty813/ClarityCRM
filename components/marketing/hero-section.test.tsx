import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renders the badge", () => {
    render(<HeroSection />);
    expect(screen.getByText("Now in Public Beta")).toBeInTheDocument();
  });

  it("renders the headline", () => {
    render(<HeroSection />);
    expect(screen.getByText(/The CRM that brings/)).toBeInTheDocument();
    expect(screen.getByText("clarity")).toBeInTheDocument();
  });

  it("renders both CTA buttons", () => {
    render(<HeroSection />);
    expect(screen.getByText("Start Free Trial")).toBeInTheDocument();
    expect(screen.getByText("Watch Demo")).toBeInTheDocument();
  });
});
