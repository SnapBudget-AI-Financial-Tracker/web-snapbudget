import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  parseAnimationConfig,
  printAnimationConfig,
  validateAnimationConfigSafe,
  createDefaultAnimationConfig,
} from "../utils/animationConfig";

/**
 * Tests for Animation Config Parser and Serializer
 * Requirement 10: Parser dan Serializer Konfigurasi Animasi
 */

describe("Animation Config Parser", () => {
  // Valid animation types
  const validTypes = [
    "fade-in",
    "slide-up",
    "slide-down",
    "slide-left",
    "slide-right",
    "scale-in",
    "rotate-in",
    "bounce",
    "parallax",
    "tilt",
    "count-up",
  ];

  // Valid easing functions
  const validEasings = ["linear", "ease-in", "ease-out", "ease-in-out", "ease"];

  describe("P1 — Round-Trip Property (Requirement 10.4)", () => {
    it("should parse -> print -> parse produce equivalent object", () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom(...validTypes),
            duration: fc.float({ min: 1, max: 10000, noNaN: true }),
            delay: fc.float({ min: 0, max: 5000, noNaN: true }),
            easing: fc.constantFrom(...validEasings),
            trigger: fc.constantFrom("viewport", "click", "hover"),
            threshold: fc.float({ min: 0, max: 1, noNaN: true }),
            repeat: fc.boolean(),
          }),
          (config) => {
            const printed = printAnimationConfig(config);
            const parsed1 = parseAnimationConfig(printed);
            const printed2 = printAnimationConfig(parsed1);
            const parsed2 = parseAnimationConfig(printed2);

            // Check equivalence
            expect(parsed1.type).toBe(parsed2.type);
            expect(parsed1.duration).toBeCloseTo(parsed2.duration, 5);
            expect(parsed1.delay).toBeCloseTo(parsed2.delay, 5);
            expect(parsed1.easing).toBe(parsed2.easing);
            expect(parsed1.trigger).toBe(parsed2.trigger);
            expect(parsed1.threshold).toBeCloseTo(parsed2.threshold, 5);
            expect(parsed1.repeat).toBe(parsed2.repeat);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Requirement 10.1 — Valid Configuration Parsing", () => {
    it("should parse valid JSON configuration", () => {
      const validJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
      });

      const config = parseAnimationConfig(validJson);

      expect(config).toMatchObject({
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
        trigger: "viewport",
        threshold: 0.2,
        repeat: false,
      });
    });

    it("should parse configuration with all optional fields", () => {
      const validJson = JSON.stringify({
        type: "count-up",
        duration: 2000,
        delay: 100,
        easing: "ease-in",
        trigger: "click",
        threshold: 0.5,
        repeat: true,
        targetValue: 1000,
      });

      const config = parseAnimationConfig(validJson);

      expect(config).toMatchObject({
        type: "count-up",
        duration: 2000,
        delay: 100,
        easing: "ease-in",
        trigger: "click",
        threshold: 0.5,
        repeat: true,
        targetValue: 1000,
      });
    });
  });

  describe("Requirement 10.2 — Invalid Configuration Error Handling", () => {
    it("should throw error for invalid JSON", () => {
      expect(() => parseAnimationConfig("not json")).toThrow(/Invalid JSON/);
    });

    it("should throw error for missing required field: type", () => {
      const invalidJson = JSON.stringify({
        duration: 300,
        delay: 0,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /type is required/
      );
    });

    it("should throw error for missing required field: duration", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        delay: 0,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /duration is required/
      );
    });

    it("should throw error for missing required field: delay", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /delay is required/
      );
    });

    it("should throw error for missing required field: easing", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        delay: 0,
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /easing is required/
      );
    });

    it("should throw error for invalid type value", () => {
      const invalidJson = JSON.stringify({
        type: "invalid-type",
        duration: 300,
        delay: 0,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /type must be one of/
      );
    });

    it("should throw error for invalid easing value", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "invalid-easing",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /easing must be one of/
      );
    });

    it("should throw error for negative duration", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: -100,
        delay: 0,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /duration must be greater than 0/
      );
    });

    it("should throw error for negative delay", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        delay: -50,
        easing: "ease-out",
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /delay must be greater than or equal to 0/
      );
    });

    it("should throw error for threshold out of range", () => {
      const invalidJson = JSON.stringify({
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
        threshold: 1.5,
      });

      expect(() => parseAnimationConfig(invalidJson)).toThrow(
        /threshold must be between 0 and 1/
      );
    });

    it("should throw error for non-object input", () => {
      expect(() => parseAnimationConfig('"string"')).toThrow(
        /config must be an object/
      );
      expect(() => parseAnimationConfig("123")).toThrow(
        /config must be an object/
      );
      expect(() => parseAnimationConfig("null")).toThrow(
        /config must be an object/
      );
      expect(() => parseAnimationConfig("[1,2,3]")).toThrow(
        /config must be an object/
      );
    });
  });

  describe("Requirement 10.3 — Serializer", () => {
    it("should serialize valid config to JSON", () => {
      const config = {
        type: "slide-up",
        duration: 500,
        delay: 100,
        easing: "ease-in-out",
      };

      const json = printAnimationConfig(config);
      const parsed = JSON.parse(json);

      expect(parsed).toMatchObject({
        type: "slide-up",
        duration: 500,
        delay: 100,
        easing: "ease-in-out",
      });
    });

    it("should throw error for invalid config", () => {
      const invalidConfig = {
        type: "invalid",
        duration: 300,
      };

      expect(() => printAnimationConfig(invalidConfig)).toThrow(
        /Cannot serialize invalid configuration/
      );
    });

    it("should format JSON with indentation", () => {
      const config = {
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
      };

      const json = printAnimationConfig(config);
      expect(json).toContain("\n");
      expect(json).toContain("  ");
    });
  });

  describe("validateAnimationConfigSafe", () => {
    it("should return valid: true for valid config", () => {
      const config = {
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
      };

      const result = validateAnimationConfigSafe(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid: false with errors for invalid config", () => {
      const config = {
        type: "invalid",
        duration: -100,
      };

      const result = validateAnimationConfigSafe(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("createDefaultAnimationConfig", () => {
    it("should create default config with no overrides", () => {
      const config = createDefaultAnimationConfig();

      expect(config).toMatchObject({
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
        trigger: "viewport",
        threshold: 0.2,
        repeat: false,
      });
    });

    it("should apply overrides to default config", () => {
      const overrides = {
        type: "slide-up",
        duration: 500,
      };

      const config = createDefaultAnimationConfig(overrides);

      expect(config).toMatchObject({
        type: "slide-up",
        duration: 500,
        delay: 0,
        easing: "ease-out",
        trigger: "viewport",
        threshold: 0.2,
        repeat: false,
      });
    });
  });

  // Edge cases testing with fast-check
  describe("Edge Cases", () => {
    it("should handle extreme numeric values", () => {
      const config = {
        type: "fade-in",
        duration: 10000,
        delay: 0,
        easing: "ease-out",
      };

      const printed = printAnimationConfig(config);
      const parsed = parseAnimationConfig(printed);

      expect(parsed.duration).toBe(10000);
    });

    it("should handle very small duration", () => {
      const config = {
        type: "fade-in",
        duration: 1,
        delay: 0,
        easing: "ease-out",
      };

      const printed = printAnimationConfig(config);
      const parsed = parseAnimationConfig(printed);

      expect(parsed.duration).toBe(1);
    });

    it("should handle threshold at boundaries (0 and 1)", () => {
      const config0 = {
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
        threshold: 0,
      };

      const config1 = {
        type: "fade-in",
        duration: 300,
        delay: 0,
        easing: "ease-out",
        threshold: 1,
      };

      const printed0 = printAnimationConfig(config0);
      const printed1 = printAnimationConfig(config1);

      const parsed0 = parseAnimationConfig(printed0);
      const parsed1 = parseAnimationConfig(printed1);

      expect(parsed0.threshold).toBe(0);
      expect(parsed1.threshold).toBe(1);
    });
  });
});
