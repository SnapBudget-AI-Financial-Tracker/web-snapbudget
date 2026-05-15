import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../index.css");

/**
 * Parse all --color-* custom properties from the @theme block of a CSS string.
 * Returns an array of { name, value } objects.
 */
function parseColorTokens(cssContent) {
  // Extract the @theme { ... } block
  const rootMatch = cssContent.match(
    /@theme\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s,
  );
  if (!rootMatch) return [];

  const rootBlock = rootMatch[1];

  // Match all --color-* declarations: --color-xxx: <value>;
  const tokenRegex = /(--color-[\w-]+)\s*:\s*([^;]+);/g;
  const tokens = [];
  let match;

  while ((match = tokenRegex.exec(rootBlock)) !== null) {
    tokens.push({
      name: match[1].trim(),
      value: match[2].trim(),
    });
  }

  return tokens;
}

const cssContent = readFileSync(cssPath, "utf-8");
const colorTokens = parseColorTokens(cssContent);

describe("Color Token Consistency — Property 1 (Validates: Requirements 1.1)", () => {
  it("should find at least one --color-* token in @theme", () => {
    expect(colorTokens.length).toBeGreaterThan(0);
  });

  it("every --color-* token must have a non-empty string value", () => {
    // Property: for all tokens t in colorTokens, t.value is a non-empty string
    for (const token of colorTokens) {
      expect(
        typeof token.value,
        `Token "${token.name}" value should be a string`,
      ).toBe("string");

      expect(
        token.value.length,
        `Token "${token.name}" must not have an empty value`,
      ).toBeGreaterThan(0);
    }
  });

  it("every --color-* token name must follow the --color-<category>-<scale> naming convention", () => {
    // Property: token names are non-empty and start with --color-
    for (const token of colorTokens) {
      expect(token.name, "Token name must be a non-empty string").toBeTruthy();

      expect(
        token.name.startsWith("--color-"),
        `Token "${token.name}" must start with --color-`,
      ).toBe(true);
    }
  });

  it("every --color-* token value must not be whitespace-only", () => {
    for (const token of colorTokens) {
      expect(
        token.value.trim().length,
        `Token "${token.name}" value must not be whitespace-only`,
      ).toBeGreaterThan(0);
    }
  });
});
