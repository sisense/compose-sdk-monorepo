import { type PivotQueryClient } from '@sisense/sdk-pivot-query-client';

// Create a mocked PivotClient
export const createMockPivotQueryClient = () => {
  return {
    queryData: vi.fn(),
    socketBuilder: {
      socket: {},
    },
  } as unknown as PivotQueryClient;
};
