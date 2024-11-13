import { ChartWidgetProps } from '@/props';
import { ByIdWidgetCodeParams, ClientSideWidgetCodeParams, UiFramework } from '../types.js';
import { isChartWidgetProps } from '@/widget-by-id/utils.js';
import { DataSource } from '@sisense/sdk-data';
import { TranslatableError } from '@/translation/translatable-error';
import { toKebabCase } from '../common/utils.js';
import { ChartDataOptions, ChartType } from '@/types';
import { stringifyProps } from './stringify-props.js';
import { generateCode } from '../code/generate-code.js';
import { stringifyFilters } from './stringify-filters.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;

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

const getChartWidgetCode = (props: ChartWidgetProps, uiFramework: UiFramework): string => {
  const codeProps: ChartWidgetCodeProps = {
    titleString: props.title,
    dataSourceString: stringifyDataSource(props.dataSource),
    chartTypeString: stringifyChartType(props.chartType),
    dataOptionsString: stringifyDataOptions(props.dataOptions),
    filtersString: stringifyFilters(props.filters),
    componentString: 'ChartWidget',
    extraImportsString: stringifyExtraImports(props),
  };
  return generateCode('chartWidgetTmpl', codeProps, uiFramework);
};

export const toWidgetCodeById = ({
  dashboardOid,
  widgetOid,
  uiFramework = 'react',
}: ByIdWidgetCodeParams): string => {
  const codeProps = { dashboardOid, widgetOid };
  return generateCode('widgetByIdTmpl', codeProps, uiFramework);
};

export const toWidgetCodeClientSide = ({
  widgetProps,
  uiFramework = 'react',
}: ClientSideWidgetCodeParams): string => {
  if (isChartWidgetProps(widgetProps)) {
    return getChartWidgetCode(widgetProps, uiFramework);
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
};
