import {
  createFilterFromJaql,
  DataSource,
  Filter,
  FilterJaql,
  FilterRelations,
} from '@sisense/sdk-data';
import { ChartRecommendations, getChartOptions } from '../../ai';
import { ChartWidgetProps, ChartDataOptions, ChartType, WidgetStyleOptions } from '../../';
import { ExpandedQueryModel, ChartWidgetModel, UiFramework } from './types.js';
import { MetadataItem } from '@sisense/sdk-query-client';
import { isEmptyQueryModel, toKebabCase } from './utils';
import { generateCode } from './generate-code';
import { stringifyProps } from './translate-props-to-code';
import { stringifyFilterList } from './translate-filters-to-code';
// .js is required for lodash import
import cloneDeep from 'lodash-es/cloneDeep.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;

/**
 * A class that translates expanded query model to CSDK chart model and code.
 *
 * @internal
 */
export class ModelTranslator {
  queryModel: ExpandedQueryModel;

  constructor(queryModel: ExpandedQueryModel) {
    this.queryModel = queryModel;
  }

  /**
   * Gets chart recommendations or default to table.
   *
   * @param chart - chart recommendations
   * @returns chart recommendations or default to table
   */
  private getChartRecommendationsOrDefault = (
    chart: {} | ChartRecommendations,
  ): ChartRecommendations => {
    if ('chartType' in chart) {
      return chart;
    }

    return {
      chartType: 'table',
      chartFamily: 'table',
      axesMapping: {},
    };
  };

  /**
   * Gets filters from metadata.
   *
   * @param metadata - metadata items
   * @return array of Filter objects
   */
  private getFilters = (metadata: MetadataItem[]): Filter[] => {
    return metadata.map((item) => createFilterFromJaql(item.jaql as FilterJaql));
  };

  /**
   * Splits metadata into columns and filters.
   *
   * @param metadata - metadata items
   */
  private splitMetadata = (
    metadata: MetadataItem[],
  ): { metadataColumns: MetadataItem[]; metadataFilters: MetadataItem[] } => {
    return metadata.reduce(
      (acc, item) => {
        // filter items may come from panel scope or from columns with inline filter conditions
        if (item.panel === 'scope' || item.jaql.filter) {
          acc.metadataFilters.push(cloneDeep(item));
        }

        if (item.panel !== 'scope') {
          const columnItem = cloneDeep(item);
          delete columnItem.jaql.filter;
          acc.metadataColumns.push(columnItem);
        }

        return acc;
      },
      { metadataColumns: [] as MetadataItem[], metadataFilters: [] as MetadataItem[] },
    );
  };

  /**
   * Converts query model to chart
   */
  toChart(): ChartWidgetModel | undefined {
    if (isEmptyQueryModel(this.queryModel)) {
      return;
    }

    try {
      const queryModel = this.queryModel;

      const { jaql, chartRecommendations: chartRecommendationsOriginal, queryTitle } = queryModel;
      const {
        metadata,
        datasource: { title: dataSource },
      } = jaql;

      const chartRecommendations = this.getChartRecommendationsOrDefault(
        chartRecommendationsOriginal,
      );
      const chartType = chartRecommendations.chartType.toLowerCase() as ChartType;

      const widgetStyleOptions: WidgetStyleOptions = {
        cornerRadius: 'Small',
        header: {
          // remove info button and render empty toolbar instead
          renderToolbar: () => null,
        },
      };

      const { metadataColumns, metadataFilters } = this.splitMetadata(metadata);
      const filters = this.getFilters(metadataFilters);

      return {
        chartType,
        queryTitle: queryTitle,
        getChartWidgetProps: () => {
          // get chart options. Use default style for charts in Query Composer
          const { dataOptions, chartStyleOptions } = getChartOptions(
            metadataColumns,
            chartRecommendations,
            false,
          );

          const styleOptions = { ...chartStyleOptions, ...widgetStyleOptions };

          const chartWidgetProps: ChartWidgetProps = {
            chartType,
            dataOptions,
            styleOptions,
            dataSource,
            filters,
            title: queryTitle,
          };

          return chartWidgetProps;
        },
      };
    } catch (error) {
      console.log(error);
      // swallow error
      return;
    }
  }

  private stringifyDataSource = (dataSource: DataSource | undefined): string => {
    if (!dataSource) {
      throw new Error('Data source is not defined');
    }

    let dataSourceString: string;

    if (typeof dataSource === 'object' && 'title' in dataSource) {
      dataSourceString = dataSource.title;
    } else {
      dataSourceString = dataSource;
    }

    return toKebabCase(dataSourceString);
  };

  private stringifyChartType = (chartType: ChartType): string => {
    return chartType as string;
  };

  private stringifyFilters = (filters: Filter[] | FilterRelations | undefined): string => {
    if (!filters) {
      return '';
    }
    if (Array.isArray(filters)) {
      return stringifyFilterList(filters, 2);
    }

    throw new Error('Filter relations not supported yet');
  };

  private stringifyDataOptions = (dataOptions: ChartDataOptions): string => {
    return stringifyProps(dataOptions, 2);
  };

  private stringifyExtraImports = (props: ChartWidgetProps): string => {
    const importNames = ['measureFactory'];

    const { filters } = props;
    if (Array.isArray(filters) && filters.length > 0) {
      importNames.push('filterFactory');
    }

    return `import { ${importNames.join(', ')} } from '@sisense/sdk-data';`;
  };

  private getChartWidgetCode = (props: ChartWidgetProps, uiFramework: UiFramework): string => {
    const codeProps: ChartWidgetCodeProps = {
      titleString: props.title,
      dataSourceString: this.stringifyDataSource(props.dataSource),
      chartTypeString: this.stringifyChartType(props.chartType),
      dataOptionsString: this.stringifyDataOptions(props.dataOptions),
      filtersString: this.stringifyFilters(props.filters),
      componentString: 'ChartWidget',
      extraImportsString: this.stringifyExtraImports(props),
    };
    return generateCode('chartWidgetTmpl', codeProps, uiFramework);
  };

  /**
   * Converts chart widget model to CSDK code.
   *
   * @param chartWidgetModel - chart widget model
   * @param uiFramework - UI framework
   * @returns CSDK code string of the UI framework
   */
  toCode(chartWidgetModel: ChartWidgetModel, uiFramework: UiFramework = 'react'): string {
    try {
      const chartWidgetProps = chartWidgetModel.getChartWidgetProps();
      return this.getChartWidgetCode(chartWidgetProps, uiFramework);
    } catch (e) {
      console.log(e);
      // swallow error
      return '';
    }
  }
}
