import cloneDeep from 'lodash-es/cloneDeep';
import { describe, expect, it } from 'vitest';

import { advancedLineChartWidgetDto } from '@/domains/dashboarding/dashboard-model/__mocks__/advanced-line-chart-widget.js';
import type { AppSettings } from '@/infra/app/settings/settings';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import type {
  AreamapStyleOptions,
  AreaStyleOptions,
  AxisLabel,
  CompleteThemeSettingsInternal,
  DataLimits,
  FunnelStyleOptions,
  GaugeIndicatorStyleOptions,
  IndicatorStyleOptions,
  LegendOptions,
  LineStyleOptions,
  Markers,
  Navigator,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  PieStyleOptions,
  PivotTableWidgetStyleOptions,
  PolarStyleOptions,
  ScattermapStyleOptions,
  ScatterStyleOptions,
  StackableStyleOptions,
  SunburstStyleOptions,
  TreemapStyleOptions,
  WidgetStyleOptions,
} from '@/types.js';

import type {
  CartesianWidgetStyle,
  FunnelWidgetStyle,
  IndicatorWidgetStyle,
  PieWidgetStyle,
  PivotWidgetStyle,
  PolarWidgetStyle,
  ScattermapWidgetStyle,
  ScatterWidgetStyle,
  SunburstWidgetStyle,
  TreemapWidgetStyle,
  WidgetDto,
  WidgetStyle,
  WidgetSubtype,
} from '../types.js';
import {
  toAreamapSubtype,
  toAreaWidgetStyle,
  toAxisStyle,
  toBarWidgetStyle,
  toColumnWidgetStyle,
  toDataLimitsStyle,
  toFunnelWidgetStyle,
  toIndicatorWidgetStyle,
  toLegendStyle,
  toLineWidgetStyle,
  toLineWidthStyle,
  toMarkersStyle,
  toNavigatorStyle,
  toPieWidgetStyle,
  toPivotTableWidgetStyle,
  toPolarWidgetStyle,
  toScattermapWidgetStyle,
  toScatterMarkerSizeStyle,
  toScatterWidgetStyle,
  toSeriesLabelsStyle,
  toSunburstWidgetStyle,
  toTreemapWidgetStyle,
  toWidgetDesign,
  withWidgetDesign,
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

  describe('toAreaWidgetStyle', () => {
    it('returns full cartesian style with defaults when styleOptions is minimal', () => {
      const styleOptions: AreaStyleOptions = {};
      const result = toAreaWidgetStyle(styleOptions, 'area/basic');
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

    it('round-trips with extractStyleOptions for area/basic chart', () => {
      const areaDto = {
        ...cloneDeep(advancedLineChartWidgetDto),
        type: 'chart/area',
        subtype: 'area/basic' as WidgetSubtype,
      } as WidgetDto;
      const styleOptions = extractStyleOptions('chart/area', areaDto);
      const restored = toAreaWidgetStyle(styleOptions as AreaStyleOptions, 'area/basic');

      const original = areaDto.style as CartesianWidgetStyle;
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
    });

    it('maps stacked area seriesLabels and totalLabels to Fusion labels.types', () => {
      const styleOptions: AreaStyleOptions = {
        seriesLabels: {
          enabled: true,
          rotation: 30,
          showValue: true,
          showPercentage: false,
        },
        totalLabels: { enabled: true, rotation: 30 },
      };
      const result = toAreaWidgetStyle(styleOptions, 'area/stacked');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 30,
        labels: {
          enabled: true,
          stacked: true,
          stackedPercentage: false,
          types: {
            count: false,
            percentage: false,
            relative: true,
            totals: true,
          },
        },
      });
    });

    it('maps stacked100 area seriesLabels and totalLabels to Fusion labels.types', () => {
      const styleOptions: AreaStyleOptions = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
          showValue: true,
          showPercentage: true,
        },
        totalLabels: { enabled: true, rotation: 45 },
      };
      const result = toAreaWidgetStyle(styleOptions, 'area/stacked100');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        labels: {
          enabled: true,
          stacked: false,
          stackedPercentage: true,
          types: {
            count: true,
            percentage: true,
            relative: false,
            totals: true,
          },
        },
      });
    });

    it('round-trips stacked area labels through extractStyleOptions', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          labels: {
            enabled: true,
            stacked: true,
            stackedPercentage: false,
            types: {
              count: false,
              percentage: false,
              relative: true,
              totals: true,
            },
          },
        },
      } as CartesianWidgetStyle;

      const widgetDto = {
        type: 'chart/area',
        subtype: 'area/stacked' as WidgetSubtype,
        style: widgetStyle,
        metadata: { panels: [] },
        options: {},
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/area', widgetDto);
      const restored = toAreaWidgetStyle(extracted as AreaStyleOptions, 'area/stacked');
      expect(restored.seriesLabels).toEqual(widgetStyle.seriesLabels);
    });

    it('round-trips stacked100 area labels through extractStyleOptions', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          labels: {
            enabled: true,
            stacked: false,
            stackedPercentage: true,
            types: {
              count: true,
              percentage: false,
              relative: false,
              totals: true,
            },
          },
        },
      } as CartesianWidgetStyle;

      const widgetDto = {
        type: 'chart/area',
        subtype: 'area/stacked100' as WidgetSubtype,
        style: widgetStyle,
        metadata: { panels: [] },
        options: {},
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/area', widgetDto);
      const restored = toAreaWidgetStyle(extracted as AreaStyleOptions, 'area/stacked100');
      expect(restored.seriesLabels).toEqual(widgetStyle.seriesLabels);
    });
  });

  describe('toWidgetDesign', () => {
    const customWidgetTheme: CompleteThemeSettingsInternal['widget'] = {
      spaceAround: 'Medium',
      cornerRadius: 'Small',
      shadow: 'Light',
      border: true,
      borderColor: '#112233',
      header: {
        titleTextColor: '#AABBCC',
        titleAlignment: 'Center',
        dividerLine: true,
        dividerLineColor: '#DDEEFF',
        backgroundColor: '#F0F0F0',
        titleFontSize: 14,
      },
    };

    it('returns undefined when styleOptions has no widget container fields', () => {
      expect(toWidgetDesign({}, customWidgetTheme)).toBeUndefined();
      expect(
        toWidgetDesign(
          { legend: { enabled: true, position: 'bottom' } } as WidgetStyleOptions,
          customWidgetTheme,
        ),
      ).toBeUndefined();
    });

    it('returns widgetDesign when only backgroundColor is set, using theme for other fields', () => {
      const design = toWidgetDesign({ backgroundColor: '#FF0000' }, customWidgetTheme);
      expect(design).toEqual({
        widgetBackgroundColor: '#FF0000',
        widgetSpacing: 'medium',
        widgetCornerRadius: 'small',
        widgetShadow: 'light',
        widgetBorderEnabled: true,
        widgetBorderColor: '#112233',
        widgetTitleColor: '#AABBCC',
        widgetTitleAlignment: 'center',
        widgetTitleDividerEnabled: true,
        widgetTitleDividerColor: '#DDEEFF',
        widgetTitleBackgroundColor: '#F0F0F0',
      });
    });

    it('maps explicit container fields to legacy DTO keys', () => {
      const design = toWidgetDesign(
        {
          backgroundColor: '#FFFFFF',
          spaceAround: 'Large',
          cornerRadius: 'None',
          shadow: 'Dark',
          border: false,
          borderColor: '#000000',
        },
        customWidgetTheme,
      );
      expect(design).toMatchObject({
        widgetBackgroundColor: '#FFFFFF',
        widgetSpacing: 'large',
        widgetCornerRadius: 'none',
        widgetShadow: 'dark',
        widgetBorderEnabled: false,
        widgetBorderColor: '#000000',
      });
    });

    it('merges partial header overrides with theme header defaults', () => {
      const design = toWidgetDesign(
        {
          backgroundColor: '#EEEEEE',
          header: {
            titleTextColor: '#111111',
          },
        },
        customWidgetTheme,
      );
      expect(design).toMatchObject({
        widgetBackgroundColor: '#EEEEEE',
        widgetTitleColor: '#111111',
        widgetTitleAlignment: 'center',
        widgetTitleDividerEnabled: true,
        widgetTitleDividerColor: '#DDEEFF',
        widgetTitleBackgroundColor: '#F0F0F0',
      });
    });
  });

  describe('toIndicatorWidgetStyle', () => {
    const gaugeStyle: GaugeIndicatorStyleOptions = {
      subtype: 'indicator/gauge',
      skin: 1,
      indicatorComponents: {
        title: { shouldBeShown: false, text: 'My KPI' },
        ticks: { shouldBeShown: true },
        labels: { shouldBeShown: true },
      },
    };

    const numericSimpleStyle: NumericSimpleIndicatorStyleOptions = {
      subtype: 'indicator/numeric',
      numericSubtype: 'numericSimple',
      skin: 'horizontal',
      indicatorComponents: {
        title: { shouldBeShown: true, text: 'Revenue' },
        ticks: { shouldBeShown: false },
        labels: { shouldBeShown: false },
      },
    };

    const numericBarStyle: NumericBarIndicatorStyleOptions = {
      subtype: 'indicator/numeric',
      numericSubtype: 'numericBar',
      indicatorComponents: {
        title: { shouldBeShown: true },
      },
    };

    it('maps gauge indicator to DTO style with subtype=round and string skin', () => {
      const result = toIndicatorWidgetStyle(gaugeStyle) as IndicatorWidgetStyle;
      expect(result.subtype).toBe('round');
      expect(result.skin).toBe('1');
    });

    it('maps gauge skin 2 to string "2"', () => {
      const result = toIndicatorWidgetStyle({
        ...gaugeStyle,
        skin: 2,
      } as GaugeIndicatorStyleOptions) as IndicatorWidgetStyle;
      expect(result.skin).toBe('2');
    });

    it('maps numericSimple to subtype=simple with skin preserved', () => {
      const result = toIndicatorWidgetStyle(numericSimpleStyle) as IndicatorWidgetStyle;
      expect(result.subtype).toBe('simple');
      expect(result.skin).toBe('horizontal');
    });

    it('maps numericBar to subtype=bar with no skin', () => {
      const result = toIndicatorWidgetStyle(numericBarStyle) as IndicatorWidgetStyle;
      expect(result.subtype).toBe('bar');
      expect(result.skin).toBeUndefined();
    });

    it('maps indicatorComponents to components enabled flags', () => {
      const result = toIndicatorWidgetStyle(gaugeStyle) as IndicatorWidgetStyle;
      expect(result.components.title.enabled).toBe(false);
      expect(result.components.ticks.enabled).toBe(true);
      expect(result.components.labels.enabled).toBe(true);
      expect(result.components.secondaryTitle).toEqual({ inactive: true, enabled: true });
    });

    it('defaults components to enabled=true when indicatorComponents is absent', () => {
      const minimal: IndicatorStyleOptions = {
        subtype: 'indicator/numeric',
        numericSubtype: 'numericSimple',
        skin: 'vertical',
      };
      const result = toIndicatorWidgetStyle(minimal) as IndicatorWidgetStyle;
      expect(result.components.title.enabled).toBe(true);
      expect(result.components.ticks.enabled).toBe(true);
      expect(result.components.labels.enabled).toBe(true);
    });

    it('round-trips gauge indicator through extractStyleOptions', () => {
      const originalStyle: IndicatorWidgetStyle = {
        subtype: 'round',
        skin: '2',
        components: {
          ticks: { inactive: false, enabled: false },
          labels: { inactive: false, enabled: true },
          title: { inactive: false, enabled: true },
          secondaryTitle: { inactive: true, enabled: true },
        },
      } as unknown as IndicatorWidgetStyle;

      const widgetDto = {
        type: 'indicator',
        subtype: 'indicator/gauge',
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('indicator', widgetDto) as IndicatorStyleOptions;
      const restored = toIndicatorWidgetStyle(extracted) as IndicatorWidgetStyle;

      expect(restored.subtype).toBe(originalStyle.subtype);
      expect(restored.skin).toBe(originalStyle.skin);
      expect(restored.components.ticks.enabled).toBe(originalStyle.components.ticks.enabled);
      expect(restored.components.labels.enabled).toBe(originalStyle.components.labels.enabled);
      expect(restored.components.title.enabled).toBe(originalStyle.components.title.enabled);
    });

    it('round-trips numericSimple indicator through extractStyleOptions', () => {
      const originalStyle: IndicatorWidgetStyle = {
        subtype: 'simple',
        skin: 'horizontal',
        components: {
          ticks: { inactive: false, enabled: true },
          labels: { inactive: false, enabled: false },
          title: { inactive: false, enabled: true },
          secondaryTitle: { inactive: true, enabled: true },
        },
      } as unknown as IndicatorWidgetStyle;

      const widgetDto = {
        type: 'indicator',
        subtype: 'indicator/numeric',
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('indicator', widgetDto) as IndicatorStyleOptions;
      const restored = toIndicatorWidgetStyle(extracted) as IndicatorWidgetStyle;

      expect(restored.subtype).toBe(originalStyle.subtype);
      expect(restored.skin).toBe(originalStyle.skin);
      expect(restored.components.labels.enabled).toBe(originalStyle.components.labels.enabled);
    });
  });

  describe('toPieWidgetStyle', () => {
    it('writes legend, labels and dataLimits from styleOptions', () => {
      const styleOptions: PieStyleOptions = {
        legend: { enabled: false, position: 'right' },
        labels: { enabled: true, categories: true, percent: false, value: true, decimals: true },
        dataLimits: { seriesCapacity: 50, categoriesCapacity: 200 },
      };
      const result = toPieWidgetStyle(styleOptions) as PieWidgetStyle;

      expect(result.legend).toEqual({ enabled: false, position: 'right' });
      expect(result.labels).toEqual({
        enabled: true,
        categories: true,
        percent: false,
        value: true,
        decimals: true,
      });
      expect(result.dataLimits).toEqual({ seriesCapacity: 50, categoriesCapacity: 200 });
      expect(result.convolution).toBeUndefined();
    });

    it('writes convolution when present in styleOptions', () => {
      const styleOptions: PieStyleOptions = {
        convolution: {
          enabled: true,
          selectedConvolutionType: 'bySlicesCount',
          independentSlicesCount: 5,
          minimalIndependentSlicePercentage: 2,
        },
      };
      const result = toPieWidgetStyle(styleOptions) as PieWidgetStyle;
      expect(result.convolution).toEqual({
        enabled: true,
        selectedConvolutionType: 'bySlicesCount',
        independentSlicesCount: 5,
        minimalIndependentSlicePercentage: 2,
      });
    });

    it('applies label defaults when labels is absent', () => {
      const result = toPieWidgetStyle({}) as PieWidgetStyle;
      expect(result.labels).toEqual({
        enabled: true,
        categories: true,
        percent: true,
        value: false,
        decimals: false,
      });
    });

    it('omits dataLimits when absent in styleOptions', () => {
      const result = toPieWidgetStyle({}) as PieWidgetStyle;
      expect(result.dataLimits).toBeUndefined();
    });

    it('round-trips through extractStyleOptions for pie/classic', () => {
      const originalStyle: PieWidgetStyle = {
        legend: { enabled: false, position: 'bottom' },
        labels: { enabled: true, categories: true, value: false, percent: true, decimals: false },
        dataLimits: { seriesCapacity: 100000 },
        convolution: {
          enabled: true,
          selectedConvolutionType: 'bySlicesCount',
          independentSlicesCount: 7,
          minimalIndependentSlicePercentage: 3,
        },
      } as unknown as PieWidgetStyle;

      const widgetDto = {
        type: 'chart/pie',
        subtype: 'pie/classic' as WidgetSubtype,
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/pie', widgetDto) as PieStyleOptions;
      const restored = toPieWidgetStyle(extracted) as PieWidgetStyle;

      expect(restored.legend).toEqual(originalStyle.legend);
      expect(restored.labels).toEqual(originalStyle.labels);
      expect(restored.dataLimits).toEqual(originalStyle.dataLimits);
      expect(restored.convolution).toEqual(originalStyle.convolution);
    });

    it('extractStyleOptions preserves chart/pie subtype (e.g. pie/donut)', () => {
      const widgetDto = {
        type: 'chart/pie',
        subtype: 'pie/donut' as WidgetSubtype,
        style: {
          legend: { enabled: true, position: 'bottom' },
          labels: { enabled: true, categories: true, value: false, percent: true, decimals: false },
        },
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/pie', widgetDto) as PieStyleOptions;
      expect(extracted.subtype).toBe('pie/donut');
    });
  });

  describe('withWidgetDesign', () => {
    const enabledAppSettings = {
      serverFeatures: {
        widgetDesignStyle: {
          key: 'widgetDesignStyle',
          active: true,
        },
      },
    } as AppSettings;

    const disabledAppSettings = {
      serverFeatures: {
        widgetDesignStyle: {
          key: 'widgetDesignStyle',
          active: false,
        },
      },
    } as AppSettings;

    const themeSettings: CompleteThemeSettingsInternal = {
      ...getDefaultThemeSettings(),
      widget: {
        spaceAround: 'Small',
        cornerRadius: 'Medium',
        shadow: 'Medium',
        border: false,
        borderColor: '#THEME_BORDER',
        header: {
          titleTextColor: '#THEME_TITLE',
          titleAlignment: 'Right',
          dividerLine: false,
          dividerLineColor: '#THEME_DIV',
          backgroundColor: '#THEME_HDR_BG',
          titleFontSize: 12,
        },
      },
    };

    const baseStyle = toLineWidgetStyle({}) as WidgetStyle;

    it('returns baseStyle unchanged when appSettings is undefined', () => {
      const result = withWidgetDesign(
        baseStyle,
        { backgroundColor: '#ABC' },
        themeSettings,
        undefined,
      );
      expect(result).toBe(baseStyle);
    });

    it('returns baseStyle unchanged when widget design feature is disabled', () => {
      const result = withWidgetDesign(
        baseStyle,
        { backgroundColor: '#ABC' },
        themeSettings,
        disabledAppSettings,
      );
      expect(result).toBe(baseStyle);
    });

    it('returns baseStyle unchanged when feature is on but there are no container fields', () => {
      const result = withWidgetDesign(baseStyle, {}, themeSettings, enabledAppSettings);
      expect(result).toBe(baseStyle);
    });

    it('merges widgetDesign onto baseStyle when feature is on and container fields exist', () => {
      const result = withWidgetDesign(
        baseStyle,
        { backgroundColor: '#WIDGET_BG' },
        themeSettings,
        enabledAppSettings,
      );
      expect(result).not.toBe(baseStyle);
      expect(result).toMatchObject({
        ...baseStyle,
        widgetDesign: expect.objectContaining({
          widgetBackgroundColor: '#WIDGET_BG',
          widgetSpacing: 'small',
          widgetCornerRadius: 'medium',
          widgetShadow: 'medium',
        }),
      });
    });

    it('does not mutate the original baseStyle', () => {
      const mutableBase = toLineWidgetStyle({}) as WidgetStyle;
      withWidgetDesign(mutableBase, { spaceAround: 'Large' }, themeSettings, enabledAppSettings);
      expect(mutableBase).not.toHaveProperty('widgetDesign');
    });
  });

  describe('toBarWidgetStyle', () => {
    it('returns full cartesian style with defaults when styleOptions is minimal', () => {
      const result = toBarWidgetStyle({}, 'bar/classic');
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.navigator).toEqual({ enabled: false });
      expect(result.seriesLabels).toEqual({ enabled: false, rotation: 0 });
      expect(result.xAxis).toBeDefined();
      expect(result.yAxis).toBeDefined();
      expect(result.lineWidth).toBeUndefined();
      expect(result.markers).toBeUndefined();
      expect(result.dataLimits).toBeUndefined();
    });

    it('round-trips with extractStyleOptions for bar/classic chart', () => {
      const barDto = {
        ...cloneDeep(advancedLineChartWidgetDto),
        type: 'chart/bar',
        subtype: 'bar/classic' as WidgetSubtype,
      } as WidgetDto;
      const styleOptions = extractStyleOptions('chart/bar', barDto);
      const restored = toBarWidgetStyle(styleOptions as StackableStyleOptions, 'bar/classic');

      const original = barDto.style as CartesianWidgetStyle;
      expect(restored.legend).toEqual(original.legend);
      expect(restored.navigator).toEqual(original.navigator);
      expect(restored.seriesLabels).toMatchObject({
        enabled: original.seriesLabels.enabled,
        rotation: original.seriesLabels.rotation,
      });
      expect(restored.xAxis).toMatchObject({
        enabled: original.xAxis.enabled,
        gridLines: original.xAxis.gridLines,
        isIntervalEnabled: original.xAxis.isIntervalEnabled,
        labels: { enabled: original.xAxis.labels.enabled, rotation: 0 },
      });
      expect(restored.yAxis).toMatchObject({
        enabled: original.yAxis.enabled,
        gridLines: original.yAxis.gridLines,
        isIntervalEnabled: original.yAxis.isIntervalEnabled,
        labels: { enabled: original.yAxis.labels.enabled, rotation: 0 },
      });
    });

    it('maps stacked bar seriesLabels to Fusion labels.types', () => {
      const styleOptions: StackableStyleOptions = {
        seriesLabels: { enabled: true, rotation: 0, showValue: true },
        totalLabels: { enabled: true },
      };
      const result = toBarWidgetStyle(styleOptions, 'bar/stacked');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 0,
        labels: {
          enabled: true,
          stacked: true,
          stackedPercentage: false,
          types: { count: false, percentage: false, relative: true, totals: true },
        },
      });
    });

    it('maps stacked100 bar seriesLabels to Fusion labels.types', () => {
      const styleOptions: StackableStyleOptions = {
        seriesLabels: { enabled: true, rotation: 0, showValue: true, showPercentage: true },
        totalLabels: { enabled: true },
      };
      const result = toBarWidgetStyle(styleOptions, 'bar/stacked100');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 0,
        labels: {
          enabled: true,
          stacked: false,
          stackedPercentage: true,
          types: { count: true, percentage: true, relative: false, totals: true },
        },
      });
    });

    it('round-trips stacked bar labels through extractStyleOptions', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          labels: {
            enabled: true,
            stacked: true,
            stackedPercentage: false,
            types: { count: false, percentage: false, relative: true, totals: true },
          },
        },
      } as CartesianWidgetStyle;

      const widgetDto = {
        type: 'chart/bar',
        subtype: 'bar/stacked' as WidgetSubtype,
        style: widgetStyle,
        metadata: { panels: [] },
        options: {},
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/bar', widgetDto);
      const restored = toBarWidgetStyle(extracted as StackableStyleOptions, 'bar/stacked');
      expect(restored.seriesLabels).toEqual(widgetStyle.seriesLabels);
    });

    it('round-trips stacked100 bar labels through extractStyleOptions', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          labels: {
            enabled: true,
            stacked: false,
            stackedPercentage: true,
            types: { count: true, percentage: false, relative: false, totals: false },
          },
        },
      } as CartesianWidgetStyle;

      const widgetDto = {
        type: 'chart/bar',
        subtype: 'bar/stacked100' as WidgetSubtype,
        style: widgetStyle,
        metadata: { panels: [] },
        options: {},
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/bar', widgetDto);
      const restored = toBarWidgetStyle(extracted as StackableStyleOptions, 'bar/stacked100');
      expect(restored.seriesLabels).toEqual(widgetStyle.seriesLabels);
    });
  });

  describe('toColumnWidgetStyle', () => {
    it('returns full cartesian style with defaults when styleOptions is minimal', () => {
      const result = toColumnWidgetStyle({}, 'column/classic');
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.navigator).toEqual({ enabled: false });
      expect(result.seriesLabels).toEqual({ enabled: false, rotation: 0 });
      expect(result.xAxis).toBeDefined();
      expect(result.yAxis).toBeDefined();
    });

    it('maps stacked column seriesLabels to Fusion labels.types', () => {
      const styleOptions: StackableStyleOptions = {
        seriesLabels: { enabled: true, rotation: 15, showValue: true },
        totalLabels: { enabled: false },
      };
      const result = toColumnWidgetStyle(styleOptions, 'column/stackedcolumn');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 15,
        labels: {
          enabled: true,
          stacked: true,
          stackedPercentage: false,
          types: { count: false, percentage: false, relative: true, totals: false },
        },
      });
    });

    it('maps stacked100 column seriesLabels to Fusion labels.types', () => {
      const styleOptions: StackableStyleOptions = {
        seriesLabels: { enabled: true, rotation: 0, showValue: false, showPercentage: true },
        totalLabels: { enabled: true },
      };
      const result = toColumnWidgetStyle(styleOptions, 'column/stackedcolumn100');
      expect(result.seriesLabels).toEqual({
        enabled: true,
        rotation: 0,
        labels: {
          enabled: true,
          stacked: false,
          stackedPercentage: true,
          types: { count: false, percentage: true, relative: false, totals: true },
        },
      });
    });

    it('round-trips stacked column labels through extractStyleOptions', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          labels: {
            enabled: true,
            stacked: false,
            stackedPercentage: true,
            types: { count: false, percentage: true, relative: false, totals: false },
          },
        },
      } as CartesianWidgetStyle;

      const widgetDto = {
        type: 'chart/column',
        subtype: 'column/stackedcolumn100' as WidgetSubtype,
        style: widgetStyle,
        metadata: { panels: [] },
        options: {},
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/column', widgetDto);
      const restored = toColumnWidgetStyle(
        extracted as StackableStyleOptions,
        'column/stackedcolumn100',
      );
      expect(restored.seriesLabels).toEqual(widgetStyle.seriesLabels);
    });
  });

  describe('toPolarWidgetStyle', () => {
    it('returns polar style with sensible defaults when styleOptions is minimal', () => {
      const result = toPolarWidgetStyle({});
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.navigator).toEqual({ enabled: false });
      expect(result.seriesLabels).toEqual({ enabled: false, rotation: 0 });
      expect(result.categories).toBeDefined();
      expect(result.axis).toBeDefined();
      expect(result.dataLimits).toBeUndefined();
      // Polar uses categories/axis, not xAxis/yAxis
      expect(result).not.toHaveProperty('xAxis');
      expect(result).not.toHaveProperty('yAxis');
    });

    it('maps xAxis to categories and yAxis to axis', () => {
      const styleOptions: PolarStyleOptions = {
        xAxis: { enabled: true, gridLines: false, labels: { enabled: false } },
        yAxis: { enabled: false, gridLines: true, labels: { enabled: true } },
      };
      const result = toPolarWidgetStyle(styleOptions);
      expect(result.categories).toMatchObject({ enabled: true, gridLines: false });
      expect(result.axis).toMatchObject({ enabled: false, gridLines: true });
    });

    it('includes dataLimits when present', () => {
      const styleOptions: PolarStyleOptions = {
        dataLimits: { seriesCapacity: 25, categoriesCapacity: 500 },
      };
      const result = toPolarWidgetStyle(styleOptions);
      expect(result.dataLimits).toEqual({ seriesCapacity: 25, categoriesCapacity: 500 });
    });

    it('round-trips with extractStyleOptions for chart/polar', () => {
      const polarWidgetStyle: PolarWidgetStyle = {
        legend: { enabled: false, position: 'right' },
        navigator: { enabled: false },
        categories: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: { enabled: true, rotation: 0 },
          gridLines: false,
          isIntervalEnabled: false,
          title: { enabled: true, text: 'Category Axis' },
        },
        axis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: { enabled: false, rotation: 0 },
          gridLines: true,
          isIntervalEnabled: false,
          title: { enabled: false },
        },
        seriesLabels: { enabled: true, rotation: 45 },
        dataLimits: { seriesCapacity: 10 },
      };

      const widgetDto = {
        type: 'chart/polar',
        subtype: 'column/polar' as WidgetSubtype,
        style: polarWidgetStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/polar', widgetDto) as PolarStyleOptions;
      const restored = toPolarWidgetStyle(extracted);

      expect(restored.legend).toEqual(polarWidgetStyle.legend);
      expect(restored.seriesLabels).toMatchObject({
        enabled: polarWidgetStyle.seriesLabels.enabled,
        rotation: polarWidgetStyle.seriesLabels.rotation,
      });
      expect(restored.categories).toMatchObject({
        enabled: polarWidgetStyle.categories!.enabled,
        gridLines: polarWidgetStyle.categories!.gridLines,
      });
      expect(restored.axis).toMatchObject({
        enabled: polarWidgetStyle.axis!.enabled,
        gridLines: polarWidgetStyle.axis!.gridLines,
      });
      expect(restored.dataLimits).toEqual(polarWidgetStyle.dataLimits);
    });
  });
  describe('toScatterMarkerSizeStyle', () => {
    it('returns undefined when markerSize is undefined', () => {
      expect(toScatterMarkerSizeStyle(undefined)).toBeUndefined();
    });

    it('maps SDK scatter marker size fields to DTO fields', () => {
      expect(
        toScatterMarkerSizeStyle({
          scatterDefaultSize: 10,
          scatterBubbleMinSize: 12,
          scatterBubbleMaxSize: 48,
        }),
      ).toEqual({ defaultSize: 10, min: 12, max: 48 });
    });
  });

  describe('toScatterWidgetStyle', () => {
    it('returns scatter style with sensible defaults when styleOptions is minimal', () => {
      const result = toScatterWidgetStyle({});
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.navigator).toEqual({ enabled: false });
      expect(result.seriesLabels).toEqual({ enabled: false, rotation: 0 });
      expect(result.xAxis).toBeDefined();
      expect(result.yAxis).toBeDefined();
      expect(result.dataLimits).toBeUndefined();
      expect(result.markerSize).toBeUndefined();
    });

    it('maps xAxis and yAxis options through toAxisStyle', () => {
      const styleOptions: ScatterStyleOptions = {
        xAxis: {
          enabled: true,
          gridLines: false,
          labels: { enabled: false },
          title: { enabled: true, text: 'Sales' },
        },
        yAxis: {
          enabled: false,
          gridLines: true,
          labels: { enabled: true },
          title: { enabled: true, text: 'Quantity' },
        },
      };
      const result = toScatterWidgetStyle(styleOptions);
      expect(result.xAxis).toMatchObject({
        enabled: true,
        gridLines: false,
        title: { enabled: true, text: 'Sales' },
      });
      expect(result.yAxis).toMatchObject({
        enabled: false,
        gridLines: true,
        title: { enabled: true, text: 'Quantity' },
      });
    });

    it('includes dataLimits when present', () => {
      const styleOptions: ScatterStyleOptions = {
        dataLimits: { seriesCapacity: 50, categoriesCapacity: 500 },
      };
      const result = toScatterWidgetStyle(styleOptions);
      expect(result.dataLimits).toEqual({ seriesCapacity: 50, categoriesCapacity: 500 });
    });

    it('includes markerSize when present', () => {
      const styleOptions: ScatterStyleOptions = {
        markerSize: {
          scatterDefaultSize: 10,
          scatterBubbleMinSize: 12,
          scatterBubbleMaxSize: 48,
        },
      };
      const result = toScatterWidgetStyle(styleOptions);
      expect(result.markerSize).toEqual({ defaultSize: 10, min: 12, max: 48 });
    });

    it('omits markerSize and dataLimits when not provided', () => {
      const result = toScatterWidgetStyle({});
      expect('markerSize' in result).toBe(false);
      expect('dataLimits' in result).toBe(false);
    });

    it('round-trips with extractStyleOptions for chart/scatter', () => {
      const scatterWidgetStyle: ScatterWidgetStyle = {
        legend: { enabled: false, position: 'right' },
        navigator: { enabled: false },
        xAxis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: { enabled: true, rotation: 0 },
          gridLines: false,
          isIntervalEnabled: false,
          title: { enabled: true, text: 'X Title' },
        },
        yAxis: {
          inactive: false,
          enabled: true,
          ticks: true,
          labels: { enabled: false, rotation: 0 },
          gridLines: true,
          isIntervalEnabled: false,
          title: { enabled: true, text: 'Y Title' },
        },
        seriesLabels: { enabled: true, rotation: 45 },
        dataLimits: { seriesCapacity: 50, categoriesCapacity: 500 },
        markerSize: { defaultSize: 10, min: 12, max: 48 },
      };

      const widgetDto = {
        type: 'chart/scatter',
        subtype: 'bubble/scatter' as WidgetSubtype,
        style: scatterWidgetStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('chart/scatter', widgetDto) as ScatterStyleOptions;
      const restored = toScatterWidgetStyle(extracted);

      expect(restored.legend).toEqual(scatterWidgetStyle.legend);
      expect(restored.seriesLabels).toMatchObject({
        enabled: scatterWidgetStyle.seriesLabels.enabled,
        rotation: scatterWidgetStyle.seriesLabels.rotation,
      });
      expect(restored.xAxis).toMatchObject({
        enabled: scatterWidgetStyle.xAxis.enabled,
        gridLines: scatterWidgetStyle.xAxis.gridLines,
        title: scatterWidgetStyle.xAxis.title,
      });
      expect(restored.yAxis).toMatchObject({
        enabled: scatterWidgetStyle.yAxis.enabled,
        gridLines: scatterWidgetStyle.yAxis.gridLines,
        title: scatterWidgetStyle.yAxis.title,
      });
      expect(restored.dataLimits).toEqual(scatterWidgetStyle.dataLimits);
      expect(restored.markerSize).toEqual(scatterWidgetStyle.markerSize);
    });
  });

  describe('toScattermapWidgetStyle', () => {
    it('returns Fusion defaults when styleOptions is empty', () => {
      const result = toScattermapWidgetStyle({});
      expect(result.markers.fill).toBe('filled');
      expect(result.markers.size).toMatchObject({ defaultSize: 4, min: 4, max: 24 });
    });

    it('maps SDK markerSize (minSize/maxSize/defaultSize) to DTO (min/max/defaultSize)', () => {
      const styleOptions: ScattermapStyleOptions = {
        markers: {
          fill: 'hollow',
          size: { defaultSize: 8, minSize: 6, maxSize: 32 },
        },
      };
      const result = toScattermapWidgetStyle(styleOptions);
      expect(result.markers.fill).toBe('hollow');
      expect(result.markers.size).toMatchObject({ defaultSize: 8, min: 6, max: 32 });
    });

    it('falls back per-field when only some marker fields are provided', () => {
      const styleOptions: ScattermapStyleOptions = {
        markers: { size: { maxSize: 50 } },
      };
      const result = toScattermapWidgetStyle(styleOptions);
      expect(result.markers.fill).toBe('filled');
      expect(result.markers.size).toMatchObject({ defaultSize: 4, min: 4, max: 50 });
    });

    it('round-trips with extractStyleOptions for map/scatter', () => {
      const scattermapWidgetStyle: ScattermapWidgetStyle = {
        markers: {
          fill: 'hollow-bold',
          size: { defaultSize: 10, min: 8, max: 40 },
        },
      };

      const widgetDto = {
        type: 'map/scatter',
        subtype: 'map/scatter' as WidgetSubtype,
        style: scattermapWidgetStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('map/scatter', widgetDto) as ScattermapStyleOptions;
      const restored = toScattermapWidgetStyle(extracted);

      expect(restored.markers.fill).toBe(scattermapWidgetStyle.markers.fill);
      expect(restored.markers.size).toMatchObject({
        defaultSize: scattermapWidgetStyle.markers.size.defaultSize,
        min: scattermapWidgetStyle.markers.size.min,
        max: scattermapWidgetStyle.markers.size.max,
      });
    });
  });

  describe('toAreamapSubtype', () => {
    it('maps mapType "usa" to DTO subtype "areamap/usa"', () => {
      expect(toAreamapSubtype('usa')).toBe('areamap/usa');
    });

    it('maps mapType "world" to DTO subtype "areamap/world"', () => {
      expect(toAreamapSubtype('world')).toBe('areamap/world');
    });

    it('defaults to "areamap/world" when mapType is undefined', () => {
      expect(toAreamapSubtype(undefined)).toBe('areamap/world');
    });

    it('round-trips with extractStyleOptions for map/area (world)', () => {
      const widgetDto = {
        type: 'map/area',
        subtype: 'areamap/world' as WidgetSubtype,
        style: {},
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('map/area', widgetDto) as AreamapStyleOptions;
      expect(extracted.mapType).toBe('world');
      expect(toAreamapSubtype(extracted.mapType)).toBe('areamap/world');
    });

    it('round-trips with extractStyleOptions for map/area (usa)', () => {
      const widgetDto = {
        type: 'map/area',
        subtype: 'areamap/usa' as WidgetSubtype,
        style: {},
        metadata: { panels: [] },
      } as unknown as WidgetDto;

      const extracted = extractStyleOptions('map/area', widgetDto) as AreamapStyleOptions;
      expect(extracted.mapType).toBe('usa');
      expect(toAreamapSubtype(extracted.mapType)).toBe('areamap/usa');
    });
  });

  describe('toFunnelWidgetStyle', () => {
    it('returns default funnel style when styleOptions is minimal', () => {
      const result = toFunnelWidgetStyle({});
      expect(result.legend).toEqual({ enabled: true, position: 'bottom' });
      expect(result.size).toBe('regular');
      expect(result.type).toBe('regular');
      expect(result.direction).toBe('regular');
      expect(result.labels).toEqual({
        enabled: true,
        categories: true,
        percent: true,
        value: false,
        decimals: false,
      });
    });

    it('restores funnelSize, funnelType, funnelDirection from styleOptions', () => {
      const styleOptions: FunnelStyleOptions = {
        funnelSize: 'wide',
        funnelType: 'pinched',
        funnelDirection: 'inverted',
      };
      const result = toFunnelWidgetStyle(styleOptions);
      expect(result.size).toBe('wide');
      expect(result.type).toBe('pinched');
      expect(result.direction).toBe('inverted');
    });

    it('restores labels from styleOptions.labels', () => {
      const styleOptions: FunnelStyleOptions = {
        labels: { enabled: false, categories: false, percent: false, value: true, decimals: true },
      };
      const result = toFunnelWidgetStyle(styleOptions);
      expect(result.labels).toEqual({
        enabled: false,
        categories: false,
        percent: false,
        value: true,
        decimals: true,
      });
    });

    it('round-trips with extractStyleOptions for chart/funnel', () => {
      const originalStyle: FunnelWidgetStyle = {
        legend: { enabled: true, position: 'bottom' },
        navigator: { enabled: false },
        size: 'narrow',
        type: 'pinched',
        direction: 'inverted',
        labels: { enabled: true, categories: true, percent: false, value: true, decimals: true },
      } as FunnelWidgetStyle;
      const widgetDto = {
        type: 'chart/funnel',
        subtype: 'chart/funnel' as WidgetSubtype,
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;
      const extracted = extractStyleOptions('chart/funnel', widgetDto) as FunnelStyleOptions;
      const restored = toFunnelWidgetStyle(extracted);
      expect(restored.size).toBe(originalStyle.size);
      expect(restored.type).toBe(originalStyle.type);
      expect(restored.direction).toBe(originalStyle.direction);
      expect(restored.labels).toEqual(originalStyle.labels);
      expect(restored.legend).toEqual(originalStyle.legend);
    });
  });

  describe('toTreemapWidgetStyle', () => {
    it('returns default treemap style when styleOptions is minimal', () => {
      const result = toTreemapWidgetStyle({});
      expect(result['title/1']).toBe(true);
      expect(result['title/2']).toBe(true);
      expect(result['title/3']).toBe(true);
      expect(result['tooltip/value']).toBe(true);
      expect(result['tooltip/contribution']).toBe(false);
    });

    it('restores category label visibility per level', () => {
      const styleOptions: TreemapStyleOptions = {
        labels: {
          category: [{ enabled: true }, { enabled: false }, { enabled: true }],
        },
      };
      const result = toTreemapWidgetStyle(styleOptions);
      expect(result['title/1']).toBe(true);
      expect(result['title/2']).toBe(false);
      expect(result['title/3']).toBe(true);
    });

    it('maps tooltip contribution mode to tooltip/value=false', () => {
      const result = toTreemapWidgetStyle({ tooltip: { mode: 'contribution' } });
      expect(result['tooltip/value']).toBe(false);
      expect(result['tooltip/contribution']).toBe(true);
    });

    it('maps tooltip value mode to tooltip/value=true', () => {
      const result = toTreemapWidgetStyle({ tooltip: { mode: 'value' } });
      expect(result['tooltip/value']).toBe(true);
      expect(result['tooltip/contribution']).toBe(false);
    });

    it('round-trips with extractStyleOptions for treemap', () => {
      const originalStyle: TreemapWidgetStyle = {
        'title/1': true,
        'title/2': false,
        'title/3': true,
        'tooltip/value': false,
        'tooltip/contribution': true,
      };
      const widgetDto = {
        type: 'treemap',
        subtype: 'treemap' as WidgetSubtype,
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;
      const extracted = extractStyleOptions('treemap', widgetDto) as TreemapStyleOptions;
      const restored = toTreemapWidgetStyle(extracted);
      expect(restored['title/1']).toBe(originalStyle['title/1']);
      expect(restored['title/2']).toBe(originalStyle['title/2']);
      expect(restored['title/3']).toBe(originalStyle['title/3']);
      expect(restored['tooltip/value']).toBe(originalStyle['tooltip/value']);
      expect(restored['tooltip/contribution']).toBe(originalStyle['tooltip/contribution']);
    });
  });

  describe('toSunburstWidgetStyle', () => {
    it('returns default sunburst style when styleOptions is minimal', () => {
      const result = toSunburstWidgetStyle({});
      expect(result['legend/enabled']).toBe(true);
      expect(result['legend/position']).toBe('bottom');
      expect(result['tooltip/value']).toBe(true);
      expect(result['tooltip/contribution']).toBe(false);
    });

    it('restores legend enabled and position', () => {
      const styleOptions: SunburstStyleOptions = {
        legend: { enabled: false, position: 'top' },
      };
      const result = toSunburstWidgetStyle(styleOptions);
      expect(result['legend/enabled']).toBe(false);
      expect(result['legend/position']).toBe('top');
    });

    it('maps tooltip contribution mode to tooltip/value=false', () => {
      const result = toSunburstWidgetStyle({ tooltip: { mode: 'contribution' } });
      expect(result['tooltip/value']).toBe(false);
      expect(result['tooltip/contribution']).toBe(true);
    });

    it('round-trips with extractStyleOptions for sunburst', () => {
      const originalStyle: SunburstWidgetStyle = {
        'legend/enabled': false,
        'legend/position': 'right',
        'tooltip/value': false,
        'tooltip/contribution': true,
      };
      const widgetDto = {
        type: 'sunburst',
        subtype: 'sunburst' as WidgetSubtype,
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;
      const extracted = extractStyleOptions('sunburst', widgetDto) as SunburstStyleOptions;
      const restored = toSunburstWidgetStyle(extracted);
      expect(restored['legend/enabled']).toBe(originalStyle['legend/enabled']);
      expect(restored['legend/position']).toBe(originalStyle['legend/position']);
      expect(restored['tooltip/value']).toBe(originalStyle['tooltip/value']);
      expect(restored['tooltip/contribution']).toBe(originalStyle['tooltip/contribution']);
    });
  });

  describe('toPivotTableWidgetStyle', () => {
    it('returns an empty colors object and no style scalars for minimal input', () => {
      const result = toPivotTableWidgetStyle({});
      expect(result).toEqual({ colors: {} });
    });

    it('maps color flags to colors.* on the DTO', () => {
      const styleOptions: PivotTableWidgetStyleOptions = {
        alternatingRowsColor: true,
        alternatingColumnsColor: false,
        headersColor: true,
        membersColor: false,
        totalsColor: true,
      };
      const result = toPivotTableWidgetStyle(styleOptions);
      expect(result.colors).toEqual({
        rows: true,
        columns: false,
        headers: true,
        members: false,
        totals: true,
      });
    });

    it('maps rowsPerPage, isAutoHeight, and rowHeight to DTO fields', () => {
      const styleOptions: PivotTableWidgetStyleOptions = {
        rowsPerPage: 50,
        isAutoHeight: true,
        rowHeight: 30,
      };
      const result = toPivotTableWidgetStyle(styleOptions);
      expect(result.pageSize).toBe(50);
      expect(result.automaticHeight).toBe(true);
      expect(result.rowHeight).toBe(30);
    });

    it('omits pageSize, automaticHeight, and rowHeight when the SDK fields are undefined', () => {
      const result = toPivotTableWidgetStyle({});
      expect('pageSize' in result).toBe(false);
      expect('automaticHeight' in result).toBe(false);
      expect('rowHeight' in result).toBe(false);
    });

    it('writes grandTotals.rows/columns to rowsGrandTotal/columnsGrandTotal', () => {
      const result = toPivotTableWidgetStyle({}, { rows: true, columns: false });
      expect(result.rowsGrandTotal).toBe(true);
      expect(result.columnsGrandTotal).toBe(false);
    });

    it('omits rowsGrandTotal/columnsGrandTotal when grandTotals is undefined', () => {
      const result = toPivotTableWidgetStyle({});
      expect('rowsGrandTotal' in result).toBe(false);
      expect('columnsGrandTotal' in result).toBe(false);
    });

    it('omits individual grand total flags that are undefined', () => {
      const result = toPivotTableWidgetStyle({}, { rows: true });
      expect(result.rowsGrandTotal).toBe(true);
      expect('columnsGrandTotal' in result).toBe(false);
    });

    it('round-trips with extractStyleOptions for pivot', () => {
      const originalStyle: PivotWidgetStyle = {
        pageSize: 40,
        automaticHeight: false,
        rowHeight: 32,
        colors: {
          rows: true,
          columns: false,
          headers: true,
          members: false,
          totals: true,
        },
      };
      const widgetDto = {
        type: 'pivot2',
        subtype: 'pivot2' as WidgetSubtype,
        style: originalStyle,
        metadata: { panels: [] },
      } as unknown as WidgetDto;
      const extracted = extractStyleOptions('pivot2', widgetDto) as PivotTableWidgetStyleOptions;
      const restored = toPivotTableWidgetStyle(extracted);
      expect(restored.pageSize).toBe(originalStyle.pageSize);
      expect(restored.automaticHeight).toBe(originalStyle.automaticHeight);
      expect(restored.rowHeight).toBe(originalStyle.rowHeight);
      expect(restored.colors).toEqual(originalStyle.colors);
    });
  });
});
