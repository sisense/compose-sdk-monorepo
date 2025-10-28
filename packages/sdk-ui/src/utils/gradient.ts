/**
 * A position value for gradient stops, ranging from 0 (start) to 1 (end).
 */
export type GradientPosition = number;

/**
 * A color value that can be a CSS color string, hex value, or rgba/hsla string.
 */
export type ColorValue = string;

/**
 * A gradient stop defining a color at a specific position in the gradient.
 *
 * @example
 * ```ts
 * const stop: GradientStop = {
 *   position: 0.5,
 *   color: '#ffffff'
 * };
 * ```
 */
export interface GradientStop {
  /**
   * Position in the gradient where 0 is the start and 1 is the end.
   * Must be between 0 and 1 inclusive.
   */
  position: GradientPosition;

  /**
   * Color at this position. Can be any valid CSS color value.
   */
  color: ColorValue;
}

/**
 * Linear gradient direction configuration.
 *
 * @example
 * ```ts
 * const direction: LinearGradientDirection = {
 *   x1: 0, y1: 0,  // Start point (top-left)
 *   x2: 0, y2: 1   // End point (bottom-left)
 * };
 * ```
 */
export interface LinearGradientDirection {
  /**
   * X coordinate of the start point (0-1)
   */
  x1: number;

  /**
   * Y coordinate of the start point (0-1)
   */
  y1: number;

  /**
   * X coordinate of the end point (0-1)
   */
  x2: number;

  /**
   * Y coordinate of the end point (0-1)
   */
  y2: number;
}

/**
 * Radial gradient configuration.
 *
 * @example
 * ```ts
 * const radial: RadialGradientConfig = {
 *   centerX: 0.5,
 *   centerY: 0.5,
 *   radius: 0.8
 * };
 * ```
 */
export interface RadialGradientConfig {
  /**
   * X coordinate of the center point (0-1)
   */
  centerX: number;

  /**
   * Y coordinate of the center point (0-1)
   */
  centerY: number;

  /**
   * Radius of the gradient (0-1)
   */
  radius: number;
}

/**
 * Linear gradient color configuration.
 *
 * @example
 * ```ts
 * const linearGradient: LinearGradientColor = {
 *   type: 'linear',
 *   direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
 *   stops: [
 *     { position: 0, color: '#003399' },
 *     { position: 0.5, color: '#ffffff' },
 *     { position: 1, color: '#3366AA' }
 *   ]
 * };
 * ```
 */
export interface LinearGradientColor {
  /**
   * Type discriminator for linear gradients
   */
  type: 'linear';

  /**
   * Direction of the linear gradient
   */
  direction: LinearGradientDirection;

  /**
   * Color stops along the gradient
   */
  stops: readonly GradientStop[];
}

/**
 * Radial gradient color configuration.
 *
 * @example
 * ```ts
 * const radialGradient: RadialGradientColor = {
 *   type: 'radial',
 *   center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
 *   stops: [
 *     { position: 0, color: '#ff0000' },
 *     { position: 1, color: '#0000ff' }
 *   ]
 * };
 * ```
 */
export interface RadialGradientColor {
  /**
   * Type discriminator for radial gradients
   */
  type: 'radial';

  /**
   * Center and radius configuration
   */
  center: RadialGradientConfig;

  /**
   * Color stops along the gradient
   */
  stops: readonly GradientStop[];
}

/**
 * Enhanced gradient color options that provide better type safety and developer experience.
 *
 * This is a discriminated union that allows for either linear or radial gradients,
 * with comprehensive type checking and better IntelliSense support.
 *
 * @example
 * ```ts
 * // Linear gradient example
 * const linearGradient: GradientColor = {
 *   type: 'linear',
 *   direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
 *   stops: [
 *     { position: 0, color: '#003399' },
 *     { position: 0.5, color: '#ffffff' },
 *     { position: 1, color: '#3366AA' }
 *   ]
 * };
 *
 * // Radial gradient example
 * const radialGradient: GradientColor = {
 *   type: 'radial',
 *   center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
 *   stops: [
 *     { position: 0, color: '#ff0000' },
 *     { position: 1, color: '#0000ff' }
 *   ]
 * };
 * ```
 */
export type GradientColor = LinearGradientColor | RadialGradientColor;

/**
 * Utility type to check if a value is a linear gradient.
 *
 * @param value - The value to check
 * @returns True if the value is a linear gradient
 */
export const isLinearGradient = (value: any): value is LinearGradientColor => {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'linear';
};

/**
 * Utility type to check if a value is a radial gradient.
 *
 * @param value - The value to check
 * @returns True if the value is a radial gradient
 */
export const isRadialGradient = (value: any): value is RadialGradientColor => {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'radial';
};

/**
 * Utility type to check if a value is any gradient.
 *
 * @param value - The value to check
 * @returns True if the value is a gradient
 */
export const isGradient = (value: any): value is GradientColor => {
  return isLinearGradient(value) || isRadialGradient(value);
};

/**
 * Common gradient direction presets for convenience.
 */
export const GradientDirections = {
  /**
   * Top to bottom gradient
   */
  topToBottom: { x1: 0, y1: 0, x2: 0, y2: 1 } as const,

  /**
   * Bottom to top gradient
   */
  bottomToTop: { x1: 0, y1: 1, x2: 0, y2: 0 } as const,

  /**
   * Left to right gradient
   */
  leftToRight: { x1: 0, y1: 0, x2: 1, y2: 0 } as const,

  /**
   * Right to left gradient
   */
  rightToLeft: { x1: 1, y1: 0, x2: 0, y2: 0 } as const,

  /**
   * Diagonal top-left to bottom-right
   */
  diagonalTopLeft: { x1: 0, y1: 0, x2: 1, y2: 1 } as const,

  /**
   * Diagonal top-right to bottom-left
   */
  diagonalTopRight: { x1: 1, y1: 0, x2: 0, y2: 1 } as const,
} as const;

