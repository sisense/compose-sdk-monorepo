import { JaqlElement } from '@/ai/messages/jaql-element';
import { MetadataItemJaql } from '@sisense/sdk-query-client';
import { capitalizeFirstLetter } from '@/ai/translators/utils';

const NEW_LINE = '\n';

export type MembersFilterJaql = {
  members: string[];
};

export type FromNotEqualFilterJaql = {
  fromNotEqual: number;
};

export type FilterJaql = MembersFilterJaql | FromNotEqualFilterJaql;

const stringifyFormula = (jaql: MetadataItemJaql, indent: number): string => {
  let s = '';
  s += 'createCalculatedMeasure({\n';
  s += ' '.repeat(indent);
  s += `  name: '${jaql.title}',\n`;
  s += ' '.repeat(indent);
  s += `  exp: '${jaql.formula}',\n`;
  s += ' '.repeat(indent);
  s += `  context: {\n`;

  Object.entries(jaql.context!).forEach(([key, value]) => {
    s += ' '.repeat(indent);
    s += `    '${key}': ${value.dim?.slice(1, -1)},\n`;
  });

  s += ' '.repeat(indent);
  s += `  }\n`;
  s += ' '.repeat(indent);
  s += `})`;
  return s;
};

const stringifyDimensionOrMeasure = (jaql: MetadataItemJaql, indent: number): string => {
  const { level, table, column, agg, title } = jaql;

  if (agg && table && column && title) {
    return `${' '.repeat(indent)}measureFactory.${agg}(DM.${table}.${column}, '${title}')`;
  }

  if (table && column) {
    return `${' '.repeat(indent)}DM.${table}.${column}${
      level ? '.' + capitalizeFirstLetter(level) : ''
    }`;
  }

  return 'UNKNOWN';
};

// TODO - handle all filter types
const stringifyFilter = (jaql: MetadataItemJaql, indent: number): string => {
  if (!jaql.filter) {
    return '';
  }
  const filterJaql = jaql.filter as unknown as FilterJaql;

  if ('members' in filterJaql) {
    const members = filterJaql.members.map((m) => `'${m}'`).join(', ');
    return `${NEW_LINE}${' '.repeat(indent)}filterFactory.members(${stringifyDimensionOrMeasure(
      jaql,
      0,
    )}, [${members}])`;
  }

  if ('fromNotEqual' in filterJaql) {
    return `${NEW_LINE}${' '.repeat(indent)}filterFactory.greaterThan(${stringifyDimensionOrMeasure(
      jaql,
      0,
    )}, ${filterJaql.fromNotEqual})`;
  }
  return ``;
};

const stringifyJaqlElement = (jaqlElement: JaqlElement, indent: number): string => {
  const jaql = jaqlElement.jaql().jaql;

  if ('formula' in jaql) {
    return stringifyFormula(jaql, indent);
  } else if ('filter' in jaql) {
    return stringifyFilter(jaql, indent);
  } else {
    return NEW_LINE + stringifyDimensionOrMeasure(jaql, indent);
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const stringifyProps = (props: object, indent = 0, wrapInQuotes = false): string => {
  if (!props) {
    return '';
  }

  if (props instanceof JaqlElement) {
    return stringifyJaqlElement(props, indent);
  }

  let s = '';

  if (Array.isArray(props)) {
    s += `[${props.map((v) => stringifyProps(v, indent + 2))}${
      props.length ? '\n' + ' '.repeat(indent + 2) : ''
    }]`;
  } else {
    s += `{${NEW_LINE}`;
    Object.entries(props).forEach(([key, value]) => {
      if (wrapInQuotes) {
        key = `'${key}'`;
      }
      s += ' '.repeat(indent + 2);
      if (Array.isArray(value)) {
        s += `${key}: [${value.map((v) => stringifyProps(v, indent + 4))}${
          value.length ? '\n' + ' '.repeat(indent + 2) : ''
        }]`;
      } else if (typeof value === 'object') {
        s += `${key}: ${stringifyProps(value, indent + 2)}`;
      } else if (['number', 'boolean', 'undefined', null].includes(typeof value)) {
        s += `${key}: ${value}`;
      } else {
        s += `${key}: '${value}'`;
      }
      s += `,${NEW_LINE}`;
    });
    s += ' '.repeat(indent);
    s += '}';
  }

  return s;
};
