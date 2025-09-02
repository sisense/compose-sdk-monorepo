import {
  Filter,
  FilterRelations,
  isMembersFilter,
  JaqlDataSourceForDto,
  filterFactory,
  isLevelAttribute,
  mergeFiltersOrFilterRelations,
  JSONArray,
} from '@sisense/sdk-data';
import { NormalizedTable } from '../types.js';
import {
  isFilterElement,
  isFilterRelationsElement,
  isParsedFunctionCallArray,
  ParsedFunctionCall,
  processNode,
} from './common.js';

function postProcessFilter(filter: Filter) {
  const { attribute, config } = filter;
  if (isMembersFilter(filter) && isLevelAttribute(attribute)) {
    const { granularity } = attribute;
    // Convert values to ISO 8601 string -- e.g., 2011 to "2011-01-01"
    return filterFactory.members(
      attribute,
      filter.members.map((member) => {
        if (granularity === 'Years' && !isNaN(Number(member))) {
          return `${member}-01-01T00:00:00`;
        }
        return member;
      }),
      config,
    );
  }
  return filter;
}

function postProcessFilters(filters: (Filter | FilterRelations)[]): Filter[] | FilterRelations {
  let mergedFilters: Filter[] | FilterRelations = [];
  for (const filter of filters) {
    if (isFilterRelationsElement(filter)) {
      mergedFilters = mergeFiltersOrFilterRelations(filter, mergedFilters);
    } else {
      mergedFilters = mergeFiltersOrFilterRelations([postProcessFilter(filter)], mergedFilters);
    }
  }
  return mergedFilters ?? [];
}

/**
 * Translate an array of JSON objects to filters
 *
 * @example
 * [{
 * "function": "filterFactory.logic.or",
 * "args": [
 * {
 * "function": "filterFactory.startsWith",
 *      "args": ["DM.Country.Country", "A"]
 *    },
 *    {
 *      "function": "filterFactory.measureGreaterThan",
 *      "args": [
 *        {
 *          "function": "measureFactory.sum",
 *          "args": ["DM.Commerce.Revenue", "Total Revenue"]
 *        },
 *        1000
 *      ]
 *    }
 *  ]
 * }]
 *
 * is translated to the following Filter[] or FilterRelations object:
 * filterFactory.logic.or([
 * filterFactory.startsWith("DM.Country.Country", "A"),
 * filterFactory.measureGreaterThan(
 * measureFactory.sum("DM.Commerce.Revenue", "Total Revenue"),
 * 1000
 * )
 * ])
 * @param filtersJSON - A JSON array representing the filters
 * @param dataSource - The data source to use for the filters
 * @param tables - The tables to use for the filters
 * @returns A Filter[] or FilterRelations object
 */
export const translateFiltersFromJSONFunctionCall = (
  filtersJSON: ParsedFunctionCall[],
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Filter[] | FilterRelations => {
  const filters = filtersJSON.map((filterJSON) => {
    const filter = processNode(filterJSON, dataSource, tables);
    if (!isFilterRelationsElement(filter) && !isFilterElement(filter)) {
      throw new Error('Invalid filter JSON');
    }
    return filter;
  });

  return postProcessFilters(filters);
};

export const translateFiltersJSON = (
  filtersJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Filter[] | FilterRelations => {
  if (!filtersJSON) {
    return [];
  }
  if (!isParsedFunctionCallArray(filtersJSON)) {
    throw new Error(
      'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
    );
  }
  return translateFiltersFromJSONFunctionCall(filtersJSON, dataSource, tables);
};

export const translateHighlightsFromJSONFunctionCall = (
  highlightsJSON: ParsedFunctionCall[],
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Filter[] => {
  return highlightsJSON.map((filterJSON) => {
    const filter = processNode(filterJSON, dataSource, tables);
    if (!isFilterElement(filter)) {
      throw new Error('Invalid filter JSON');
    }
    return postProcessFilter(filter);
  });
};

export const translateHighlightsJSON = (
  highlightsJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Filter[] => {
  if (!highlightsJSON) {
    return [];
  }
  if (!isParsedFunctionCallArray(highlightsJSON)) {
    throw new Error(
      'Invalid highlights JSON. Expected an array of function calls with "function" and "args" properties.',
    );
  }
  return translateHighlightsFromJSONFunctionCall(highlightsJSON, dataSource, tables);
};
