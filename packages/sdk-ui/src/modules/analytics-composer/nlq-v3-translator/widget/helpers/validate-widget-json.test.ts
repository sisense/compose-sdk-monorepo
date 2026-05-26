import { describe, expect, it } from 'vitest';

import { validateWidgetType } from './validate-widget-json.js';

describe('validateWidgetType', () => {
  it('returns null for valid widgetType', () => {
    expect(validateWidgetType({ widgetType: 'chart', id: 'w-1' })).toBeNull();
  });

  it('returns error when widgetType is missing', () => {
    const error = validateWidgetType({ id: 'w-1', chartType: 'column' });
    expect(error?.path).toBe('widgetType');
    expect(error?.message).toMatch(/widgetType is required/i);
  });

  it('returns error for invalid widgetType', () => {
    const error = validateWidgetType({ widgetType: 'unknown', id: 'w-1' });
    expect(error?.path).toBe('widgetType');
    expect(error?.message).toMatch(/Invalid widgetType/);
  });
});
