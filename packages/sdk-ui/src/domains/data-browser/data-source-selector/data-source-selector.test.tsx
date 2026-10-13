import type { DataSource } from '@sisense/sdk-data';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { mockToken, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

import { DataSourceSelector } from './data-source-selector.js';

const dataSources: DataSource[] = [
  'Sample ECommerce',
  { title: 'Sample Healthcare', type: 'elasticube' },
];

// Display names are cached per Sisense URL, so each test uses its own URL
let testIndex = 0;
const renderSelector = (props: { selectedDataSource: DataSource; onChange?: () => void }) => {
  testIndex += 1;
  return setup(
    <SisenseContextProvider
      url={`http://fake-url-${testIndex}/`}
      token={mockToken}
      appConfig={{ queryCacheConfig: { enabled: false }, trackingConfig: { enabled: false } }}
    >
      <DataSourceSelector
        dataSources={dataSources}
        selectedDataSource={props.selectedDataSource}
        onChange={props.onChange ?? vi.fn()}
      />
    </SisenseContextProvider>,
  );
};

const mockDataSourceList = (displayNames: Record<string, string | null>) => {
  server.use(
    http.get('*/api/datasources/', () =>
      HttpResponse.json(
        Object.entries(displayNames).map(([title, displayName]) => ({
          title,
          fullname: `localhost/${title}`,
          live: false,
          displayName,
        })),
      ),
    ),
  );
};

describe('DataSourceSelector', () => {
  it('should show titles when the server returns no display names', async () => {
    mockDataSourceList({});
    const { user } = renderSelector({ selectedDataSource: dataSources[0] });

    await user.click(await screen.findByRole('button', { name: /Sample ECommerce/ }));

    expect(screen.getAllByText('Sample ECommerce')).toHaveLength(2);
    expect(screen.getByText('Sample Healthcare')).toBeInTheDocument();
  });

  it('should show display names for the selected value and the list items', async () => {
    mockDataSourceList({ 'Sample ECommerce': 'Online Store', 'Sample Healthcare': null });
    const { user } = renderSelector({ selectedDataSource: dataSources[0] });

    const selectorButton = await screen.findByRole('button', { name: /Online Store/ });
    await user.click(selectorButton);

    expect(screen.getAllByText('Online Store')).toHaveLength(2);
    expect(screen.getByText('Sample Healthcare')).toBeInTheDocument();
    expect(screen.queryByText('Sample ECommerce')).toBeNull();
  });

  it('should keep selecting the original data source when labelled by display name', async () => {
    mockDataSourceList({ 'Sample Healthcare': 'Hospital' });
    const onChange = vi.fn();
    const { user } = renderSelector({ selectedDataSource: dataSources[0], onChange });

    await user.click(await screen.findByRole('button', { name: /Sample ECommerce/ }));
    await user.click(await screen.findByText('Hospital'));

    expect(onChange).toHaveBeenCalledWith(dataSources[1]);
  });

  it('should render a hostile display name as plain text', async () => {
    const hostile = '<img src=x onerror="alert(1)">';
    mockDataSourceList({ 'Sample ECommerce': hostile });
    renderSelector({ selectedDataSource: dataSources[0] });

    await waitFor(() => expect(screen.getByText(hostile)).toBeInTheDocument());
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
});
