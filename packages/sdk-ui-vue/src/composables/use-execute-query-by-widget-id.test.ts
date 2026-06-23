/** @vitest-environment jsdom */
import { executeQueryByWidgetId } from '@sisense/sdk-ui-preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useExecuteQueryByWidgetId } from './use-execute-query-by-widget-id';

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    executeQueryByWidgetId: vi.fn(),
  };
});

vi.mock('../providers/sisense-context-provider', () => ({
  getSisenseContext: vi.fn(() => ref({ app: {} })),
}));

vi.mock('./use-tracking', () => ({
  useTracking: vi.fn(() => ({ hasTrackedRef: ref(false) })),
}));

const executeQueryByWidgetIdMock = vi.mocked(executeQueryByWidgetId);

const params = {
  widgetOid: 'widget-oid',
  dashboardOid: 'dashboard-oid',
  filters: [],
};

async function flushPromises() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('useExecuteQueryByWidgetId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose the total row count from the query result', async () => {
    executeQueryByWidgetIdMock.mockResolvedValue({
      data: { columns: [], rows: [] },
      query: { dimensions: [], measures: [], filters: [], highlights: [] },
      pivotQuery: undefined,
      rowCount: 1234,
    });

    const result = useExecuteQueryByWidgetId({ ...params, includeRowCount: true });

    // rowCount starts undefined before the async query resolves
    expect(result.rowCount?.value).toBeUndefined();

    await flushPromises();
    await nextTick();

    expect(executeQueryByWidgetIdMock).toHaveBeenCalledWith(
      expect.objectContaining({ includeRowCount: true }),
    );
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual({ columns: [], rows: [] });
    expect(result.rowCount?.value).toBe(1234);
  });

  it('should leave rowCount undefined when the result has none', async () => {
    executeQueryByWidgetIdMock.mockResolvedValue({
      data: { columns: [], rows: [] },
      query: { dimensions: [], measures: [], filters: [], highlights: [] },
      pivotQuery: undefined,
      rowCount: undefined,
    });

    const result = useExecuteQueryByWidgetId(params);

    await flushPromises();
    await nextTick();

    expect(result.isSuccess.value).toBe(true);
    expect(result.rowCount?.value).toBeUndefined();
  });
});
