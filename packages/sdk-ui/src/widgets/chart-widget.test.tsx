/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { mockChartWidgetPropsForTable, mockResolvedTableQuery } from './__mocks__/mocks';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ClientApplication } from '../app/client-application';
import { HttpClient, SsoAuthenticator } from '@sisense/sdk-rest-client';
import { ChartWidget } from './chart-widget';
import { executeQueryMock } from '@/query/__mocks__/execute-query';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

describe('ChartWidget', () => {
  beforeEach(() => {
    const url = 'mock-url';
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: new HttpClient(url, new SsoAuthenticator(url), 'test'),
        settings: {
          locale: 'en',
          dateConfig: {},
        },
      } as unknown as ClientApplication,
      tracking: { packageName: 'mock-package-name' },

      isInitialized: true,
      enableTracking: false,
    });
  });
  it('should render ChartWidget for table widget', async () => {
    executeQueryMock.mockResolvedValue(mockResolvedTableQuery);
    const { container, findByLabelText } = render(
      <ChartWidget {...mockChartWidgetPropsForTable} />,
    );
    const table = await findByLabelText('table-root');
    expect(table).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});
