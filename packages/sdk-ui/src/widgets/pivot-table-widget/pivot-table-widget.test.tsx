/** @vitest-environment jsdom */
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import { usePivotBuilderMock, usePivotClientMock } from '@/pivot-table/__mocks__/pivot-hooks';
import { createMockPivotQueryClient } from '@/pivot-table/__mocks__/pivot-query-client-mock';
import { usePivotBuilder } from '@/pivot-table/hooks/use-pivot-builder';
import { usePivotClient } from '@/pivot-table/hooks/use-pivot-client';
import { SisenseContextPayload } from '@/sisense-context/sisense-context';

import { ClientApplication } from '../../app/client-application';
import { executePivotQueryMock } from '../../query/__mocks__/execute-query';
import { useSisenseContextMock } from '../../sisense-context/__mocks__/sisense-context';
import { mockPivotTableWidgetProps } from '../__mocks__/mocks';
import { PivotTableWidget } from './pivot-table-widget';

setupI18nMock();

vi.mock('../../query/execute-query');
vi.mock('../../sisense-context/sisense-context');
vi.mock('../../pivot-table/hooks/use-pivot-client');
vi.mock('../../pivot-table/hooks/use-pivot-builder');
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
    const { container, findByLabelText } = render(
      <PivotTableWidget {...mockPivotTableWidgetProps} />,
    );
    const pivotTable = await findByLabelText('pivot-table-root');
    expect(pivotTable).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});
