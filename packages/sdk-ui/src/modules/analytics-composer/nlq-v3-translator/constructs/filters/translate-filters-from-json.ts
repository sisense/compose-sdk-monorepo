import {
  Filter,
  filterFactory,
  FilterRelations,
  FilterRelationsNode,
  isLevelAttribute,
  isMembersFilter,
  mergeFiltersOrFilterRelations,
  simplifyFilterConfig,
} from '@sisense/sdk-data';

import {
  NlqTranslationError,
  NlqTranslationErrorContext,
  NlqTranslationResult,
} from '../../../types.js';
import { processNode } from '../../shared/expression/process-node.js';
import { validateNoDuplicateMembers } from '../../shared/validation/datetime-member-validation.js';
import { normalizeMemberForGranularity } from '../../shared/validation/normalize-member-for-granularity.js';
import {
  FiltersFunctionCallInput,
  FiltersInput,
  HighlightsFunctionCallInput,
  HighlightsInput,
  isFilterElement,
  isFilterRelationsElement,
  isFunctionCallArray,
} from '../../types.js';

const UNKNOWN_ERROR_MSG = 'Unknown error';

function postProcessFilter(filter: Filter, pathPrefix = 'filters') {
  const { attribute, config } = filter;
  if (isMembersFilter(filter) && isLevelAttribute(attribute)) {
    const { granularity } = attribute;
    const members = filter.members.map((member) =>
      normalizeMemberForGranularity(String(member), granularity),
    );
    validateNoDuplicateMembers(members, pathPrefix);

    // Simplify config to remove default values before passing to filterFactory.members()
    // This ensures composeCode doesn't include config when all values match defaults
    const simplifiedConfig = simplifyFilterConfig(config);
    const configToPass = Object.keys(simplifiedConfig).length === 0 ? undefined : simplifiedConfig;

    return filterFactory.members(attribute, members, configToPass);
  }
  return filter;
}

function isFilterRelationsNode(node: FilterRelationsNode): node is FilterRelations {
  return (
    !Array.isArray(node) &&
    'operator' in node &&
    (node.operator === 'AND' || node.operator === 'OR') &&
    'left' in node &&
    'right' in node
  );
}

function postProcessFilterRelationsNode(
  node: FilterRelationsNode,
  pathPrefix: string,
): FilterRelationsNode {
  if (Array.isArray(node)) {
    return node.map((item, index) =>
      postProcessFilterRelationsNode(item, `${pathPrefix}[${index}]`),
    ) as Filter[];
  }
  if (isFilterRelationsNode(node)) {
    return {
      ...node,
      left: postProcessFilterRelationsNode(node.left, `${pathPrefix}.left`),
      right: postProcessFilterRelationsNode(node.right, `${pathPrefix}.right`),
    };
  }
  return postProcessFilter(node, pathPrefix);
}

function postProcessFilterRelations(
  filterRelations: FilterRelations,
  pathPrefix: string,
): FilterRelations {
  return {
    ...filterRelations,
    left: postProcessFilterRelationsNode(filterRelations.left, `${pathPrefix}.left`),
    right: postProcessFilterRelationsNode(filterRelations.right, `${pathPrefix}.right`),
  };
}

function postProcessFilters(
  filters: (Filter | FilterRelations)[],
  filtersJSON: FiltersFunctionCallInput['data'],
  pathPrefix = 'filters',
): { data: Filter[] | FilterRelations | null; errors: NlqTranslationError[] } {
  const errors: NlqTranslationError[] = [];
  let mergedFilters: Filter[] | FilterRelations = [];

  filters.forEach((filter, index) => {
    const itemPath = `${pathPrefix}[${index}]`;
    if (isFilterRelationsElement(filter)) {
      try {
        mergedFilters = mergeFiltersOrFilterRelations(
          postProcessFilterRelations(filter, itemPath),
          mergedFilters,
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : UNKNOWN_ERROR_MSG;
        errors.push({ path: itemPath, input: filtersJSON[index], message: errorMsg });
      }
      return;
    }
    try {
      mergedFilters = mergeFiltersOrFilterRelations(
        [postProcessFilter(filter, itemPath)],
        mergedFilters,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : UNKNOWN_ERROR_MSG;
      errors.push({ path: itemPath, input: filtersJSON[index], message: errorMsg });
    }
  });

  return {
    data: errors.length > 0 ? null : mergedFilters,
    errors,
  };
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
      path: `filters[${index}]`,
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
      const errorMsg = error instanceof Error ? error.message : UNKNOWN_ERROR_MSG;
      errors.push({ ...context, message: errorMsg });
    }
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const postProcessResult = postProcessFilters(filters, filtersJSON);
  if (postProcessResult.errors.length > 0) {
    return { success: false, errors: postProcessResult.errors };
  }

  return { success: true, data: postProcessResult.data! };
};

/**
 * Translate an array of JSON objects to filters.
 * Direction: JSON → CSDK
 *
 * @param input - FiltersInput object
 * @returns NlqTranslationResult<Filter[] | FilterRelations>
 */
export const translateFiltersFromJSON = (
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
          path: 'filters',
          input: filtersJSON,
          message:
            "Invalid filters JSON. Expected an array of function calls with 'function' and 'args' properties.",
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
      path: `highlights[${index}]`,
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
        results.push(postProcessFilter(filter, `highlights[${index}]`));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : UNKNOWN_ERROR_MSG;
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};

/**
 * Translate an array of JSON objects to highlights.
 * Direction: JSON → CSDK
 *
 * @param input - HighlightsInput object
 * @returns NlqTranslationResult<Filter[]>
 */
export const translateHighlightsFromJSON = (
  input: HighlightsInput,
): NlqTranslationResult<Filter[]> => {
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
          path: 'highlights',
          input: highlightsJSON,
          message:
            "Invalid highlights JSON. Expected an array of function calls with 'function' and 'args' properties.",
        },
      ],
    };
  }

  return translateHighlightsFromJSONFunctionCall({
    data: highlightsJSON,
    context: { dataSource, schemaIndex },
  });
};
