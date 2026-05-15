import { describe, it, expect } from "vitest";

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function relativeLuminance({ r, g, b }) {
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const COLOR_PAIRS = [
  {
    label: "Primary text (#134e4a) on white (#ffffff)",
    text: "#134e4a",
    bg: "#ffffff",
  },
  {
    label: "Secondary text (#3d6b67) on white (#ffffff)",
    text: "#3d6b67",
    bg: "#ffffff",
  },
  {
    label: "Primary text (#134e4a) on bg-base (#f0fdfa)",
    text: "#134e4a",
    bg: "#f0fdfa",
  },
  {
    label: "Secondary text (#3d6b67) on bg-base (#f0fdfa)",
    text: "#3d6b67",
    bg: "#f0fdfa",
  },
  { label: "White text on teal-700 (#0f766e)", text: "#ffffff", bg: "#0f766e" },
  {
    label: "White text on orange-700 (#c2410c)",
    text: "#ffffff",
    bg: "#c2410c",
  },
  {
    label: "White text on emerald-700 (#047857)",
    text: "#ffffff",
    bg: "#047857",
  },
  { label: "White text on rose-600 (#e11d48)", text: "#ffffff", bg: "#e11d48" },
  { label: "White text on teal-900 (#134e4a)", text: "#ffffff", bg: "#134e4a" },

  {
    label: "Emerald-700 (#047857) on emerald-100 (#d1fae5)",
    text: "#047857",
    bg: "#d1fae5",
  },
  {
    label: "Rose-700 (#be123c) on rose-100 (#ffe4e6)",
    text: "#be123c",
    bg: "#ffe4e6",
  },
  {
    label: "Amber-700 (#b45309) on amber-100 (#fef3c7)",
    text: "#b45309",
    bg: "#fef3c7",
  },
  {
    label: "Sky-700 (#0369a1) on sky-100 (#e0f2fe)",
    text: "#0369a1",
    bg: "#e0f2fe",
  },
  {
    label: "Orange-700 (#c2410c) on orange-100 (#ffedd5)",
    text: "#c2410c",
    bg: "#ffedd5",
  },

  {
    label: "Teal-700 (#0f766e) on teal-50 (#f0fdfa)",
    text: "#0f766e",
    bg: "#f0fdfa",
  },
];

const WCAG_AA_THRESHOLD = 4.5;

describe("Color Contrast Accessibility — Property 6 (Validates: Requirements 12.5)", () => {
  it("should define at least one color pair to test", () => {
    expect(COLOR_PAIRS.length).toBeGreaterThan(0);
  });

  for (const pair of COLOR_PAIRS) {
    it(`contrast ratio >= 4.5:1 — ${pair.label}`, () => {
      const ratio = contrastRatio(pair.text, pair.bg);
      expect(
        ratio,
        `Expected contrast ratio >= ${WCAG_AA_THRESHOLD} but got ${ratio.toFixed(2)} for: ${pair.label}`,
      ).toBeGreaterThanOrEqual(WCAG_AA_THRESHOLD);
    });
  }

  it("contrastRatio utility returns 21 for black on white", () => {
    const ratio = contrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("contrastRatio utility returns 1 for identical colors", () => {
    const ratio = contrastRatio("#6366f1", "#6366f1");
    expect(ratio).toBeCloseTo(1, 5);
  });
});
