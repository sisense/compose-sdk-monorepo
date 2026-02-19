import { type Filter } from '@sisense/sdk-data';

import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';

import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from '../code/stringify-filters.js';
import { stringifyDataSource, stringifyExtraImports } from '../code/stringify-props.js';
import { stringifyProps } from '../code/stringify-props.js';
import { CODE_TEMPLATES_INDENT } from '../common/constants.js';
import { checkIfMeasuresExist } from '../common/utils.js';
import {
  ByIdDashboardCodeParams,
  ClientSideDashboardCodeParams,
  DashboardCodeProps,
} from '../types.js';
import { CodeTemplateKey } from '../types.js';
import { stringifyWidgets } from './stringify-widgets.js';

const dashboardByIdTemplateKey: CodeTemplateKey = 'dashboardByIdTmpl';
const dashboardTemplateKey: CodeTemplateKey = 'dashboardTmpl';

export const toDashboardCodeById = ({
  dashboardOid,
  uiFramework = 'react',
  config,
}: ByIdDashboardCodeParams): string => {
  const hasConfig = config && Object.keys(config).length > 0;

  const configString = hasConfig ? stringifyProps(config, CODE_TEMPLATES_INDENT) : '{}';

  const codeProps = {
    dashboardOid,
    configString,
  };

  return generateCode(dashboardByIdTemplateKey, codeProps, uiFramework);
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
    configString: stringifyProps(
      {
        toolbar: { visible: true },
        filtersPanel: { visible: true },
        tabbers: dashboardProps.config?.tabbers || {},
      },
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
