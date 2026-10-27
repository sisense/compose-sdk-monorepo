import type { WidgetProps } from '../components/widget/types';
import { BUILT_IN_WIDGET_DESCRIPTORS } from './descriptors';
import type { BuiltInWidgetKey } from './types';
import { customWidgetKey, familyOfKey, isCustomWidgetKey, widgetKeyOf } from './widget-key';

describe('widget keys', () => {
  it('prefixes custom widget types with custom:', () => {
    expect(customWidgetKey('tabber-buttons')).toBe('custom:tabber-buttons');
    expect(customWidgetKey('line')).toBe('custom:line');
  });

  it('recognizes custom keys', () => {
    expect(isCustomWidgetKey('custom:my-widget')).toBe(true);
    expect(isCustomWidgetKey('line')).toBe(false);
    expect(isCustomWidgetKey('pivot')).toBe(false);
  });

  it('resolves the family of a custom key to custom', () => {
    expect(familyOfKey('custom:my-widget')).toBe('custom');
    expect(familyOfKey(customWidgetKey('line'))).toBe('custom');
  });

  it.each(Object.keys(BUILT_IN_WIDGET_DESCRIPTORS) as BuiltInWidgetKey[])(
    'resolves the family of the built-in key %s from its descriptor',
    (key) => {
      expect(familyOfKey(key)).toBe(BUILT_IN_WIDGET_DESCRIPTORS[key].widgetType);
    },
  );
});

describe('widgetKeyOf', () => {
  it.each([
    [{ widgetType: 'chart', chartType: 'line' }, 'line'],
    [{ widgetType: 'chart', chartType: 'table' }, 'table'],
    [{ widgetType: 'pivot' }, 'pivot'],
    [{ widgetType: 'text' }, 'text'],
    [{ widgetType: 'narrative' }, 'narrative'],
    [{ widgetType: 'filter' }, 'filter'],
    [{ widgetType: 'custom', customWidgetType: 'line' }, 'custom:line'],
  ])('resolves the key of %o to %s', (props, key) => {
    expect(widgetKeyOf({ id: 'widget', ...props } as WidgetProps)).toBe(key);
  });
});
