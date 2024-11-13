/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { PivotTable } from './pivot-table';
import { mockPivotTableProps } from './__mocks__/mocks';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ClientApplication } from '../app/client-application';
import { PivotClient } from '@sisense/sdk-pivot-client';
import { SsoAuthenticator } from '@sisense/sdk-rest-client';
import { executePivotQueryMock } from '../query/__mocks__/execute-query';
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { SisenseContextPayload } from '@/sisense-context/sisense-context';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

describe('PivotTable', () => {
  beforeEach(() => {
    const url = 'mock-url';
    const contextMock: SisenseContextPayload = {
      app: {
        pivotClient: new PivotClient(url, new SsoAuthenticator(url), true),
        settings: {
          trackingConfig: { enabled: false },
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
  });
  it('should render empty pivot table', async () => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);
    const { container, findByLabelText } = render(<PivotTable {...mockPivotTableProps} />);
    const pivotTable = await findByLabelText('pivot-table-root');
    expect(pivotTable).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('should handle error', async () => {
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);
    const { findByLabelText, findByText } = render(<PivotTable {...mockPivotTableProps} />);

    const errorBoxContainer = await findByLabelText('error-box');
    fireEvent.mouseEnter(errorBoxContainer);
    const errorBoxText = await findByText(/errorBoxText/);
    expect(errorBoxText).toBeTruthy();

    spy.mockRestore();
  });
});
