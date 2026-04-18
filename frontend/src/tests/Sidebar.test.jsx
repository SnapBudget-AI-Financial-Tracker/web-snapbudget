/**
 * Property test: Sidebar collapse state idempotency
 *
 * Property 3: Toggle collapsed dua kali harus mengembalikan ke state semula (idempoten)
 * Validates: Requirements 5.3, 5.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock AuthContext — path relative to test file location
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: vi.fn(),
  }),
}));

// Mock window.matchMedia (required by useReducedMotion)
function setupMatchMedia(prefersReduced = false) {
  Object.defineProperty(window, 'matchMedia', {
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

// ---------------------------------------------------------------------------
// Import component after mocks are set up
// ---------------------------------------------------------------------------
import Sidebar from '../components/dashboard/Sidebar.jsx';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function renderSidebar() {
  return render(<Sidebar isOpen={true} onClose={vi.fn()} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Sidebar — Property 3: Toggle idempotency (Validates: Requirements 5.3, 5.4)', () => {
  beforeEach(() => {
    setupMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initial state: sidebar is expanded (width 256px)', () => {
    renderSidebar();

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar.style.width).toBe('256px');
  });

  it('after one toggle: sidebar is collapsed (width 64px)', () => {
    renderSidebar();

    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(collapseBtn);

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar.style.width).toBe('64px');
  });

  it('after two toggles: sidebar returns to expanded state (width 256px) — idempotency property', () => {
    renderSidebar();

    // First toggle: expanded → collapsed
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(collapseBtn);

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar.style.width).toBe('64px');

    // Second toggle: collapsed → expanded
    const expandBtn = screen.getByRole('button', { name: /expand sidebar/i });
    fireEvent.click(expandBtn);

    expect(sidebar.style.width).toBe('256px');
  });

  it('multiple double-toggles always return to original state', () => {
    renderSidebar();

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });

    // Run the double-toggle cycle 3 times to verify idempotency holds consistently
    for (let i = 0; i < 3; i++) {
      const initialWidth = sidebar.style.width;
      expect(initialWidth).toBe('256px');

      // Toggle once: collapse
      fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
      expect(sidebar.style.width).toBe('64px');

      // Toggle again: expand back
      fireEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
      expect(sidebar.style.width).toBe('256px');
    }
  });
});
