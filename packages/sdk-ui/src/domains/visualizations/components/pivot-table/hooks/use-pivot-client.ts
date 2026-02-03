import { useMemo } from 'react';

import { PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { PivotClient } from '@sisense/sdk-pivot-ui';

/**
 * Hook that creates a new pivot client
 */
export function usePivotClient(options: { pivotQueryClient: PivotQueryClient }): PivotClient {
  const { pivotQueryClient } = options;

  return useMemo(() => new PivotClient(pivotQueryClient), [pivotQueryClient]);
}
