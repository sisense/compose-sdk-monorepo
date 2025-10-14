import { WidgetProps } from '@/props';
import { TranslatableError } from '@/translation/translatable-error';
import { ChartType } from '@/types';
import {
  isChartWidgetProps,
  isCustomWidgetProps,
  isPivotTableWidgetProps,
} from '@/widget-by-id/utils.js';

import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../code/stringify-filters.js';
import {
  removeDefaultDataOptionsProps,
  removeDefaultStyleOptionsProps,
  stringifyProps,
} from '../code/stringify-props.js';
import {
  stringifyDataOptions,
  stringifyDataSource,
  stringifyExtraImports,
} from '../code/stringify-props.js';
import { CODE_TEMPLATES_INDENT } from '../common/constants.js';
import { checkIfMeasuresExist, validateChartType } from '../common/utils.js';
import {
  ByIdWidgetCodeParams,
  ChartWidgetCodeProps,
  ClientSideWidgetCodeParams,
  PivotTableWidgetCodeProps,
  TemplateKeyMapByWidgetType,
  UiFramework,
} from '../types.js';
import { CodeTemplateKey } from '../types.js';

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
  removeDefaultProps?: boolean,
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
      dataOptionsString: stringifyDataOptions(
        removeDefaultProps
          ? removeDefaultDataOptionsProps(widgetProps.dataOptions, widgetProps.chartType)
          : widgetProps.dataOptions,
      ),
      filtersString: stringifyFilters(widgetProps.filters),
      componentString: 'ChartWidget',
      extraImportsString: stringifyExtraImports(widgetProps.filters || [], hasMeasures),
      styleOptionsString: stringifyProps(
        removeDefaultProps
          ? removeDefaultStyleOptionsProps(widgetProps.styleOptions || {}, widgetProps.chartType)
          : widgetProps.styleOptions || {},
        CODE_TEMPLATES_INDENT,
      ),
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
      dataOptionsString: stringifyProps(
        removeDefaultProps
          ? removeDefaultDataOptionsProps(widgetProps.dataOptions, widgetProps.widgetType)
          : widgetProps.dataOptions,
      ),
      filtersString: stringifyFilters(widgetProps.filters),
      componentString: 'PivotTableWidget',
      extraImportsString: stringifyExtraImports(widgetProps.filters || [], hasMeasures),
      styleOptionsString: stringifyProps(
        removeDefaultProps
          ? removeDefaultStyleOptionsProps(widgetProps.styleOptions || {}, widgetProps.widgetType)
          : widgetProps.styleOptions || {},
        CODE_TEMPLATES_INDENT,
      ),
    };
    return generateCode(templateKeyMap.pivot, codeProps, uiFramework);
  }

  if (isCustomWidgetProps(widgetProps)) {
    return '/** Custom widget code not supported yet */';
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};

export const toWidgetCodeClientSide = ({
  widgetProps,
  uiFramework = 'react',
  removeDefaultProps = false,
}: ClientSideWidgetCodeParams): string => {
  const templateKeyMap: TemplateKeyMapByWidgetType = {
    chart: widgetTemplateKey,
    pivot: pivotTableWidgetTemplateKey,
  };
  return getWidgetCode(widgetProps, uiFramework, templateKeyMap, removeDefaultProps);
};
