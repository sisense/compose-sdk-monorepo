/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/** @vitest-environment jsdom */
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import { executePivotQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { mockPivotTableProps } from './__mocks__/mocks';
import { usePivotBuilderMock, usePivotClientMock } from './__mocks__/pivot-hooks';
import { createMockPivotQueryClient } from './__mocks__/pivot-query-client-mock';
import { usePivotBuilder } from './hooks/use-pivot-builder';
import { usePivotClient } from './hooks/use-pivot-client';
import { PivotTable } from './pivot-table';

setupI18nMock();

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('./hooks/use-pivot-client');
vi.mock('./hooks/use-pivot-builder');

describe('PivotTable', () => {
  beforeEach(() => {
    const mockPivotQueryClient = createMockPivotQueryClient();

    const contextMock: SisenseContextPayload = {
      app: {
        pivotQueryClient: mockPivotQueryClient,
        settings: {
          trackingConfig: { enabled: false },
          loadingIndicatorConfig: { enabled: true, delay: 0 },
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
  it('should render empty pivot table', async () => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);
    const { container, findByRole } = render(<PivotTable {...mockPivotTableProps} />);
    const pivotTable = await findByRole('region', { name: 'Pivot table' });
    expect(pivotTable).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('should handle error', async () => {
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);
    const { findByLabelText } = render(<PivotTable {...mockPivotTableProps} />);

    expect(await findByLabelText('error-box')).toBeInTheDocument();

    spy.mockRestore();
  });
});
