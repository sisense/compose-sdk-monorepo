import { widgetModelTranslator } from '@/index';
import * as executeQueryComposer from './execute-query-composer';
import {
  MOCK_CODE_EXECUTE_QUERY_REACT_2,
  MOCK_CODE_EXECUTE_PIVOT_QUERY_REACT_1,
} from '../__mocks__/mock-code-examples';
import { ExecuteQueryCodeParams, ExecutePivotQueryCodeParams } from '../types';
import { sampleEcommerceDashboard } from '../../models/__mocks__/sample-ecommerce-dashboard';

describe('executeQueryComposer', () => {
  describe('toExecuteQueryParams', () => {
    it('should translate widget model to query params', () => {
      const widgets = sampleEcommerceDashboard.widgets!;
      widgets.forEach((widget) => {
        const widgetModel = widgetModelTranslator.fromWidgetDto(widget);
        const queryParams = widgetModelTranslator.toExecuteQueryParams(widgetModel);
        expect(queryParams).toBeDefined();
        if (!queryParams) return;
      });
    });
  });

  describe('toExecuteQueryCode', () => {
    let queryCodeParams: ExecuteQueryCodeParams;
    beforeEach(() => {
      queryCodeParams = {
        queryParams: {
          dataSource: 'Sample ECommerce',
          dimensions: [],
          measures: [],
          filters: [],
          highlights: [],
        },
      }; // react by default
    });

    it('should compose client-side widget code in React with chart not included', () => {
      expect(executeQueryComposer.toExecuteQueryCode(queryCodeParams)).toEqual(
        MOCK_CODE_EXECUTE_QUERY_REACT_2,
      );
    });
  });

  describe('toExecutePivotQueryCode', () => {
    let pivotQueryCodeParams: ExecutePivotQueryCodeParams;
    beforeEach(() => {
      pivotQueryCodeParams = {
        pivotQueryParams: {
          dataSource: 'Sample ECommerce',
          rows: [],
          values: [],
          filters: [],
          highlights: [],
        },
      }; // react by default
    });

    it('should compose client-side widget code in React with chart not included 1', () => {
      expect(executeQueryComposer.toExecutePivotQueryCode(pivotQueryCodeParams)).toEqual(
        MOCK_CODE_EXECUTE_PIVOT_QUERY_REACT_1,
      );
    });
  });
});
