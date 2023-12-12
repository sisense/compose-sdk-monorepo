import { dataLoadStateReducer } from '../common/hooks/data-load-state-reducer.js';
import { CsvQueryAction, CsvQueryState } from './types.js';

export function downloadCsvQueryStateReducer(
  state: CsvQueryState,
  action: CsvQueryAction,
): CsvQueryState {
  return dataLoadStateReducer<Blob | string>(state, action);
}
