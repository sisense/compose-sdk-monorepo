import {
  ByIdDashboardCodeParams,
  ClientSideDashboardCodeParams,
  DashboardCodeProps,
} from '../types.js';
import { stringifyDataSource, stringifyExtraImports } from '../code/stringify-props.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../code/stringify-filters.js';
import { CodeTemplateKey } from '../types.js';
import { stringifyProps } from '../code/stringify-props.js';
import { CODE_TEMPLATES_INDENT } from '../common/constants.js';
import { type Filter } from '@ethings-os/sdk-data';
import { checkIfMeasuresExist } from '../common/utils.js';
import { isChartWidgetProps, isPivotTableWidgetProps } from '@/widget-by-id/utils.js';
import { stringifyWidgets } from './stringify-widgets.js';

const dashboardByIdTemplateKey: CodeTemplateKey = 'dashboardByIdTmpl';
const dashboardTemplateKey: CodeTemplateKey = 'dashboardTmpl';

export const toDashboardCodeById = ({
  dashboardOid,
  uiFramework = 'react',
}: ByIdDashboardCodeParams): string => {
  const codeProps = { dashboardOid };
  const templateKey = dashboardByIdTemplateKey;
  return generateCode(templateKey, codeProps, uiFramework);
};

export const toDashboardCodeClientSide = ({
  dashboardProps,
  uiFramework = 'react',
}: ClientSideDashboardCodeParams): string => {
  const templateKey = dashboardTemplateKey;
  const hasMeasures = dashboardProps.widgets.some(
    (widget) =>
      (isChartWidgetProps(widget) || isPivotTableWidgetProps(widget)) &&
      checkIfMeasuresExist(widget),
  );
  const codeProps: DashboardCodeProps = {
    titleString: dashboardProps.title,
    defaultDataSourceString: stringifyDataSource(dashboardProps.defaultDataSource),
    widgetsString: stringifyWidgets(dashboardProps.widgets, uiFramework),
    filtersString: stringifyFilters(dashboardProps.filters),
    componentString: 'Dashboard',
    extraImportsString: stringifyExtraImports(
      dashboardProps.filters ||
        dashboardProps.widgets
          .map((widget) => ('filters' in widget ? widget.filters : []))
          .flat()
          .filter((f): f is Filter => f !== undefined) ||
        [],
      hasMeasures,
    ),
    tabbersOptionsString: stringifyProps(
      dashboardProps.tabbersOptions || {},
      CODE_TEMPLATES_INDENT,
    ),
    layoutOptionsString: stringifyProps(dashboardProps.layoutOptions || {}, CODE_TEMPLATES_INDENT),
    widgetsOptionsString: stringifyProps(
      dashboardProps.widgetsOptions || {},
      CODE_TEMPLATES_INDENT,
      true,
    ),
    styleOptionsString: stringifyProps(dashboardProps.styleOptions || {}, CODE_TEMPLATES_INDENT),
  };
  return generateCode(templateKey, codeProps, uiFramework);
};
