/* eslint-disable max-lines */
import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { ChartRecommendations } from '@/ai';
import { getChartOptions, getTableOptions } from '@/ai/messages/get-widget-options';
import { createJaqlElement } from '@/ai/messages/jaql-element';
import { ChartWidgetProps, TableWidgetProps } from '@/props';
import { TranslatableError } from '@/translation/translatable-error';
import {
  AllChartType,
  ExpandedQueryModel,
  ChartWidgetModel,
  UiFramework,
} from '@/ai/translators/types';
import { MetadataItem } from '@sisense/sdk-query-client';
import { ChartDataOptions, ChartType, WidgetStyleOptions } from '@/types';
import { toKebabCase } from '@/ai/translators/utils';
import { generateCode } from '@/ai/translators/generate-code';
import { stringifyProps } from '@/ai/translators/translate-props-to-code';
import { TableDataOptions } from '@/chart-data-options/types';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;
type TableWidgetCodeProps = Stringify<TableWidgetProps> & ExtraCodeProps;

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
   */
  private getFilters = (metadata: MetadataItem[]): Filter[] => {
    return metadata.map(createJaqlElement) as unknown as Filter[];
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
        if (item.panel === 'scope') {
          acc.metadataFilters.push(item);
        } else {
          acc.metadataColumns.push(item);
        }
        return acc;
      },
      { metadataColumns: [] as MetadataItem[], metadataFilters: [] as MetadataItem[] },
    );
  };

  /**
   * Converts query model to chart.
   *
   * TODO Refactor Chatbot to use this method to render the chart
   */
  // eslint-disable-next-line max-lines-per-function
  toChart(): ChartWidgetModel | undefined {
    if (!this.queryModel) {
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
      const chartType = chartRecommendations.chartType.toLowerCase() as AllChartType;

      const widgetStyleOptions: WidgetStyleOptions = {
        cornerRadius: 'Small',
        header: {},
      };

      const { metadataColumns, metadataFilters } = this.splitMetadata(metadata);
      const filters = this.getFilters(metadataFilters);

      return {
        chartType,
        queryTitle: queryTitle,
        getChartWidgetProps: () => {
          if (chartType === 'table') {
            throw new TranslatableError('Tabular widgets are not supported for this method');
          }

          const { dataOptions, chartStyleOptions } = getChartOptions(
            metadataColumns,
            chartRecommendations,
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
        getTableWidgetProps: () => {
          const { dataOptions } = getTableOptions(metadataColumns);

          const tableWidgetProps: TableWidgetProps = {
            dataOptions,
            dataSource,
            filters,
            title: queryTitle,
          };

          return tableWidgetProps;
        },
      };
    } catch (e) {
      console.log(e);
      // swallow error
      return;
    }
  }

  private stringifyDataSource = (dataSource: DataSource | undefined): string => {
    if (!dataSource) {
      throw new TranslatableError('Data source is not defined');
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
    return stringifyProps(filters, 2);
  };

  private stringifyDataOptions = (dataOptions: ChartDataOptions | TableDataOptions): string => {
    return stringifyProps(dataOptions, 2);
  };

  private stringifyExtraImports = (props: ChartWidgetProps | TableWidgetProps): string => {
    let extraImportsString = '';
    const filters = props.filters;
    if (filters && Array.isArray(filters) && filters.length > 0) {
      extraImportsString = `import { measureFactory, filterFactory } from '@sisense/sdk-data';`;
    } else {
      extraImportsString = `import { measureFactory } from '@sisense/sdk-data';`;
    }
    return extraImportsString;
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

  private getTableWidgetCode = (props: TableWidgetProps, uiFramework: UiFramework): string => {
    const codeProps: TableWidgetCodeProps = {
      titleString: props.title,
      dataSourceString: this.stringifyDataSource(props.dataSource),
      dataOptionsString: this.stringifyDataOptions(props.dataOptions),
      filtersString: this.stringifyFilters(props.filters),
      componentString: 'TableWidget',
      extraImportsString: this.stringifyExtraImports(props),
    };
    return generateCode('tableWidgetTmpl', codeProps, uiFramework);
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
      const chartType = chartWidgetModel.chartType;
      if (chartType === 'table') {
        const tableWidgetProps = chartWidgetModel.getTableWidgetProps();
        return this.getTableWidgetCode(tableWidgetProps, uiFramework);
      } else {
        const chartWidgetProps = chartWidgetModel.getChartWidgetProps();
        return this.getChartWidgetCode(chartWidgetProps, uiFramework);
      }
    } catch (e) {
      console.log(e);
      // swallow error
      return '';
    }
  }
}
