import { describe, expect, it } from 'vitest';

import {
  createLinearGradient,
  createRadialGradient,
  GradientDirections,
  type GradientStop,
  isGradient,
  isLinearGradient,
  isRadialGradient,
  type LinearGradientColor,
  type RadialGradientColor,
  RadialGradientPresets,
  toGradientHighchartsFormat,
} from './gradient';

describe('gradient utilities', () => {
  describe('toGradientHighchartsFormat', () => {
    it('should convert linear gradient to Highcharts format', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          { position: 0, color: '#003399' },
          { position: 0.5, color: '#ffffff' },
          { position: 1, color: '#3366AA' },
        ],
      };

      const result = toGradientHighchartsFormat(linearGradient);

      expect(result).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
        },
        stops: [
          [0, '#003399'],
          [0.5, '#ffffff'],
          [1, '#3366AA'],
        ],
      });
    });

    it('should convert radial gradient to Highcharts format', () => {
      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [
          { position: 0, color: '#ff0000' },
          { position: 1, color: '#0000ff' },
        ],
      };

      const result = toGradientHighchartsFormat(radialGradient);

      expect(result).toEqual({
        radialGradient: {
          cx: 0.5,
          cy: 0.5,
          r: 0.8,
        },
        stops: [
          [0, '#ff0000'],
          [1, '#0000ff'],
        ],
      });
    });

    it('should handle single stop gradients', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 1, y2: 0 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      const result = toGradientHighchartsFormat(linearGradient);

      expect(result).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 0,
        },
        stops: [[0, '#ff0000']],
      });
    });

    it('should handle multiple stops with various positions', () => {
      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0, centerY: 0, radius: 1 },
        stops: [
          { position: 0, color: 'red' },
          { position: 0.25, color: 'rgba(255, 0, 0, 0.8)' },
          { position: 0.75, color: 'hsla(240, 100%, 50%, 0.5)' },
          { position: 1, color: 'transparent' },
        ],
      };

      const result = toGradientHighchartsFormat(radialGradient);

      expect(result).toEqual({
        radialGradient: {
          cx: 0,
          cy: 0,
          r: 1,
        },
        stops: [
          [0, 'red'],
          [0.25, 'rgba(255, 0, 0, 0.8)'],
          [0.75, 'hsla(240, 100%, 50%, 0.5)'],
          [1, 'transparent'],
        ],
      });
    });
  });

  describe('createRadialGradient', () => {
    it('should create a radial gradient with custom center configuration', () => {
      const center = { centerX: 0.3, centerY: 0.7, radius: 0.5 };
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ];

      const result = createRadialGradient(center, stops);

      expect(result).toEqual({
        type: 'radial',
        center: { centerX: 0.3, centerY: 0.7, radius: 0.5 },
        stops: [
          { position: 0, color: '#ff0000' },
          { position: 1, color: '#0000ff' },
        ],
      });
    });

    it('should create a radial gradient with preset configuration', () => {
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#ffffff' },
        { position: 0.5, color: '#cccccc' },
        { position: 1, color: '#000000' },
      ];

      const result = createRadialGradient(RadialGradientPresets.center, stops);

      expect(result).toEqual({
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [
          { position: 0, color: '#ffffff' },
          { position: 0.5, color: '#cccccc' },
          { position: 1, color: '#000000' },
        ],
      });
    });

    it('should create a radial gradient with single stop', () => {
      const center = { centerX: 0, centerY: 0, radius: 1 };
      const stops: readonly GradientStop[] = [{ position: 0, color: '#ff0000' }];

      const result = createRadialGradient(center, stops);

      expect(result).toEqual({
        type: 'radial',
        center: { centerX: 0, centerY: 0, radius: 1 },
        stops: [{ position: 0, color: '#ff0000' }],
      });
    });

    it('should preserve readonly stops array', () => {
      const center = { centerX: 0.5, centerY: 0.5, radius: 0.8 };
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ];

      const result = createRadialGradient(center, stops);

      expect(result.stops).toBe(stops);
      expect(result.stops).toHaveLength(2);
    });
  });

  describe('createLinearGradient', () => {
    it('should create a linear gradient with custom direction', () => {
      const direction = { x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8 };
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#003399' },
        { position: 1, color: '#3366AA' },
      ];

      const result = createLinearGradient(direction, stops);

      expect(result).toEqual({
        type: 'linear',
        direction: { x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8 },
        stops: [
          { position: 0, color: '#003399' },
          { position: 1, color: '#3366AA' },
        ],
      });
    });

    it('should create a linear gradient with preset direction', () => {
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#ffffff' },
        { position: 1, color: '#000000' },
      ];

      const result = createLinearGradient(GradientDirections.topToBottom, stops);

      expect(result).toEqual({
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          { position: 0, color: '#ffffff' },
          { position: 1, color: '#000000' },
        ],
      });
    });

    it('should create a linear gradient with diagonal direction', () => {
      const stops: readonly GradientStop[] = [
        { position: 0, color: 'red' },
        { position: 0.5, color: 'green' },
        { position: 1, color: 'blue' },
      ];

      const result = createLinearGradient(GradientDirections.diagonalTopLeft, stops);

      expect(result).toEqual({
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 1, y2: 1 },
        stops: [
          { position: 0, color: 'red' },
          { position: 0.5, color: 'green' },
          { position: 1, color: 'blue' },
        ],
      });
    });

    it('should preserve readonly stops array', () => {
      const direction = { x1: 0, y1: 0, x2: 1, y2: 0 };
      const stops: readonly GradientStop[] = [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ];

      const result = createLinearGradient(direction, stops);

      expect(result.stops).toBe(stops);
      expect(result.stops).toHaveLength(2);
    });
  });

  describe('isGradient', () => {
    it('should return true for linear gradient', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isGradient(linearGradient)).toBe(true);
    });

    it('should return true for radial gradient', () => {
      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isGradient(radialGradient)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isGradient(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isGradient(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isGradient('#ff0000')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isGradient(123)).toBe(false);
    });

    it('should return false for boolean', () => {
      expect(isGradient(true)).toBe(false);
    });

    it('should return false for object without type property', () => {
      const obj = { color: '#ff0000' };
      expect(isGradient(obj)).toBe(false);
    });

    it('should return false for object with invalid type', () => {
      const obj = { type: 'invalid', color: '#ff0000' };
      expect(isGradient(obj)).toBe(false);
    });

    it('should return false for array', () => {
      expect(isGradient([])).toBe(false);
    });

    it('should return false for function', () => {
      expect(isGradient(() => {})).toBe(false);
    });
  });

  describe('isRadialGradient', () => {
    it('should return true for radial gradient', () => {
      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isRadialGradient(radialGradient)).toBe(true);
    });

    it('should return false for linear gradient', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isRadialGradient(linearGradient)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRadialGradient(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRadialGradient(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isRadialGradient('#ff0000')).toBe(false);
    });

    it('should return false for object without type property', () => {
      const obj = { center: { centerX: 0.5, centerY: 0.5, radius: 0.8 } };
      expect(isRadialGradient(obj)).toBe(false);
    });

    it('should return false for object with linear type', () => {
      const obj = { type: 'linear', direction: { x1: 0, y1: 0, x2: 0, y2: 1 } };
      expect(isRadialGradient(obj)).toBe(false);
    });

    it('should return false for object with invalid type', () => {
      const obj = { type: 'invalid', center: { centerX: 0.5, centerY: 0.5, radius: 0.8 } };
      expect(isRadialGradient(obj)).toBe(false);
    });

    it('should return false for array', () => {
      expect(isRadialGradient([])).toBe(false);
    });

    it('should return false for function', () => {
      expect(isRadialGradient(() => {})).toBe(false);
    });
  });

  describe('isLinearGradient', () => {
    it('should return true for linear gradient', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isLinearGradient(linearGradient)).toBe(true);
    });

    it('should return false for radial gradient', () => {
      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      expect(isLinearGradient(radialGradient)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLinearGradient(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isLinearGradient(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isLinearGradient('#ff0000')).toBe(false);
    });

    it('should return false for object without type property', () => {
      const obj = { direction: { x1: 0, y1: 0, x2: 0, y2: 1 } };
      expect(isLinearGradient(obj)).toBe(false);
    });

    it('should return false for object with radial type', () => {
      const obj = { type: 'radial', center: { centerX: 0.5, centerY: 0.5, radius: 0.8 } };
      expect(isLinearGradient(obj)).toBe(false);
    });

    it('should return false for object with invalid type', () => {
      const obj = { type: 'invalid', direction: { x1: 0, y1: 0, x2: 0, y2: 1 } };
      expect(isLinearGradient(obj)).toBe(false);
    });

    it('should return false for array', () => {
      expect(isLinearGradient([])).toBe(false);
    });

    it('should return false for function', () => {
      expect(isLinearGradient(() => {})).toBe(false);
    });
  });

  describe('type guards integration', () => {
    it('should work together correctly', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      const radialGradient: RadialGradientColor = {
        type: 'radial',
        center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
        stops: [{ position: 0, color: '#ff0000' }],
      };

      const notGradient = { color: '#ff0000' };

      // Test isGradient
      expect(isGradient(linearGradient)).toBe(true);
      expect(isGradient(radialGradient)).toBe(true);
      expect(isGradient(notGradient)).toBe(false);

      // Test isLinearGradient
      expect(isLinearGradient(linearGradient)).toBe(true);
      expect(isLinearGradient(radialGradient)).toBe(false);
      expect(isLinearGradient(notGradient)).toBe(false);

      // Test isRadialGradient
      expect(isRadialGradient(linearGradient)).toBe(false);
      expect(isRadialGradient(radialGradient)).toBe(true);
      expect(isRadialGradient(notGradient)).toBe(false);

      // Test that isGradient is equivalent to isLinearGradient || isRadialGradient
      expect(isGradient(linearGradient)).toBe(
        isLinearGradient(linearGradient) || isRadialGradient(linearGradient),
      );
      expect(isGradient(radialGradient)).toBe(
        isLinearGradient(radialGradient) || isRadialGradient(radialGradient),
      );
      expect(isGradient(notGradient)).toBe(
        isLinearGradient(notGradient) || isRadialGradient(notGradient),
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty stops array in toGradientHighchartsFormat', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [],
      };

      const result = toGradientHighchartsFormat(linearGradient);

      expect(result).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
        },
        stops: [],
      });
    });

    it('should handle extreme position values', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          { position: 0, color: '#ff0000' },
          { position: 1, color: '#0000ff' },
        ],
      };

      const result = toGradientHighchartsFormat(linearGradient);

      expect(result.stops).toEqual([
        [0, '#ff0000'],
        [1, '#0000ff'],
      ]);
    });

    it('should handle various color formats', () => {
      const linearGradient: LinearGradientColor = {
        type: 'linear',
        direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          { position: 0, color: '#ff0000' },
          { position: 0.5, color: 'rgb(255, 0, 0)' },
          { position: 1, color: 'rgba(0, 0, 255, 0.5)' },
        ],
      };

      const result = toGradientHighchartsFormat(linearGradient);

      expect(result.stops).toEqual([
        [0, '#ff0000'],
        [0.5, 'rgb(255, 0, 0)'],
        [1, 'rgba(0, 0, 255, 0.5)'],
      ]);
    });
  });
});
