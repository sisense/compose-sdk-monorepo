import { useEffect, useMemo } from 'react';
import { PivotBuilder, PivotClient } from '@ethings-os/sdk-pivot-client';

/**
 * Hook that creates a new pivot builder
 */
export function usePivotBuilder(options: { pivotClient: PivotClient }): PivotBuilder {
  const { pivotClient } = options;

  const pivotBuilder = useMemo(() => pivotClient.preparePivotBuilder(), [pivotClient]);

  useEffect(() => {
    // Cleanup
    return () => {
      pivotBuilder.destroy();
    };
  }, [pivotBuilder]);

  return pivotBuilder;
}