/**
 * Common radial gradient presets for convenience.
 */
export const RadialGradientPresets = {
  /**
   * Center-focused radial gradient
   */
  center: { centerX: 0.5, centerY: 0.5, radius: 0.8 } as const,

  /**
   * Top-left focused radial gradient
   */
  topLeft: { centerX: 0, centerY: 0, radius: 1 } as const,

  /**
   * Top-right focused radial gradient
   */
  topRight: { centerX: 1, centerY: 0, radius: 1 } as const,

  /**
   * Bottom-left focused radial gradient
   */
  bottomLeft: { centerX: 0, centerY: 1, radius: 1 } as const,

  /**
   * Bottom-right focused radial gradient
   */
  bottomRight: { centerX: 1, centerY: 1, radius: 1 } as const,
} as const;

/**
 * Helper function to create a linear gradient with common direction presets.
 *
 * @param direction - The gradient direction
 * @param stops - The color stops
 * @returns A linear gradient configuration
 *
 * @example
 * ```ts
 * const gradient = createLinearGradient(
 *   GradientDirections.topToBottom,
 *   [
 *     { position: 0, color: '#003399' },
 *     { position: 1, color: '#3366AA' }
 *   ]
 * );
 * ```
 */
export const createLinearGradient = (
  direction: LinearGradientDirection,
  stops: readonly GradientStop[],
): LinearGradientColor => ({
  type: 'linear',
  direction,
  stops,
});

/**
 * Helper function to create a radial gradient with common presets.
 *
 * @param center - The gradient center configuration
 * @param stops - The color stops
 * @returns A radial gradient configuration
 *
 * @example
 * ```ts
 * const gradient = createRadialGradient(
 *   RadialGradientPresets.center,
 *   [
 *     { position: 0, color: '#ff0000' },
 *     { position: 1, color: '#0000ff' }
 *   ]
 * );
 * ```
 */
export const createRadialGradient = (
  center: RadialGradientConfig,
  stops: readonly GradientStop[],
): RadialGradientColor => ({
  type: 'radial',
  center,
  stops,
});

/**
 * Inner compatibility interface that matches the original Highcharts GradientColorObject structure.
 *
 * This interface is provided for backward compatibility with existing Highcharts integrations.
 * For new code, prefer using the enhanced {@link GradientColor} types.
 *
 * @internal
 */
export interface HighchartsGradientColorObject {
  /**
   * Linear gradient configuration (inner format)
   */
  linearGradient?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };

  /**
   * Radial gradient configuration (inner format)
   */
  radialGradient?: {
    cx: number;
    cy: number;
    r: number;
  };

  /**
   * Color stops in inner format [position, color]
   */
  stops: [number, string][];
}

/**
 * Converts a modern GradientColor to the inner Highcharts format.
 *
 * @param gradient - The modern gradient color
 * @returns The inner format gradient color object
 *
 * @internal
 */
export const toGradientHighchartsFormat = (
  gradient: GradientColor,
): HighchartsGradientColorObject => {
  if (gradient.type === 'linear') {
    return {
      linearGradient: {
        x1: gradient.direction.x1,
        y1: gradient.direction.y1,
        x2: gradient.direction.x2,
        y2: gradient.direction.y2,
      },
      stops: gradient.stops.map((stop) => [stop.position, stop.color]),
    };
  } else {
    return {
      radialGradient: {
        cx: gradient.center.centerX,
        cy: gradient.center.centerY,
        r: gradient.center.radius,
      },
      stops: gradient.stops.map((stop) => [stop.position, stop.color]),
    };
  }
};

/**
 * Converts a inner Highcharts gradient to the modern format.
 *
 * @param highchartGradient - The inner gradient color object
 * @returns The modern gradient color format
 *
 * @internal
 */
export const fromHighchartsGradientFormat = (
  highchartGradient: HighchartsGradientColorObject,
): GradientColor => {
  if (highchartGradient.linearGradient) {
    return {
      type: 'linear',
      direction: {
        x1: highchartGradient.linearGradient.x1,
        y1: highchartGradient.linearGradient.y1,
        x2: highchartGradient.linearGradient.x2,
        y2: highchartGradient.linearGradient.y2,
      },
      stops: highchartGradient.stops.map(([position, color]) => ({ position, color })),
    };
  } else if (highchartGradient.radialGradient) {
    return {
      type: 'radial',
      center: {
        centerX: highchartGradient.radialGradient.cx,
        centerY: highchartGradient.radialGradient.cy,
        radius: highchartGradient.radialGradient.r,
      },
      stops: highchartGradient.stops.map(([position, color]) => ({ position, color })),
    };
  } else {
    throw new Error(
      'Invalid inner gradient format: must have either linearGradient or radialGradient',
    );
  }
};

/**
 * Converts a color to the inner Highcharts format if it is a gradient, otherwise returns the color as is.
 *
 * @param color - The color to convert
 * @returns The inner format gradient color object or the color as is
 *
 * @internal
 */
export const withGradientConversion = <T>(
  color: T,
): Exclude<T, GradientColor> | HighchartsGradientColorObject =>
  isGradient(color) ? toGradientHighchartsFormat(color) : (color as Exclude<T, GradientColor>);
