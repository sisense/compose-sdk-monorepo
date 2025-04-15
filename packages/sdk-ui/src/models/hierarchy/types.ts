import type { Attribute, DataSource } from '@sisense/sdk-data';

/**
 * Options for retrieving hierarchies.
 *
 * @internal
 */
export type GetHierarchiesOptions = {
  /**
   * The dimension for which to retrieve the hierarchies.
   */
  dimension: Attribute;
  /**
   * The data source from which to retrieve the hierarchies - e.g. `Sample ECommerce`.
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  /**
   * A list of hierarchy IDs to retrieve specific hierarchies.
   */
  ids?: string[];
  /**
   * A flag indicating whether to filter the retrieved hierarchies based on the `alwaysIncluded` field.
   *
   * When set to true, only hierarchies with `alwaysIncluded: true` will be returned.
   * When set to false, only hierarchies with `alwaysIncluded: false` will be returned.
   * If not specified, all hierarchies will be returned.
   */
  alwaysIncluded?: boolean;
};
