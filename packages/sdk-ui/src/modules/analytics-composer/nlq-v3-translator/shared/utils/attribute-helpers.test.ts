import { Attribute } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import {
  isDateLevelAttribute,
  isNonDateLevelAttribute,
  isNumericAttribute,
  isTextAttribute,
  isTextOrNumericAttribute,
} from './attribute-helpers.js';

describe('attribute-helpers', () => {
  const createMockAttribute = (type: string): Attribute =>
    ({
      name: 'TestAttribute',
      title: 'TestAttribute',
      type,
      description: 'Test attribute',
      id: 'test-id',
      expression: '[Test.Column]',
      getSort: () => 0,
      sort: () => createMockAttribute(type),
      serialize: () => ({}),
      toJSON: () => ({}),
      jaql: () => ({}),
      __serializable: 'DimensionalAttribute',
    } as unknown as Attribute);

  describe('isTextAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isTextAttribute(textAttr)).toBe(true);
    });

    it('should return false for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isTextAttribute(numericAttr)).toBe(false);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isTextAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isNumericAttribute', () => {
    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isNumericAttribute(numericAttr)).toBe(true);
    });

    it('should return false for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isNumericAttribute(textAttr)).toBe(false);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isNumericAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isDateLevelAttribute', () => {
    it('should return true for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isDateLevelAttribute(dateAttr)).toBe(true);
    });

    it('should return false for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isDateLevelAttribute(textAttr)).toBe(false);
    });

    it('should return false for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isDateLevelAttribute(numericAttr)).toBe(false);
    });
  });

  describe('isTextOrNumericAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isTextOrNumericAttribute(textAttr)).toBe(true);
    });

    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isTextOrNumericAttribute(numericAttr)).toBe(true);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isTextOrNumericAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isNonDateLevelAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isNonDateLevelAttribute(textAttr)).toBe(true);
    });

    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isNonDateLevelAttribute(numericAttr)).toBe(true);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isNonDateLevelAttribute(dateAttr)).toBe(false);
    });
  });
});
