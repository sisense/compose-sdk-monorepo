/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { useEffect, useReducer, useState } from 'react';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { fetchFormula, fetchFormulaByOid } from './fetch-formula.js';
import { CalculatedMeasure, DimensionalCalculatedMeasure } from '@sisense/sdk-data';
import { TranslatableError } from '../translation/translatable-error.js';
import { UseGetSharedFormulaParams } from '../props.js';
import { HookEnableParam } from '../common/hooks/types.js';
import { withTracking } from '../decorators/hook-decorators/with-tracking.js';
import { usePrevious } from '../common/hooks/use-previous.js';
import { DataState, dataLoadStateReducer } from '../common/hooks/data-load-state-reducer.js';
import { isEqual } from 'lodash';

/**
 * Parameters for {@link useGetSharedFormula} hook.
 */
export interface GetSharedFormulaParams extends UseGetSharedFormulaParams, HookEnableParam {
  /**
   * Dashboard identifier
   */
  dashboardOid: string;
}

/**
 * States of a shared formula load.
 */
export type SharedFormulaState =
  | SharedFormulaLoadingState
  | SharedFormulaErrorState
  | SharedFormulaSuccessState;

/**
 * State of a shared formula loading.
 */
export type SharedFormulaLoadingState = {
  /** Whether the shared formula is loading */
  isLoading: true;
  /** Whether the shared formula load has failed */
  isError: false;
  /** Whether the shared formula load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result shared formula if the load has succeeded */
  formula: CalculatedMeasure | null;
  /** The status of the shared formula load */
  status: 'loading';
};

/**
 * State of a shared formula load that has failed.
 */
export type SharedFormulaErrorState = {
  /** Whether the shared formula is loading */
  isLoading: false;
  /** Whether the shared formula load has failed */
  isError: true;
  /** Whether the shared formula load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result shared formula if the load has succeeded */
  formula: undefined;
  /** The status of the shared formula load */
  status: 'error';
};

/**
 * State of a shared formula load that has succeeded.
 */
export type SharedFormulaSuccessState = {
  /** Whether the shared formula is loading */
  isLoading: false;
  /** Whether the shared formula load has failed */
  isError: false;
  /** Whether the shared formula load has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result shared formula if the load has succeeded */
  formula: CalculatedMeasure | null;
  /** The status of the shared formula load */
  status: 'success';
};

/**
 * Fetch a [shared formula](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm) from the Sisense instance
 *
 * Formula can be identified either by `oid` or by name and data source pair
 *
 * When the retrieval is successful but the shared formula is not found, the result is altered from being `undefined` to `null`
 *
 * @example
 * An example of retrieving a shared formula by oid:
    ```tsx
    const { formula, isLoading, isError } = useGetSharedFormula({ oid: 'd61c337b-fabc-4e9e-b4cc-a30116857153' })
    ```
 * @example
 * An example of retrieving a shared formula by name and data source:
    ```tsx
    const { formula, isLoading, isError } = useGetSharedFormula({ name: 'My Shared Formula', datasource: DM.DataSource })
    ```
 * @param params - {@link UseGetSharedFormulaParams}
 * @param dataSource - Data source in Sisense instance
 * @returns Formula load state that contains the status of the execution, the result formula, or the error if any
 * @group Fusion Assets
 */
export const useGetSharedFormula = withTracking('useGetSharedFormula')(useGetSharedFormulaInternal);

/**
 * {@link useGetSharedFormula} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useGetSharedFormulaInternal(params: UseGetSharedFormulaParams) {
  const { name, dataSource, oid } = params;

  if (!(oid || (name && dataSource)))
    throw new TranslatableError('errors.sharedFormula.identifierExpected');

  const prevParams = usePrevious(params);
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<CalculatedMeasure | null>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();
  const [isNeverExecuted, setIsNeverExecuted] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.sisenseContextNotFound'),
      });
    }
    if (!app) {
      return;
    }
    if (params?.enabled === false) {
      return;
    }

    if (isNeverExecuted || isParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
      dispatch({ type: 'loading' });

      let fetchPromise = Promise.resolve(<DimensionalCalculatedMeasure | null>null);
      if (oid) {
        fetchPromise = fetchFormulaByOid(oid, app);
      } else if (name && dataSource) {
        fetchPromise = fetchFormula(name, dataSource, app);
      }
      fetchPromise
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, prevParams, name, dataSource, oid, params, isNeverExecuted]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (dataState.data && isParamsChanged(prevParams, params)) {
    return translateToFormulaResponse(dataLoadStateReducer(dataState, { type: 'loading' }));
  }

  return translateToFormulaResponse(dataState);
}

/**
 * Checks if the parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
function isParamsChanged(
  prevParams: UseGetSharedFormulaParams | undefined,
  newParams: UseGetSharedFormulaParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }

  const simplySerializableParamNames = ['oid', 'name', 'dataSource'];
  return simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );
}
/**
 * @internal
 */
export function translateToFormulaResponse(dataState: DataState<CalculatedMeasure | null>) {
  const { data, ...rest } = dataState;

  return {
    ...rest,
    formula: data,
  } as SharedFormulaState;
}
