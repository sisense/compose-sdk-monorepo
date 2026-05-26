import { dataLoadStateReducer } from '../../../../shared/hooks/data-load-state-reducer.js';
import type { ExcelQueryAction, ExcelQueryState } from '../../types.js';

export function downloadExcelQueryStateReducer(
  state: ExcelQueryState,
  action: ExcelQueryAction,
): ExcelQueryState {
  return dataLoadStateReducer<Blob>(state, action);
}
