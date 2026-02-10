import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./navbar";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<AuthModalProvider>{ui}</AuthModalProvider>);
}

describe("Navbar", () => {
  it("renders the logo", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    renderWithProvider(await Navbar());
    expect(screen.getByText("ClarityCRM")).toBeInTheDocument();
  });

  it("renders navigation links", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    renderWithProvider(await Navbar());
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders Log in and Get Started when logged out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    renderWithProvider(await Navbar());
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders Dashboard link when logged in", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
    });
    renderWithProvider(await Navbar());
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });

  it("renders mobile menu button", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    renderWithProvider(await Navbar());
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });
});
