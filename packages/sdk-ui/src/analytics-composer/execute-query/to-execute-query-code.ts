import { ExecuteQueryParams } from '@/query-execution';
import { stringifyDataSource, stringifyExtraImports } from '../common/stringify-props';
import { ExecuteQueryCodeParams, CodeTemplateKey, UiFramework } from '../types.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../widget/stringify-filters.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExecuteQueryCodeProps = Stringify<ExecuteQueryParams> & { extraImportsString: string };

const executeQueryTemplateKey: CodeTemplateKey = 'executeQueryTmpl';

const getExecuteQueryCode = (
  queryParams: ExecuteQueryParams,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const codeProps: ExecuteQueryCodeProps = {
    dataSourceString: stringifyDataSource(queryParams.dataSource),
    dimensionsString: '[]', // TODO
    measuresString: '[]', // TODO
    filtersString: stringifyFilters(queryParams.filters),
    highlightsString: '[]', // TODO
    extraImportsString: stringifyExtraImports(queryParams.filters || []),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

export const toExecuteQueryCode = ({
  queryParams,
  uiFramework = 'react',
}: ExecuteQueryCodeParams): string => {
  const templateKey = executeQueryTemplateKey;
  return getExecuteQueryCode(queryParams, uiFramework, templateKey);
};
