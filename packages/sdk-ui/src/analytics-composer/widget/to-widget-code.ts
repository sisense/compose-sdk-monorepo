import { ChartWidgetProps } from '@/props';
import { ByIdWidgetCodeParams, ClientSideWidgetCodeParams, UiFramework } from '../types.js';
import { isChartWidgetProps } from '@/widget-by-id/utils.js';
import { TranslatableError } from '@/translation/translatable-error';
import { validateChartType } from '../common/utils.js';
import {
  stringifyDataSource,
  stringifyExtraImports,
  stringifyDataOptions,
} from '../common/stringify-props.js';
import { ChartType } from '@/types';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from './stringify-filters.js';
import { CodeTemplateKey } from '../types.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;

const widgetByIdTemplateKeys: CodeTemplateKey[] = ['executeQueryByWidgetIdTmpl', 'widgetByIdTmpl'];
const widgetTemplateKey: CodeTemplateKey = 'chartWidgetTmpl';

const stringifyChartType = (chartType: ChartType): string => {
  return chartType as string;
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
    extraImportsString: stringifyExtraImports(props.filters || []),
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
}: ClientSideWidgetCodeParams): string => {
  if (isChartWidgetProps(widgetProps)) {
    validateChartType(widgetProps.chartType);
    const templateKey = widgetTemplateKey;
    return getChartWidgetCode(widgetProps, uiFramework, templateKey);
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};
