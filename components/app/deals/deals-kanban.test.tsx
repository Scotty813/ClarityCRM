import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DropResult } from "@hello-pangea/dnd";
import type { DealWithRelations, DealStage } from "@/lib/types/database";

// Capture onDragEnd so tests can invoke it directly
let capturedOnDragEnd: ((result: DropResult) => void) | null = null;

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd: (result: DropResult) => void;
  }) => {
    capturedOnDragEnd = onDragEnd;
    return <div>{children}</div>;
  },
  Droppable: ({
    children,
    droppableId,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
    droppableId: string;
  }) =>
    children(
      {
        innerRef: () => {},
        droppableProps: { "data-testid": `droppable-${droppableId}` },
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({
    children,
    draggableId,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
    draggableId: string;
  }) =>
    children(
      {
        innerRef: () => {},
        draggableProps: { "data-testid": `draggable-${draggableId}` },
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const mockMoveDeal = vi.fn();
vi.mock("@/lib/actions/deals", () => ({
  moveDeal: (...args: unknown[]) => mockMoveDeal(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { DealsKanban } from "./deals-kanban";
import { toast } from "sonner";

function makeDeal(
  overrides: Partial<DealWithRelations> & { id: string; name: string; stage: DealStage }
): DealWithRelations {
  return {
    organization_id: "org-1",
    created_by: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    position: 0,
    value: null,
    expected_close_date: null,
    owner_id: null,
    contact_id: null,
    company_id: null,
    notes: null,
    lost_reason: null,
    contact_name: null,
    company_name: null,
    owner_name: null,
    owner_avatar_url: null,
    last_activity_at: null,
    next_task_title: null,
    next_task_due_date: null,
    ...overrides,
  };
}

const DEALS: DealWithRelations[] = [
  makeDeal({ id: "d1", name: "Acme Corp", stage: "qualified", value: 10000, position: 0 }),
  makeDeal({ id: "d2", name: "Beta Inc", stage: "qualified", value: 5000, position: 1000 }),
  makeDeal({ id: "d3", name: "Gamma LLC", stage: "proposal", value: 20000, position: 0 }),
  makeDeal({ id: "d4", name: "Delta Co", stage: "negotiation", value: null, position: 0 }),
];

function fireDragEnd(result: Partial<DropResult>) {
  act(() => {
    capturedOnDragEnd?.({
      draggableId: "",
      type: "DEFAULT",
      reason: "DROP",
      mode: "FLUID",
      source: { droppableId: "qualified", index: 0 },
      combine: null,
      destination: null,
      ...result,
    } as DropResult);
  });
}

describe("DealsKanban", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnDragEnd = null;
    mockMoveDeal.mockResolvedValue({ success: true });
  });

  it("renders all five stage columns", () => {
    render(<DealsKanban deals={[]} />);
    expect(screen.getByText("Qualified")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("Negotiation")).toBeInTheDocument();
    expect(screen.getByText("Won")).toBeInTheDocument();
    expect(screen.getByText("Lost")).toBeInTheDocument();
  });

  it("renders deals in their correct stage columns", () => {
    render(<DealsKanban deals={DEALS} />);

    const qualifiedColumn = screen.getByTestId("droppable-qualified");
    expect(within(qualifiedColumn).getByText("Acme Corp")).toBeInTheDocument();
    expect(within(qualifiedColumn).getByText("Beta Inc")).toBeInTheDocument();

    const proposalColumn = screen.getByTestId("droppable-proposal");
    expect(within(proposalColumn).getByText("Gamma LLC")).toBeInTheDocument();

    const negotiationColumn = screen.getByTestId("droppable-negotiation");
    expect(within(negotiationColumn).getByText("Delta Co")).toBeInTheDocument();
  });

  it("shows deal count per stage", () => {
    render(<DealsKanban deals={DEALS} />);
    const qualifiedColumn = screen.getByTestId("droppable-qualified");
    expect(within(qualifiedColumn).getByText("2")).toBeInTheDocument();

    const proposalColumn = screen.getByTestId("droppable-proposal");
    expect(within(proposalColumn).getByText("1")).toBeInTheDocument();
  });

  it("shows stage value totals", () => {
    render(<DealsKanban deals={DEALS} />);
    // $15,000 only appears as the column total (individual deals are $10,000 and $5,000)
    const qualifiedColumn = screen.getByTestId("droppable-qualified");
    expect(within(qualifiedColumn).getByText("$15,000")).toBeInTheDocument();

    // $20,000 appears both as the column total and on the deal card, so check the header area
    const proposalColumn = screen.getByTestId("droppable-proposal");
    const totals = within(proposalColumn).getAllByText("$20,000");
    expect(totals.length).toBe(2); // column total + deal card value
  });

  it("shows 'No deals' for empty stages", () => {
    render(<DealsKanban deals={[]} />);
    const noDealTexts = screen.getAllByText("No deals");
    expect(noDealTexts.length).toBe(5);
  });

  it("ignores no-op drag (same column, same index)", () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "qualified", index: 0 },
    });
    expect(mockMoveDeal).not.toHaveBeenCalled();
  });

  it("ignores drag with no destination", () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: null,
    });
    expect(mockMoveDeal).not.toHaveBeenCalled();
  });

  it("calls moveDeal when reordering within the same column", async () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d2",
      source: { droppableId: "qualified", index: 1 },
      destination: { droppableId: "qualified", index: 0 },
    });

    // d2 moved before d1
    await vi.waitFor(() => {
      expect(mockMoveDeal).toHaveBeenCalledWith("d2", "qualified", ["d2", "d1"]);
    });
  });

  it("calls moveDeal when dragging to a non-terminal stage", async () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "proposal", index: 0 },
    });

    // d1 inserted at index 0 in proposal (before d3)
    await vi.waitFor(() => {
      expect(mockMoveDeal).toHaveBeenCalledWith("d1", "proposal", ["d1", "d3"]);
    });
  });

  it("opens close dialog instead of moving when dragging to 'won'", () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "won", index: 0 },
    });

    expect(mockMoveDeal).not.toHaveBeenCalled();
    expect(screen.getByText("Close Deal as Won")).toBeInTheDocument();
  });

  it("opens close dialog when dragging to 'lost'", () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "lost", index: 0 },
    });

    expect(mockMoveDeal).not.toHaveBeenCalled();
    expect(screen.getByText("Close Deal as Lost")).toBeInTheDocument();
  });

  it("shows error toast when moveDeal fails", async () => {
    mockMoveDeal.mockResolvedValue({ success: false, error: "Server error" });
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "proposal", index: 0 },
    });

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("shows success toast on stage change", async () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d1",
      source: { droppableId: "qualified", index: 0 },
      destination: { droppableId: "proposal", index: 0 },
    });

    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Moved to Proposal");
    });
  });

  it("does not show success toast on reorder within same column", async () => {
    render(<DealsKanban deals={DEALS} />);
    fireDragEnd({
      draggableId: "d2",
      source: { droppableId: "qualified", index: 1 },
      destination: { droppableId: "qualified", index: 0 },
    });

    await vi.waitFor(() => {
      expect(mockMoveDeal).toHaveBeenCalled();
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("calls onDealSelect when a deal card is clicked", async () => {
    const onDealSelect = vi.fn();
    render(<DealsKanban deals={DEALS} onDealSelect={onDealSelect} />);

    // Click on a non-link area of the card — the deal name is wrapped in a
    // <Link> with stopPropagation, so clicking it navigates instead of
    // triggering the Card's onClick.
    const card = screen.getByTestId("draggable-d1");
    await userEvent.click(within(card).getByText("No next step"));
    expect(onDealSelect).toHaveBeenCalledWith("d1");
  });
});
