/** @vitest-environment jsdom */
import { setupI18nMock } from '@/__test-helpers__';
setupI18nMock();
import { render } from '@testing-library/react';
import { mockPivotTableWidgetProps } from './__mocks__/mocks';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ClientApplication } from '../app/client-application';
import { executePivotQueryMock } from '../query/__mocks__/execute-query';
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { PivotTableWidget } from './pivot-table-widget';
import { SisenseContextPayload } from '@/sisense-context/sisense-context';
import { createMockPivotClient } from '@/pivot-table/__mocks__/pivot-client-mock';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

describe('PivotTableWidget', () => {
  beforeEach(() => {
    const mockPivotClient = createMockPivotClient();

    const contextMock: SisenseContextPayload = {
      app: {
        pivotClient: mockPivotClient,
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
