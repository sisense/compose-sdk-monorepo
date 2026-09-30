import { describe, expect, it } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import { withNarrativeDashboardId } from './with-narrative-dashboard-id.js';

const narrative = (id: string, dashboardId?: string): WidgetProps => ({
  widgetType: 'narrative',
  id,
  ...(dashboardId ? { dashboardId } : {}),
});
const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>x</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

describe('withNarrativeDashboardId', () => {
  it('sets the dashboard id on every narrative widget and leaves the others alone', () => {
    const widgets = [narrative('n1'), text, narrative('n2')];

    const result = withNarrativeDashboardId('d1')(widgets);

    expect(result).toEqual([narrative('n1', 'd1'), text, narrative('n2', 'd1')]);
    expect(result[1]).toBe(text);
  });

  it('keeps a dashboard id the widget already carries', () => {
    const result = withNarrativeDashboardId('d1')([narrative('n1', 'other')]);

    expect(result).toEqual([narrative('n1', 'other')]);
  });

  it('returns the input when there is no narrative widget', () => {
    const widgets = [text];

    expect(withNarrativeDashboardId('d1')(widgets)).toBe(widgets);
  });

  it('does not mutate the input', () => {
    const widget = narrative('n1');

    withNarrativeDashboardId('d1')([widget]);

    expect(widget).not.toHaveProperty('dashboardId');
  });
});
