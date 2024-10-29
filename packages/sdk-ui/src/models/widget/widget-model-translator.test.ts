/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WidgetDto } from '@/index';
import {
  toChartWidgetProps,
  fromWidgetDto,
  toWidgetDto,
  fromChartWidgetProps,
} from './widget-model-translator';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { commonDataSources } from '../__mocks__/common-datasources';
import cloneDeep from 'lodash-es/cloneDeep';

describe('WidgetModelTranslator', () => {
  const mockIndicatorWidgetDto = dashboardMock.widgets![0];
  const mockLineWidgetDto = dashboardMock.widgets![7];
  const mockTableWidgetDto = dashboardMock.widgets![9];
  const dataSource = commonDataSources[0];
  let resWidgetDto: WidgetDto;

  const getWidgetTransformChain = (widgetDto: WidgetDto) => {
    const widget = fromWidgetDto(widgetDto);
    const chartProps = toChartWidgetProps(widget);
    const widgetFromChart = fromChartWidgetProps(chartProps);
    return { widget, chartProps, widgetFromChart };
  };

  describe('fromChartWidgetProps + toWidgetDto', () => {
    it('should create a valid WidgetDto for the "line" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockLineWidgetDto);
      expect(widgetFromChart.chartType).toBe('line');

      resWidgetDto = toWidgetDto(widgetFromChart, dataSource);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.type).toBe(mockLineWidgetDto.type);
    });

    it('should create a valid WidgetDto for the "table" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockTableWidgetDto);
      expect(widgetFromChart.chartType).toBe('table');

      resWidgetDto = toWidgetDto(widgetFromChart, dataSource);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.type).toBe('tablewidget');
    });

    it('should create a valid WidgetDto for the "indicator" chart', () => {
      const { widgetFromChart } = getWidgetTransformChain(mockIndicatorWidgetDto);
      expect(widgetFromChart.chartType).toBe('indicator');

      resWidgetDto = toWidgetDto(widgetFromChart, dataSource);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      expect(resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters').length).toBe(1);
      expect(resWidgetDto.subtype).toBe('indicator/gauge');
      expect(resWidgetDto.type).toBe(mockIndicatorWidgetDto.type);
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
