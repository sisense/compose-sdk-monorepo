/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cloneDeep from 'lodash-es/cloneDeep';

import { WidgetDto } from '@/index';

import { advancedLineChartWidgetDto } from '../__mocks__/advanced-line-chart-widget';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import {
  fromChartWidgetProps,
  fromWidgetDto,
  toChartWidgetProps,
  toWidgetDto,
} from './widget-model-translator';

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

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.type).toBe(mockLineWidgetDto.type);
      expect(resWidgetDto.metadata.panels[0].name).toBe('x-axis');
      expect(resWidgetDto.metadata.panels[1].name).toBe('values');
    });

    it('should create a valid WidgetDto for the "line" chart with advanced analytics', () => {
      const { widgetFromChart } = getWidgetTransformChain(advancedLineChartWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart);

      expect(resWidgetDto.type).toBe(advancedLineChartWidgetDto.type);
      // values

      resWidgetDto.metadata.panels[1].items.forEach((actualItem, index) => {
        const expectedItem = advancedLineChartWidgetDto.metadata.panels[1].items[index];
        expect(actualItem.panel).toBe(expectedItem.panel);
        expect(actualItem.y2).toBe(expectedItem.y2);
        expect(actualItem.statisticalModels).toStrictEqual(expectedItem.statisticalModels);
        expect(actualItem.format?.color).toStrictEqual(expectedItem.format?.color);
      });
    });

    it('should create a valid WidgetDto for the "table" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTableWidgetDto);
      expect(widgetFromChart.chartType).toBe('table');

      resWidgetDto = toWidgetDto(widgetFromChart);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.type).toBe('tablewidget');
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

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'y-axis').length).toBe(1);
      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'x-axis').length).toBe(1);
      expect(resWidgetDto.type).toBe(mockScatterWidgetDto.type);
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
      expect(valuesPanel.length).toBe(1);
      expect(valuesPanel[0].items.length).toBe(0);
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
});
