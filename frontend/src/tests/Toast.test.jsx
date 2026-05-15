import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider } from "../context/ToastContext.jsx";
import { useToast } from "../context/ToastContext.js";

function setupMatchMedia(prefersReduced = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: prefersReduced,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function ToastTrigger({ message, variant }) {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => showToast({ message, variant })}
      data-testid="trigger"
    >
      Show Toast
    </button>
  );
}

function renderWithProvider(message = "Test message", variant = "info") {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} variant={variant} />
    </ToastProvider>,
  );
}

describe("Toast — variant rendering (Requirements: 11.1)", () => {
  beforeEach(() => {
    setupMatchMedia(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders success toast with role="alert" and correct message', () => {
    renderWithProvider("Saved successfully!", "success");
    fireEvent.click(screen.getByTestId("trigger"));

    const alert = screen.getByRole("alert");
    expect(alert).toBeTruthy();
    expect(screen.getByText("Saved successfully!")).toBeTruthy();
  });

  it('renders error toast with role="alert"', () => {
    renderWithProvider("Something went wrong", "error");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it('renders warning toast with role="alert"', () => {
    renderWithProvider("Low balance warning", "warning");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Low balance warning")).toBeTruthy();
  });

  it('renders info toast with role="alert"', () => {
    renderWithProvider("Here is some info", "info");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Here is some info")).toBeTruthy();
  });

  it("each variant applies a distinct background color", () => {
    const variants = [
      { variant: "success", expectedBg: "rgb(236, 253, 245)" }, // #ecfdf5
      { variant: "error", expectedBg: "rgb(255, 241, 242)" }, // #fff1f2
      { variant: "warning", expectedBg: "rgb(255, 251, 235)" }, // #fffbeb
      { variant: "info", expectedBg: "rgb(239, 246, 255)" }, // #eff6ff
    ];

    for (const { variant, expectedBg } of variants) {
      const { unmount } = renderWithProvider(`${variant} message`, variant);
      fireEvent.click(screen.getByTestId("trigger"));

      const alert = screen.getByRole("alert");
      expect(alert.style.backgroundColor).toBe(expectedBg);

      unmount();
    }
  });
});

describe("Toast — auto-close after 4000ms (Requirements: 11.4)", () => {
  beforeEach(() => {
    setupMatchMedia(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("toast is visible immediately after showToast", () => {
    renderWithProvider("Auto-close test", "info");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("toast is removed after 4000ms + 220ms slide-out delay", async () => {
    renderWithProvider("Auto-close test", "info");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4220);
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("toast is still visible just before 4000ms", () => {
    renderWithProvider("Auto-close test", "info");
    fireEvent.click(screen.getByTestId("trigger"));

    act(() => {
      vi.advanceTimersByTime(3999);
    });

    expect(screen.getByRole("alert")).toBeTruthy();
  });
});

describe("Toast — manual close button (Requirements: 11.5)", () => {
  beforeEach(() => {
    setupMatchMedia(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('close button has aria-label="Close notification"', () => {
    renderWithProvider("Close me", "success");
    fireEvent.click(screen.getByTestId("trigger"));

    const closeBtn = screen.getByRole("button", {
      name: /close notification/i,
    });
    expect(closeBtn).toBeTruthy();
  });

  it("clicking close button removes the toast after slide-out delay", () => {
    renderWithProvider("Close me", "success");
    fireEvent.click(screen.getByTestId("trigger"));

    expect(screen.getByRole("alert")).toBeTruthy();

    const closeBtn = screen.getByRole("button", {
      name: /close notification/i,
    });
    fireEvent.click(closeBtn);

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("clicking close button cancels the auto-close timer", () => {
    renderWithProvider("Close me", "success");
    fireEvent.click(screen.getByTestId("trigger"));

    const closeBtn = screen.getByRole("button", {
      name: /close notification/i,
    });
    fireEvent.click(closeBtn);

    act(() => {
      vi.advanceTimersByTime(220);
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
