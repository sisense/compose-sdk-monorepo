import { useLastDefined } from '@/common/hooks/use-last-defined';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { DataChunk, Slice } from '../../types';
import { calculateIfAllItemsLoaded } from '../utils';

export function useManageSliceToLoad({
  initialCount,
  chunkSize,
  accumulatedData,
  shouldBeReset,
}: {
  initialCount: number;
  chunkSize: number;
  accumulatedData: DataChunk[];
  shouldBeReset: boolean;
}): { sliceToLoad: Slice; increaseSliceToLoad: () => void } {
  const initialSlice: Slice = useMemo(() => ({ count: initialCount, offset: 0 }), [initialCount]);

  const [totalSlice, setTotalSlice] = useState<Slice>(initialSlice);

  const sliceToLoad = useLastDefined(
    getSliceToLoad(shouldBeReset ? initialSlice : totalSlice, accumulatedData),
  );

  const increaseSliceToLoad = useCallback(() => {
    setTotalSlice({
      offset: 0,
      count: totalSlice.count + chunkSize,
    });
  }, [chunkSize, totalSlice.count]);

  useEffect(() => {
    if (shouldBeReset) {
      setTotalSlice(initialSlice);
    }
  }, [initialSlice, shouldBeReset]);

  return { sliceToLoad, increaseSliceToLoad };
}

function getSliceToLoad(totalSlice: Slice, alreadyLoadedData: DataChunk[]): Slice | null {
  const alreadyLoadedCount = alreadyLoadedData.reduce((acc, { slice }) => acc + slice.count, 0);

  if (alreadyLoadedCount === 0) {
    return totalSlice;
  }

  if (alreadyLoadedCount === totalSlice.count) {
    return null;
  }

  const isAllItemsLoaded = alreadyLoadedData.some(calculateIfAllItemsLoaded);
  if (isAllItemsLoaded) {
    return null;
  }

  const lastLoadedSlice = alreadyLoadedData[alreadyLoadedData.length - 1].slice;
  const nextSliceOffset = lastLoadedSlice.offset + lastLoadedSlice.count;
  const nextSliceCount = totalSlice.count - alreadyLoadedCount;
  return { count: nextSliceCount, offset: nextSliceOffset };
}
