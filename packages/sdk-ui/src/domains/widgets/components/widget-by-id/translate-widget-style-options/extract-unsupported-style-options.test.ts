import { describe, expect, it } from 'vitest';

import type { WidgetStyle } from '../types.js';
import { extractUnsupportedStyleOptions } from './extract-unsupported-style-options.js';

describe('extractUnsupportedStyleOptions', () => {
  it('returns {} for unknown widget types', () => {
    expect(
      extractUnsupportedStyleOptions('custom', { foo: 'bar' } as unknown as WidgetStyle),
    ).toEqual({});
    expect(
      extractUnsupportedStyleOptions('WidgetsTabber', { tabs: [] } as unknown as WidgetStyle),
    ).toEqual({});
  });

  it('returns {} when style is undefined', () => {
    expect(extractUnsupportedStyleOptions('chart/line', undefined)).toEqual({});
  });

  describe('cartesian (line/area/bar/column)', () => {
    const fullDtoStyle = {
      legend: { enabled: true, position: 'bottom' },
      navigator: { enabled: true },
      xAxis: {
        enabled: true,
        ticks: false,
        inactive: true,
        gridLines: false,
        labels: { enabled: true, rotation: 45, stepInterval: 5 },
        title: { enabled: true, text: 'X' },
      },
      yAxis: {
        enabled: true,
        ticks: true,
        labels: { enabled: false, rotation: 90, stepInterval: 2 },
      },
      y2Axis: {
        enabled: false,
        ticks: false,
        labels: { enabled: true, rotation: 0 },
      },
      seriesLabels: { enabled: false, rotation: 0 },
    } as unknown as WidgetStyle;

    it.each(['chart/line', 'chart/area', 'chart/bar', 'chart/column'] as const)(
      'extracts axis ticks/inactive/labels.{rotation,stepInterval} for %s',
      (widgetType) => {
        expect(extractUnsupportedStyleOptions(widgetType, fullDtoStyle)).toEqual({
          xAxis: {
            ticks: false,
            inactive: true,
            labels: { rotation: 45, stepInterval: 5 },
          },
          yAxis: {
            ticks: true,
            labels: { rotation: 90, stepInterval: 2 },
          },
          y2Axis: {
            ticks: false,
            labels: { rotation: 0 },
          },
        });
      },
    );

    it('omits axis entries with no unsupported fields', () => {
      const style = {
        xAxis: { enabled: true, gridLines: true, labels: { enabled: true } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/line', style)).toEqual({});
    });
  });

  describe('chart/polar', () => {
    it('extracts unsupported fields under categories and axis', () => {
      const style = {
        categories: { ticks: false, labels: { rotation: 45, stepInterval: 1 } },
        axis: { inactive: true, labels: { stepInterval: 2 } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/polar', style)).toEqual({
        categories: { ticks: false, labels: { rotation: 45, stepInterval: 1 } },
        axis: { inactive: true, labels: { stepInterval: 2 } },
      });
    });
  });

  describe('chart/scatter', () => {
    it('extracts axis fields and scatter-specific marker/dataLimits gaps', () => {
      const style = {
        xAxis: { ticks: false, labels: { rotation: 30 } },
        yAxis: { inactive: true },
        markerSize: { defaultSize: 10, isRange: true, lowest: 5, highest: 50, step: 2 },
        dataLimits: { categoriesCapacityX: 100, categoriesCapacityY: 200 },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/scatter', style)).toEqual({
        xAxis: { ticks: false, labels: { rotation: 30 } },
        yAxis: { inactive: true },
        markerSize: { isRange: true, lowest: 5, highest: 50, step: 2 },
        dataLimits: { categoriesCapacityX: 100, categoriesCapacityY: 200 },
      });
    });
  });

  describe('chart/boxplot', () => {
    it('extracts axes plus outliers/whisker gaps', () => {
      const style = {
        xAxis: { ticks: true },
        yAxis: { inactive: false, labels: { rotation: 0 } },
        outliers: { enabled: true },
        whisker: {
          'whisker/iqr': true,
          'whisker/extremums': false,
          'whisker/deviation': false,
        },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/boxplot', style)).toEqual({
        xAxis: { ticks: true },
        yAxis: { inactive: false, labels: { rotation: 0 } },
        outliers: { enabled: true },
        whisker: {
          'whisker/iqr': true,
          'whisker/extremums': false,
          'whisker/deviation': false,
        },
      });
    });

    it('extracts xAxis.x2Title (Fusion boxplot editor exposes it even though boxplot is single-axis)', () => {
      const style = {
        xAxis: { x2Title: { enabled: true, text: 'Secondary X' } },
        yAxis: { labels: {} },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/boxplot', style)).toEqual({
        xAxis: { x2Title: { enabled: true, text: 'Secondary X' } },
      });
    });

    it('merges xAxis.x2Title with other unsupported xAxis fields', () => {
      const style = {
        xAxis: {
          ticks: false,
          labels: { rotation: 45, step: 3, stepInterval: 5 },
          x2Title: { enabled: false, text: 'X2' },
        },
        yAxis: {},
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/boxplot', style)).toEqual({
        xAxis: {
          ticks: false,
          labels: { rotation: 45, step: 3, stepInterval: 5 },
          x2Title: { enabled: false, text: 'X2' },
        },
      });
    });
  });

  describe('axis labels.step', () => {
    it('extracts labels.step alongside labels.stepInterval for cartesian charts', () => {
      const style = {
        xAxis: { labels: { step: 5 } },
        yAxis: { labels: { step: 2, stepInterval: 4 } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/line', style)).toEqual({
        xAxis: { labels: { step: 5 } },
        yAxis: { labels: { step: 2, stepInterval: 4 } },
      });
    });

    it('extracts labels.step for polar charts (categories/axis panels)', () => {
      const style = {
        categories: { labels: { step: 7 } },
        axis: { labels: { step: 1 } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/polar', style)).toEqual({
        categories: { labels: { step: 7 } },
        axis: { labels: { step: 1 } },
      });
    });

    it('extracts labels.step for scatter charts', () => {
      const style = {
        xAxis: { labels: { step: 4 } },
        yAxis: { labels: { step: 6 } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/scatter', style)).toEqual({
        xAxis: { labels: { step: 4 } },
        yAxis: { labels: { step: 6 } },
      });
    });
  });

  describe('chart/pie', () => {
    it('extracts labels.fontFamily', () => {
      const style = {
        labels: { enabled: true, fontFamily: 'Arial', color: '#fff' },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/pie', style)).toEqual({
        labels: { fontFamily: 'Arial' },
      });
    });
  });

  describe('sunburst', () => {
    it('extracts center/* fields', () => {
      const style = {
        'legend/enabled': true,
        'center/value': true,
        'center/contribution': false,
        'center/contributionToParent': true,
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('sunburst', style)).toEqual({
        'center/value': true,
        'center/contribution': false,
        'center/contributionToParent': true,
      });
    });
  });

  describe('indicator', () => {
    it('extracts variant-keyed components.* gap fields', () => {
      const style = {
        subtype: 'simple',
        skin: '1',
        components: { title: { enabled: true, inactive: false } },
        'indicator/numeric': {
          components: {
            title: { inactive: true, enabled: false },
            icon: { inactive: false, enabled: true },
            secondaryTitle: { inactive: true, enabled: false },
          },
        },
        'indicator/gauge': {
          components: {
            ticks: { inactive: true, enabled: true },
            labels: { inactive: false, enabled: true },
            title: { inactive: true, enabled: true },
            secondaryTitle: { inactive: true, enabled: true },
          },
        },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('indicator', style)).toEqual({
        'indicator/numeric': {
          components: {
            title: { inactive: true, enabled: false },
            icon: { inactive: false, enabled: true },
            secondaryTitle: { inactive: true, enabled: false },
          },
        },
        'indicator/gauge': {
          components: {
            ticks: { inactive: true, enabled: true },
            labels: { inactive: false, enabled: true },
            title: { inactive: true, enabled: true },
            secondaryTitle: { inactive: true, enabled: true },
          },
        },
      });
    });

    it('skips a variant key when its components object is missing', () => {
      const style = {
        'indicator/numeric': {
          components: { title: { inactive: false, enabled: true } },
        },
      } as unknown as WidgetStyle;
      const result = extractUnsupportedStyleOptions('indicator', style);
      expect(result).toEqual({
        'indicator/numeric': {
          components: { title: { inactive: false, enabled: true } },
        },
      });
      expect(result).not.toHaveProperty('indicator/gauge');
    });
  });

  describe('pivot / pivot2', () => {
    it.each(['pivot', 'pivot2'] as const)('extracts grand totals + scroll for %s', (widgetType) => {
      const style = {
        rowsGrandTotal: true,
        columnsGrandTotal: false,
        scroll: true,
        colors: { rows: true },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions(widgetType, style)).toEqual({
        rowsGrandTotal: true,
        columnsGrandTotal: false,
        scroll: true,
      });
    });
  });

  describe('tablewidget / tablewidgetagg', () => {
    it.each(['tablewidget', 'tablewidgetagg'] as const)(
      'extracts borders/wordwrap/scroll/tableState/automaticHeight for %s',
      (widgetType) => {
        const style = {
          'borders/all': true,
          'borders/grid': false,
          'borders/rows': true,
          'borders/columns': false,
          'wordwrap/headers': true,
          'wordwrap/rows': false,
          scroll: true,
          tableState: { foo: 'bar' },
          automaticHeight: false,
          pageSize: 25,
          'colors/headers': true,
        } as unknown as WidgetStyle;
        expect(extractUnsupportedStyleOptions(widgetType, style)).toEqual({
          'borders/all': true,
          'borders/grid': false,
          'borders/rows': true,
          'borders/columns': false,
          'wordwrap/headers': true,
          'wordwrap/rows': false,
          scroll: true,
          tableState: { foo: 'bar' },
          automaticHeight: false,
        });
      },
    );
  });

  describe('heatmap (calendar)', () => {
    it('extracts orient/* and view/monthly', () => {
      const style = {
        'orient/horizontal': true,
        'orient/vertical': false,
        'view/monthly': true,
        'view/weekly': false,
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('heatmap', style)).toEqual({
        'orient/horizontal': true,
        'orient/vertical': false,
        'view/monthly': true,
      });
    });
  });

  describe('map/scatter', () => {
    it('extracts markers.size.{inactive,lowest,highest,step}', () => {
      const style = {
        markers: {
          fill: 'filled',
          size: {
            defaultSize: 4,
            min: 1,
            max: 24,
            inactive: true,
            lowest: 1,
            highest: 42,
            step: 2,
          },
        },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('map/scatter', style)).toEqual({
        markers: { size: { inactive: true, lowest: 1, highest: 42, step: 2 } },
      });
    });

    it('returns {} when markers/size has no unsupported fields', () => {
      const style = {
        markers: { fill: 'filled', size: { defaultSize: 4, min: 1, max: 24 } },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('map/scatter', style)).toEqual({});
    });
  });

  describe('map/area', () => {
    it('extracts legend.{enabled,position}', () => {
      const style = {
        legend: { enabled: true, position: 'bottomright' },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('map/area', style)).toEqual({
        legend: { enabled: true, position: 'bottomright' },
      });
    });
  });
});
