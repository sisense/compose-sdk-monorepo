import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { TranslatableError } from '@/translation/translatable-error';
import { toKebabCase } from './utils';
import { stringifyProps } from '../widget/stringify-props';
import { ChartDataOptions } from '@/types';

export function stringifyDataOptions(dataOptions: ChartDataOptions): string {
  return stringifyProps(dataOptions, 2);
}

export function stringifyDataSource(dataSource: DataSource | undefined): string {
  if (!dataSource) {
    throw new TranslatableError('errors.undefinedDataSource');
  }

  let dataSourceString: string;

  if (typeof dataSource === 'object' && 'title' in dataSource) {
    dataSourceString = dataSource.title;
  } else {
    dataSourceString = dataSource;
  }

  return toKebabCase(dataSourceString);
}

export function stringifyExtraImports(filters: Filter[] | FilterRelations): string {
  const importNames = ['measureFactory'];

  if (Array.isArray(filters) && filters.length > 0) {
    importNames.push('filterFactory');
  }

  return `import { ${importNames.join(', ')} } from '@sisense/sdk-data';`;
}
