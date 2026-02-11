import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { AuthModalProvider } from "./auth-modal-context";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

function renderWithProvider() {
  return render(
    <AuthModalProvider>
      <LoginForm />
    </AuthModalProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    renderWithProvider();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign in and google buttons", () => {
    renderWithProvider();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("renders button to switch to signup", () => {
    renderWithProvider();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("calls signInWithPassword on submit and redirects based on onboarding status", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { onboarding_completed: true },
            }),
        }),
      }),
    });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    // Wait for async profile check to complete
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to onboarding when onboarding is not completed", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { onboarding_completed: false },
            }),
        }),
      }),
    });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/onboarding/welcome");
    });
  });

  it("displays error message on failed sign in", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();

    renderWithProvider();
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid login credentials"),
    ).toBeInTheDocument();
  });
});
