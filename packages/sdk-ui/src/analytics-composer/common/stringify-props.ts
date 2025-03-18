import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { TranslatableError } from '@/translation/translatable-error';
import { toKebabCase, isNonEmptyArray } from './utils';
import { stringifyProps } from '../widget/stringify-props';
import { ChartDataOptions } from '@/types';
import { CODE_TEMPLATES_INDENT } from './constants';

export function stringifyDataOptions(dataOptions: ChartDataOptions): string {
  return stringifyProps(dataOptions, CODE_TEMPLATES_INDENT);
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

export function stringifyExtraImports(
  filters: Filter[] | FilterRelations,
  importMeasureFactory = true,
): string {
  const importNames = [];

  if (importMeasureFactory) {
    importNames.push('measureFactory');
  }

  if (isNonEmptyArray(filters as Filter[])) {
    importNames.push('filterFactory');
  }

  return importNames.length > 0
    ? `import { ${importNames.join(', ')} } from '@sisense/sdk-data';`
    : '';
}
