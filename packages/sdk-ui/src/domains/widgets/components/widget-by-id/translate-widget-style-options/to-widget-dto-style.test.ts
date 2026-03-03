import { describe, expect, it } from 'vitest';

import { advancedLineChartWidgetDto } from '@/domains/dashboarding/dashboard-model/__mocks__/advanced-line-chart-widget.js';
import type {
  AxisLabel,
  DataLimits,
  LegendOptions,
  LineStyleOptions,
  Markers,
  Navigator,
} from '@/types.js';

import type { CartesianWidgetStyle } from '../types.js';
import {
  toAxisStyle,
  toDataLimitsStyle,
  toLegendStyle,
  toLineWidgetStyle,
  toLineWidthStyle,
  toMarkersStyle,
  toNavigatorStyle,
  toSeriesLabelsStyle,
} from './to-widget-dto-style.js';
import { extractStyleOptions } from './translate-widget-style-options.js';

describe('to-widget-dto-style', () => {
  describe('toLegendStyle', () => {
    it('returns default legend when legend is undefined', () => {
      expect(toLegendStyle(undefined)).toEqual({ enabled: true, position: 'bottom' });
    });

    it('maps legend options to DTO style', () => {
      const legend: LegendOptions = { enabled: false, position: 'right' };
      expect(toLegendStyle(legend)).toEqual({ enabled: false, position: 'right' });
    });
  });

  describe('toAxisStyle', () => {
    it('returns default axis when axisLabel is undefined', () => {
      const result = toAxisStyle(undefined);
      expect(result).toMatchObject({
        enabled: true,
        ticks: true,
        gridLines: true,
        isIntervalEnabled: false,
        labels: { enabled: true, rotation: 0 },
      });
    });

    it('maps axis label options to DTO axis style', () => {
      const axisLabel: AxisLabel = {
        enabled: true,
        gridLines: false,
        isIntervalEnabled: true,
        labels: { enabled: false },
        title: { enabled: true, text: 'X Axis' },
        min: 0,
        max: 100,
      };
      const result = toAxisStyle(axisLabel);
      expect(result).toMatchObject({
        enabled: true,
        gridLines: false,
        isIntervalEnabled: true,
        labels: { enabled: false, rotation: 0 },
        title: { enabled: true, text: 'X Axis' },
        min: 0,
        max: 100,
      });
      expect(result.ticks).toBe(true);
      expect(result.inactive).toBe(false);
    });
  });

  describe('toSeriesLabelsStyle', () => {
    it('returns default series labels when undefined', () => {
      expect(toSeriesLabelsStyle(undefined)).toEqual({ enabled: false, rotation: 0 });
    });

    it('maps series labels to DTO style', () => {
      expect(toSeriesLabelsStyle({ enabled: true, rotation: 45 })).toEqual({
        enabled: true,
        rotation: 45,
      });
    });
  });

  describe('toNavigatorStyle', () => {
    it('returns default navigator when undefined', () => {
      expect(toNavigatorStyle(undefined)).toEqual({ enabled: false });
    });

    it('maps navigator options to DTO style', () => {
      const navigator: Navigator = { enabled: true };
      expect(toNavigatorStyle(navigator)).toEqual({ enabled: true });
    });
  });

  describe('toLineWidthStyle', () => {
    it('returns undefined when lineWidth is undefined', () => {
      expect(toLineWidthStyle(undefined)).toBeUndefined();
    });

    it('returns undefined when width is absent', () => {
      expect(toLineWidthStyle({})).toBeUndefined();
    });

    it('maps allowed string tokens to DTO style', () => {
      expect(toLineWidthStyle({ width: 'thin' })).toEqual({ width: 'thin' });
      expect(toLineWidthStyle({ width: 'bold' })).toEqual({ width: 'bold' });
      expect(toLineWidthStyle({ width: 'thick' })).toEqual({ width: 'thick' });
    });

    it('maps numeric width to token via thresholds (thin=1, bold=3, thick=5)', () => {
      expect(toLineWidthStyle({ width: 0 })).toEqual({ width: 'thin' });
      expect(toLineWidthStyle({ width: 1 })).toEqual({ width: 'thin' });
      expect(toLineWidthStyle({ width: 2 })).toEqual({ width: 'thin' });
      expect(toLineWidthStyle({ width: 3 })).toEqual({ width: 'bold' });
      expect(toLineWidthStyle({ width: 4 })).toEqual({ width: 'bold' });
      expect(toLineWidthStyle({ width: 5 })).toEqual({ width: 'thick' });
      expect(toLineWidthStyle({ width: 10 })).toEqual({ width: 'thick' });
    });

    it('returns undefined for invalid string tokens', () => {
      expect(toLineWidthStyle({ width: 'medium' })).toBeUndefined();
      expect(toLineWidthStyle({ width: '10px' })).toBeUndefined();
    });
  });

  describe('toMarkersStyle', () => {
    it('returns undefined when markers is undefined', () => {
      expect(toMarkersStyle(undefined)).toBeUndefined();
    });

    it('maps markers options to DTO style', () => {
      const markers: Markers = { enabled: true, fill: 'hollow', size: 'large' };
      expect(toMarkersStyle(markers)).toEqual({
        enabled: true,
        fill: 'hollow',
        size: 'large',
      });
    });

    it('uses defaults for missing fill and size', () => {
      const markers: Markers = { enabled: false };
      expect(toMarkersStyle(markers)).toEqual({
        enabled: false,
        size: 'small',
        fill: 'filled',
      });
    });
  });

  describe('toDataLimitsStyle', () => {
    it('returns undefined when dataLimits is undefined', () => {
      expect(toDataLimitsStyle(undefined)).toBeUndefined();
    });

    it('maps data limits to DTO style', () => {
      const dataLimits: DataLimits = {
        seriesCapacity: 50,
        categoriesCapacity: 100000,
      };
      expect(toDataLimitsStyle(dataLimits)).toEqual(dataLimits);
    });
  });

  describe('toLineWidgetStyle', () => {
    it('returns full cartesian style with defaults when styleOptions is minimal', () => {
      const styleOptions: LineStyleOptions = {};
      const result = toLineWidgetStyle(styleOptions);
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.navigator).toEqual({ enabled: false });
      expect(result.seriesLabels).toEqual({ enabled: false, rotation: 0 });
      expect(result.xAxis).toBeDefined();
      expect(result.yAxis).toBeDefined();
      expect(result.y2Axis).toBeUndefined();
      expect(result.lineWidth).toBeUndefined();
      expect(result.markers).toBeUndefined();
      expect(result.dataLimits).toBeUndefined();
    });

    it('round-trips with extractStyleOptions for line chart', () => {
      const styleOptions = extractStyleOptions('chart/line', advancedLineChartWidgetDto);
      const restored = toLineWidgetStyle(styleOptions as LineStyleOptions);

      const original = advancedLineChartWidgetDto.style as CartesianWidgetStyle;
      expect(restored.legend).toEqual(original.legend);
      expect(restored.navigator).toEqual(original.navigator);
      expect(restored.seriesLabels).toMatchObject({
        enabled: original.seriesLabels.enabled,
        rotation: original.seriesLabels.rotation,
      });
      expect(restored.lineWidth).toEqual(original.lineWidth);
      expect(restored.markers).toEqual(original.markers);
      expect(restored.dataLimits).toEqual(original.dataLimits);

      expect(restored.xAxis).toMatchObject({
        enabled: original.xAxis.enabled,
        gridLines: original.xAxis.gridLines,
        isIntervalEnabled: original.xAxis.isIntervalEnabled,
        title: original.xAxis.title,
        labels: { enabled: original.xAxis.labels.enabled, rotation: 0 },
      });
      expect(restored.yAxis).toMatchObject({
        enabled: original.yAxis.enabled,
        gridLines: original.yAxis.gridLines,
        isIntervalEnabled: original.yAxis.isIntervalEnabled,
        logarithmic: original.yAxis.logarithmic,
        title: original.yAxis.title,
        labels: { enabled: original.yAxis.labels.enabled, rotation: 0 },
      });
      expect(restored.y2Axis).toBeDefined();
      expect(restored.y2Axis).toMatchObject({
        enabled: original.y2Axis?.enabled,
        gridLines: original.y2Axis?.gridLines,
        title: original.y2Axis?.title,
        labels: { enabled: original.y2Axis?.labels?.enabled, rotation: 0 },
      });
    });
  });
});
