import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";
import { AuthModalProvider } from "./auth-modal-context";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

function renderWithProvider() {
  return render(
    <AuthModalProvider>
      <SignupForm />
    </AuthModalProvider>,
  );
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, email, and password inputs", () => {
    renderWithProvider();
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
  });

  it("renders create account and google buttons", () => {
    renderWithProvider();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("renders button to switch to login", () => {
    renderWithProvider();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows success message after successful signup", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText(/^Email/), "new@example.com");
    await user.type(screen.getByLabelText(/^Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
  });

  it("passes first_name and last_name metadata when names are provided", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText("First name"), "Jane");
    await user.type(screen.getByLabelText("Last name"), "Smith");
    await user.type(screen.getByLabelText(/^Email/), "jane@example.com");
    await user.type(screen.getByLabelText(/^Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "jane@example.com",
        password: "password123",
        options: expect.objectContaining({
          data: { first_name: "Jane", last_name: "Smith" },
        }),
      }),
    );
  });

  it("omits data when names are empty", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText(/^Email/), "no-name@example.com");
    await user.type(screen.getByLabelText(/^Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: undefined,
        }),
      }),
    );
  });

  it("displays error message on failed signup", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText(/^Email/), "existing@example.com");
    await user.type(screen.getByLabelText(/^Password/), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("User already registered"),
    ).toBeInTheDocument();
  });
});
