import { QueryResultData } from '@sisense/sdk-data';

import { dataLoadStateReducer } from '../common/hooks/data-load-state-reducer';
import { QueryAction, QueryState } from './types';

/** @internal */
export function queryStateReducer(state: QueryState, action: QueryAction): QueryState {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case 'success-load-more':
      return {
        ...state,
        isLoading: false,
        isError: false,
        isSuccess: true,
        status: 'success',
        error: undefined,
        data: {
          columns: state.data?.columns ?? action.data?.columns ?? [],
          rows: [
            ...(state?.data?.rows ? state.data.rows : []),
            ...(action.data.rows ? action.data.rows : []),
          ],
        },
      };
    default:
      return dataLoadStateReducer<QueryResultData>(state, action);
  }
}
