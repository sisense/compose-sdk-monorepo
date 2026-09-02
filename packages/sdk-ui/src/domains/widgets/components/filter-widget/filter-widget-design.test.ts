import { describe, expect, it } from 'vitest';

import {
  extractFilterWidgetControlStyle,
  FILTER_WIDGET_DESIGN_DEFAULTS,
  resolveFilterWidgetControlStyle,
} from './filter-widget-design';

describe('extractFilterWidgetControlStyle', () => {
  it('returns undefined for missing or non-object values', () => {
    expect(extractFilterWidgetControlStyle(undefined)).toBeUndefined();
    expect(extractFilterWidgetControlStyle(null)).toBeUndefined();
    expect(extractFilterWidgetControlStyle('s')).toBeUndefined();
    expect(extractFilterWidgetControlStyle({})).toBeUndefined();
  });

  it('keeps known tokens and drops unknown keys', () => {
    expect(
      extractFilterWidgetControlStyle({
        primaryText: '#111',
        size: 'l',
        mystery: true,
      }),
    ).toEqual({ primaryText: '#111', size: 'l' });
  });

  it('drops invalid enum tokens', () => {
    expect(
      extractFilterWidgetControlStyle({
        size: 'huge',
        cornerRadius: 'round',
        primaryText: '#111',
      }),
    ).toEqual({ primaryText: '#111' });
  });
});

describe('resolveFilterWidgetControlStyle', () => {
  it('fills omitted tokens from the Filter Style defaults', () => {
    expect(resolveFilterWidgetControlStyle(undefined).tokens).toEqual(
      FILTER_WIDGET_DESIGN_DEFAULTS,
    );
  });

  it('keeps what the style states and defaults the rest', () => {
    const resolved = resolveFilterWidgetControlStyle({ size: 'xl' });
    expect(resolved.tokens.size).toBe('xl');
    expect(resolved.tokens.cornerRadius).toBe(FILTER_WIDGET_DESIGN_DEFAULTS.cornerRadius);
  });

  // Colour is resolved against the dashboard theme, not here: a colour that leaked into the
  // shape tokens would be a constant the theme could never override.
  it('carries no colour tokens', () => {
    const resolved = resolveFilterWidgetControlStyle({ accentColor: '#00ffaa' });
    expect(Object.keys(resolved.tokens).sort()).toEqual([
      'alignHorizontal',
      'alignVertical',
      'cornerRadius',
      'size',
    ]);
  });

  // A host persists these, so a step can arrive as anything at all; the control still needs
  // a height and a radius it can paint.
  it('replaces a step outside its own token set with the default', () => {
    const resolved = resolveFilterWidgetControlStyle({
      size: 'huge',
      cornerRadius: 'round',
      alignHorizontal: 'sideways',
    } as never);
    expect(resolved.tokens.size).toBe(FILTER_WIDGET_DESIGN_DEFAULTS.size);
    expect(resolved.tokens.cornerRadius).toBe(FILTER_WIDGET_DESIGN_DEFAULTS.cornerRadius);
    expect(resolved.tokens.alignHorizontal).toBe(FILTER_WIDGET_DESIGN_DEFAULTS.alignHorizontal);
    expect(resolved.containerAlign.justifyContent).toBe('flex-start');
  });

  it('maps alignment tokens to flex placement inside the widget tile', () => {
    const resolved = resolveFilterWidgetControlStyle({
      alignHorizontal: 'right',
      alignVertical: 'bottom',
    });
    expect(resolved.containerAlign.justifyContent).toBe('flex-end');
    expect(resolved.containerAlign.alignItems).toBe('flex-end');
  });
});
