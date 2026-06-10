/** @vitest-environment jsdom */
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
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

import { mockPivotTableWidgetProps } from '../../__mocks__/mocks';
import { calcPivotTableWidgetHeight, PivotTableWidget } from './pivot-table-widget';

setupI18nMock();

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('@/domains/visualizations/components/pivot-table/hooks/use-pivot-client');
vi.mock('@/domains/visualizations/components/pivot-table/hooks/use-pivot-builder');
vi.mock('./use-with-pivot-table-widget-drilldown.js', async () => ({
  useWithPivotTableWidgetDrilldown: (params: any) => ({ propsWithDrilldown: params.propsToExtend }),
}));

describe('PivotTableWidget', () => {
  beforeEach(() => {
    const mockPivotQueryClient = createMockPivotQueryClient();

    const contextMock: SisenseContextPayload = {
      app: {
        pivotQueryClient: mockPivotQueryClient,
        settings: {
          trackingConfig: {
            enabled: false,
          },
        },
      } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: '',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    };
    useSisenseContextMock.mockReturnValue(contextMock);

    // Mock the pivot hooks to return mock instances
    vi.mocked(usePivotClient).mockImplementation(usePivotClientMock);
    vi.mocked(usePivotBuilder).mockImplementation(usePivotBuilderMock);
  });

  it('should render empty pivot table widget', async () => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);
    const { container, findByRole } = render(<PivotTableWidget {...mockPivotTableWidgetProps} />);
    const pivotTable = await findByRole('region', { name: 'Pivot table' });
    expect(pivotTable).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});

describe('calcPivotTableWidgetHeight', () => {
  // MIN_PIVOT_HEIGHT = 100
  it('returns undefined when the pivot has not reported a height yet', () => {
    expect(calcPivotTableWidgetHeight(undefined, 32)).toBeUndefined();
  });

  it('treats a 0 pivot height as a known value and clamps to MIN_PIVOT_HEIGHT', () => {
    // E.g. the empty-pivot / no-results case — the widget should still render at MIN_PIVOT_HEIGHT
    // rather than falling back to the container default size.
    expect(calcPivotTableWidgetHeight(0, 32)).toBe(100);
  });

  it('sums the pivot height and the reserved (non-pivot) height', () => {
    expect(calcPivotTableWidgetHeight(400, 32)).toBe(432);
    expect(calcPivotTableWidgetHeight(400, 64)).toBe(464);
  });

  it('grows by the breadcrumb height so drilldown breadcrumbs do not clip pagination (SNS-128141)', () => {
    // The caller folds the top-slot height into `reservedHeight`; the function just sees the sum.
    const headerOnly = calcPivotTableWidgetHeight(400, 32);
    const headerAndBreadcrumbs = calcPivotTableWidgetHeight(400, 32 + 38);
    expect(headerAndBreadcrumbs).toBe((headerOnly as number) + 38);
  });

  it('enforces the minimum pivot height', () => {
    expect(calcPivotTableWidgetHeight(10, 0)).toBe(100);
  });
});
