import { DataSource, DataSourceInfo } from '@sisense/sdk-data';
import { NEWLINE } from './base.js';
import { Writer } from './interfaces.js';

export class DataSourceWriter implements Writer {
  constructor(private dataSource: DataSource) {}

  write(stream: NodeJS.WritableStream) {
    if (isDataSourceInfo(this.dataSource)) {
      stream.write(
        `export const DataSource: DataSourceInfo = ${JSON.stringify(this.dataSource)};${NEWLINE}`,
      );
    } else {
      stream.write(`export const DataSource = '${this.dataSource}';${NEWLINE}`);
    }
  }
}

/**
 * Function to check if the provided data source is a data source info object
 */
function isDataSourceInfo(dataSource: DataSource): dataSource is DataSourceInfo {
  return typeof dataSource === 'object' && 'type' in dataSource && 'title' in dataSource;
}
