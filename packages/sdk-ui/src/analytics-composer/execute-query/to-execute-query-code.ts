import { ExecuteQueryParams, ExecutePivotQueryParams } from '@/query-execution';
import { stringifyDataSource, stringifyExtraImports } from '../common/stringify-props';
import {
  ExecuteQueryCodeParams,
  ExecutePivotQueryCodeParams,
  CodeTemplateKey,
  UiFramework,
} from '../types.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../widget/stringify-filters.js';
import { stringifyProps } from '../widget/stringify-props.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExecuteQueryCodeProps = Stringify<ExecuteQueryParams> & { extraImportsString: string };
type ExecutePivotQueryCodeProps = Stringify<ExecutePivotQueryParams> & {
  extraImportsString: string;
};

const executeQueryTemplateKey: CodeTemplateKey = 'executeQueryTmpl';
const executePivotQueryTemplateKey: CodeTemplateKey = 'executePivotQueryTmpl';

const getExecuteQueryCode = (
  queryParams: ExecuteQueryParams,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const codeProps: ExecuteQueryCodeProps = {
    dataSourceString: stringifyDataSource(queryParams.dataSource),
    dimensionsString: stringifyProps(queryParams.dimensions || []),
    measuresString: stringifyProps(queryParams.measures || []),
    filtersString: stringifyFilters(queryParams.filters),
    highlightsString: stringifyProps(queryParams.highlights || []),
    extraImportsString: stringifyExtraImports(queryParams.filters || []),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

const getExecutePivotQueryCode = (
  pivotQueryParams: ExecutePivotQueryParams,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const pivotQueryProps: ExecutePivotQueryCodeProps = {
    dataSourceString: stringifyDataSource(pivotQueryParams.dataSource),
    rowsString: '[]', // TODO
    valuesString: '[]', // TODO
    extraImportsString: stringifyExtraImports(pivotQueryParams.filters || []),
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
