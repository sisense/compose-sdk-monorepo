import './translation/initialize-i18n.js';

/**
 * @packageDocumentation
 */
export * from './interfaces.js';

export * from './dimensional-model/types.js';
export * from './dimensional-model/interfaces.js';
export * from './dimensional-model/base.js';
export * from './dimensional-model/data-model.js';
export * from './dimensional-model/attributes.js';
export * from './dimensional-model/dimensions.js';
export * from './dimensional-model/factory.js';

export * from './dimensional-model/filters/filters.js';

/**
 * Functions to create date, text, or numeric filters on certain data columns
 *
 * They are similar to [Dashboard and Widget Filters](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.
 *
 * Filters created with these functions can be used in the data options of UI components such as
 * {@link @sisense/sdk-ui!ChartProps | Chart}, {@link @sisense/sdk-ui!ChartWidgetProps | ChartWidget},
 * and {@link @sisense/sdk-ui!ExecuteQueryProps | ExecuteQuery}.
 *
 * @example
 * Example of using React hook `useExecuteQuery` to query the `Sample ECommerce` data source.
 * Factory function `filterFactory.greaterThan()` is used to create a filter on `Revenue` to get values
 * greater than 1000.
 * ```tsx
 *   const { data, isLoading, isError } = useExecuteQuery({
 *     dataSource: DM.DataSource,
 *     dimensions: [DM.Commerce.AgeRange],
 *     measures: [measureFactory.sum(DM.Commerce.Revenue)],
 *     filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
 *   });
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 *   if (isError) {
 *     return <div>Error</div>;
 *   }
 *   if (data) {
 *     return <div>{`Total Rows: ${data.rows.length}`}</div>;
 *   }
 *   return null;
 * ```
 */
export * as filterFactory from './dimensional-model/filters/factory.js';

export * from './dimensional-model/measures/measures.js';
/**
 * Functions to create measures that aggregate, summarize, and accumulate data,
 * plus show changes in data over time.
 *
 * They are similar to [Formulas](https://docs.sisense.com/main/SisenseLinux/build-formulas.htm) in Sisense.
 *
 * Measures created with these functions can be used in the data options of UI components such as
 * {@link @sisense/sdk-ui!ChartProps | Chart}, {@link @sisense/sdk-ui!ChartWidgetProps | ChartWidget},
 * and {@link @sisense/sdk-ui!ExecuteQueryProps | ExecuteQuery}.
 *
 * @example
 * Example of using React hook useExecuteQuery to query the `Sample ECommerce` data source.
 * Factory function `measureFactory.sum()` is used to create a measure that sums the `Revenue` column.
 * ```tsx
 *   const { data, isLoading, isError } = useExecuteQuery({
 *     dataSource: DM.DataSource,
 *     dimensions: [DM.Commerce.AgeRange],
 *     measures: [measureFactory.sum(DM.Commerce.Revenue)],
 *     filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
 *   });
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 *   if (isError) {
 *     return <div>Error</div>;
 *   }
 *   if (data) {
 *     return <div>{`Total Rows: ${data.rows.length}`}</div>;
 *   }
 *   return null;
 * ```
 */
export * as measureFactory from './dimensional-model/measures/factory.js';

export * from './dimensional-model/simple-column-types.js';

/**
 * Functions to create elements for advanced analytics – for example, attributes and measures for constructing a custom Boxplot chart
 */
export * as analyticsFactory from './dimensional-model/analytics/factory.js';

export * from './utils.js';
