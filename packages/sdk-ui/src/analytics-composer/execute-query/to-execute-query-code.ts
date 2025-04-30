import { ExecuteQueryParams, ExecutePivotQueryParams } from '@/query-execution';
import { stringifyDataSource, stringifyExtraImports } from '../code/stringify-props';
import {
  ExecuteQueryCodeParams,
  ExecutePivotQueryCodeParams,
  CodeTemplateKey,
  UiFramework,
  ExecuteQueryCodeProps,
  ExecutePivotQueryCodeProps,
} from '../types.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../code/stringify-filters.js';
import { stringifyProps } from '../code/stringify-props.js';
import { checkIfMeasuresExist } from '../common/utils.js';

const executeQueryTemplateKey: CodeTemplateKey = 'executeQueryTmpl';
const executePivotQueryTemplateKey: CodeTemplateKey = 'executePivotQueryTmpl';

const getExecuteQueryCode = (
  queryParams: ExecuteQueryParams,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const hasMeasures = checkIfMeasuresExist(queryParams);
  const codeProps: ExecuteQueryCodeProps = {
    dataSourceString: stringifyDataSource(queryParams.dataSource),
    dimensionsString: stringifyProps(queryParams.dimensions || []),
    measuresString: stringifyProps(queryParams.measures || []),
    filtersString: stringifyFilters(queryParams.filters),
    highlightsString: stringifyProps(queryParams.highlights || []),
    extraImportsString: stringifyExtraImports(queryParams.filters || [], hasMeasures),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

const getExecutePivotQueryCode = (
  pivotQueryParams: ExecutePivotQueryParams,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const hasMeasures = checkIfMeasuresExist(pivotQueryParams);
  const pivotQueryProps: ExecutePivotQueryCodeProps = {
    dataSourceString: stringifyDataSource(pivotQueryParams.dataSource),
    rowsString: stringifyProps(pivotQueryParams.rows || []),
    valuesString: stringifyProps(pivotQueryParams.values || []),
    filtersString: stringifyFilters(pivotQueryParams.filters),
    extraImportsString: stringifyExtraImports(pivotQueryParams.filters || [], hasMeasures),
  };
  return generateCode(templateKey, pivotQueryProps, uiFramework);
};

export const toExecuteQueryCode = ({
  queryParams,
  uiFramework = 'react',
}: ExecuteQueryCodeParams): string => {
  const templateKey = executeQueryTemplateKey;
  return getExecuteQueryCode(queryParams, uiFramework, templateKey);
};

export const toExecutePivotQueryCode = ({
  pivotQueryParams,
  uiFramework = 'react',
}: ExecutePivotQueryCodeParams): string => {
  const templateKey = executePivotQueryTemplateKey;
  return getExecutePivotQueryCode(pivotQueryParams, uiFramework, templateKey);
};
