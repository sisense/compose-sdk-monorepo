import {
  Filter,
  filterFactory,
  FilterRelations,
  isLevelAttribute,
  isMembersFilter,
  mergeFiltersOrFilterRelations,
} from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationErrorContext, NlqTranslationResult } from '../types.js';
import { processNode } from './process-function/process-node.js';
import {
  FiltersFunctionCallInput,
  FiltersInput,
  HighlightsFunctionCallInput,
  HighlightsInput,
  isFilterElement,
  isFilterRelationsElement,
  isFunctionCallArray,
} from './types.js';

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
  input: FiltersFunctionCallInput,
): NlqTranslationResult<Filter[] | FilterRelations> => {
  const { data: filtersJSON } = input;
  const { dataSource, schemaIndex } = input.context;
  const filters: (Filter | FilterRelations)[] = [];
  const errors: NlqTranslationError[] = [];

  // Process each filter and collect errors instead of throwing
  filtersJSON.forEach((filterJSON, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'filters',
      index,
      input: filterJSON,
    };
    try {
      const filter = processNode({
        data: filterJSON,
        context: { dataSource, schemaIndex, pathPrefix: '' },
      });
      if (!isFilterRelationsElement(filter) && !isFilterElement(filter)) {
        errors.push({ ...context, message: `Invalid filter JSON` });
      } else {
        filters.push(filter);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: postProcessFilters(filters) };
};

/**
 * Translate an array of JSON objects to filters
 *
 * @param input - FiltersInput object
 * @returns NlqTranslationResult<Filter[] | FilterRelations>
 */
export const translateFiltersJSON = (
  input: FiltersInput,
): NlqTranslationResult<Filter[] | FilterRelations> => {
  const { data: filtersJSON } = input;
  const { dataSource, schemaIndex } = input.context;
  if (!filtersJSON) {
    return { success: true, data: [] };
  }

  if (!isFunctionCallArray(filtersJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'filters',
          index: -1,
          input: filtersJSON,
          message:
            'Invalid filters JSON. Expected an array of function calls with "function" and "args" properties.',
        },
      ],
    };
  }

  return translateFiltersFromJSONFunctionCall({
    data: filtersJSON,
    context: { dataSource, schemaIndex },
  });
};

export const translateHighlightsFromJSONFunctionCall = (
  input: HighlightsFunctionCallInput,
): NlqTranslationResult<Filter[]> => {
  const { data: highlightsJSON } = input;
  const { dataSource, schemaIndex } = input.context;
  const results: Filter[] = [];
  const errors: NlqTranslationError[] = [];

  // Process each highlight and collect errors instead of throwing
  highlightsJSON.forEach((filterJSON, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'highlights',
      index,
      input: filterJSON,
    };
    try {
      const filter = processNode({
        data: filterJSON,
        context: { dataSource, schemaIndex, pathPrefix: '' },
      });
      if (!isFilterElement(filter)) {
        errors.push({ ...context, message: `Invalid filter JSON` });
      } else {
        results.push(postProcessFilter(filter));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};

/**
 * Translate an array of JSON objects to highlights
 *
 * @param input - HighlightsInput object
 * @returns NlqTranslationResult<Filter[]>
 */
export const translateHighlightsJSON = (input: HighlightsInput): NlqTranslationResult<Filter[]> => {
  const { data: highlightsJSON } = input;
  const { dataSource, schemaIndex } = input.context;

  if (!highlightsJSON) {
    return { success: true, data: [] };
  }

  if (!isFunctionCallArray(highlightsJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'highlights',
          index: -1,
          input: highlightsJSON,
          message:
            'Invalid highlights JSON. Expected an array of function calls with "function" and "args" properties.',
        },
      ],
    };
  }

  return translateHighlightsFromJSONFunctionCall({
    data: highlightsJSON,
    context: { dataSource, schemaIndex },
  });
};
