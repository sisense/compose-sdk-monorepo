import { DataSource, isDataSourceInfo } from '@ethings-os/sdk-data';

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
