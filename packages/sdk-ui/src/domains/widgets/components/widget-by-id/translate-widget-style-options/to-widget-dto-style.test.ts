import cloneDeep from 'lodash-es/cloneDeep';
import { describe, expect, it } from 'vitest';

import { advancedLineChartWidgetDto } from '@/domains/dashboarding/dashboard-model/__mocks__/advanced-line-chart-widget.js';
import type { AppSettings } from '@/infra/app/settings/settings';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import type {
  AreaStyleOptions,
  AxisLabel,
  CompleteThemeSettings,
  DataLimits,
  GaugeIndicatorStyleOptions,
  IndicatorStyleOptions,
  LegendOptions,
  LineStyleOptions,
  Markers,
  Navigator,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  PieStyleOptions,
  WidgetStyleOptions,
} from '@/types.js';

import type {
  CartesianWidgetStyle,
  IndicatorWidgetStyle,
  PieWidgetStyle,
  WidgetDto,
  WidgetStyle,
  WidgetSubtype,
} from '../types.js';
import {
  toAreaWidgetStyle,
  toAxisStyle,
  toDataLimitsStyle,
  toIndicatorWidgetStyle,
  toLegendStyle,
  toLineWidgetStyle,
  toLineWidthStyle,
  toMarkersStyle,
  toNavigatorStyle,
  toPieWidgetStyle,
  toSeriesLabelsStyle,
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
    const customWidgetTheme: CompleteThemeSettings['widget'] = {
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

    const themeSettings: CompleteThemeSettings = {
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
});
