import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { sampleEcommerceFields as MOCK_DATA_SOURCE_FIELDS } from '@/__mocks__/sample-ecommerce-fields.js';
import { ConfiguredSisenseContextProvider } from '@/__test-helpers__/configured-sisense-context-provider.js';

import { useGetDataSourceDimensions } from './use-get-data-source-dimensions.js';

const mockDataSource = 'Sample ECommerce';

const renderHookWithWrapper = (
  params: {
    dataSource?: string;
    enabled?: boolean;
    count?: number;
    offset?: number;
    searchValue?: string;
  } = {},
) => {
  return renderHook(
    () =>
      useGetDataSourceDimensions({
        dataSource: params.dataSource,
        enabled: params.enabled,
        count: params.count,
        offset: params.offset,
        searchValue: params.searchValue,
      }),
    {
      wrapper: ConfiguredSisenseContextProvider,
    },
  );
};

describe('useGetDataSourceDimensions', () => {
  beforeEach(() => {
    server.use(
      http.post(`*/api/datasources/${encodeURIComponent(mockDataSource)}/fields/search`, () =>
        HttpResponse.json(MOCK_DATA_SOURCE_FIELDS),
      ),
    );
  });

  it('returns dimensions when successful', async () => {
    const { result } = renderHookWithWrapper({ dataSource: mockDataSource });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.dimensions).toBeDefined();
    expect(Array.isArray(result.current.dimensions)).toBe(true);
  });

  it('passes count parameter to the API', async () => {
    const count = 10;
    const { result } = renderHookWithWrapper({
      dataSource: mockDataSource,
      count,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.dimensions).toBeDefined();
  });

  it('passes offset parameter to the API', async () => {
    const offset = 5;
    const { result } = renderHookWithWrapper({
      dataSource: mockDataSource,
      offset,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.dimensions).toBeDefined();
  });

  it('passes searchValue parameter to the API', async () => {
    const searchValue = 'Brand';
    const { result } = renderHookWithWrapper({
      dataSource: mockDataSource,
      searchValue,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.dimensions).toBeDefined();
  });
});
