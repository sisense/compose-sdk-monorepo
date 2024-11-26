import { MOCK_QUERY_MODEL_1, MOCK_QUERY_MODEL_2 } from '../__mocks__/mock-queries';
import {
  MOCK_CODE_REACT_1,
  MOCK_CODE_ANGULAR_1,
  MOCK_CODE_VUE_1,
  MOCK_CODE_REACT_3,
  MOCK_CODE_ANGULAR_2,
  MOCK_CODE_VUE_2,
  MOCK_CODE_EXECUTE_QUERY_REACT_1,
  MOCK_CODE_EXECUTE_QUERY_ANGULAR_1,
  MOCK_CODE_EXECUTE_QUERY_VUE_1,
} from '../__mocks__/mock-code-examples';
import { commonDataSources } from '../__mocks__/common-datasources';
import * as widgetComposer from './widget-composer';
import { ExpandedQueryModel, WidgetCodeParams } from '../types';
import { isChartWidgetProps } from '@/widget-by-id/utils';
import { widgetModelTranslator, ChartWidgetProps } from '@/index';

describe('widgetComposer', () => {
  describe('toWidgetProps', () => {
    it('should translate query model to widget props', () => {
      [MOCK_QUERY_MODEL_1, MOCK_QUERY_MODEL_2].forEach((queryModel) => {
        const widgetProps = widgetComposer.toWidgetProps(queryModel);
        expect(widgetProps).toBeDefined();
        if (!widgetProps) return;
        expect(isChartWidgetProps(widgetProps)).toBe(true);
      });
    });

    it('should handle empty query modeltranslate query model to widget props', () => {
      const queryModel1 = { ...MOCK_QUERY_MODEL_1, jaql: { datasource: {} } } as ExpandedQueryModel;
      const queryModel2 = {
        ...MOCK_QUERY_MODEL_1,
        jaql: { datasource: { title: 'Sample ECommerce' }, metadata: [] },
      } as ExpandedQueryModel;
      [queryModel1, queryModel2].forEach((queryModel) => {
        const widgetProps = widgetComposer.toWidgetProps(queryModel);
        expect(widgetProps).toBeUndefined();
      });
    });

    it('check Nlq/composer compatibility with WidgetDto transformation', () => {
      const widgetProps = widgetComposer.toWidgetProps(MOCK_QUERY_MODEL_1);
      expect(widgetProps).toBeDefined();
      const widgetFromChart = widgetModelTranslator.fromChartWidgetProps(
        widgetProps as ChartWidgetProps,
      );

      expect(widgetFromChart.chartType).toBe('bar');
      const dataSource = {
        ...commonDataSources[0],
        type: commonDataSources[0].live ? 'live' : 'elasticube',
      };

      const resWidgetDto = widgetModelTranslator.toWidgetDto(widgetFromChart, dataSource);

      // console.log(JSON.stringify(resWidgetDto, null, 2));

      const filtersPanels = resWidgetDto.metadata.panels.filter(({ name }) => name === 'filters');
      expect(filtersPanels.length).toBe(1);

      expect((filtersPanels[0].items[0].jaql as any).filter.members).toBeDefined();
      expect((filtersPanels[0].items[0].jaql as any).filter.members).toEqual(
        expect.arrayContaining(['Cambodia', 'United States']),
      );
      expect(resWidgetDto.type).toBe('chart/bar');
    });
  });

  describe('toWidgetCode Client Side', () => {
    let widgetCodeParams: WidgetCodeParams;
    beforeEach(() => {
      const widgetProps = widgetComposer.toWidgetProps(MOCK_QUERY_MODEL_1);
      if (!widgetProps) return;
      widgetCodeParams = { widgetProps }; // react by default
    });

    it('should compose client-side widget code in React', () => {
      expect(widgetComposer.toWidgetCode(widgetCodeParams)).toEqual(MOCK_CODE_REACT_1);
    });
    it('should compose client-side widget code in Angular', () => {
      expect(widgetComposer.toWidgetCode({ ...widgetCodeParams, uiFramework: 'angular' })).toEqual(
        MOCK_CODE_ANGULAR_1,
      );
    });
    it('should compose client-side widget code in Vue', () => {
      expect(widgetComposer.toWidgetCode({ ...widgetCodeParams, uiFramework: 'vue' })).toEqual(
        MOCK_CODE_VUE_1,
      );
    });
  });

  describe('toWidgetCode By ID', () => {
    let widgetCodeParams: WidgetCodeParams;
    beforeEach(() => {
      widgetCodeParams = {
        dashboardOid: 'SOME_DASHBOARD_OID',
        widgetOid: 'SOME_WIDGET_BY_ID',
        chartType: 'table',
      }; // react by default
    });

    it('should compose By ID widget code in React', () => {
      expect(widgetComposer.toWidgetCode(widgetCodeParams)).toEqual(MOCK_CODE_REACT_3);
    });
    it('should compose By ID widget code in Angular', () => {
      expect(widgetComposer.toWidgetCode({ ...widgetCodeParams, uiFramework: 'angular' })).toEqual(
        MOCK_CODE_ANGULAR_2,
      );
    });
    it('should compose By ID widget code in Vue', () => {
      expect(widgetComposer.toWidgetCode({ ...widgetCodeParams, uiFramework: 'vue' })).toEqual(
        MOCK_CODE_VUE_2,
      );
    });
    it('should compose By ID widget code in React with chart not included', () => {
      expect(
        widgetComposer.toWidgetCode({
          ...widgetCodeParams,
          uiFramework: 'react',
          includeChart: false,
        }),
      ).toEqual(MOCK_CODE_EXECUTE_QUERY_REACT_1);
    });
    it('should compose By ID widget code in Angular with chart not included', () => {
      expect(
        widgetComposer.toWidgetCode({
          ...widgetCodeParams,
          uiFramework: 'angular',
          includeChart: false,
        }),
      ).toEqual(MOCK_CODE_EXECUTE_QUERY_ANGULAR_1);
    });
    it('should compose By ID widget code in Vue with chart not included', () => {
      expect(
        widgetComposer.toWidgetCode({
          ...widgetCodeParams,
          uiFramework: 'vue',
          includeChart: false,
        }),
      ).toEqual(MOCK_CODE_EXECUTE_QUERY_VUE_1);
    });
  });
});
