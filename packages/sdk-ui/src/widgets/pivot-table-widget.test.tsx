/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { mockPivotTableWidgetProps } from './__mocks__/mocks';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ClientApplication } from '../app/client-application';
import { PivotClient } from '@sisense/sdk-pivot-client';
import { HttpClient, SsoAuthenticator } from '@sisense/sdk-rest-client';
import { executePivotQueryMock } from '../query/__mocks__/execute-query';
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { PivotTableWidget } from './pivot-table-widget';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

describe('PivotTableWidget', () => {
  beforeEach(() => {
    const url = 'mock-url';
    useSisenseContextMock.mockReturnValue({
      app: {
        pivotClient: new PivotClient(new HttpClient(url, new SsoAuthenticator(url), 'test'), true),
      } as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
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
