import { measureFactory, MetadataTypes } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import { advancedLineChartWidgetDto } from '@/domains/dashboarding/dashboard-model/__mocks__/advanced-line-chart-widget.js';
import { sampleEcommerceDashboard as dashboardMock } from '@/domains/dashboarding/dashboard-model/__mocks__/sample-ecommerce-dashboard.js';
import { samplePivotDashboard } from '@/domains/dashboarding/dashboard-model/__mocks__/sample-pivot-dashboard.js';
import { jumpToDashboardConfigFromWidgetDto } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils.js';
import type { JtdConfigDto } from '@/domains/dashboarding/hooks/jtd/jtd-types';
import type { WidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';
import {
  BoxplotChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import type { CustomWidgetProps } from '@/domains/widgets/components/custom-widget/types';
import {
  BoxplotWidgetStyle,
  CalendarHeatmapWidgetStyle,
  CartesianWidgetStyle,
  PivotWidgetStyle,
  ScattermapWidgetStyle,
  ScatterWidgetStyle,
  TabberWidgetDtoStyle,
} from '@/domains/widgets/components/widget-by-id/types';
import { WidgetDto } from '@/index';
import { AppSettings } from '@/infra/app/settings/settings';
import {
  CalendarHeatmapStyleOptions,
  CompleteThemeSettingsInternal,
  PivotTableWidgetStyleOptions,
} from '@/types';

import type { WidgetModel } from '../widget-model.js';
import {
  fromChartWidgetProps,
  fromCustomWidgetProps,
  fromPivotTableWidgetProps,
  fromWidgetDto,
  fromWidgetProps,
  toChartWidgetProps,
  toCommonWidgetProps,
  toCustomWidgetProps,
  toJtdConfig,
  toPivotTableWidgetProps,
  toWidgetDto,
} from './widget-model-translator.js';

/** Minimal versioned JTD DTO for chart widgets (see translate-dashboard-utils). */
const minimalChartJtdDto: JtdConfigDto = {
  drilledDashboardPrefix: '_drill',
  drilledDashboardsFolderPrefix: '',
  displayFilterPane: true,
  displayDashboardsPane: true,
  displayToolbarRow: true,
  displayHeaderRow: true,
  volatile: false,
  hideDrilledDashboards: true,
  hideSharedDashboardsForNonOwner: true,
  drillToDashboardRightMenuCaption: 'Jump to ',
  drillToDashboardNavigateType: 1,
  drillToDashboardNavigateTypePivot: 2,
  drillToDashboardNavigateTypeCharts: 1,
  drillToDashboardNavigateTypeOthers: 3,
  drilledDashboardDisplayType: 2,
  dashboardIds: [{ id: 'target-dash', caption: 'Target', oid: 'target-dash' }],
  modalWindowResize: false,
  showFolderNameOnMenuSelection: false,
  resetDashFiltersAfterJTD: false,
  sameCubeRestriction: true,
  showJTDIcon: true,
  sendPieChartMeasureFiltersOnClick: true,
  forceZeroInsteadNull: false,
  mergeTargetDashboardFilters: false,
  drillToDashboardByName: false,
  sendBreakByValueFilter: true,
  ignoreFiltersSource: false,
  version: '1',
};

describe('WidgetModelTranslator', () => {
  const mockIndicatorWidgetDto = dashboardMock.widgets![0];
  const mockLineWidgetDto = dashboardMock.widgets![7];
  const mockTableWidgetDto = dashboardMock.widgets![9];
  const mockPieWidgetDto = dashboardMock.widgets![2];
  const mockScatterWidgetDto = dashboardMock.widgets![6];
  const mockPolarFilteredWidgetDto = dashboardMock.widgets![10];
  const mockTreemapWidgetDto = dashboardMock.widgets![11];

  let resWidgetDto: WidgetDto;

  const getWidgetTransformChain = (widgetDto: WidgetDto) => {
    const widget = fromWidgetDto(widgetDto);
    const chartProps = toChartWidgetProps(widget);
    const widgetFromChart = fromChartWidgetProps(chartProps);
    return { widget, chartProps, widgetFromChart };
  };

  describe('fromChartWidgetProps + toWidgetDto', () => {
    it('should create a valid WidgetDto for the "line"(carthesian) chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockLineWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe(mockLineWidgetDto.type);
      expect(resWidgetDto.metadata.panels[0].name).toBe('x-axis');
      expect(resWidgetDto.metadata.panels[1].name).toBe('values');

      const expectedStyle = mockLineWidgetDto.style as CartesianWidgetStyle;
      expect(resWidgetDto.style).toMatchObject({
        legend: expectedStyle.legend,
        navigator: expectedStyle.navigator,
        seriesLabels: expectedStyle.seriesLabels,
        lineWidth: expectedStyle.lineWidth,
        markers: expectedStyle.markers,
        dataLimits: expectedStyle.dataLimits,
      });
    });

    it('should create a valid WidgetDto for the "area"(cartesian) chart', () => {
      const mockAreaWidgetDto = {
        ...cloneDeep(mockLineWidgetDto),
        type: 'chart/area',
        subtype: 'area/basic',
      } as WidgetDto;

      const { widgetFromChart } = getWidgetTransformChain(mockAreaWidgetDto);
      expect(widgetFromChart.chartType).toBe('area');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe('chart/area');
      expect(resWidgetDto.subtype).toBe('area/basic');
      expect(resWidgetDto.metadata.panels[0].name).toBe('x-axis');

      const expectedStyle = mockAreaWidgetDto.style as CartesianWidgetStyle;
      expect(resWidgetDto.style).toMatchObject({
        legend: expectedStyle.legend,
        navigator: expectedStyle.navigator,
        seriesLabels: expectedStyle.seriesLabels,
        lineWidth: expectedStyle.lineWidth,
        markers: expectedStyle.markers,
        dataLimits: expectedStyle.dataLimits,
      });
    });

    it('should create a valid WidgetDto for the "line" chart with advanced analytics', () => {
      const { widgetFromChart } = getWidgetTransformChain(advancedLineChartWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe(advancedLineChartWidgetDto.type);

      resWidgetDto.metadata.panels[1].items.forEach((actualItem, index) => {
        const expectedItem = advancedLineChartWidgetDto.metadata.panels[1].items[index];
        expect(actualItem.panel).toBe(expectedItem.panel);
        expect(actualItem.y2).toBe(expectedItem.y2);
        expect(actualItem.statisticalModels).toStrictEqual(expectedItem.statisticalModels);
        expect(actualItem.format?.color).toStrictEqual(expectedItem.format?.color);
      });

      const expectedStyle = advancedLineChartWidgetDto.style as CartesianWidgetStyle;
      expect(resWidgetDto.style).toMatchObject({
        legend: expectedStyle.legend,
        navigator: expectedStyle.navigator,
        seriesLabels: expectedStyle.seriesLabels,
        lineWidth: expectedStyle.lineWidth,
        markers: expectedStyle.markers,
        dataLimits: expectedStyle.dataLimits,
      });
    });

    it('should create a valid WidgetDto for the "table" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTableWidgetDto);
      expect(widgetFromChart.chartType).toBe('table');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe('tablewidget');
      expect(resWidgetDto.subtype).toBe('tablewidget');
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);

      const columnsPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'columns');
      expect(columnsPanel).toBeDefined();
      expect(columnsPanel!.items).toHaveLength(2);
      expect((columnsPanel!.items[0].jaql as any).dim).toBe('[Commerce.Brand ID]');
      expect((columnsPanel!.items[1].jaql as any).dim).toBe('[Brand.Brand]');

      // Style round-trip
      const mockStyle = mockTableWidgetDto.style as any;
      const resultStyle = resWidgetDto.style as any;
      expect(resultStyle.pageSize).toBe(mockStyle.pageSize);
      expect(resultStyle['colors/headers']).toBe(mockStyle['colors/headers']);
      expect(resultStyle['colors/rows']).toBe(mockStyle['colors/rows']);
      expect(resultStyle['colors/columns']).toBe(mockStyle['colors/columns']);
      expect(resultStyle['width/content']).toBe(mockStyle['width/content']);
      expect(resultStyle['width/window']).toBe(mockStyle['width/window']);
    });

    it('should create a valid WidgetDto for a "table" with measure columns', () => {
      const tableWithMeasureDto = {
        ...cloneDeep(mockTableWidgetDto),
        metadata: {
          panels: [
            {
              name: 'columns',
              items: [
                {
                  jaql: {
                    table: 'Brand',
                    column: 'Brand',
                    dim: '[Brand.Brand]',
                    datatype: 'text',
                    merged: true,
                    title: 'Brand',
                  },
                  panel: 'rows',
                },
                {
                  jaql: {
                    table: 'Commerce',
                    column: 'Revenue',
                    dim: '[Commerce.Revenue]',
                    datatype: 'numeric',
                    agg: 'sum',
                    title: 'Total Revenue',
                  },
                  panel: 'rows',
                },
              ],
            },
            { name: 'filters', items: [] },
          ],
        },
      } as WidgetDto;

      const { widgetFromChart } = getWidgetTransformChain(tableWithMeasureDto);
      expect(widgetFromChart.chartType).toBe('table');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe('tablewidget');

      const columnsPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'columns');
      expect(columnsPanel).toBeDefined();
      expect(columnsPanel!.items).toHaveLength(2);

      // Attribute column comes first
      expect((columnsPanel!.items[0].jaql as any).dim).toBe('[Brand.Brand]');
      expect((columnsPanel!.items[0].jaql as any).agg).toBeUndefined();

      // Measure column with aggregation
      expect((columnsPanel!.items[1].jaql as any).dim).toBe('[Commerce.Revenue]');
      expect((columnsPanel!.items[1].jaql as any).agg).toBe('sum');
    });

    it('should create a valid WidgetDto for the "indicator" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockIndicatorWidgetDto);
      expect(widgetFromChart.chartType).toBe('indicator');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.subtype).toBe('indicator/gauge');
      expect((resWidgetDto.style as any).skin).toBe('1');
      expect(resWidgetDto.type).toBe(mockIndicatorWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "pie"(categorical) chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockPieWidgetDto);
      expect(widgetFromChart.chartType).toBe('pie');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect((resWidgetDto.style as any).convolution.minimalIndependentSlicePercentage).toBe(3);
      expect(resWidgetDto.type).toBe(mockPieWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "scatter" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockScatterWidgetDto);
      expect(widgetFromChart.chartType).toBe('scatter');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'y-axis').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'x-axis').length).toBe(1);
      expect(resWidgetDto.type).toBe(mockScatterWidgetDto.type);
      expect(resWidgetDto.subtype).toBe(mockScatterWidgetDto.subtype);

      const panelNames = resWidgetDto.metadata.panels
        .map(({ name }) => name)
        .filter((name) => name !== 'filters');
      expect(panelNames).toEqual(['x-axis', 'y-axis', 'point', 'Break By / Color', 'size']);

      const expectedStyle = mockScatterWidgetDto.style as ScatterWidgetStyle;
      expect(resWidgetDto.style).toMatchObject({
        legend: expectedStyle.legend,
        navigator: { enabled: false },
        seriesLabels: expectedStyle.seriesLabels,
      });
      expect((resWidgetDto.style as ScatterWidgetStyle).xAxis).toMatchObject({
        enabled: expectedStyle.xAxis.enabled,
        gridLines: expectedStyle.xAxis.gridLines,
        title: expectedStyle.xAxis.title,
      });
      expect((resWidgetDto.style as ScatterWidgetStyle).yAxis).toMatchObject({
        enabled: expectedStyle.yAxis.enabled,
        gridLines: expectedStyle.yAxis.gridLines,
        title: expectedStyle.yAxis.title,
      });
      const expectedMarkerSize = expectedStyle.markerSize;
      expect(expectedMarkerSize).toBeDefined();
      expect((resWidgetDto.style as ScatterWidgetStyle).markerSize).toEqual({
        defaultSize: expectedMarkerSize?.defaultSize,
        min: expectedMarkerSize?.min,
        max: expectedMarkerSize?.max,
      });
    });

    it('should always emit all scatter panels even when slots are empty', () => {
      const widget = fromWidgetDto(mockScatterWidgetDto);
      // Strip every scatter slot so only filters are left.
      const emptyDataOptions = {
        x: undefined,
        y: undefined,
        breakByPoint: undefined,
        breakByColor: undefined,
        size: undefined,
      };
      const widgetWithNoSlots = {
        ...widget,
        dataOptions: emptyDataOptions,
      } as typeof widget;

      resWidgetDto = toWidgetDto(widgetWithNoSlots);

      const nonFilterPanels = resWidgetDto.metadata.panels.filter(({ name }) => name !== 'filters');
      expect(nonFilterPanels.map(({ name }) => name)).toEqual([
        'x-axis',
        'y-axis',
        'point',
        'Break By / Color',
        'size',
      ]);
      nonFilterPanels.forEach((panel) => expect(panel.items).toEqual([]));
    });

    it('should drop "point" items when neither x nor y is a measure (Fusion breakByPoint dependency)', () => {
      const widget = fromWidgetDto(mockScatterWidgetDto);
      // The mock has measure x/y and text breakByPoint/breakByColor. Swap axes with
      // the text columns so neither axis is a measure; breakByPoint must then be empty.
      const base = widget.dataOptions as Record<string, unknown>;
      const widgetWithoutMeasureAxis = {
        ...widget,
        dataOptions: {
          x: base.breakByPoint,
          y: base.breakByColor,
          breakByPoint: base.breakByPoint,
          breakByColor: base.breakByColor,
          size: base.size,
        },
      } as unknown as typeof widget;

      resWidgetDto = toWidgetDto(widgetWithoutMeasureAxis);

      const pointPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'point');
      expect(pointPanel).toBeDefined();
      expect(pointPanel!.items).toEqual([]);

      // Other populated slots still get items.
      const xPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'x-axis');
      expect(xPanel!.items).toHaveLength(1);
      const breakByColorPanel = resWidgetDto.metadata.panels.find(
        ({ name }) => name === 'Break By / Color',
      );
      expect(breakByColorPanel!.items).toHaveLength(1);
      const sizePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'size');
      expect(sizePanel!.items).toHaveLength(1);
    });

    it('should keep "point" items when at least one axis is a measure', () => {
      const widget = fromWidgetDto(mockScatterWidgetDto);
      const base = widget.dataOptions as Record<string, unknown>;
      const widgetWithMeasureY = {
        ...widget,
        dataOptions: {
          x: base.breakByPoint, // text
          y: base.y, // measure
          breakByPoint: base.breakByPoint,
        },
      } as unknown as typeof widget;

      resWidgetDto = toWidgetDto(widgetWithMeasureY);

      const pointPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'point');
      expect(pointPanel!.items).toHaveLength(1);
    });

    it('should drop "point" items when only one axis is populated', () => {
      const widget = fromWidgetDto(mockScatterWidgetDto);
      const base = widget.dataOptions as Record<string, unknown>;
      const widgetWithOneAxis = {
        ...widget,
        dataOptions: {
          x: base.x,
          y: undefined,
          breakByPoint: base.breakByPoint,
        },
      } as unknown as typeof widget;

      resWidgetDto = toWidgetDto(widgetWithOneAxis);

      const pointPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'point');
      expect(pointPanel!.items).toEqual([]);
    });

    it('should write seriesToColorMap to the "Break By / Color" panel item format.members', () => {
      const widget = fromWidgetDto(mockScatterWidgetDto);
      const scatterDataOptions = {
        ...(widget.dataOptions as object),
        seriesToColorMap: { Male: '#ff0000', Female: '#00ff00' },
      };
      const widgetWithColors = { ...widget, dataOptions: scatterDataOptions } as typeof widget;

      resWidgetDto = toWidgetDto(widgetWithColors);

      const breakByColorPanel = resWidgetDto.metadata.panels.find(
        ({ name }) => name === 'Break By / Color',
      );
      expect(breakByColorPanel).toBeDefined();
      expect(breakByColorPanel!.items).toHaveLength(1);
      expect(breakByColorPanel!.items[0].format?.members).toEqual({
        Male: { color: '#ff0000', colored: true, isHandPickedColor: true },
        Female: { color: '#00ff00', colored: true, isHandPickedColor: true },
      });
    });

    describe('scattermap widget', () => {
      const makeScattermapWidgetDto = (
        overrides: Partial<WidgetDto['metadata']['panels'][number]>[] = [],
      ): WidgetDto =>
        ({
          oid: 'scattermap-oid',
          title: 'scattermap',
          desc: null,
          type: 'map/scatter',
          subtype: 'map/scatter',
          datasource: {
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            address: 'LocalHost',
            database: 'aSampleIAAaECommerce',
          },
          metadata: {
            panels: [
              {
                name: 'geo',
                items: [
                  {
                    jaql: {
                      table: 'Country',
                      column: 'Country',
                      dim: '[Country.Country]',
                      datatype: 'text',
                      merged: true,
                      title: 'Country',
                    },
                    geoLevel: 'country',
                  },
                ],
              },
              {
                name: 'color',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Revenue',
                      dim: '[Commerce.Revenue]',
                      datatype: 'numeric',
                      agg: 'sum',
                      title: 'Total Revenue',
                    },
                  },
                ],
              },
              {
                name: 'size',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Cost',
                      dim: '[Commerce.Cost]',
                      datatype: 'numeric',
                      agg: 'sum',
                      title: 'Total Cost',
                    },
                  },
                ],
              },
              { name: 'details', items: [] },
              { name: 'filters', items: [] },
              ...overrides,
            ],
          },
          style: {
            markers: {
              fill: 'filled',
              size: { inactive: false, min: 4, max: 24, defaultSize: 4 },
            },
          },
        } as unknown as WidgetDto);

      it('should create a valid WidgetDto for the "scattermap" chart', () => {
        const mockDto = makeScattermapWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect(widgetFromChart.chartType).toBe('scattermap');

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.type).toBe('map/scatter');
        expect(resWidgetDto.subtype).toBe('map/scatter');

        const panelNames = resWidgetDto.metadata.panels
          .map(({ name }) => name)
          .filter((name) => name !== 'filters');
        expect(panelNames).toEqual(['geo', 'color', 'size', 'details']);

        const geoPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'geo');
        expect(geoPanel!.items).toHaveLength(1);
        expect(geoPanel!.items[0].geoLevel).toBe('country');

        const colorPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'color');
        expect(colorPanel!.items).toHaveLength(1);
        const sizePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'size');
        expect(sizePanel!.items).toHaveLength(1);
      });

      it('should translate scattermap markers style (fill + size defaults + min/max) back into the DTO style', () => {
        const mockDto = makeScattermapWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const expectedMarkers = (mockDto.style as ScattermapWidgetStyle).markers;
        const resultStyle = resWidgetDto.style as ScattermapWidgetStyle;
        expect(resultStyle.markers.fill).toBe(expectedMarkers.fill);
        expect(resultStyle.markers.size).toMatchObject({
          defaultSize: expectedMarkers.size.defaultSize,
          min: expectedMarkers.size.min,
          max: expectedMarkers.size.max,
        });
      });

      it('should always emit all scattermap panels even when slots are empty', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetWithNoSlots = {
          ...widget,
          dataOptions: { geo: [], colorBy: undefined, size: undefined, details: undefined },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithNoSlots);

        const nonFilterPanels = resWidgetDto.metadata.panels.filter(
          ({ name }) => name !== 'filters',
        );
        expect(nonFilterPanels.map(({ name }) => name)).toEqual([
          'geo',
          'color',
          'size',
          'details',
        ]);
        nonFilterPanels.forEach((panel) => expect(panel.items).toEqual([]));
      });

      it('should preserve geoLevel on geo items when present on styled columns', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const base = widget.dataOptions as Record<string, unknown>;
        const geoColumn = (base.geo as unknown[])[0] as Record<string, unknown>;
        const widgetWithStateLevel = {
          ...widget,
          dataOptions: {
            ...base,
            geo: [{ ...geoColumn, geoLevel: 'state' }],
          },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithStateLevel);

        const geoPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'geo');
        expect(geoPanel!.items[0].geoLevel).toBe('state');
      });

      it('should omit geoLevel when the column level is "auto"', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const base = widget.dataOptions as Record<string, unknown>;
        const geoColumn = (base.geo as unknown[])[0] as Record<string, unknown>;
        const widgetWithAutoLevel = {
          ...widget,
          dataOptions: {
            ...base,
            geo: [{ ...geoColumn, geoLevel: 'auto' }],
          },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithAutoLevel);

        const geoPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'geo');
        expect(geoPanel!.items[0].geoLevel).toBeUndefined();
      });

      it('should write marker min/max to the size panel item format.size (Fusion reads this at widget load)', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetWithMarkers = {
          ...widget,
          styleOptions: {
            markers: {
              fill: 'filled',
              size: { defaultSize: 10, minSize: 8, maxSize: 40 },
            },
          },
        } as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithMarkers);

        const sizePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'size');
        expect(sizePanel!.items).toHaveLength(1);
        expect(sizePanel!.items[0].format?.size).toEqual({ min: 8, max: 40 });
      });

      it('should not attach format.size when no marker-size options are provided', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetNoSizeStyle = { ...widget, styleOptions: {} } as typeof widget;

        resWidgetDto = toWidgetDto(widgetNoSizeStyle);

        const sizePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'size');
        expect(sizePanel!.items[0].format?.size).toBeUndefined();
      });

      it('should apply Fusion scattermap defaults when the WidgetModel has no markers style', () => {
        const mockDto = makeScattermapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetNoStyle = { ...widget, styleOptions: {} } as typeof widget;

        resWidgetDto = toWidgetDto(widgetNoStyle);

        const resultStyle = resWidgetDto.style as ScattermapWidgetStyle;
        expect(resultStyle.markers.fill).toBe('filled');
        expect(resultStyle.markers.size).toMatchObject({
          defaultSize: 4,
          min: 4,
          max: 24,
        });
      });
    });

    describe('areamap widget', () => {
      const makeAreamapWidgetDto = (subtype: 'areamap/world' | 'areamap/usa'): WidgetDto =>
        ({
          oid: 'areamap-oid',
          title: 'areamap',
          desc: null,
          type: 'map/area',
          subtype,
          datasource: {
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            address: 'LocalHost',
            database: 'aSampleIAAaECommerce',
          },
          metadata: {
            panels: [
              {
                name: 'geo',
                items: [
                  {
                    jaql: {
                      table: 'Country',
                      column: 'Country',
                      dim: '[Country.Country]',
                      datatype: 'text',
                      merged: true,
                      title: 'Country',
                    },
                  },
                ],
              },
              {
                name: 'color',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Revenue',
                      dim: '[Commerce.Revenue]',
                      datatype: 'numeric',
                      agg: 'sum',
                      title: 'Total Revenue',
                    },
                  },
                ],
              },
              { name: 'filters', items: [] },
            ],
          },
          style: {},
        } as unknown as WidgetDto);

      it('should create a valid WidgetDto for the "areamap" (world) chart', () => {
        const mockDto = makeAreamapWidgetDto('areamap/world');
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect(widgetFromChart.chartType).toBe('areamap');

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.type).toBe('map/area');
        expect(resWidgetDto.subtype).toBe('areamap/world');

        const panelNames = resWidgetDto.metadata.panels
          .map(({ name }) => name)
          .filter((name) => name !== 'filters');
        expect(panelNames).toEqual(['geo', 'color']);

        const geoPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'geo');
        expect(geoPanel!.items).toHaveLength(1);
        const colorPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'color');
        expect(colorPanel!.items).toHaveLength(1);
      });

      it('should map AreamapStyleOptions.mapType = "usa" to subtype = "areamap/usa"', () => {
        const mockDto = makeAreamapWidgetDto('areamap/usa');
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.subtype).toBe('areamap/usa');
      });

      it('should default subtype to "areamap/world" when mapType is missing (Fusion defaultSubtype)', () => {
        const mockDto = makeAreamapWidgetDto('areamap/world');
        const widget = fromWidgetDto(mockDto);
        const widgetNoStyle = { ...widget, styleOptions: {} } as typeof widget;

        resWidgetDto = toWidgetDto(widgetNoStyle);

        expect(resWidgetDto.subtype).toBe('areamap/world');
      });

      it('should always emit geo and color panels even when slots are empty', () => {
        const mockDto = makeAreamapWidgetDto('areamap/world');
        const widget = fromWidgetDto(mockDto);
        const widgetWithNoSlots = {
          ...widget,
          dataOptions: { geo: [], color: undefined },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithNoSlots);

        const nonFilterPanels = resWidgetDto.metadata.panels.filter(
          ({ name }) => name !== 'filters',
        );
        expect(nonFilterPanels.map(({ name }) => name)).toEqual(['geo', 'color']);
        nonFilterPanels.forEach((panel) => expect(panel.items).toEqual([]));
      });

      it('should still include the filters panel even when no data filters are set', () => {
        const mockDto = makeAreamapWidgetDto('areamap/world');
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const filterPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'filters');
        expect(filterPanel).toBeDefined();
        expect(filterPanel!.items).toEqual([]);
      });
    });

    describe('boxplot widget', () => {
      const makeBoxplotWidgetDto = (
        overrides: { subtype?: string; styleOverrides?: Partial<BoxplotWidgetStyle> } = {},
      ): WidgetDto =>
        ({
          oid: 'boxplot-oid',
          title: 'boxplot',
          desc: null,
          type: 'chart/boxplot',
          subtype: overrides.subtype ?? 'boxplot/full',
          datasource: {
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            address: 'LocalHost',
            database: 'aSampleIAAaECommerce',
          },
          metadata: {
            panels: [
              {
                name: 'category',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Age Range',
                      dim: '[Commerce.Age Range]',
                      datatype: 'text',
                      merged: true,
                      title: 'Age Range',
                    },
                  },
                ],
              },
              {
                name: 'value',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Cost',
                      dim: '[Commerce.Cost]',
                      datatype: 'numeric',
                      title: 'Cost',
                    },
                  },
                ],
              },
              { name: 'filters', items: [] },
            ],
          },
          style: {
            legend: { enabled: true, position: 'bottom' },
            navigator: { enabled: false },
            xAxis: {
              enabled: true,
              ticks: true,
              labels: { enabled: true, rotation: 0 },
              gridLines: true,
              isIntervalEnabled: false,
            },
            yAxis: {
              enabled: true,
              ticks: true,
              labels: { enabled: true, rotation: 0 },
              gridLines: true,
              isIntervalEnabled: false,
            },
            whisker: {
              'whisker/iqr': true,
              'whisker/extremums': false,
              'whisker/deviation': false,
            },
            outliers: { enabled: true },
            ...overrides.styleOverrides,
          },
        } as unknown as WidgetDto);

      it('should create a valid WidgetDto for the "boxplot" chart', () => {
        const mockDto = makeBoxplotWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect(widgetFromChart.chartType).toBe('boxplot');

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.type).toBe('chart/boxplot');
        expect(resWidgetDto.subtype).toBe('boxplot/full');

        const panelNames = resWidgetDto.metadata.panels
          .map(({ name }) => name)
          .filter((name) => name !== 'filters');
        expect(panelNames).toEqual(['category', 'value']);

        const categoryPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'category');
        expect(categoryPanel!.items).toHaveLength(1);
        expect((categoryPanel!.items[0].jaql as any).dim).toBe('[Commerce.Age Range]');

        const valuePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'value');
        expect(valuePanel!.items).toHaveLength(1);
        expect((valuePanel!.items[0].jaql as any).dim).toBe('[Commerce.Cost]');
        // value is treated as an attribute (no agg), matching the extractor's read
        expect((valuePanel!.items[0].jaql as any).agg).toBeUndefined();
      });

      it('should round-trip whisker (iqr) and outliers from dataOptions back into the DTO style', () => {
        const mockDto = makeBoxplotWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const resultStyle = resWidgetDto.style as BoxplotWidgetStyle;
        expect(resultStyle.whisker).toEqual({
          'whisker/iqr': true,
          'whisker/extremums': false,
          'whisker/deviation': false,
        });
        expect(resultStyle.outliers).toEqual({ enabled: true });
      });

      it('should map whisker/extremums into BoxWhiskerType "extremums" and back', () => {
        const mockDto = makeBoxplotWidgetDto({
          styleOverrides: {
            whisker: {
              'whisker/iqr': false,
              'whisker/extremums': true,
              'whisker/deviation': false,
            },
            outliers: { enabled: false },
          },
        });
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect((widgetFromChart.dataOptions as BoxplotChartDataOptions).boxType).toBe('extremums');

        resWidgetDto = toWidgetDto(widgetFromChart);

        const resultStyle = resWidgetDto.style as BoxplotWidgetStyle;
        expect(resultStyle.whisker).toEqual({
          'whisker/iqr': false,
          'whisker/extremums': true,
          'whisker/deviation': false,
        });
        expect(resultStyle.outliers).toEqual({ enabled: false });
      });

      it('should map whisker/deviation into BoxWhiskerType "standardDeviation" and back', () => {
        const mockDto = makeBoxplotWidgetDto({
          styleOverrides: {
            whisker: {
              'whisker/iqr': false,
              'whisker/extremums': false,
              'whisker/deviation': true,
            },
            outliers: { enabled: false },
          },
        });
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect((widgetFromChart.dataOptions as BoxplotChartDataOptions).boxType).toBe(
          'standardDeviation',
        );

        resWidgetDto = toWidgetDto(widgetFromChart);

        const resultStyle = resWidgetDto.style as BoxplotWidgetStyle;
        expect(resultStyle.whisker).toEqual({
          'whisker/iqr': false,
          'whisker/extremums': false,
          'whisker/deviation': true,
        });
      });

      it('should preserve the boxplot/hollow subtype', () => {
        const mockDto = makeBoxplotWidgetDto({ subtype: 'boxplot/hollow' });
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.subtype).toBe('boxplot/hollow');
      });

      it('should default subtype to "boxplot/full" when styleOptions has no subtype', () => {
        const mockDto = makeBoxplotWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetNoSubtype = {
          ...widget,
          styleOptions: {},
        } as typeof widget;

        resWidgetDto = toWidgetDto(widgetNoSubtype);

        expect(resWidgetDto.subtype).toBe('boxplot/full');
      });

      it('should emit category and value panels with empty items when slots are missing', () => {
        const mockDto = makeBoxplotWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetWithNoSlots = {
          ...widget,
          dataOptions: {
            category: [],
            value: [],
            boxType: 'iqr',
            outliersEnabled: false,
          },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithNoSlots);

        const nonFilterPanels = resWidgetDto.metadata.panels.filter(
          ({ name }) => name !== 'filters',
        );
        expect(nonFilterPanels.map(({ name }) => name)).toEqual(['category', 'value']);
        nonFilterPanels.forEach((panel) => expect(panel.items).toEqual([]));
      });

      it('should write back axis options from styleOptions', () => {
        const mockDto = makeBoxplotWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const expectedStyle = mockDto.style as BoxplotWidgetStyle;
        const resultStyle = resWidgetDto.style as BoxplotWidgetStyle;
        expect(resultStyle.xAxis).toMatchObject({
          enabled: expectedStyle.xAxis.enabled,
          gridLines: expectedStyle.xAxis.gridLines,
        });
        expect(resultStyle.yAxis).toMatchObject({
          enabled: expectedStyle.yAxis.enabled,
          gridLines: expectedStyle.yAxis.gridLines,
        });
      });

      it('should still include the filters panel even when no data filters are set', () => {
        const mockDto = makeBoxplotWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const filterPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'filters');
        expect(filterPanel).toBeDefined();
        expect(filterPanel!.items).toEqual([]);
      });
    });

    describe('calendar-heatmap widget', () => {
      const makeCalendarHeatmapWidgetDto = (style: CalendarHeatmapWidgetStyle = {}): WidgetDto =>
        ({
          oid: 'calendar-heatmap-oid',
          title: 'calendar heatmap',
          desc: null,
          type: 'heatmap',
          subtype: 'heatmap',
          datasource: {
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            address: 'LocalHost',
            database: 'aSampleIAAaECommerce',
          },
          metadata: {
            panels: [
              {
                name: 'date',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Date',
                      dim: '[Commerce.Date (Calendar)]',
                      datatype: 'datetime',
                      level: 'days',
                      title: 'Date',
                    },
                  },
                ],
              },
              {
                name: 'color',
                items: [
                  {
                    jaql: {
                      table: 'Commerce',
                      column: 'Revenue',
                      dim: '[Commerce.Revenue]',
                      datatype: 'numeric',
                      agg: 'sum',
                      title: 'Total Revenue',
                    },
                  },
                ],
              },
              { name: 'filters', items: [] },
            ],
          },
          style,
        } as unknown as WidgetDto);

      it('should create a valid WidgetDto for the "calendar-heatmap" chart', () => {
        const mockDto = makeCalendarHeatmapWidgetDto({
          dayNameEnabled: true,
          dayNumberEnabled: true,
          'domain/quarter': true,
          'view/weekly': true,
          'week/monday': true,
          grayoutEnabled: true,
        });
        const { widgetFromChart } = getWidgetTransformChain(mockDto);
        expect(widgetFromChart.chartType).toBe('calendar-heatmap');

        resWidgetDto = toWidgetDto(widgetFromChart);

        expect(resWidgetDto.type).toBe('heatmap');
        expect(resWidgetDto.subtype).toBe('heatmap');

        const panelNames = resWidgetDto.metadata.panels
          .map(({ name }) => name)
          .filter((name) => name !== 'filters');
        expect(panelNames).toEqual(['date', 'color']);

        const datePanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'date');
        expect(datePanel!.items).toHaveLength(1);
        expect((datePanel!.items[0].jaql as any).dim).toBe('[Commerce.Date (Calendar)]');

        const colorPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'color');
        expect(colorPanel!.items).toHaveLength(1);
        expect((colorPanel!.items[0].jaql as any).dim).toBe('[Commerce.Revenue]');
        expect((colorPanel!.items[0].jaql as any).agg).toBe('sum');
      });

      it('should round-trip view/domain/week/grayout flags through the DTO style', () => {
        const mockDto = makeCalendarHeatmapWidgetDto({
          dayNameEnabled: true,
          dayNumberEnabled: false,
          'domain/half-year': true,
          'view/weekly': true,
          'week/monday': true,
          grayoutEnabled: true,
        });
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const resultStyle = resWidgetDto.style as CalendarHeatmapWidgetStyle;
        expect(resultStyle.dayNameEnabled).toBe(true);
        expect(resultStyle.dayNumberEnabled).toBe(false);
        expect(resultStyle.grayoutEnabled).toBe(true);
        expect(resultStyle['view/weekly']).toBe(true);
        expect(resultStyle['view/monthly']).toBe(false);
        expect(resultStyle['domain/half-year']).toBe(true);
        expect(resultStyle['domain/month']).toBe(false);
        expect(resultStyle['domain/quarter']).toBe(false);
        expect(resultStyle['domain/year']).toBe(false);
        expect(resultStyle['week/monday']).toBe(true);
        expect(resultStyle['week/sunday']).toBe(false);
      });

      it('should default subtype flag to "view/monthly" when styleOptions.subtype is missing', () => {
        const mockDto = makeCalendarHeatmapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetNoSubtype = {
          ...widget,
          styleOptions: { ...widget.styleOptions, subtype: undefined },
        } as typeof widget;

        resWidgetDto = toWidgetDto(widgetNoSubtype);

        const resultStyle = resWidgetDto.style as CalendarHeatmapWidgetStyle;
        expect(resultStyle['view/monthly']).toBe(true);
        expect(resultStyle['view/weekly']).toBe(false);
      });

      it('should emit "view/weekly" when subtype is "calendar-heatmap/continuous"', () => {
        const mockDto = makeCalendarHeatmapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetContinuous = {
          ...widget,
          styleOptions: {
            ...widget.styleOptions,
            subtype: 'calendar-heatmap/continuous',
          } as CalendarHeatmapStyleOptions,
        } as typeof widget;

        resWidgetDto = toWidgetDto(widgetContinuous);

        const resultStyle = resWidgetDto.style as CalendarHeatmapWidgetStyle;
        expect(resultStyle['view/weekly']).toBe(true);
        expect(resultStyle['view/monthly']).toBe(false);
      });

      it('should write pagination.startMonth as { year, month } when set', () => {
        const mockDto = makeCalendarHeatmapWidgetDto({
          startMonth: { year: 2024, month: 5 },
        });
        const widget = fromWidgetDto(mockDto);

        resWidgetDto = toWidgetDto(widget);

        const resultStyle = resWidgetDto.style as CalendarHeatmapWidgetStyle;
        expect(resultStyle.startMonth).toEqual({ year: 2024, month: 5 });
      });

      it('should omit startMonth when pagination.startMonth is missing', () => {
        const mockDto = makeCalendarHeatmapWidgetDto();
        const widget = fromWidgetDto(mockDto);

        resWidgetDto = toWidgetDto(widget);

        const resultStyle = resWidgetDto.style as CalendarHeatmapWidgetStyle;
        expect(resultStyle.startMonth).toBeUndefined();
      });

      it('should always emit both date and color panels even when slots are empty', () => {
        const mockDto = makeCalendarHeatmapWidgetDto();
        const widget = fromWidgetDto(mockDto);
        const widgetWithNoSlots = {
          ...widget,
          dataOptions: { date: undefined, value: undefined },
        } as unknown as typeof widget;

        resWidgetDto = toWidgetDto(widgetWithNoSlots);

        const nonFilterPanels = resWidgetDto.metadata.panels.filter(
          ({ name }) => name !== 'filters',
        );
        expect(nonFilterPanels.map(({ name }) => name)).toEqual(['date', 'color']);
        nonFilterPanels.forEach((panel) => expect(panel.items).toEqual([]));
      });

      it('should still include the filters panel even when no data filters are set', () => {
        const mockDto = makeCalendarHeatmapWidgetDto();
        const { widgetFromChart } = getWidgetTransformChain(mockDto);

        resWidgetDto = toWidgetDto(widgetFromChart);

        const filterPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'filters');
        expect(filterPanel).toBeDefined();
        expect(filterPanel!.items).toEqual([]);
      });
    });

    it('should create a valid WidgetDto for the "polar" chart with Filters', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockPolarFilteredWidgetDto);
      expect(widgetFromChart.chartType).toBe('polar');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      const filterPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters');
      expect(filterPanel.length).toBe(1);
      expect((filterPanel[0].items[0].jaql as any).dim).toBe('[Country.Country]');
      expect((filterPanel[0].items[0].jaql as any).filter.members).toEqual(
        expect.arrayContaining(['France', 'Israel', 'Ukraine']),
      );

      expect(resWidgetDto.type).toBe(mockPolarFilteredWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "treemap" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTreemapWidgetDto);
      expect(widgetFromChart.chartType).toBe('treemap');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      const filterPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters');
      expect(filterPanel.length).toBe(1);
      const valuesPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'values');
      expect(valuesPanel.length).toBe(0);
      const sizePanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'size');
      expect(sizePanel.length).toBe(1);
      expect(sizePanel[0].items.length).toBe(1);
      const colorPanel = resWidgetDto.metadata.panels.filter(({ name }) => name === 'color');
      expect(colorPanel.length).toBe(1);

      expect(resWidgetDto.type).toBe(mockTreemapWidgetDto.type);
      expect(resWidgetDto.subtype).toBe(mockTreemapWidgetDto.type);
    });

    it('should throw an error for a non-supported chart', () => {
      expect(() => {
        const pivotMock = cloneDeep(mockTableWidgetDto);
        pivotMock.type = 'pivot2';
        getWidgetTransformChain(pivotMock);
      }).toThrow();
    });
  });

  describe('fromPivotTableWidgetProps + toWidgetDto', () => {
    const mockPivotWidgetDto = samplePivotDashboard.widgets![0] as unknown as WidgetDto;

    const getPivotWidgetTransformChain = (widgetDto: WidgetDto) => {
      const widget = fromWidgetDto(widgetDto);
      const pivotProps = toPivotTableWidgetProps(widget);
      const widgetFromPivot = fromPivotTableWidgetProps(pivotProps);
      return { widget, pivotProps, widgetFromPivot };
    };

    it('should create a valid WidgetDto for the "pivot" widget with type, subtype, and filters panel', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);
      expect(widgetFromPivot.widgetType).toBe('pivot');

      resWidgetDto = toWidgetDto(widgetFromPivot);

      expect(resWidgetDto.type).toBe('pivot2');
      expect(resWidgetDto.subtype).toBe('pivot2');
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
    });

    it('should emit rows, columns, and values panels with the original items preserved', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);

      resWidgetDto = toWidgetDto(widgetFromPivot);

      const rowsPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'rows');
      const columnsPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'columns');
      const valuesPanel = resWidgetDto.metadata.panels.find(({ name }) => name === 'values');

      expect(rowsPanel).toBeDefined();
      expect(columnsPanel).toBeDefined();
      expect(valuesPanel).toBeDefined();

      expect(rowsPanel!.items).toHaveLength(1);
      expect((rowsPanel!.items[0].jaql as any).dim).toBe('[Brand.Brand]');

      expect(columnsPanel!.items).toHaveLength(1);
      expect((columnsPanel!.items[0].jaql as any).dim).toBe('[Commerce.Gender]');

      expect(valuesPanel!.items).toHaveLength(1);
      expect((valuesPanel!.items[0].jaql as any).dim).toBe('[Commerce.Cost]');
      expect((valuesPanel!.items[0].jaql as any).agg).toBe('sum');
    });

    it('should translate style options (colors, pageSize, automaticHeight)', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);

      resWidgetDto = toWidgetDto(widgetFromPivot);

      const expectedStyle = mockPivotWidgetDto.style as PivotWidgetStyle;
      const resultStyle = resWidgetDto.style as PivotWidgetStyle;

      expect(resultStyle.pageSize).toBe(expectedStyle.pageSize);
      expect(resultStyle.automaticHeight).toBe(expectedStyle.automaticHeight);
      expect(resultStyle.colors).toMatchObject({
        rows: expectedStyle.colors!.rows,
        columns: expectedStyle.colors!.columns,
        headers: expectedStyle.colors!.headers,
        members: expectedStyle.colors!.members,
        totals: expectedStyle.colors!.totals,
      });
    });

    it('should write grandTotals from dataOptions back into style.rowsGrandTotal/columnsGrandTotal', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);
      const widgetWithGrandTotals = {
        ...widgetFromPivot,
        dataOptions: {
          ...(widgetFromPivot.dataOptions as PivotTableDataOptions),
          grandTotals: { rows: true, columns: false },
        } as PivotTableDataOptions,
      };

      resWidgetDto = toWidgetDto(widgetWithGrandTotals);

      const resultStyle = resWidgetDto.style as PivotWidgetStyle;
      expect(resultStyle.rowsGrandTotal).toBe(true);
      expect(resultStyle.columnsGrandTotal).toBe(false);
    });

    it('should omit rowsGrandTotal/columnsGrandTotal when dataOptions.grandTotals is absent', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);

      resWidgetDto = toWidgetDto(widgetFromPivot);

      const resultStyle = resWidgetDto.style as PivotWidgetStyle;
      expect(resultStyle.rowsGrandTotal).toBeUndefined();
      expect(resultStyle.columnsGrandTotal).toBeUndefined();
    });

    it('should map custom PivotTableWidgetStyleOptions fields to the DTO style shape', () => {
      const { widgetFromPivot } = getPivotWidgetTransformChain(mockPivotWidgetDto);
      const customizedWidget = {
        ...widgetFromPivot,
        styleOptions: {
          ...(widgetFromPivot.styleOptions as PivotTableWidgetStyleOptions),
          rowsPerPage: 50,
          isAutoHeight: false,
          rowHeight: 30,
          alternatingRowsColor: false,
          alternatingColumnsColor: true,
          headersColor: true,
          membersColor: true,
          totalsColor: true,
        } as PivotTableWidgetStyleOptions,
      };

      resWidgetDto = toWidgetDto(customizedWidget);

      const resultStyle = resWidgetDto.style as PivotWidgetStyle;
      expect(resultStyle.pageSize).toBe(50);
      expect(resultStyle.automaticHeight).toBe(false);
      expect(resultStyle.rowHeight).toBe(30);
      expect(resultStyle.colors).toEqual({
        rows: false,
        columns: true,
        headers: true,
        members: true,
        totals: true,
      });
    });
  });

  describe('fromWidgetDto', () => {
    describe('Unknown Custom Widgets', () => {
      it('should handle unknown custom widgets', () => {
        const customStyle = {
          customProperty: 'customValue',
          anotherProperty: 123,
        };

        const customWidgetDto = {
          oid: 'custom-widget-1',
          type: 'MyCustomWidget',
          subtype: 'MyCustomWidget',
          title: 'Custom Widget',
          desc: 'Test custom widget',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: customStyle,
          metadata: {
            panels: [
              {
                name: 'values',
                items: [
                  {
                    jaql: {
                      title: 'Total Revenue',
                      dim: '[Commerce.Revenue]',
                      agg: 'sum',
                      datatype: 'numeric',
                      table: 'Commerce',
                      column: 'Revenue',
                    },
                    format: {
                      mask: {
                        type: 'number',
                        abbreviations: {
                          t: true,
                          b: true,
                          m: true,
                          k: true,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        } as unknown as WidgetDto;

        const widgetModel = fromWidgetDto(customWidgetDto);

        expect(widgetModel.widgetType).toBe('custom');
        expect(widgetModel.customWidgetType).toBe('MyCustomWidget');
        expect(widgetModel.oid).toBe('custom-widget-1');
        expect(widgetModel.title).toBe('Custom Widget');
        expect(widgetModel.description).toBe('Test custom widget');

        // Verify style options are copied as-is
        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.customProperty).toBe('customValue');
        expect(styleOptions.anotherProperty).toBe(123);

        // Verify data options are created from panels
        expect(widgetModel.dataOptions).toBeDefined();
      });

      it('should apply widget design to unknown custom widgets', () => {
        const customStyle = {
          customProperty: 'value',
          widgetDesign: {
            widgetBackgroundColor: '#00FF00',
            widgetSpacing: 'medium',
            widgetCornerRadius: 'medium',
            widgetShadow: 'medium',
          },
        };

        const customWidgetDto = {
          oid: 'custom-widget-2',
          type: 'MyCustomWidget',
          subtype: 'MyCustomWidget',
          title: 'Custom Widget with Design',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: customStyle,
          metadata: {
            panels: [],
          },
        } as unknown as WidgetDto;

        const widgetModel = fromWidgetDto(customWidgetDto);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.customProperty).toBe('value');
        // Widget design should be flattened into style options for unknown custom widgets
        expect(styleOptions.backgroundColor).toBe('#00FF00');
      });
    });

    describe('Standard Widgets', () => {
      it('should handle standard chart widget (line chart)', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        const widgetModel = fromWidgetDto(lineChartDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.chartType).toBe('line');
        expect(widgetModel.customWidgetType).toBe('');
        expect(widgetModel.oid).toBe(lineChartDto.oid);
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });

      it('should handle indicator widget', () => {
        const indicatorDto = cloneDeep(mockIndicatorWidgetDto);
        const widgetModel = fromWidgetDto(indicatorDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.chartType).toBe('indicator');
        expect(widgetModel.customWidgetType).toBe('');
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });

      it('should apply widget design to standard widgets when enabled', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lineChartDto.style as any).widgetDesign = {
          widgetBackgroundColor: '#0000FF',
          widgetSpacing: 'small',
          widgetCornerRadius: 'small',
          widgetShadow: 'dark',
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: true,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(lineChartDto, undefined, appSettings);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.backgroundColor).toBe('#0000FF');
        expect(styleOptions.spaceAround).toBeDefined();
        expect(styleOptions.cornerRadius).toBeDefined();
        expect(styleOptions.shadow).toBeDefined();
      });

      it('should not apply widget design when feature flag is disabled', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lineChartDto.style as any).widgetDesign = {
          widgetBackgroundColor: '#0000FF',
          widgetSpacing: 'small',
          widgetCornerRadius: 'small',
          widgetShadow: 'dark',
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: false,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(lineChartDto, undefined, appSettings);

        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.backgroundColor).toBeUndefined();
      });
    });

    describe('Theme Settings', () => {
      it('should apply theme settings to standard widgets', () => {
        const lineChartDto = cloneDeep(mockLineWidgetDto);

        const themeSettings: Partial<CompleteThemeSettingsInternal> = {
          palette: {
            variantColors: ['#FF0000', '#00FF00', '#0000FF'],
          },
        };

        const widgetModel = fromWidgetDto(
          lineChartDto,
          themeSettings as unknown as CompleteThemeSettingsInternal,
        );

        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.styleOptions).toBeDefined();
      });
    });

    describe('Plugin Widgets (WidgetsTabber)', () => {
      it('should transform WidgetsTabber to tabber-buttons widget with full integration', () => {
        const tabberStyle: TabberWidgetDtoStyle = {
          activeTab: '1',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval: 'MEDIUM',
          tabsAlignment: 'CENTER',
          selectedColor: '#94F5F0',
          selectedBkgColor: '#ffffff',
          unselectedColor: '#666666',
          unselectedBkgColor: '#ffffff',
          descriptionColor: '#666666',
          tabCornerRadius: 'NONE',
          showDescription: false,
          tabs: [
            {
              title: 'TAB 1',
              displayWidgetIds: ['widget1'],
              hideWidgetIds: ['widget2'],
            },
            {
              title: 'TAB 2',
              displayWidgetIds: ['widget2'],
              hideWidgetIds: ['widget1'],
            },
          ],
        };

        const tabberWidgetDto: WidgetDto = {
          oid: 'tabber-widget-1',
          type: 'WidgetsTabber',
          subtype: 'WidgetsTabber',
          title: 'Tabber Widget',
          desc: 'Test tabber widget',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: tabberStyle,
          metadata: {
            panels: [],
          },
        };

        // Test fromWidgetDto transformation
        const widgetModel = fromWidgetDto(tabberWidgetDto);

        expect(widgetModel.widgetType).toBe('custom');
        expect(widgetModel.customWidgetType).toBe('tabber-buttons');
        expect(widgetModel.oid).toBe('tabber-widget-1');
        expect(widgetModel.title).toBe('Tabber Widget');
        expect(widgetModel.description).toBe('Test tabber widget');

        // Verify customOptions transformation
        const customOptions = widgetModel.customOptions;
        expect(customOptions).toBeDefined();
        expect(customOptions!.tabNames).toEqual(['TAB 1', 'TAB 2']);
        expect(customOptions!.activeTab).toBe(1);

        // Verify style options are normalized and cleaned
        const styleOptions = widgetModel.styleOptions as any;
        expect(styleOptions.tabs).toBeUndefined();
        expect(styleOptions.activeTab).toBeUndefined();
        expect(styleOptions.showSeparators).toBe(true);
        expect(styleOptions.tabsSize).toBe('medium');
        expect(styleOptions.selectedColor).toBe('#94F5F0');

        // Test toCustomWidgetProps transformation
        const customWidgetProps = toCustomWidgetProps(widgetModel) as any;
        expect(customWidgetProps.customOptions).toBeDefined();
        expect(customWidgetProps.customOptions.tabNames).toEqual(['TAB 1', 'TAB 2']);
        expect(customWidgetProps.customOptions.activeTab).toBe(1);
        expect(customWidgetProps.styleOptions.tabsConfig).toBeUndefined();
      });

      it('should apply widget design to WidgetsTabber when feature is enabled', () => {
        const tabberStyle: TabberWidgetDtoStyle & { widgetDesign: any } = {
          activeTab: '0',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval: 'MEDIUM',
          tabsAlignment: 'CENTER',
          selectedColor: '#000000',
          selectedBkgColor: '#ffffff',
          unselectedColor: '#666666',
          unselectedBkgColor: '#ffffff',
          descriptionColor: '#666666',
          tabCornerRadius: 'NONE',
          showDescription: false,
          tabs: [
            {
              title: 'TAB 1',
              displayWidgetIds: ['widget1'],
              hideWidgetIds: [],
            },
          ],
          widgetDesign: {
            widgetBackgroundColor: '#FF0000',
            widgetSpacing: 'large',
            widgetCornerRadius: 'large',
            widgetShadow: 'light',
            widgetBorderEnabled: false,
            widgetBorderColor: '#000000',
            widgetTitleColor: '#000000',
            widgetTitleAlignment: 'left',
            widgetTitleDividerEnabled: false,
            widgetTitleDividerColor: '#000000',
            widgetTitleBackgroundColor: '#FFFFFF',
          },
        };

        const tabberWidgetDto: WidgetDto = {
          oid: 'tabber-widget-2',
          type: 'WidgetsTabber',
          subtype: 'WidgetsTabber',
          title: 'Tabber Widget with Design',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: tabberStyle,
          metadata: {
            panels: [],
          },
        };

        const appSettings = {
          serverFeatures: {
            widgetDesignStyle: {
              key: 'widgetDesignStyle',
              active: true,
            },
          },
        } as AppSettings;

        const widgetModel = fromWidgetDto(tabberWidgetDto, undefined, appSettings);

        // Verify customOptions are present
        expect(widgetModel.customOptions).toBeDefined();

        // Verify widget design is applied to style options
        const styleOptions = widgetModel.styleOptions;
        expect(styleOptions.backgroundColor).toBe('#FF0000');
        expect(styleOptions.spaceAround).toBe('Large');
        expect(styleOptions.cornerRadius).toBe('Large');
        expect(styleOptions.shadow).toBe('Light');
        expect(styleOptions.header).toBeDefined();
        expect(styleOptions.header!.titleTextColor).toBe('#000000');
      });

      it('round-trips a tabber widget back to a WidgetsTabber DTO (duplicate scenario)', () => {
        const tabberDatasource = {
          title: 'Sample ECommerce',
          id: 'aLOCALHOST_aSAMPLEIAAaECOMMERCE',
          address: 'LocalHost',
          fullname: 'LocalHost/Sample ECommerce',
          live: false,
        };
        const tabberStyle: TabberWidgetDtoStyle = {
          activeTab: '1',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: true,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval: 'LARGE',
          tabsAlignment: 'CENTER',
          selectedColor: '#94F5F0',
          selectedBkgColor: '#ffffff',
          unselectedColor: '#666666',
          unselectedBkgColor: '#f0f0f0',
          descriptionColor: '#666666',
          tabCornerRadius: 'SMALL',
          showDescription: false,
          tabs: [
            { title: 'TAB 1', displayWidgetIds: ['widget1'], hideWidgetIds: ['widget2'] },
            { title: 'TAB 2', displayWidgetIds: ['widget2'], hideWidgetIds: ['widget1'] },
          ],
        };
        const tabberWidgetDto: WidgetDto = {
          oid: 'tabber-widget-rt',
          type: 'WidgetsTabber',
          subtype: 'WidgetsTabber',
          title: 'Tabber Widget',
          desc: 'Test tabber widget',
          datasource: tabberDatasource,
          style: tabberStyle,
          metadata: { panels: [] },
        };

        const model = fromWidgetDto(tabberWidgetDto);
        const resultDto = toWidgetDto(model, tabberDatasource);

        // The bug: the DTO `type`/`subtype` were written back as the CSDK
        // 'tabber-buttons' instead of the Fusion 'WidgetsTabber'.
        expect(resultDto.type).toBe('WidgetsTabber');
        expect(resultDto.subtype).toBe('WidgetsTabber');

        // The style transform is inverted and tabs/activeTab are re-materialized.
        const resultStyle = resultDto.style as unknown as TabberWidgetDtoStyle;
        expect(resultStyle.activeTab).toBe('1');
        expect(resultStyle.tabs?.map((tab) => tab.title)).toEqual(['TAB 1', 'TAB 2']);
        expect(resultStyle.tabsSize).toBe('MEDIUM');
        expect(resultStyle.tabsInterval).toBe('LARGE');
        expect(resultStyle.tabCornerRadius).toBe('SMALL');
        expect(resultStyle.tabsAlignment).toBe('CENTER');
        expect(resultStyle.useSelectedBkg).toBe(true);
        expect(resultStyle.selectedBkgColor).toBe('#ffffff');
        expect(resultStyle.useUnselectedBkg).toBe(false);

        // The DTO can be read back into a tabber widget model again.
        const recovered = fromWidgetDto(resultDto);
        expect(recovered.widgetType).toBe('custom');
        expect(recovered.customWidgetType).toBe('tabber-buttons');
        expect(recovered.customOptions!.tabNames).toEqual(['TAB 1', 'TAB 2']);
        expect(recovered.customOptions!.activeTab).toBe(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle widget without description', () => {
        const widgetDto = cloneDeep(mockLineWidgetDto);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (widgetDto as any).desc = undefined;

        const widgetModel = fromWidgetDto(widgetDto);

        expect(widgetModel.description).toBe('');
      });

      it('should handle standard widget with empty panels', () => {
        const emptyPanelDto: WidgetDto = {
          oid: 'empty-widget',
          type: 'chart/line',
          subtype: 'line',
          title: 'Empty Line Chart',
          desc: '',
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
          },
          style: {},
          metadata: {
            panels: [],
          },
        };

        const widgetModel = fromWidgetDto(emptyPanelDto);

        expect(widgetModel.widgetType).toBe('chart');
        expect(widgetModel.dataOptions).toBeDefined();
        expect(widgetModel.filters).toEqual([]);
      });
    });

    describe('Widget narrative round-trip', () => {
      /** `WidgetModel.config` spans every widget type; only chart and pivot carry a narrative. */
      const narrativeOf = (model: WidgetModel): WidgetNarrativeConfig | undefined =>
        model.config && 'narrative' in model.config ? model.config.narrative : undefined;

      it('maps style.narration from Fusion DTO into config.narrative only', () => {
        const dto = cloneDeep(advancedLineChartWidgetDto);
        const model = fromWidgetDto(dto);
        expect(narrativeOf(model)).toEqual(
          expect.objectContaining({
            displayLocation: 'above',
            verbosity: 'low',
          }),
        );
        expect(model).not.toHaveProperty('fusionNarrationStyle');
      });

      it('does not add autoShow to DTO when it was never set on the model', () => {
        const dto = cloneDeep(advancedLineChartWidgetDto);
        if (dto.style.narration && 'autoShow' in dto.style.narration) {
          delete (dto.style.narration as Record<string, unknown>).autoShow;
        }
        const model = fromWidgetDto(dto);
        const narrative = narrativeOf(model);
        expect(narrative == null || !('autoShow' in narrative)).toBe(true);
        const out = toWidgetDto(model);
        expect(out.style.narration == null || !('autoShow' in out.style.narration)).toBe(true);
      });

      it('persists Fusion autoShow on the DTO when present', () => {
        const dto = cloneDeep(advancedLineChartWidgetDto);
        (dto.style.narration as { autoShow?: boolean }).autoShow = true;
        const model = fromWidgetDto(dto);
        expect(narrativeOf(model)?.autoShow).toBe(true);
        const out = toWidgetDto(model);
        expect((out.style.narration as { autoShow?: boolean })?.autoShow).toBe(true);
      });
    });
  });

  describe('toJtdConfig', () => {
    it('returns null when WidgetModel was not built from a Fusion DTO (no JTD source fields)', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockLineWidgetDto);
      expect(toJtdConfig(widgetFromChart)).toBeNull();
    });

    it('matches jumpToDashboardConfigFromWidgetDto when the Fusion DTO carries versioned JTD', () => {
      const dto: WidgetDto = {
        ...cloneDeep(mockLineWidgetDto),
        drillToDashboardConfig: minimalChartJtdDto,
      };
      const model = fromWidgetDto(dto);
      expect(toJtdConfig(model)).toEqual(jumpToDashboardConfigFromWidgetDto(dto));
    });
  });

  describe('fromCustomWidgetProps + fromWidgetProps + toWidgetDto (custom widgets)', () => {
    const datasourceForDto = {
      title: 'Sample ECommerce',
      id: 'aLOCALHOST_aSAMPLEIAAaECOMMERCE',
      address: 'LocalHost',
      fullname: 'LocalHost/Sample ECommerce',
      live: false,
    };

    const makeCustomWidgetProps = (): CustomWidgetProps => ({
      customWidgetType: 'demo-plugin',
      dataSource: { title: 'Sample ECommerce', type: 'elasticube' },
      dataOptions: {
        category: [{ column: Commerce.AgeRange }],
        value: [{ column: measureFactory.sum(Commerce.Revenue, 'Total Revenue') }],
        breakBy: [{ column: Commerce.Condition }],
      } as unknown as CustomWidgetProps['dataOptions'],
      styleOptions: { plugin: 'specific' } as unknown as CustomWidgetProps['styleOptions'],
      title: 'Demo Plugin',
      description: 'A demo plugin widget',
      filters: [],
    });

    it('fromCustomWidgetProps produces a WidgetModel typed as custom with the plugin name and data preserved', () => {
      const model = fromCustomWidgetProps(makeCustomWidgetProps());

      expect(model.widgetType).toBe('custom');
      expect(model.customWidgetType).toBe('demo-plugin');
      expect(model.title).toBe('Demo Plugin');
      expect(model.description).toBe('A demo plugin widget');
      expect(model.filters).toEqual([]);
      expect(model.dataOptions).toMatchObject({
        category: expect.any(Array),
        value: expect.any(Array),
        breakBy: expect.any(Array),
      });
    });

    it('fromWidgetProps dispatches custom widgets through fromCustomWidgetProps and stamps the oid', () => {
      const props = { id: 'custom-1', widgetType: 'custom' as const, ...makeCustomWidgetProps() };

      const model = fromWidgetProps(props);

      expect(model.widgetType).toBe('custom');
      expect(model.customWidgetType).toBe('demo-plugin');
      expect(model.oid).toBe('custom-1');
    });

    it('toWidgetDto emits a DTO whose `type` is the plugin name and whose panels carry valid JAQL', () => {
      const model = fromCustomWidgetProps(makeCustomWidgetProps());

      const dto = toWidgetDto(model, datasourceForDto);

      expect(dto.type).toBe('demo-plugin');

      const panelNames = dto.metadata.panels.map((p) => p.name);
      // Each dataOptions key becomes a panel; the trailing `filters` panel is always appended.
      expect(panelNames).toContain('category');
      expect(panelNames).toContain('value');
      expect(panelNames).toContain('breakBy');
      expect(panelNames[panelNames.length - 1]).toBe('filters');

      const categoryPanel = dto.metadata.panels.find((p) => p.name === 'category')!;
      const categoryJaql = categoryPanel.items[0].jaql as { dim?: string };
      expect(categoryJaql.dim).toBe('[Commerce.Age Range]');

      const valuePanel = dto.metadata.panels.find((p) => p.name === 'value')!;
      const valueJaql = valuePanel.items[0].jaql as { dim?: string; agg?: string };
      expect(valueJaql.dim).toBe('[Commerce.Revenue]');
      expect(valueJaql.agg).toBe('sum');
    });

    it('round-trips: fromWidgetDto(toWidgetDto(...)) recovers a custom WidgetModel with the same plugin name', () => {
      const originalModel = fromCustomWidgetProps(makeCustomWidgetProps());
      const dto = toWidgetDto(originalModel, datasourceForDto);

      const recovered = fromWidgetDto(dto);

      expect(recovered.widgetType).toBe('custom');
      expect(recovered.customWidgetType).toBe('demo-plugin');
      expect(recovered.title).toBe('Demo Plugin');
      // The plugin-side style fields ride through opaquely.
      expect(recovered.styleOptions as Record<string, unknown>).toMatchObject({
        plugin: 'specific',
      });
    });
  });

  describe('FilterWidget translation', () => {
    const makeFilterWidgetDto = (
      opts: {
        jaql?: Record<string, unknown>;
        noItems?: boolean;
        style?: Record<string, unknown>;
        title?: string;
        filtersPanelItems?: Record<string, unknown>[];
      } = {},
    ): WidgetDto =>
      ({
        oid: 'fw-oid',
        title: opts.title ?? 'My Filter',
        desc: null,
        type: 'filter',
        subtype: 'filter',
        datasource: {
          title: 'Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          address: 'LocalHost',
          database: 'aSampleIAAaECommerce',
        },
        metadata: {
          panels: [
            {
              name: 'dimension',
              items: opts.noItems
                ? []
                : [
                    {
                      jaql: opts.jaql ?? {
                        table: 'Country',
                        column: 'Country',
                        dim: '[Country.Country]',
                        datatype: 'text',
                        title: 'Country',
                      },
                    },
                  ],
            },
            ...(opts.filtersPanelItems ? [{ name: 'filters', items: opts.filtersPanelItems }] : []),
          ],
        },
        style: opts.style ?? {},
      } as unknown as WidgetDto);

    const toFilterProps = (dto: WidgetDto) =>
      toCommonWidgetProps(fromWidgetDto(dto)) as unknown as {
        widgetType: string;
        attribute: { expression: string; granularity?: string; type?: string };
        title?: string;
        isMultiselect: boolean;
        filterType: string;
        parentFilters?: { attribute: { expression: string } }[];
      };

    it('translates a text filter widget DTO to FilterWidgetProps', () => {
      const props = toFilterProps(makeFilterWidgetDto());
      expect(props.widgetType).toBe('filter');
      expect(props.attribute.expression).toBe('[Country.Country]');
      expect(props.filterType).toBe('members');
      expect(props.isMultiselect).toBe(true);
      expect(props.title).toBe('My Filter');
    });

    // SNS-131802: the query layer (validateQueryDescription) rejects attributes whose
    // `type` is a raw JAQL datatype ('text'/'numeric') — MetadataTypes.isAttribute only
    // accepts metadata attribute types ('text-attribute'/'numeric-attribute'/...). The
    // FilterWidget member query then throws BEFORE any request is sent and the editor
    // dropdown silently stays empty.
    it('builds a queryable attribute (valid metadata type) for a text dimension', () => {
      const props = toFilterProps(makeFilterWidgetDto());
      expect(MetadataTypes.isAttribute(props.attribute)).toBe(true);
      expect(props.attribute.type).toBe('text-attribute');
    });

    it('builds a queryable attribute (valid metadata type) for a numeric dimension', () => {
      const props = toFilterProps(
        makeFilterWidgetDto({
          jaql: { dim: '[Commerce.Revenue]', datatype: 'numeric', title: 'Revenue' },
        }),
      );
      expect(MetadataTypes.isAttribute(props.attribute)).toBe(true);
      expect(props.attribute.type).toBe('numeric-attribute');
    });

    it('defaults a datetime dimension WITHOUT a level to a Years LevelAttribute', () => {
      // Both pickers stamp a level on date dims; a hand-crafted/legacy DTO may omit it.
      // Mirrors the picker semantics: a date pick always creates a Years filter.
      const props = toFilterProps(
        makeFilterWidgetDto({
          jaql: { dim: '[Commerce.Date (Calendar)]', datatype: 'datetime', title: 'Date' },
        }),
      );
      expect(props.attribute.granularity).toBe('Years');
      expect(MetadataTypes.isAttribute(props.attribute)).toBe(true);
    });

    it('normalizes the legacy "list" filter type to "members"', () => {
      const props = toFilterProps(makeFilterWidgetDto({ style: { filterType: 'list' } }));
      expect(props.filterType).toBe('members');
    });

    it('normalizes the "filter/<type>" subtype format', () => {
      const props = toFilterProps(makeFilterWidgetDto({ style: { filterType: 'filter/members' } }));
      expect(props.filterType).toBe('members');
    });

    it('preserves a known filter type and falls back to "members" for unknown values', () => {
      expect(
        toFilterProps(makeFilterWidgetDto({ style: { filterType: 'numericRange' } })).filterType,
      ).toBe('numericRange');
      expect(
        toFilterProps(makeFilterWidgetDto({ style: { filterType: 'bogus' } })).filterType,
      ).toBe('members');
    });

    it('builds a LevelAttribute with granularity for a datetime dimension', () => {
      const props = toFilterProps(
        makeFilterWidgetDto({
          jaql: {
            dim: '[Commerce.Date (Calendar)]',
            level: 'years',
            datatype: 'datetime',
            title: 'Years',
          },
        }),
      );
      expect(props.attribute.granularity).toBe('Years');
    });

    it('respects allowMultiselect / multiSelection style flags', () => {
      expect(
        toFilterProps(makeFilterWidgetDto({ style: { allowMultiselect: false } })).isMultiselect,
      ).toBe(false);
      expect(
        toFilterProps(makeFilterWidgetDto({ style: { multiSelection: false } })).isMultiselect,
      ).toBe(false);
    });

    it('yields an empty attribute when no dimension item is present', () => {
      const props = toFilterProps(makeFilterWidgetDto({ noItems: true }));
      expect(props.attribute.expression).toBeFalsy();
    });

    it('passes enabled widget filters from the DTO filters panel as parentFilters', () => {
      const props = toFilterProps(
        makeFilterWidgetDto({
          filtersPanelItems: [
            {
              jaql: {
                table: 'Commerce',
                column: 'Age Range',
                dim: '[Commerce.Age Range]',
                datatype: 'text',
                title: 'Age Range',
                filter: { members: ['0-18'] },
              },
            },
            {
              disabled: true,
              jaql: {
                dim: '[Commerce.Gender]',
                datatype: 'text',
                title: 'Gender',
                filter: { members: ['Male'] },
              },
            },
          ],
        }),
      );

      expect(props.parentFilters).toHaveLength(1);
      expect(props.parentFilters?.[0].attribute.expression).toBe('[Commerce.Age Range]');
    });

    it('passes empty parentFilters when the DTO has no filters panel', () => {
      expect(toFilterProps(makeFilterWidgetDto()).parentFilters).toEqual([]);
    });

    it('falls back to defaults for a programmatic model without filterWidgetData', () => {
      const model = fromWidgetDto(makeFilterWidgetDto());
      const props = toCommonWidgetProps({
        ...model,
        filterWidgetData: undefined,
      }) as unknown as {
        attribute: { expression: string };
        isMultiselect: boolean;
        filterType: string;
      };
      expect(props.attribute.expression).toBeFalsy();
      expect(props.isMultiselect).toBe(true);
      expect(props.filterType).toBe('members');
    });

    it('carries the widget-design style options (so the CSDK container is styled)', () => {
      const dto = makeFilterWidgetDto({
        style: {
          widgetDesign: {
            widgetBackgroundColor: '#ff0000',
            widgetBorderEnabled: true,
            widgetBorderColor: '#0000ff',
          },
        },
      });
      const props = toCommonWidgetProps(fromWidgetDto(dto)) as unknown as {
        styleOptions?: {
          backgroundColor?: string;
          border?: boolean;
          borderColor?: string;
        };
      };
      expect(props.styleOptions).toBeDefined();
      expect(props.styleOptions?.backgroundColor).toBe('#ff0000');
      expect(props.styleOptions?.border).toBe(true);
      expect(props.styleOptions?.borderColor).toBe('#0000ff');
    });
  });
});
