/** @vitest-environment jsdom */
import { createAttribute } from '@sisense/sdk-data';
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executePivotQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import {
  usePivotBuilderMock,
  usePivotClientMock,
} from '@/domains/visualizations/components/pivot-table/__mocks__/pivot-hooks';
import { createMockPivotQueryClient } from '@/domains/visualizations/components/pivot-table/__mocks__/pivot-query-client-mock';
import { usePivotBuilder } from '@/domains/visualizations/components/pivot-table/hooks/use-pivot-builder';
import { usePivotClient } from '@/domains/visualizations/components/pivot-table/hooks/use-pivot-client';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { PivotTableWidget } from './pivot-table-widget';

setupI18nMock();

const ageRange = createAttribute({
  name: 'Age Range',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('@/domains/visualizations/components/pivot-table/hooks/use-pivot-client');
vi.mock('@/domains/visualizations/components/pivot-table/hooks/use-pivot-builder');
vi.mock('./use-with-pivot-table-widget-drilldown', async () => {
  const React = await import('react');
  return {
    useWithPivotTableWidgetDrilldown: (params: {
      propsToExtend: unknown;
      onDrilldownSelectionsChange?: (
        target: { dataOptionName: string; dataOptionIndex: number },
        selections: unknown[],
      ) => void;
    }) => {
      React.useEffect(() => {
        const target = { dataOptionName: 'rows' as const, dataOptionIndex: 0 };
        params.onDrilldownSelectionsChange?.(target, [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: ageRange,
          },
        ]);
      }, [params]);
      return {
        propsWithDrilldown: params.propsToExtend,
        breadcrumbs: null,
      };
    },
  };
});

describe('PivotTableWidget onChange', () => {
  beforeEach(() => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);
    const mockPivotQueryClient = createMockPivotQueryClient();
    const contextMock: SisenseContextPayload = {
      app: {
        pivotQueryClient: mockPivotQueryClient,
        settings: { trackingConfig: { enabled: false } },
      } as ClientApplication,
      isInitialized: true,
      tracking: { enabled: false, packageName: '' },
      errorBoundary: { showErrorBox: true },
    };
    useSisenseContextMock.mockReturnValue(contextMock);
    vi.mocked(usePivotClient).mockImplementation(usePivotClientMock);
    vi.mocked(usePivotBuilder).mockImplementation(usePivotBuilderMock);
  });

  it('should call onChange with drilldownSelections/changed event when drilldown selections change', async () => {
    const onChange = vi.fn();
    render(
      <PivotTableWidget
        dataSource={DM.DataSource}
        dataOptions={{
          rows: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
          columns: [],
          values: [],
        }}
        drilldownOptions={{
          drilldownTarget: { dataOptionName: 'rows', dataOptionIndex: 0 },
          drilldownSelections: [],
        }}
        onChange={onChange}
      />,
    );

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        type: 'drilldownSelections/changed',
        payload: {
          target: { dataOptionName: 'rows', dataOptionIndex: 0 },
          selections: [
            {
              points: [{ categoryValue: 'Male' }],
              nextDimension: ageRange,
            },
          ],
        },
      });
    });
  });
});
