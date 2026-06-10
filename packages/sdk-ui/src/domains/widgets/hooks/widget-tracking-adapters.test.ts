import {
  getChartWidgetName,
  getCustomWidgetName,
  getPivotWidgetName,
  getTextWidgetName,
  getWidgetTitle,
} from './widget-tracking-adapters';

describe('widget-tracking-adapters', () => {
  describe('getChartWidgetName', () => {
    it.each(['line', 'column', 'pie', 'streamgraph', 'calendar-heatmap'] as const)(
      'returns chartType "%s"',
      (chartType) => {
        expect(getChartWidgetName({ chartType })).toBe(chartType);
      },
    );
  });

  describe('getPivotWidgetName', () => {
    it('returns the constant "pivot"', () => {
      expect(getPivotWidgetName()).toBe('pivot');
    });
  });

  describe('getTextWidgetName', () => {
    it('returns the constant "text"', () => {
      expect(getTextWidgetName()).toBe('text');
    });
  });

  describe('getCustomWidgetName', () => {
    it('returns the registered plugin name', () => {
      expect(getCustomWidgetName({ customWidgetType: 'my-org-bullet-chart' })).toBe(
        'my-org-bullet-chart',
      );
    });
  });

  describe('getWidgetTitle', () => {
    it('returns the string title when present', () => {
      expect(getWidgetTitle({ title: 'Total Revenue by Month' })).toBe('Total Revenue by Month');
    });

    it('returns null when title is absent', () => {
      expect(getWidgetTitle({})).toBeNull();
    });
  });
});
