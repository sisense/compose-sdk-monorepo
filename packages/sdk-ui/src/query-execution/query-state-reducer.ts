import { QueryResultData } from '@sisense/sdk-data';
import { dataLoadStateReducer } from '../common/hooks/data-load-state-reducer';
import { QueryAction, QueryState } from './types';

export function queryStateReducer(state: QueryState, action: QueryAction): QueryState {
  return dataLoadStateReducer<QueryResultData>(state, action);
}
