import { PivotQueryResultData } from '@sisense/sdk-data';

import { dataLoadStateReducer } from '../common/hooks/data-load-state-reducer.js';
import { PivotQueryAction, PivotQueryState } from './types.js';

export function pivotQueryStateReducer(
  state: PivotQueryState,
  action: PivotQueryAction,
): PivotQueryState {
  return dataLoadStateReducer<PivotQueryResultData>(state, action);
}
