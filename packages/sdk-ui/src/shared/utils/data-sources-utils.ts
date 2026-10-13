import { DataSource, type DataSourceInfo, isDataSourceInfo } from '@sisense/sdk-data';

export type DataSourceObject = {
  title: string;
  id: string;
};

export const toDataSourceObject = (dataSource: DataSource): DataSourceObject => {
  return {
    id: getDataSourceId(dataSource),
    title: getDataSourceTitle(dataSource),
  };
};

export const getDataSourceId = (dataSource: DataSource): string => {
  return isDataSourceInfo(dataSource) ? dataSource.id || dataSource.title : dataSource;
};

export const getDataSourceTitle = (dataSource: DataSource): string => {
  return isDataSourceInfo(dataSource) ? dataSource.title : dataSource;
};

const isNonBlankString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Resolves the user-visible label of a data source: the first non-blank display name, else `title`.
 * Display only — queries and matching must keep using `title`.
 *
 * @param title - Identity name of the data source.
 * @param displayNames - Candidate display names, in priority order.
 * @returns The label to render.
 */
export const toDataSourceLabel = (
  title: string,
  ...displayNames: ReadonlyArray<string | null | undefined>
): string => displayNames.find(isNonBlankString) ?? title;

/**
 * A data source that can be labelled: its title, or an object with a title, such as
 * {@link DataSourceInfo} or the data source of an attribute.
 */
export type LabelableDataSource = string | Pick<DataSourceInfo, 'title'>;

/**
 * Resolves the user-visible label of a data source: its server-provided display name, looked up
 * by `title`, else `title`.
 *
 * @param dataSource - Data source to label.
 * @param serverDisplayNames - Display names by data source title, as returned by the server.
 * @returns The label to render.
 */
export const getDataSourceLabel = (
  dataSource: LabelableDataSource,
  serverDisplayNames: ReadonlyMap<string, string> = new Map(),
): string => {
  const title = typeof dataSource === 'string' ? dataSource : dataSource.title;
  return toDataSourceLabel(title, serverDisplayNames.get(title));
};
