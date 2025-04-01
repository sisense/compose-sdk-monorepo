import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useGetDataSourceFields } from './use-get-data-source-fields.js';
import { ConfiguredSisenseContextProvider } from '@/__test-helpers__/configured-sisense-context-provider.js';
import { sampleEcommerceFields as MOCK_DATA_SOURCE_FIELDS } from '@/__mocks__/sample-ecommerce-fields.js';

const mockDataSource = 'Sample ECommerce';

const renderHookWithWrapper = (dataSource: string | undefined) => {
  return renderHook(() => useGetDataSourceFields({ dataSource }), {
    wrapper: ConfiguredSisenseContextProvider,
  });
};

describe('useGetDataSourceFields', () => {
  beforeEach(() => {
    server.use(
      http.post(`*/api/datasources/${encodeURIComponent(mockDataSource)}/fields/search`, () =>
        HttpResponse.json(MOCK_DATA_SOURCE_FIELDS),
      ),
    );
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(mockDataSource);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.dataSourceFields).toStrictEqual(MOCK_DATA_SOURCE_FIELDS);
  });
});
