import { useState, useCallback, useEffect } from 'react';
import { DataChunk } from '../../types';

export function useDataAccumulation({ shouldBeReset }: { shouldBeReset: boolean }): {
  accumulatedData: DataChunk[];
  addData: (dataChunk: DataChunk | null) => void;
} {
  const [accumulatedData, setAccumulatedData] = useState<DataChunk[]>([]);

  const addData = useCallback(
    (dataChunk: DataChunk | null) => {
      if (
        !dataChunk ||
        accumulatedData.some(
          (accumulatedChunk) =>
            accumulatedChunk.slice.offset === dataChunk.slice.offset &&
            accumulatedChunk.slice.count === dataChunk.slice.count,
        )
      ) {
        return;
      }
      setAccumulatedData((prev) => [...prev, dataChunk]);
    },
    [accumulatedData],
  );

  useEffect(() => {
    if (shouldBeReset) {
      setAccumulatedData([]);
    }
  }, [shouldBeReset]);

  return { accumulatedData: shouldBeReset ? [] : accumulatedData, addData };
}
