/**
 * Animation Configuration Parser and Serializer
 * Requirement 10: Parser dan Serializer Konfigurasi Animasi
 *
 * Provides validation, parsing, and serialization of animation configurations
 * with round-trip property support.
 */

// Valid easing functions
const VALID_EASINGS = ["linear", "ease-in", "ease-out", "ease-in-out", "ease"];

// Valid animation types
const VALID_ANIMATION_TYPES = [
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

/**
 * Validates a single animation configuration object
 * @param {Object} config - Animation configuration to validate
 * @param {string} path - Current path in the config (for error messages)
 * @returns {string[]} - Array of error messages (empty if valid)
 */
function validateAnimationConfig(config, path = "config") {
  const errors = [];

  if (!config || typeof config !== "object") {
    return [`${path} must be an object`];
  }

  // Check required fields
  if (!("type" in config)) {
    errors.push(`${path}.type is required`);
  } else if (typeof config.type !== "string") {
    errors.push(`${path}.type must be a string`);
  } else if (!VALID_ANIMATION_TYPES.includes(config.type)) {
    errors.push(
      `${path}.type must be one of: ${VALID_ANIMATION_TYPES.join(", ")}`
    );
  }

  if (!("duration" in config)) {
    errors.push(`${path}.duration is required`);
  } else if (typeof config.duration !== "number") {
    errors.push(`${path}.duration must be a number`);
  } else if (config.duration <= 0) {
    errors.push(`${path}.duration must be greater than 0`);
  } else if (config.duration > 10000) {
    errors.push(`${path}.duration must be less than or equal to 10000ms`);
  }

  if (!("delay" in config)) {
    errors.push(`${path}.delay is required`);
  } else if (typeof config.delay !== "number") {
    errors.push(`${path}.delay must be a number`);
  } else if (config.delay < 0) {
    errors.push(`${path}.delay must be greater than or equal to 0`);
  }

  if (!("easing" in config)) {
    errors.push(`${path}.easing is required`);
  } else if (typeof config.easing !== "string") {
    errors.push(`${path}.easing must be a string`);
  } else if (!VALID_EASINGS.includes(config.easing)) {
    errors.push(`${path}.easing must be one of: ${VALID_EASINGS.join(", ")}`);
  }

  // Optional fields validation
  if ("trigger" in config && config.trigger !== undefined) {
    if (typeof config.trigger !== "string") {
      errors.push(`${path}.trigger must be a string if provided`);
    }
  }

  if ("threshold" in config && config.threshold !== undefined) {
    if (
      typeof config.threshold !== "number" ||
      Number.isNaN(config.threshold)
    ) {
      errors.push(`${path}.threshold must be a number if provided`);
    } else if (config.threshold < 0 || config.threshold > 1) {
      errors.push(`${path}.threshold must be between 0 and 1`);
    }
  }

  if ("repeat" in config && config.repeat !== undefined) {
    if (typeof config.repeat !== "boolean") {
      errors.push(`${path}.repeat must be a boolean if provided`);
    }
  }

  if ("targetValue" in config && config.targetValue !== undefined) {
    if (typeof config.targetValue !== "number") {
      errors.push(`${path}.targetValue must be a number if provided`);
    }
  }

  return errors;
}

/**
 * Parses a JSON string into a validated animation configuration object
 * Requirement 10.1 & 10.2
 *
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} - Parsed and validated configuration
 * @throws {Error} - If JSON is invalid or configuration fails validation
 */
export function parseAnimationConfig(jsonString) {
  if (typeof jsonString !== "string") {
    throw new Error("Input must be a string");
  }

  let config;
  try {
    config = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  // Check if parsed result is an object
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(
      "Invalid animation configuration: config must be an object"
    );
  }

  const errors = validateAnimationConfig(config);
  if (errors.length > 0) {
    throw new Error(`Invalid animation configuration:\n${errors.join("\n")}`);
  }

  // Return normalized config with defaults for optional fields
  return {
    type: config.type,
    duration: config.duration,
    delay: config.delay,
    easing: config.easing,
    trigger: config.trigger || "viewport",
    threshold: config.threshold ?? 0.2,
    repeat: config.repeat ?? false,
    ...(config.targetValue !== undefined && {
      targetValue: config.targetValue,
    }),
  };
}

/**
 * Serializes an animation configuration object to JSON string
 * Requirement 10.3
 *
 * @param {Object} config - Animation configuration object
 * @returns {string} - JSON string representation
 * @throws {Error} - If configuration is invalid
 */
export function printAnimationConfig(config) {
  const errors = validateAnimationConfig(config);
  if (errors.length > 0) {
    throw new Error(
      `Cannot serialize invalid configuration:\n${errors.join("\n")}`
    );
  }

  const normalizedConfig = {
    type: config.type,
    duration: config.duration,
    delay: config.delay,
    easing: config.easing,
    trigger: config.trigger || "viewport",
    threshold: config.threshold ?? 0.2,
    repeat: config.repeat ?? false,
    ...(config.targetValue !== undefined && {
      targetValue: config.targetValue,
    }),
  };

  return JSON.stringify(normalizedConfig, null, 2);
}

/**
 * Validates an animation configuration without throwing
 *
 * @param {Object} config - Animation configuration to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateAnimationConfigSafe(config) {
  const errors = validateAnimationConfig(config);
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a default animation configuration
 *
 * @param {Object} overrides - Fields to override in the default config
 * @returns {Object} - Default animation configuration
 */
export function createDefaultAnimationConfig(overrides = {}) {
  const defaults = {
    type: "fade-in",
    duration: 300,
    delay: 0,
    easing: "ease-out",
    trigger: "viewport",
    threshold: 0.2,
    repeat: false,
  };

  return { ...defaults, ...overrides };
}
