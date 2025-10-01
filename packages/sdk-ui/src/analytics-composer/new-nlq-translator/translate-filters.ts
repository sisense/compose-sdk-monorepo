import {
  Filter,
  FilterRelations,
  isMembersFilter,
  JaqlDataSourceForDto,
  filterFactory,
  isLevelAttribute,
  mergeFiltersOrFilterRelations,
  JSONArray,
} from '@ethings-os/sdk-data';
import { NlqTranslationResult, NormalizedTable } from '../types.js';
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
): NlqTranslationResult<Filter[] | FilterRelations> => {
  const filters: (Filter | FilterRelations)[] = [];
  const errors: string[] = [];

  // Process each filter and collect errors instead of throwing
  filtersJSON.forEach((filterJSON, index) => {
    try {
      const filter = processNode(filterJSON, dataSource, tables);
      if (!isFilterRelationsElement(filter) && !isFilterElement(filter)) {
        errors.push(`Filter ${index + 1} (${filterJSON.function}): Invalid filter JSON`);
      } else {
        filters.push(filter);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Filter ${index + 1} (${filterJSON.function}): ${errorMsg}`);
    }
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: postProcessFilters(filters) };
};

export const translateFiltersJSON = (
  filtersJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Filter[] | FilterRelations> => {
  if (!filtersJSON) {
    return { success: true, data: [] };
  }

  if (!isParsedFunctionCallArray(filtersJSON)) {
    return {
      success: false,
      errors: [
        'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
      ],
    };
  }

  return translateFiltersFromJSONFunctionCall(filtersJSON, dataSource, tables);
};

export const translateHighlightsFromJSONFunctionCall = (
  highlightsJSON: ParsedFunctionCall[],
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Filter[]> => {
  const results: Filter[] = [];
  const errors: string[] = [];

  // Process each highlight and collect errors instead of throwing
  highlightsJSON.forEach((filterJSON, index) => {
    try {
      const filter = processNode(filterJSON, dataSource, tables);
      if (!isFilterElement(filter)) {
        errors.push(`Highlight ${index + 1} (${filterJSON.function}): Invalid filter JSON`);
      } else {
        results.push(postProcessFilter(filter));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Highlight ${index + 1} (${filterJSON.function}): ${errorMsg}`);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};

export const translateHighlightsJSON = (
  highlightsJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Filter[]> => {
  if (!highlightsJSON) {
    return { success: true, data: [] };
  }

  if (!isParsedFunctionCallArray(highlightsJSON)) {
    return {
      success: false,
      errors: [
        'Invalid highlights JSON. Expected an array of function calls with "function" and "args" properties.',
      ],
    };
  }

  return translateHighlightsFromJSONFunctionCall(highlightsJSON, dataSource, tables);
};
