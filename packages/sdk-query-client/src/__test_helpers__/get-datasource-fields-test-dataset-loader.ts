import { DataSourceField } from '../types';
import { downloadTestDataFromArtifactory } from './artifactory-test-data-loader.js';

export type DatasourceFieldsTestDataset = {
  datasource: string;
  fields: DataSourceField[];
}[];

export function getDatasourceFieldsTestDataset(): Promise<DatasourceFieldsTestDataset> {
  return downloadTestDataFromArtifactory<DatasourceFieldsTestDataset>(
    'datasource-fields-test-data',
  );
}
