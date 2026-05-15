import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import SwipeableRow from "../components/ui/SwipeableRow.jsx";

afterEach(cleanup);

const swipe = (element, deltaX) => {
  const startX = 200;
  const draggableArea = element.lastChild;
  fireEvent.mouseDown(draggableArea, { clientX: startX });
  fireEvent.mouseMove(draggableArea, { clientX: startX + deltaX });
  fireEvent.mouseUp(draggableArea, { clientX: startX + deltaX });
};

describe("SwipeableRow — render", () => {
  it("renders its children", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <SwipeableRow onEdit={onEdit} onDelete={onDelete}>
        <span data-testid="child">Transaction item</span>
      </SwipeableRow>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Transaction item")).toBeVisible();
  });
});

describe("SwipeableRow — swipe interactions", () => {
  let onEdit, onDelete, container;

  beforeEach(() => {
    vi.useFakeTimers();
    onEdit = vi.fn();
    onDelete = vi.fn();
    const result = render(
      <SwipeableRow onEdit={onEdit} onDelete={onDelete}>
        <span>Item</span>
      </SwipeableRow>,
    );
    container = result.container.firstChild;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onEdit when swiped right beyond the threshold", () => {
    swipe(container, 100);
    vi.advanceTimersByTime(400);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onDelete when swiped left beyond the threshold", () => {
    swipe(container, -100);
    vi.advanceTimersByTime(400);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("does NOT call onEdit or onDelete for a tiny swipe (below threshold)", () => {
    swipe(container, 10);
    vi.advanceTimersByTime(400);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});

describe("SwipeableRow — a11y & edge cases", () => {
  it("does not crash when onEdit is not provided", () => {
    const onDelete = vi.fn();
    const { container } = render(
      <SwipeableRow onDelete={onDelete}>
        <span>Item</span>
      </SwipeableRow>,
    );
    expect(() => swipe(container.firstChild, 100)).not.toThrow();
  });

  it("does not crash when onDelete is not provided", () => {
    const onEdit = vi.fn();
    const { container } = render(
      <SwipeableRow onEdit={onEdit}>
        <span>Item</span>
      </SwipeableRow>,
    );
    expect(() => swipe(container.firstChild, -100)).not.toThrow();
  });
});
