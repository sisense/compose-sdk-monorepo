/* eslint-disable @typescript-eslint/default-param-last */
/* eslint-disable max-params */
import { Attribute, DataSource, Filter, Measure, QueryResultData } from '@sisense/sdk-data';
import { ClientApplication } from '../app/client-application';
import { translation } from '../locales/en';

/** @internal */
export const QUERY_DEFAULT_LIMIT = 20000;

/** @internal */
export const executeQuery = (
  dataSource: DataSource | undefined,
  dimensions: Attribute[] = [],
  measures: Measure[] = [],
  filters: Filter[] = [],
  highlights: Filter[] = [],
  app: ClientApplication,
  count = QUERY_DEFAULT_LIMIT,
  offset?: number,
): Promise<QueryResultData> => {
  // We use "dimensions" in the API because the term is closer to the query and charting
  // as used in the industry (Sisense included).
  // internally, "dimensions" are represented by attributes as the latter is closer to the data model.
  const attributes = dimensions;

  if (filters) {
    filters.forEach((f) => (f.isScope = true));
  }
  if (highlights) {
    highlights.forEach((f) => (f.isScope = true));
  }

  // if data source is not explicitly specified, use the default data source
  // specified in the Sisense context provider
  const dataSourceToQuery = dataSource || app?.defaultDataSource;
  if (!dataSourceToQuery) {
    throw new Error(translation.errors.executeQueryNoDataSource);
  }

  return app.queryClient.executeQuery({
    dataSource: dataSourceToQuery,
    attributes,
    measures,
    filters,
    highlights,
    count,
    offset,
  }).resultPromise;
};
