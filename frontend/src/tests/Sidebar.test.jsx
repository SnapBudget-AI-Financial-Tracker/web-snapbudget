import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/dashboard" }),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User", email: "test@example.com" },
    logout: vi.fn(),
  }),
}));

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

import Sidebar from "../components/dashboard/Sidebar.jsx";
function renderSidebar() {
  return render(<Sidebar isOpen={true} onClose={vi.fn()} />);
}

describe("Sidebar — Property 3: Toggle idempotency (Validates: Requirements 5.3, 5.4)", () => {
  beforeEach(() => {
    setupMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initial state: sidebar is expanded (width 256px)", () => {
    renderSidebar();

    const sidebar = screen.getByRole("complementary", {
      name: /navigasi utama/i,
    });
    expect(sidebar.style.width).toBe("256px");
  });

  it("after one toggle: sidebar is collapsed (width 64px)", () => {
    renderSidebar();

    const collapseBtn = screen.getByRole("button", {
      name: /ciutkan sidebar/i,
    });
    fireEvent.click(collapseBtn);

    const sidebar = screen.getByRole("complementary", {
      name: /navigasi utama/i,
    });
    expect(sidebar.style.width).toBe("64px");
  });

  it("after two toggles: sidebar returns to expanded state (width 256px) — idempotency property", () => {
    renderSidebar();

    const collapseBtn = screen.getByRole("button", {
      name: /ciutkan sidebar/i,
    });
    fireEvent.click(collapseBtn);

    const sidebar = screen.getByRole("complementary", {
      name: /navigasi utama/i,
    });
    expect(sidebar.style.width).toBe("64px");

    const expandBtn = screen.getByRole("button", { name: /perluas sidebar/i });
    fireEvent.click(expandBtn);

    expect(sidebar.style.width).toBe("256px");
  });

  it("multiple double-toggles always return to original state", () => {
    renderSidebar();

    const sidebar = screen.getByRole("complementary", {
      name: /navigasi utama/i,
    });

    for (let i = 0; i < 3; i++) {
      const initialWidth = sidebar.style.width;
      expect(initialWidth).toBe("256px");

      fireEvent.click(screen.getByRole("button", { name: /ciutkan sidebar/i }));
      expect(sidebar.style.width).toBe("64px");

      fireEvent.click(screen.getByRole("button", { name: /perluas sidebar/i }));
      expect(sidebar.style.width).toBe("256px");
    }
  });
});
