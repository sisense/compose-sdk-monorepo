import { useCallback } from 'react';

export function useGetLoadMoreFunction({
  increaseSliceToLoad,
  isLoadMoreRequestsForbidden,
}: {
  increaseSliceToLoad: () => void;
  isLoadMoreRequestsForbidden: boolean;
}): () => void {
  return useCallback(() => {
    if (isLoadMoreRequestsForbidden) {
      return;
    }
    increaseSliceToLoad();
  }, [isLoadMoreRequestsForbidden, increaseSliceToLoad]);
}
