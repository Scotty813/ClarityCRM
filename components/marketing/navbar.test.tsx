import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";

describe("Navbar", () => {
  it("renders the logo", () => {
    render(<Navbar />);
    expect(screen.getByText("Clarity")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders Log in and Get Started buttons", () => {
    render(<Navbar />);
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(<Navbar />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });
});
