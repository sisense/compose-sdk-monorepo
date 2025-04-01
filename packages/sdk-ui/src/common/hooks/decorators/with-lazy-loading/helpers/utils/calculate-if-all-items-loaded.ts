import { DataChunk } from '../../types';

export const calculateIfAllItemsLoaded = (dataChunk: DataChunk | null): boolean => {
  return !!(dataChunk && dataChunk.data.length < dataChunk.slice.count);
};
