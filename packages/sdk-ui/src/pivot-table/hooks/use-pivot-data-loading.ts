import { useCallback, useEffect, useState } from 'react';

import type { InitPageData, JaqlRequest } from '@sisense/sdk-pivot-query-client';
import { EVENT_QUERY_END, EVENT_QUERY_START, PivotBuilder } from '@sisense/sdk-pivot-ui';

import { useHasChanged } from '@/common/hooks/use-has-changed';

interface LoadingState {
  isLoading: boolean;
  isNoResults: boolean;
}

/**
 * Hook that initiates loading if jaql is changed or force reload is triggered.
 * Listens to query lifecycle events to update loading state and no results state.
 */
export function usePivotDataLoading(options: {
  jaql: JaqlRequest | undefined;
  pivotBuilder: PivotBuilder;
  isForceReload: boolean;
}): LoadingState {
  const { jaql, pivotBuilder, isForceReload } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    isNoResults: false,
  });

  const isJaqlChanged = useHasChanged(jaql);

  useEffect(() => {
    if (jaql && (isJaqlChanged || isForceReload)) {
      pivotBuilder.updateJaql(jaql);
    }
  }, [isForceReload, isJaqlChanged, jaql, pivotBuilder]);

  const handleQueryStart = useCallback(() => {
    setLoadingState({ isLoading: true, isNoResults: false });
  }, []);

  const handleQueryEnd = useCallback((data: InitPageData) => {
    setLoadingState({
      isLoading: false,
      isNoResults: !data.cellsMetadata,
    });
  }, []);

  useEffect(() => {
    const eventHandlers = [
      { event: EVENT_QUERY_START, handler: handleQueryStart },
      { event: EVENT_QUERY_END, handler: handleQueryEnd },
    ];

    eventHandlers.forEach(({ event, handler }) => {
      pivotBuilder.on(event, handler);
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        pivotBuilder.off(event, handler);
      });
    };
  }, [pivotBuilder, handleQueryStart, handleQueryEnd]);

  return loadingState;
}
