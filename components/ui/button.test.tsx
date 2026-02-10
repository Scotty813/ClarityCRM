import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders with text content", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  it("applies variant data attribute", () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive")
  })

  it("passes through disabled prop", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
