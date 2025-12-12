/**
 * Tests for factory function schema definitions
 */
import { describe, expect, it } from 'vitest';

import {
  getFunctionSchema,
  getMaxArgCount,
  getRequiredArgCount,
} from './factory-function-schemas.js';

describe('factory-function-schemas', () => {
  describe('getFunctionSchema', () => {
    it('should return schema for existing function', () => {
      const schema = getFunctionSchema('filterFactory.dateRelative');
      expect(schema).toBeDefined();
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return undefined for non-existent function', () => {
      const schema = getFunctionSchema('filterFactory.nonExistent');
      expect(schema).toBeUndefined();
    });
  });

  describe('getRequiredArgCount', () => {
    it('should return correct required arg count for dateRelative', () => {
      const count = getRequiredArgCount('filterFactory.dateRelative');
      expect(count).toBe(3); // level, offset, count
    });

    it('should return correct required arg count for dateRelativeFrom', () => {
      const count = getRequiredArgCount('filterFactory.dateRelativeFrom');
      expect(count).toBe(3); // level, offset, count
    });

    it('should return correct required arg count for dateRelativeTo', () => {
      const count = getRequiredArgCount('filterFactory.dateRelativeTo');
      expect(count).toBe(3); // level, offset, count
    });

    it('should return correct required arg count for dateRange', () => {
      const count = getRequiredArgCount('filterFactory.dateRange');
      expect(count).toBe(1); // level only (from and to are optional)
    });

    it('should return 0 for non-existent function', () => {
      const count = getRequiredArgCount('filterFactory.nonExistent');
      expect(count).toBe(0);
    });
  });

  describe('getMaxArgCount', () => {
    it('should return correct max arg count for dateRelative', () => {
      const count = getMaxArgCount('filterFactory.dateRelative');
      expect(count).toBe(5); // level, offset, count, anchor, config
    });

    it('should return correct max arg count for dateRelativeFrom', () => {
      const count = getMaxArgCount('filterFactory.dateRelativeFrom');
      expect(count).toBe(5); // level, offset, count, anchor, config
    });

    it('should return correct max arg count for dateRelativeTo', () => {
      const count = getMaxArgCount('filterFactory.dateRelativeTo');
      expect(count).toBe(5); // level, offset, count, anchor, config
    });

    it('should return correct max arg count for dateRange', () => {
      const count = getMaxArgCount('filterFactory.dateRange');
      expect(count).toBe(4); // level, from, to, config
    });

    it('should return 0 for non-existent function', () => {
      const count = getMaxArgCount('filterFactory.nonExistent');
      expect(count).toBe(0);
    });
  });

  describe('schema structure validation', () => {
    it('should have correct schema structure for dateRelative', () => {
      const schema = getFunctionSchema('filterFactory.dateRelative');
      expect(schema).toBeDefined();
      expect(schema!.length).toBe(5);
      expect(schema![0]).toEqual({ type: 'LevelAttribute', required: true });
      expect(schema![1]).toEqual({ type: 'number', required: true }); // offset
      expect(schema![2]).toEqual({ type: 'number', required: true }); // count
      expect(schema![3]).toEqual({ type: 'Date | string', required: false }); // anchor
      expect(schema![4]).toEqual({ type: 'BaseFilterConfig', required: false }); // config
    });

    it('should have correct schema structure for dateRelativeFrom', () => {
      const schema = getFunctionSchema('filterFactory.dateRelativeFrom');
      expect(schema).toBeDefined();
      expect(schema!.length).toBe(5);
      expect(schema![0]).toEqual({ type: 'LevelAttribute', required: true });
      expect(schema![1]).toEqual({ type: 'number', required: true }); // offset
      expect(schema![2]).toEqual({ type: 'number', required: true }); // count
      expect(schema![3]).toEqual({ type: 'Date | string', required: false }); // anchor
      expect(schema![4]).toEqual({ type: 'BaseFilterConfig', required: false }); // config
    });

    it('should have correct schema structure for dateRelativeTo', () => {
      const schema = getFunctionSchema('filterFactory.dateRelativeTo');
      expect(schema).toBeDefined();
      expect(schema!.length).toBe(5);
      expect(schema![0]).toEqual({ type: 'LevelAttribute', required: true });
      expect(schema![1]).toEqual({ type: 'number', required: true }); // offset
      expect(schema![2]).toEqual({ type: 'number', required: true }); // count
      expect(schema![3]).toEqual({ type: 'Date | string', required: false }); // anchor
      expect(schema![4]).toEqual({ type: 'BaseFilterConfig', required: false }); // config
    });

    it('should have correct schema structure for dateRange', () => {
      const schema = getFunctionSchema('filterFactory.dateRange');
      expect(schema).toBeDefined();
      expect(schema!.length).toBe(4);
      expect(schema![0]).toEqual({ type: 'LevelAttribute', required: true });
      expect(schema![1]).toEqual({ type: 'Date | string', required: false }); // from
      expect(schema![2]).toEqual({ type: 'Date | string', required: false }); // to
      expect(schema![3]).toEqual({ type: 'BaseFilterConfig', required: false }); // config
    });
  });

  describe('integration tests - argument count validation', () => {
    it('should validate dateRelative accepts minimum required arguments (3)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRelative');
      const maxCount = getMaxArgCount('filterFactory.dateRelative');
      expect(requiredCount).toBe(3);
      expect(maxCount).toBe(5);
      // Should accept 3 args (level, offset, count)
      expect(3).toBeGreaterThanOrEqual(requiredCount);
      expect(3).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRelative accepts all arguments (5)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRelative');
      const maxCount = getMaxArgCount('filterFactory.dateRelative');
      // Should accept 5 args (level, offset, count, anchor, config)
      expect(5).toBeGreaterThanOrEqual(requiredCount);
      expect(5).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRelativeFrom accepts minimum required arguments (3)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRelativeFrom');
      const maxCount = getMaxArgCount('filterFactory.dateRelativeFrom');
      expect(requiredCount).toBe(3);
      expect(maxCount).toBe(5);
      expect(3).toBeGreaterThanOrEqual(requiredCount);
      expect(3).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRelativeTo accepts minimum required arguments (3)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRelativeTo');
      const maxCount = getMaxArgCount('filterFactory.dateRelativeTo');
      expect(requiredCount).toBe(3);
      expect(maxCount).toBe(5);
      expect(3).toBeGreaterThanOrEqual(requiredCount);
      expect(3).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRange accepts minimum required arguments (1)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRange');
      const maxCount = getMaxArgCount('filterFactory.dateRange');
      expect(requiredCount).toBe(1);
      expect(maxCount).toBe(4);
      // Should accept 1 arg (level only)
      expect(1).toBeGreaterThanOrEqual(requiredCount);
      expect(1).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRange accepts all arguments (4)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRange');
      const maxCount = getMaxArgCount('filterFactory.dateRange');
      // Should accept 4 args (level, from, to, config)
      expect(4).toBeGreaterThanOrEqual(requiredCount);
      expect(4).toBeLessThanOrEqual(maxCount);
    });

    it('should validate dateRange accepts partial arguments (2 or 3)', () => {
      const requiredCount = getRequiredArgCount('filterFactory.dateRange');
      const maxCount = getMaxArgCount('filterFactory.dateRange');
      // Should accept 2 args (level, from)
      expect(2).toBeGreaterThanOrEqual(requiredCount);
      expect(2).toBeLessThanOrEqual(maxCount);
      // Should accept 3 args (level, from, to)
      expect(3).toBeGreaterThanOrEqual(requiredCount);
      expect(3).toBeLessThanOrEqual(maxCount);
    });
  });
});
