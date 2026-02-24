import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DealActivityList } from "./deal-activity-list";
import type { DealActivityWithAuthor } from "@/lib/types/database";

const mocks = vi.hoisted(() => ({
  updateDealActivity: vi.fn(),
  deleteDealActivity: vi.fn(),
  toast: { error: vi.fn() },
}));

vi.mock("@/lib/actions/deal-activities", () => ({
  updateDealActivity: mocks.updateDealActivity,
  deleteDealActivity: mocks.deleteDealActivity,
}));

vi.mock("sonner", () => ({
  toast: mocks.toast,
}));

const CURRENT_USER = "user-1";
const OTHER_USER = "user-2";
const DEAL_ID = "deal-1";

function makeActivity(
  overrides: Partial<DealActivityWithAuthor> = {}
): DealActivityWithAuthor {
  return {
    id: "act-1",
    deal_id: DEAL_ID,
    organization_id: "org-1",
    activity_type: "note",
    content: "Test note content",
    metadata: null,
    created_by: CURRENT_USER,
    created_at: new Date().toISOString(),
    author_name: "Alice",
    ...overrides,
  };
}


describe("DealActivityList", () => {
  const onMutationSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no activities", () => {
    render(
      <DealActivityList
        activities={[]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );
    expect(
      screen.getByText(/no activity yet/i)
    ).toBeInTheDocument();
  });

  it("renders non-stage_change activities with editable content", () => {
    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );
    expect(screen.getByText("Test note content")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("enters edit mode on click and shows textarea", async () => {
    const user = userEvent.setup();
    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    await user.click(screen.getByTestId("activity-content"));
    expect(screen.getByTestId("activity-edit-textarea")).toBeInTheDocument();
  });

  it("saves on Cmd+Enter", async () => {
    mocks.updateDealActivity.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    await user.click(screen.getByTestId("activity-content"));
    const textarea = screen.getByTestId("activity-edit-textarea");
    await user.clear(textarea);
    await user.type(textarea, "Updated content");
    await user.keyboard("{Meta>}{Enter}{/Meta}");

    await vi.waitFor(() => {
      expect(mocks.updateDealActivity).toHaveBeenCalledWith(
        "act-1",
        "Updated content"
      );
    });
    expect(onMutationSuccess).toHaveBeenCalled();
  });

  it("cancels edit on Escape", async () => {
    const user = userEvent.setup();

    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    await user.click(screen.getByTestId("activity-content"));
    expect(screen.getByTestId("activity-edit-textarea")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("activity-edit-textarea")).not.toBeInTheDocument();
    expect(screen.getByText("Test note content")).toBeInTheDocument();
  });

  it("renders activity type label for any activity type", () => {
    render(
      <DealActivityList
        activities={[makeActivity({ activity_type: "call", content: "Called contact" })]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Called contact")).toBeInTheDocument();
  });

  it("hides action menu for activities not owned by current user (non-admin)", () => {
    render(
      <DealActivityList
        activities={[makeActivity({ created_by: OTHER_USER })]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    expect(screen.queryByTestId("activity-action-menu")).not.toBeInTheDocument();
  });

  it("shows action menu for activities not owned by current user when admin", () => {
    render(
      <DealActivityList
        activities={[makeActivity({ created_by: OTHER_USER })]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={true}
        onMutationSuccess={onMutationSuccess}
      />
    );

    expect(screen.getByTestId("activity-action-menu")).toBeInTheDocument();
  });

  it("deletes activity via action menu", async () => {
    mocks.deleteDealActivity.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    await user.click(screen.getByTestId("activity-action-menu"));
    await user.click(screen.getByTestId("activity-delete"));

    await vi.waitFor(() => {
      expect(mocks.deleteDealActivity).toHaveBeenCalledWith("act-1", DEAL_ID);
    });
    expect(onMutationSuccess).toHaveBeenCalled();
  });

  it("shows error toast when delete fails", async () => {
    mocks.deleteDealActivity.mockResolvedValue({
      success: false,
      error: "Cannot delete",
    });
    const user = userEvent.setup();

    render(
      <DealActivityList
        activities={[makeActivity()]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    await user.click(screen.getByTestId("activity-action-menu"));
    await user.click(screen.getByTestId("activity-delete"));

    await vi.waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith("Cannot delete");
    });
  });

  it("does not allow editing activities owned by others (non-admin)", async () => {
    const user = userEvent.setup();

    render(
      <DealActivityList
        activities={[
          makeActivity({
            created_by: OTHER_USER,
            content: "Other user note",
          }),
        ]}
        dealId={DEAL_ID}
        currentUserId={CURRENT_USER}
        isAdmin={false}
        onMutationSuccess={onMutationSuccess}
      />
    );

    // Content should be rendered but not clickable to edit
    const content = screen.getByText("Other user note");
    await user.click(content);
    expect(screen.queryByTestId("activity-edit-textarea")).not.toBeInTheDocument();
  });
});
