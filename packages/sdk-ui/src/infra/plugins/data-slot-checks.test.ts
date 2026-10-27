import { describe, expect, it } from 'vitest';

import {
  checkCamelCaseName,
  checkDisplayName,
  checkMaxItems,
  checkReservedName,
  checkVisibleWhen,
  findDataSlotProblems,
  RESERVED_DATA_SLOT_NAMES,
} from './data-slot-checks';

describe('data slot checks', () => {
  describe('checkMaxItems', () => {
    it.each([undefined, 1, 5])('accepts maxItems %j', (maxItems) => {
      expect(checkMaxItems({ maxItems }, [])).toBeUndefined();
    });

    it.each([0, -1, 1.5, NaN, '3', null])('flags maxItems %j', (maxItems) => {
      expect(checkMaxItems({ maxItems }, [])).toContain('maxItems must be a whole number');
    });
  });

  describe('checkCamelCaseName', () => {
    it.each(['breakBy', 'x', 'value2'])('accepts %j', (name) => {
      expect(checkCamelCaseName({ name }, [])).toBeUndefined();
    });

    it.each([
      ['break-by', 'breakBy'],
      ['Size', 'size'],
      ['my slot', 'mySlot'],
    ])('flags %j and names its camelCase form', (name, expected) => {
      expect(checkCamelCaseName({ name }, [])).toContain(`"${expected}"`);
    });

    it('ignores a name that is not a string', () => {
      expect(checkCamelCaseName({ name: 42 }, [])).toBeUndefined();
    });
  });

  describe('checkReservedName', () => {
    it.each([...RESERVED_DATA_SLOT_NAMES])('flags the reserved name %j', (name) => {
      expect(checkReservedName({ name }, [])).toContain('reserved by hosts');
    });

    it.each(['Filters', 'Color', 'category', 'value', 'series'])(
      'matches case-sensitively and accepts %j',
      (name) => {
        expect(checkReservedName({ name }, [])).toBeUndefined();
      },
    );
  });

  describe('checkDisplayName', () => {
    it('flags a displayName equal to another slot name', () => {
      const slots = [{ name: 'size' }, { name: 'width', displayName: 'size' }];
      expect(checkDisplayName(slots[1], slots)).toContain('name of another data slot');
    });

    it('accepts a displayName equal to its own name', () => {
      const slots = [{ name: 'size', displayName: 'size' }];
      expect(checkDisplayName(slots[0], slots)).toBeUndefined();
    });
  });

  describe('checkVisibleWhen', () => {
    it('flags a condition the SDK cannot read', () => {
      expect(checkVisibleWhen({ visibleWhen: { gt: 1 } }, [])).toContain('cannot read');
    });

    it('accepts a missing or valid condition', () => {
      expect(checkVisibleWhen({}, [])).toBeUndefined();
      expect(checkVisibleWhen({ visibleWhen: { slot: 'size', minItems: 1 } }, [])).toBeUndefined();
    });
  });

  describe('findDataSlotProblems', () => {
    it.each([undefined, {}, 'inputs', [null, 42]])('ignores malformed inputs %j', (inputs) => {
      expect(findDataSlotProblems(inputs)).toEqual([]);
    });

    it('returns nothing for a slot list that follows every rule', () => {
      expect(
        findDataSlotProblems([
          { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
          { name: 'value', displayName: 'Value', type: 'measure' },
        ]),
      ).toEqual([]);
    });

    it('returns one problem per broken rule, in slot order', () => {
      const problems = findDataSlotProblems([
        { name: 'color', type: 'dimension', maxItems: 0 },
        { name: 'break-by', type: 'dimension' },
        { name: 'value', type: 'measure', displayName: 'color' },
      ]);

      expect(problems.map(({ slotName }) => slotName)).toEqual([
        'color',
        'color',
        'break-by',
        'value',
      ]);
      expect(problems.map(({ message }) => message)).toEqual([
        expect.stringContaining('maxItems'),
        expect.stringContaining('reserved by hosts'),
        expect.stringContaining('not camelCase'),
        expect.stringContaining('name of another data slot'),
      ]);
    });
  });
});
