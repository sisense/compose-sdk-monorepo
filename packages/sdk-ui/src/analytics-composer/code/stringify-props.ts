import { ChartDataOptions } from '@/types';
import { escapeSingleQuotes } from '@sisense/sdk-common';
import {
  DimensionalBaseMeasure,
  DimensionalElement,
  JaqlElement,
  MetadataItemJaql,
  normalizeAttributeName,
} from '@sisense/sdk-data';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { toKebabCase, isNonEmptyArray, quoteUnsafeKeys } from '../common/utils';
import { CODE_TEMPLATES_INDENT } from '../common/constants';

const NEW_LINE = '\n';
const VALUE_UNKNOWN = 'UNKNOWN';

export type MembersFilterJaql = {
  members: string[];
};

export type FromNotEqualFilterJaql = {
  fromNotEqual: number;
};

export type FilterJaql = MembersFilterJaql | FromNotEqualFilterJaql;

const stringifyFormula = (jaql: MetadataItemJaql, indent: number): string => {
  let s = '';
  s += 'measureFactory.customFormula(\n';
  s += ' '.repeat(indent);
  s += `  '${escapeSingleQuotes(jaql.title)}',\n`;
  s += ' '.repeat(indent);
  s += `  '${jaql.formula}',\n`;
  s += ' '.repeat(indent);
  s += `  {\n`;

  Object.entries(jaql.context!).forEach(([key, value]) => {
    const attributeName = normalizeAttributeName(
      value.table || VALUE_UNKNOWN,
      value.column || VALUE_UNKNOWN,
      undefined,
      'DM',
    );
    s += ' '.repeat(indent);
    s += `    '${key.slice(1, -1)}': ${attributeName},\n`;
  });

  s += ' '.repeat(indent);
  s += `  }\n`;
  s += ' '.repeat(indent);
  s += `)`;
  return s;
};

// eslint-disable-next-line complexity
const stringifyDimensionOrMeasure = (jaql: MetadataItemJaql): string => {
  const { level, table, column, agg, title } = jaql;
  let elementDef;

  // create dimension attribute
  if (table && column) {
    elementDef = normalizeAttributeName(table, column, level, 'DM');
  }

  // if agg exists, create measure on the attribute
  if (agg && table && column && title) {
    elementDef = `measureFactory.${DimensionalBaseMeasure.aggregationFromJAQL(
      agg,
    )}(${elementDef}, '${escapeSingleQuotes(title)}')`;
  }

  return elementDef || VALUE_UNKNOWN;
};

const stringifyJaqlElement = (jaqlElement: JaqlElement, indent: number): string => {
  const jaql = jaqlElement.jaql(false).jaql;

  if ('formula' in jaql) {
    return stringifyFormula(jaql, indent);
  } else {
    return stringifyDimensionOrMeasure(jaql);
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const stringifyProps = (
  props: object | string,
  indent = 0,
  wrapInQuotes = false,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): string => {
  if (!props) {
    return '';
  }

  if (typeof props === 'string') {
    return `'${escapeSingleQuotes(props)}'`;
  }

  if (props instanceof JaqlElement) {
    return stringifyJaqlElement(props, indent);
  }

  if (props instanceof DimensionalElement) {
    return props.composeCode || '';
  }

  let s = '';

  if (Array.isArray(props)) {
    s += `[${props.map((v) => stringifyProps(v, indent + 2))}${
      props.length ? NEW_LINE + ' '.repeat(indent + 2) : ''
    }]`;
  } else {
    s += `{${NEW_LINE}`;
    Object.entries(props).forEach(([key, value]) => {
      if (wrapInQuotes && typeof key === 'string') {
        key = `'${escapeSingleQuotes(key)}'`;
      }
      s += ' '.repeat(indent + 2);
      if (Array.isArray(value)) {
        s += `${key}: [${value.map((v) => stringifyProps(v, indent + 4, wrapInQuotes))}${
          value.length ? NEW_LINE + ' '.repeat(indent + 2) : ''
        }]`;
      } else if (typeof value === 'object' && value !== null) {
        const processedValue = Array.isArray(value) ? value : quoteUnsafeKeys(value);
        s += `${key}: ${stringifyProps(processedValue, indent + 2, wrapInQuotes)}`;
      } else if (['number', 'boolean', 'undefined'].includes(typeof value) || value === null) {
        s += `${key}: ${value}`;
      } else if (typeof value === 'string') {
        s += `${key}: '${escapeSingleQuotes(value)}'`;
      } else {
        s += `${key}: ${value}`;
      }
      s += `,${NEW_LINE}`;
    });
    s += ' '.repeat(indent);
    s += '}';
  }

  return s;
};

export function stringifyDataOptions(dataOptions: ChartDataOptions): string {
  return stringifyProps(dataOptions, CODE_TEMPLATES_INDENT);
}

export function stringifyDataSource(
  dataSource: DataSource | undefined,
  defaultDataSourceString = 'data-source-placeholder',
): string {
  if (!dataSource) {
    return defaultDataSourceString;
  }

  const dataSourceString =
    typeof dataSource === 'object' && 'title' in dataSource ? dataSource.title : dataSource;

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
