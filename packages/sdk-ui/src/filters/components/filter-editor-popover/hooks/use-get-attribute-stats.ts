import {
  Attribute,
  convertDataSource,
  isText,
  measureFactory,
  QueryResultData,
} from '@sisense/sdk-data';
import { HookEnableParam } from '@/common/hooks/types';
import { useExecuteQueryInternal } from '@/query-execution/use-execute-query';

const extractAttributeStats = (queryResult: QueryResultData) => {
  const [countCell, minCell, maxCell] = queryResult?.rows[0] || [];
  return {
    count: countCell?.data,
    ...(minCell && { min: minCell.data }),
    ...(maxCell && { max: maxCell.data }),
  };
};

interface UseGetAttributeStatsParams extends HookEnableParam {
  attribute: Attribute;
}

export type NumericAttributeStats = {
  count: number;
  min: number;
  max: number;
};

type TextAttributeStats = {
  count: number;
};

export type DatetimeAttributeStats = {
  count: number;
  min: string;
  max: string;
};

type AttributeStats = NumericAttributeStats | TextAttributeStats | DatetimeAttributeStats;

type AttributeStatsState<T = AttributeStats> = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  data: T | undefined;
};

export const useGetAttributeStats = <T = AttributeStats>(
  params: UseGetAttributeStatsParams,
): AttributeStatsState<T> => {
  const { attribute, enabled } = params;
  const {
    data: queryResult,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useExecuteQueryInternal({
    dataSource: attribute.dataSource && convertDataSource(attribute.dataSource),
    measures: isText(attribute.type)
      ? [measureFactory.countDistinct(attribute)]
      : [
          measureFactory.countDistinct(attribute),
          measureFactory.min(attribute),
          measureFactory.max(attribute),
        ],
    enabled,
  });

  return {
    isLoading,
    isError,
    isSuccess,
    error,
    data: queryResult ? (extractAttributeStats(queryResult) as T) : undefined,
  };
};
