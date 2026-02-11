import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WelcomeHero } from "./welcome-hero";

describe("WelcomeHero", () => {
  it("renders welcome message with user name", () => {
    render(<WelcomeHero userName="Scott" selectedPath="leads" />);
    expect(screen.getByText("Welcome, Scott")).toBeInTheDocument();
  });

  it("renders welcome message without user name", () => {
    render(<WelcomeHero userName={null} selectedPath="leads" />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("shows CTA for leads path", () => {
    render(<WelcomeHero userName={null} selectedPath="leads" />);
    expect(screen.getByText("Start tracking leads")).toBeInTheDocument();
  });

  it("shows CTA for customers path", () => {
    render(<WelcomeHero userName={null} selectedPath="customers" />);
    expect(screen.getByText("Add your first customer")).toBeInTheDocument();
  });

  it("shows CTA for pipeline path", () => {
    render(<WelcomeHero userName={null} selectedPath="pipeline" />);
    expect(screen.getByText("Build your first pipeline")).toBeInTheDocument();
  });

  it("shows CTA for exploring path", () => {
    render(<WelcomeHero userName={null} selectedPath="exploring" />);
    expect(screen.getByText("Explore ClarityCRM")).toBeInTheDocument();
  });

  it("defaults to exploring when no path selected", () => {
    render(<WelcomeHero userName={null} selectedPath={null} />);
    expect(screen.getByText("Explore ClarityCRM")).toBeInTheDocument();
  });
});
