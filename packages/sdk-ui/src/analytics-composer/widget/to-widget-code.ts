import { WidgetProps } from '@/props';
import {
  ByIdWidgetCodeParams,
  ClientSideWidgetCodeParams,
  UiFramework,
  ChartWidgetCodeProps,
  PivotTableWidgetCodeProps,
  TemplateKeyMapByWidgetType,
} from '../types.js';
import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isPluginWidgetProps,
} from '@/widget-by-id/utils.js';
import { TranslatableError } from '@/translation/translatable-error';
import { validateChartType, checkIfMeasuresExist } from '../common/utils.js';
import {
  stringifyDataSource,
  stringifyExtraImports,
  stringifyDataOptions,
} from '../code/stringify-props.js';
import { ChartType } from '@/types';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../code/stringify-filters.js';
import { CodeTemplateKey } from '../types.js';
import { stringifyProps } from '../code/stringify-props.js';
import { CODE_TEMPLATES_INDENT } from '../common/constants.js';

const widgetByIdTemplateKeys: CodeTemplateKey[] = ['executeQueryByWidgetIdTmpl', 'widgetByIdTmpl'];
const widgetTemplateKey: CodeTemplateKey = 'chartWidgetTmpl';
const pivotTableWidgetTemplateKey: CodeTemplateKey = 'pivotTableWidgetTmpl';

const stringifyChartType = (chartType: ChartType): string => {
  return chartType as string;
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

export const getWidgetCode = (
  widgetProps: WidgetProps,
  uiFramework: UiFramework,
  templateKeyMap: TemplateKeyMapByWidgetType,
): string => {
  if (isChartWidgetProps(widgetProps)) {
    validateChartType(widgetProps.chartType);
    const hasMeasures = checkIfMeasuresExist(widgetProps);
    const codeProps: ChartWidgetCodeProps = {
      idString: widgetProps.id,
      widgetTypeString: 'chart',
      titleString: widgetProps.title,
      dataSourceString: stringifyDataSource(widgetProps.dataSource),
      chartTypeString: stringifyChartType(widgetProps.chartType),
      dataOptionsString: stringifyDataOptions(widgetProps.dataOptions),
      filtersString: stringifyFilters(widgetProps.filters),
      componentString: 'ChartWidget',
      extraImportsString: stringifyExtraImports(widgetProps.filters || [], hasMeasures),
      styleOptionsString: stringifyProps(widgetProps.styleOptions || {}, CODE_TEMPLATES_INDENT),
      drilldownOptionsString: stringifyProps(
        widgetProps.drilldownOptions || {},
        CODE_TEMPLATES_INDENT,
      ),
    };
    return generateCode(templateKeyMap.chart, codeProps, uiFramework);
  }

  if (isPivotTableWidgetProps(widgetProps)) {
    const hasMeasures = checkIfMeasuresExist(widgetProps);
    const codeProps: PivotTableWidgetCodeProps = {
      idString: widgetProps.id,
      widgetTypeString: 'pivot',
      titleString: widgetProps.title,
      dataSourceString: stringifyDataSource(widgetProps.dataSource),
      dataOptionsString: stringifyProps(widgetProps.dataOptions),
      filtersString: stringifyFilters(widgetProps.filters),
      componentString: 'PivotTableWidget',
      extraImportsString: stringifyExtraImports(widgetProps.filters || [], hasMeasures),
      styleOptionsString: stringifyProps(widgetProps.styleOptions || {}, CODE_TEMPLATES_INDENT),
    };
    return generateCode(templateKeyMap.pivot, codeProps, uiFramework);
  }

  if (isPluginWidgetProps(widgetProps)) {
    return '/** Plugin widget code not supported yet */';
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};

export const toWidgetCodeClientSide = ({
  widgetProps,
  uiFramework = 'react',
}: ClientSideWidgetCodeParams): string => {
  const templateKeyMap: TemplateKeyMapByWidgetType = {
    chart: widgetTemplateKey,
    pivot: pivotTableWidgetTemplateKey,
  };
  return getWidgetCode(widgetProps, uiFramework, templateKeyMap);
};
