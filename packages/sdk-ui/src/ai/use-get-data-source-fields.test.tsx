/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AiTestWrapper } from './__mocks__/index.js';
import { useGetDataSourceFields } from './use-get-data-source-fields.js';
import { MOCK_DATA_SOURCE_FIELDS } from './__mocks__/data-source-fields.js';

const mockDataSource = 'Sample ECommerce';

const renderHookWithWrapper = (dataSource: string | undefined) => {
  return renderHook(() => useGetDataSourceFields(dataSource), { wrapper: AiTestWrapper });
};

describe('useGetDataSource', () => {
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
    expect(result.current.data).toStrictEqual(MOCK_DATA_SOURCE_FIELDS);
  });
});
