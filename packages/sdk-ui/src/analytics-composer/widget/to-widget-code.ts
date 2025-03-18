import { ChartWidgetProps, PivotTableWidgetProps } from '@/props';
import {
  ByIdWidgetCodeParams,
  ClientSideWidgetCodeParams,
  UiFramework,
  ChartWidgetCodeProps,
  PivotTableWidgetCodeProps,
} from '../types.js';
import { isChartWidgetProps, isPivotTableWidgetProps } from '@/widget-by-id/utils.js';
import { TranslatableError } from '@/translation/translatable-error';
import { validateChartType, checkIfMeasuresExist } from '../common/utils.js';
import {
  stringifyDataSource,
  stringifyExtraImports,
  stringifyDataOptions,
} from '../common/stringify-props.js';
import { ChartType } from '@/types';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from './stringify-filters.js';
import { CodeTemplateKey } from '../types.js';
import { stringifyProps } from '../widget/stringify-props';
import { CODE_TEMPLATES_INDENT } from '../common/constants.js';

const widgetByIdTemplateKeys: CodeTemplateKey[] = ['executeQueryByWidgetIdTmpl', 'widgetByIdTmpl'];
const widgetTemplateKey: CodeTemplateKey = 'chartWidgetTmpl';
const pivotTableWidgetTemplateKey: CodeTemplateKey = 'pivotTableWidgetTmpl';

const stringifyChartType = (chartType: ChartType): string => {
  return chartType as string;
};

const getChartWidgetCode = (
  props: ChartWidgetProps,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const hasMeasures = checkIfMeasuresExist(props);
  const codeProps: ChartWidgetCodeProps = {
    titleString: props.title,
    dataSourceString: stringifyDataSource(props.dataSource),
    chartTypeString: stringifyChartType(props.chartType),
    dataOptionsString: stringifyDataOptions(props.dataOptions),
    filtersString: stringifyFilters(props.filters),
    componentString: 'ChartWidget',
    extraImportsString: stringifyExtraImports(props.filters || [], hasMeasures),
    styleOptionsString: stringifyProps(props.styleOptions || {}, CODE_TEMPLATES_INDENT),
    drilldownOptionsString: stringifyProps(props.drilldownOptions || {}, CODE_TEMPLATES_INDENT),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};

const getPivotTableWidgetCode = (
  props: PivotTableWidgetProps,
  uiFramework: UiFramework,
  templateKey: CodeTemplateKey,
): string => {
  const hasMeasures = checkIfMeasuresExist(props);
  const codeProps: PivotTableWidgetCodeProps = {
    titleString: props.title,
    dataSourceString: stringifyDataSource(props.dataSource),
    dataOptionsString: stringifyProps(props.dataOptions),
    filtersString: stringifyFilters(props.filters),
    componentString: 'PivotTableWidget',
    extraImportsString: stringifyExtraImports(props.filters || [], hasMeasures),
    styleOptionsString: stringifyProps(props.styleOptions || {}, CODE_TEMPLATES_INDENT),
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

  if (isPivotTableWidgetProps(widgetProps)) {
    const templateKey = pivotTableWidgetTemplateKey;
    return getPivotTableWidgetCode(widgetProps, uiFramework, templateKey);
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};
