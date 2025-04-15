import { DataSource, isDataSourceInfo } from '@sisense/sdk-data';

import { NEWLINE } from './base.js';
import { Writer } from './interfaces.js';

export class ImportsWriter implements Writer {
  constructor(
    private dataSource: DataSource,
    private dataModule: string = '@sisense/sdk-data',
  ) {}

  write(stream: NodeJS.WritableStream) {
    const typesToImport = ['Dimension', 'DateDimension', 'Attribute'];
    if (isDataSourceInfo(this.dataSource)) {
      typesToImport.push('DataSourceInfo');
    }
    stream.write(
      `import type { ${typesToImport.join(', ')} } from '${this.dataModule}';${NEWLINE}${NEWLINE}`,
    );
    stream.write(
      `import { createAttribute, createDateDimension, createDimension } from '${this.dataModule}';${NEWLINE}${NEWLINE}`,
    );
  }
}
