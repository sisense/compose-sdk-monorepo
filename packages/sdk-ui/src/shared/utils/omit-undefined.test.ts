import { describe, expect, it } from 'vitest';

import { omitUndefinedAndEmpty } from './omit-undefined';

describe('omitUndefined', () => {
  describe('primitive values', () => {
    it('should return primitive values unchanged', () => {
      expect(omitUndefinedAndEmpty(42)).toBe(42);
      expect(omitUndefinedAndEmpty('hello')).toBe('hello');
      expect(omitUndefinedAndEmpty(true)).toBe(true);
      expect(omitUndefinedAndEmpty(false)).toBe(false);
      expect(omitUndefinedAndEmpty(null)).toBeNull();
    });

    it('should return undefined unchanged', () => {
      expect(omitUndefinedAndEmpty(undefined)).toBeUndefined();
    });
  });

  describe('arrays', () => {
    it('should remove undefined elements from arrays', () => {
      const input = [1, undefined, 2, undefined, 3];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle empty arrays', () => {
      const input: unknown[] = [];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([]);
    });

    it('should handle arrays with only undefined values', () => {
      const input = [undefined, undefined];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([]);
    });

    it('should recursively process nested arrays', () => {
      const input = [1, [undefined, 2], [3, undefined, 4]];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([1, [2], [3, 4]]);
    });

    it('should handle arrays with mixed types', () => {
      const input = [1, 'hello', undefined, true, null];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([1, 'hello', true, null]);
    });
  });

  describe('objects', () => {
    it('should remove properties with undefined values', () => {
      const input = {
        a: 1,
        b: undefined,
        c: 'hello',
        d: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
        c: 'hello',
      });
    });

    it('should handle empty objects', () => {
      const input = {};
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({});
    });

    it('should handle objects with only undefined values', () => {
      const input = {
        a: undefined,
        b: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({});
    });

    it('should remove empty objects', () => {
      const input = {
        a: 1,
        b: {},
        c: 'hello',
        d: {},
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
        c: 'hello',
      });
    });

    it('should remove nested empty objects', () => {
      const input = {
        a: 1,
        b: {
          c: {},
          d: 2,
        },
        e: {
          f: {},
          g: {},
        },
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
        b: {
          d: 2,
        },
      });
    });

    it('should remove objects that become empty after processing', () => {
      const input = {
        a: 1,
        b: {
          c: undefined,
          d: undefined,
        },
        e: {
          f: {},
          g: undefined,
        },
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
      });
    });

    it('should recursively process nested objects', () => {
      const input = {
        a: 1,
        b: {
          c: 2,
          d: undefined,
          e: {
            f: 3,
            g: undefined,
          },
        },
        h: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          e: {
            f: 3,
          },
        },
      });
    });

    it('should handle objects with arrays containing undefined', () => {
      const input = {
        a: [1, undefined, 2],
        b: {
          c: [undefined, 3, undefined],
        },
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: [1, 2],
        b: {
          c: [3],
        },
      });
    });
  });

  describe('complex nested structures', () => {
    it('should handle deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              value: 1,
              undefinedValue: undefined,
              array: [1, undefined, { nested: 2, undefinedNested: undefined }],
            },
            undefinedLevel2: undefined,
          },
          array: [undefined, { value: 3 }],
        },
        undefinedTop: undefined,
      };

      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 1,
              array: [1, { nested: 2 }],
            },
          },
          array: [{ value: 3 }],
        },
      });
    });

    it('should preserve null values', () => {
      const input = {
        a: null,
        b: undefined,
        c: 0,
        d: false,
        e: '',
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: null,
        c: 0,
        d: false,
        e: '',
      });
    });

    it('should handle deeply nested empty objects', () => {
      const input = {
        level1: {
          level2: {
            level3: {},
            empty: {},
          },
          value: 1,
          empty: {},
        },
        empty: {},
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        level1: {
          value: 1,
        },
      });
    });

    it('should handle arrays with empty objects', () => {
      const input = {
        a: [1, {}, 2],
        b: [{}, { value: 3 }, {}],
        c: [{}, {}],
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: [1, 2],
        b: [{ value: 3 }],
        c: [],
      });
    });
  });

  describe('type preservation', () => {
    it('should preserve the input type', () => {
      interface TestInterface {
        a: number;
        b?: string;
        c: boolean;
      }

      const input: TestInterface = {
        a: 1,
        b: undefined,
        c: true,
      };

      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({
        a: 1,
        c: true,
      });

      // Type should be preserved
      expect(typeof result.a).toBe('number');
      expect(typeof result.c).toBe('boolean');
    });

    it('should handle readonly arrays', () => {
      const input: readonly (number | undefined)[] = [1, undefined, 2];
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('edge cases', () => {
    it('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      const input = {
        date,
        undefined: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({ date });
    });

    it('should handle functions', () => {
      const fn = () => 'test';
      const input = {
        fn,
        undefined: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({ fn });
    });

    it('should handle Symbol values', () => {
      const sym = Symbol('test');
      const input = {
        sym,
        undefined: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({ sym });
    });

    it('should handle BigInt values', () => {
      const bigInt = BigInt(123);
      const input = {
        bigInt,
        undefined: undefined,
      };
      const result = omitUndefinedAndEmpty(input);
      expect(result).toEqual({ bigInt });
    });
  });

  describe('immutability', () => {
    it('should not mutate the original object', () => {
      const input = {
        a: 1,
        b: undefined,
        c: { d: 2, e: undefined },
      };
      const original = JSON.parse(JSON.stringify(input));

      omitUndefinedAndEmpty(input);

      expect(input).toEqual(original);
    });

    it('should not mutate the original array', () => {
      const input = [1, undefined, 2];
      const original = [...input];

      omitUndefinedAndEmpty(input);

      expect(input).toEqual(original);
    });
  });
});
