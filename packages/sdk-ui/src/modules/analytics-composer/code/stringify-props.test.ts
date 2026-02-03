import { getWidgetTypeDefaultDataOptions } from './default-options/data-options';
import { getWidgetTypeDefaultStyleOptions } from './default-options/style-options';
import {
  removeDefaultDataOptionsProps,
  removeDefaultStyleOptionsProps,
  stripDefaultsDeep,
} from './stringify-props';

describe('stringifyProps', () => {
  describe('stripDefaultsDeep', () => {
    it('returns undefined when object equals defaults', () => {
      const obj = { a: 1, b: 2 };
      const defaults = { a: 1, b: 2 };
      expect(stripDefaultsDeep(obj, defaults)).toBeUndefined();
    });

    it('removes matching keys and keeps differences', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const defaults = { a: 1, b: 2 };
      expect(stripDefaultsDeep(obj, defaults)).toEqual({ c: 3 });
    });

    it('handles nested objects', () => {
      const obj = { a: { x: 1, y: 2 }, b: 3 };
      const defaults = { a: { x: 1, y: 2 }, b: 3 };
      expect(stripDefaultsDeep(obj, defaults)).toBeUndefined();
    });

    it('keeps non-default values in nested objects', () => {
      const obj = { a: { x: 1, y: 9 }, b: 3 };
      const defaults = { a: { x: 1, y: 2 }, b: 3 };
      expect(stripDefaultsDeep(obj, defaults)).toEqual({ a: { y: 9 } });
    });

    it('returns object itself if no defaults provided', () => {
      const obj = { a: 1 };
      expect(stripDefaultsDeep(obj, undefined)).toEqual({ a: 1 });
    });
  });

  describe('removeDefaultStyleOptionsProps', () => {
    it('returns {} for empty input', () => {
      expect(removeDefaultStyleOptionsProps({}, 'line')).toEqual({});
    });

    it('returns {} if equal to defaults', () => {
      const defaults = getWidgetTypeDefaultStyleOptions('line');
      expect(removeDefaultStyleOptionsProps(defaults, 'line')).toEqual({});
    });

    it('strips matching defaults and keeps differences', () => {
      const defaults = getWidgetTypeDefaultStyleOptions('line');
      const obj = { ...defaults, extra: 42 };
      expect(removeDefaultStyleOptionsProps(obj, 'line')).toEqual({ extra: 42 });
    });
  });

  describe('removeDefaultDataOptionsProps', () => {
    it('returns input if equal to defaults', () => {
      const defaults = getWidgetTypeDefaultDataOptions('table');
      expect(removeDefaultDataOptionsProps(defaults, 'table')).toEqual(defaults);
    });

    it('strips matching defaults and keeps differences', () => {
      const defaults = getWidgetTypeDefaultDataOptions('table');
      const obj = { ...defaults, columns: ['foo'] };
      expect(removeDefaultDataOptionsProps(obj, 'table')).toEqual({ columns: ['foo'] });
    });
  });
});
