import { useCallback, useEffect, useState } from 'react';

import type { InitPageData, JaqlRequest } from '@sisense/sdk-pivot-query-client';
import {
  EVENT_QUERY_END,
  EVENT_QUERY_ERROR,
  EVENT_QUERY_START,
  PivotBuilder,
} from '@sisense/sdk-pivot-ui';

import { useHasChanged } from '@/shared/hooks/use-has-changed';

interface LoadingState {
  isLoading: boolean;
  isNoResults: boolean;
  error?: Error;
}

/**
 * Normalizes an error emitted by the pivot data layer into an `Error` instance.
 *
 * Server-streamed failures arrive as a plain object (for example
 * `{ type, subType, details }`), so extract a meaningful message from it.
 */
function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (error && typeof error === 'object') {
    const { details, message } = error as { details?: string; message?: string };
    if (details || message) {
      return new Error(details ?? message);
    }
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  return new Error('Pivot query failed');
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
    setLoadingState({ isLoading: true, isNoResults: false, error: undefined });
  }, []);

  const handleQueryEnd = useCallback((data: InitPageData) => {
    setLoadingState({
      isLoading: false,
      isNoResults: !data.cellsMetadata,
    });
  }, []);

  const handleQueryError = useCallback((error: unknown) => {
    setLoadingState({ isLoading: false, isNoResults: false, error: toError(error) });
  }, []);

  useEffect(() => {
    const eventHandlers = [
      { event: EVENT_QUERY_START, handler: handleQueryStart },
      { event: EVENT_QUERY_END, handler: handleQueryEnd },
      { event: EVENT_QUERY_ERROR, handler: handleQueryError },
    ];

    eventHandlers.forEach(({ event, handler }) => {
      pivotBuilder.on(event, handler);
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        pivotBuilder.off(event, handler);
      });
    };
  }, [pivotBuilder, handleQueryStart, handleQueryEnd, handleQueryError]);

  return loadingState;
}
