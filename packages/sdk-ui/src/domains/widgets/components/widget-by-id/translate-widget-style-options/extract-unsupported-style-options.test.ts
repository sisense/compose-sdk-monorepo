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
    it('extracts axes but not outliers/whisker, which the model carries in dataOptions', () => {
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

    it('extracts navigator, which the pie model does not carry', () => {
      const style = {
        legend: { enabled: true, position: 'bottom' },
        navigator: { enabled: true },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('chart/pie', style)).toEqual({
        navigator: { enabled: true },
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
    it('extracts the Fusion-only fields of the active components, not the modeled enabled flags', () => {
      const style = {
        subtype: 'round',
        skin: '1',
        components: {
          ticks: { inactive: true, enabled: true },
          labels: { inactive: false, enabled: false },
          title: { inactive: true, enabled: false },
          icon: { inactive: false, enabled: false },
          secondaryTitle: { inactive: false, enabled: false },
        },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('indicator', style)).toEqual({
        components: {
          ticks: { inactive: true },
          labels: { inactive: false },
          title: { inactive: true },
          icon: { inactive: false, enabled: false },
          secondaryTitle: { inactive: false, enabled: false },
        },
      });
    });

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
        components: { title: { inactive: false } },
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

    it('keeps the subtype and skin of a variant block', () => {
      const style = {
        'indicator/numeric': {
          subtype: 'simple',
          skin: '2',
          components: { icon: { inactive: true, enabled: false } },
        },
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('indicator', style)).toEqual({
        'indicator/numeric': {
          subtype: 'simple',
          skin: '2',
          components: { icon: { inactive: true, enabled: false } },
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

    it.each([
      ['no components object', { subtype: 'round', skin: '1' }],
      ['components without picked flags', { subtype: 'round', skin: '1', components: {} }],
    ])('keeps the subtype and skin of a variant block with %s', (_, variant) => {
      const style = { 'indicator/gauge': variant } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('indicator', style)).toEqual({
        'indicator/gauge': { subtype: 'round', skin: '1' },
      });
    });

    it('skips a variant block with neither subtype, skin nor component flags', () => {
      const style = { 'indicator/gauge': { components: {} } } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('indicator', style)).not.toHaveProperty(
        'indicator/gauge',
      );
    });
  });

  describe('pivot / pivot2', () => {
    it.each(['pivot', 'pivot2'] as const)(
      'extracts scroll but not grand totals, which the model carries in dataOptions, for %s',
      (widgetType) => {
        const style = {
          rowsGrandTotal: true,
          columnsGrandTotal: false,
          scroll: true,
          colors: { rows: true },
        } as unknown as WidgetStyle;
        expect(extractUnsupportedStyleOptions(widgetType, style)).toEqual({
          scroll: true,
        });
      },
    );
  });

  describe('tablewidget / tablewidgetagg', () => {
    it.each(['tablewidget', 'tablewidgetagg'] as const)(
      'extracts borders/wordwrap/scroll/tableState for %s',
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
        });
      },
    );

    it.each(['tablewidget', 'tablewidgetagg'] as const)(
      'no longer treats automaticHeight as unsupported for %s',
      (widgetType) => {
        const style = { automaticHeight: false } as unknown as WidgetStyle;
        expect(extractUnsupportedStyleOptions(widgetType, style)).toEqual({});
      },
    );
  });

  describe('heatmap (calendar)', () => {
    it('extracts orient/* but not view/monthly, which the model carries as subtype', () => {
      const style = {
        'orient/horizontal': true,
        'orient/vertical': false,
        'view/monthly': true,
        'view/weekly': false,
      } as unknown as WidgetStyle;
      expect(extractUnsupportedStyleOptions('heatmap', style)).toEqual({
        'orient/horizontal': true,
        'orient/vertical': false,
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
