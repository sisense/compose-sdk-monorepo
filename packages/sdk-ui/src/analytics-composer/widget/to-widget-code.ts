import { ChartWidgetProps } from '@/props';
import { ByIdWidgetCodeParams, ClientSideWidgetCodeParams, UiFramework } from '../types.js';
import { isChartWidgetProps } from '@/widget-by-id/utils.js';
import { DataSource } from '@sisense/sdk-data';
import { TranslatableError } from '@/translation/translatable-error';
import { toKebabCase, validateChartType } from '../common/utils.js';
import { ChartDataOptions, ChartType } from '@/types';
import { stringifyProps } from './stringify-props.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from './stringify-filters.js';
import { CodeTemplateKey } from '../types.js';
import {
  fromChartWidgetProps,
  toExecuteQueryParams,
} from '../../models/widget/widget-model-translator.js';
import { ExecuteQueryParams } from '@/query-execution';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;
type ExecuteQueryCodeProps = Stringify<ExecuteQueryParams> & { extraImportsString: string };

const widgetByIdTemplateKeys: CodeTemplateKey[] = ['executeQueryByWidgetIdTmpl', 'widgetByIdTmpl'];
const widgetClientSideTemplateKeys: CodeTemplateKey[] = [
  'executeQueryWidgetTmpl',
  'chartWidgetTmpl',
];

const stringifyDataSource = (dataSource: DataSource | undefined): string => {
  if (!dataSource) {
    throw new TranslatableError('errors.undefinedDataSource');
  }

  let dataSourceString: string;

  if (typeof dataSource === 'object' && 'title' in dataSource) {
    dataSourceString = dataSource.title;
  } else {
    dataSourceString = dataSource;
  }

  return toKebabCase(dataSourceString);
};

const stringifyChartType = (chartType: ChartType): string => {
  return chartType as string;
};

const stringifyDataOptions = (dataOptions: ChartDataOptions): string => {
  return stringifyProps(dataOptions, 2);
};

const stringifyExtraImports = (props: ChartWidgetProps): string => {
  const importNames = ['measureFactory'];

  const { filters } = props;
  if (Array.isArray(filters) && filters.length > 0) {
    importNames.push('filterFactory');
  }

  return `import { ${importNames.join(', ')} } from '@sisense/sdk-data';`;
};

const getChartWidgetCode = (
  props: ChartWidgetProps,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const codeProps: ChartWidgetCodeProps = {
    titleString: props.title,
    dataSourceString: stringifyDataSource(props.dataSource),
    chartTypeString: stringifyChartType(props.chartType),
    dataOptionsString: stringifyDataOptions(props.dataOptions),
    filtersString: stringifyFilters(props.filters),
    componentString: 'ChartWidget',
    extraImportsString: stringifyExtraImports(props),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

const getExecuteQueryWidgetCode = (
  props: ChartWidgetProps,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const widgetModel = fromChartWidgetProps(props);
  const queryParams = toExecuteQueryParams(widgetModel);
  const codeProps: ExecuteQueryCodeProps = {
    dataSourceString: stringifyDataSource(queryParams.dataSource),
    dimensionsString: '[]', // TODO
    measuresString: '[]', // TODO
    filtersString: stringifyFilters(queryParams.filters),
    highlightsString: '[]', // TODO
    extraImportsString: stringifyExtraImports(props),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

export const toWidgetCodeById = ({
  dashboardOid,
  widgetOid,
  uiFramework = 'react',
  chartType = 'table',
  includeChart = true,
}: ByIdWidgetCodeParams): string => {
  validateChartType(chartType);
  const codeProps = { dashboardOid, widgetOid };
  const templateKey = widgetByIdTemplateKeys[Number(includeChart)];
  return generateCode(templateKey, codeProps, uiFramework);
};

export const toWidgetCodeClientSide = ({
  widgetProps,
  uiFramework = 'react',
  includeChart = true,
}: ClientSideWidgetCodeParams): string => {
  if (isChartWidgetProps(widgetProps)) {
    validateChartType(widgetProps.chartType);
    const templateKey = widgetClientSideTemplateKeys[Number(includeChart)];
    if (includeChart) return getChartWidgetCode(widgetProps, uiFramework, templateKey);
    return getExecuteQueryWidgetCode(widgetProps, uiFramework, templateKey);
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};
