/** @vitest-environment jsdom */
import { executeQuery, executeQueryWithRowCount } from '@sisense/sdk-ui-preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useExecuteQuery } from './use-execute-query';

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    executeQuery: vi.fn(),
    executeQueryWithRowCount: vi.fn(),
  };
});

vi.mock('../providers/sisense-context-provider', () => ({
  getSisenseContext: vi.fn(() => ref({ app: {} })),
}));

vi.mock('./use-tracking', () => ({
  useTracking: vi.fn(() => ({ hasTrackedRef: ref(false) })),
}));

const executeQueryMock = vi.mocked(executeQuery);
const executeQueryWithRowCountMock = vi.mocked(executeQueryWithRowCount);

const params = {
  dataSource: 'Sample ECommerce',
  dimensions: [],
  measures: [],
  filters: [],
  highlights: [],
};

async function flushPromises() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('useExecuteQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute the query and expose the data', async () => {
    executeQueryMock.mockResolvedValue({ columns: [], rows: [] });

    const result = useExecuteQuery(params);

    await flushPromises();
    await nextTick();

    expect(executeQueryMock).toHaveBeenCalled();
    expect(executeQueryWithRowCountMock).not.toHaveBeenCalled();
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual({ columns: [], rows: [] });
    expect(result.rowCount.value).toBeUndefined();
  });

  it('should fetch total row count when includeRowCount is enabled', async () => {
    executeQueryWithRowCountMock.mockResolvedValue({
      data: { columns: [], rows: [] },
      rowCount: 1234,
    });

    const result = useExecuteQuery({ ...params, includeRowCount: true });

    await flushPromises();
    await nextTick();

    expect(executeQueryWithRowCountMock).toHaveBeenCalled();
    expect(executeQueryMock).not.toHaveBeenCalled();
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual({ columns: [], rows: [] });
    expect(result.rowCount.value).toBe(1234);
  });
});
