/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines */

/**
 * This file contain sorting functionality ported from the existing Analytics.
 * It directly works with pivot JAQL to apply sorting.
 *
 * It will be fully refactored soon by using a different approach of applying sorting on Pivot internal data options.
 */

import {
  JaqlRequest,
  jaqlProcessor,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-client';
import { cloneDeep } from 'lodash';

export function normalizeJaqlSorting(jaql: JaqlRequest) {
  return {
    ...jaql,
    metadata: jaql.metadata.map((item: JaqlRequest['metadata'][number], index: number) => {
      const isLastRowItem =
        item.panel === 'rows' &&
        jaql.metadata[index + 1] &&
        jaql.metadata[index + 1].panel !== 'rows';

      if (
        item.jaql.sort &&
        (!item.jaql.sortDetails ||
          !item.jaql.sortDetails.initialized ||
          item.jaql.sort !== item.jaql.sortDetails.dir)
      ) {
        // previous sort was defined by the panel item rather than clicking
        // on a pivot header (or no previous sort)
        // OR previous sort was a different direction
        // - override previous sort with the one that's defined by this panel item.
        return {
          ...item,
          jaql: {
            ...item.jaql,
            sortDetails: {
              ...getSortingFromJaql(item, jaql.metadata, isLastRowItem, false),
              initialized: true,
            },
          },
        };
      }

      return item;
    }),
  };
}

function getSortingFromJaql(panelItem: any, itemPanels: any, isLastRowItem: any, isTableSort: any) {
  const translatedSortingElement = {
    field: panelItem.field ? panelItem.field.index : -1,
    dir: panelItem.jaql.sort,
    measurePath: null,
    sortingLastDimension: isSortingLastDimension(isLastRowItem, panelItem),
  };

  // update existing sorting array with the given sorting element
  insertSortElement(translatedSortingElement, itemPanels, isTableSort, panelItem);
  return translatedSortingElement;
}

function isSortingLastDimension(isLastRowItem: any, panelItem: any) {
  return isLastRowItem || isMeasure(panelItem, true);
}

function isMeasure(item: any, includeFormulas: any) {
  return (
    item?.jaql?.agg || item?.agg || (includeFormulas && (item?.jaql?.formula || item?.formula))
  );
}

function insertSortElement(newSortElement: any, panelItems: any, isTableSort: any, panelItem: any) {
  panelItems = panelItems || [];
  if (newSortElement.sortingLastDimension) {
    // if sorting last dimension- remove all other sorting on the last dimension
    for (let i = 0; i < panelItems.length; ++i) {
      const currSortDetails = panelItems[i].jaql.sortDetails;
      if (
        currSortDetails &&
        currSortDetails.sortingLastDimension &&
        currSortDetails.field !== newSortElement.field
      ) {
        panelItems[i].jaql.sort = null;
        delete panelItems[i].jaql.sortDetails;
      }
    }
  }
  const existingElements = panelItems.filter(
    (item: any) => item.jaql.sortDetails && item.jaql.sortDetails.field === newSortElement.field,
  );

  if (existingElements.length > 0) {
    const existingSortDetails = existingElements[0].jaql.sortDetails;
    const existMeasurePath = existingSortDetails.measurePath;
    const newMeasurePath = newSortElement.measurePath;

    // no measure path is defined, or the measure paths are identical
    const isExactFieldSort =
      (!existMeasurePath && !newMeasurePath) ||
      JSON.stringify(existMeasurePath) === JSON.stringify(newMeasurePath);

    existingSortDetails.dir =
      newSortElement.dir || (isExactFieldSort ? oppositeSorting(existingSortDetails.dir) : 'asc');
    // TODO: 'none' or false or null
    if (existingSortDetails.dir === 'none') {
      delete existingElements[0].jaql.sortDetails;
      delete existingElements[0].jaql.sort;
      return;
    }
    existingSortDetails.measurePath = newSortElement.measurePath;
    existingElements[0].jaql.sort = existingSortDetails.dir;
  } else if (newSortElement.dir !== 'none') {
    const item =
      panelItem ||
      panelItems.filter((currItem: any) => newSortElement.field === currItem.field.index)[0];
    const dataType = item?.jaql?.datatype;
    const defaultSortDir = dataType === 'numeric' || dataType === 'datetime' ? 'desc' : 'asc';

    // default sorting direction re-defined due to PRIS-8581
    // @see http://jira.sisense.com:8080/browse/PRIS-8581
    // Now it id "desc" for numbers, "asc" for other column types
    newSortElement.dir = newSortElement.dir || defaultSortDir;

    item.jaql.sortDetails = newSortElement;
    item.jaql.sort = newSortElement.dir;
  }

  const jaql = { metadata: panelItems };
  jaqlProcessor.updateLastAppliedSortingFlag(jaql, newSortElement);

  if (!isTableSort) {
    return;
  }

  // table sort - remove all other sorting from other elements
  panelItems.forEach((item: any) => {
    if (!item.jaql.sortDetails || item.jaql.sortDetails.field === newSortElement.field) {
      return;
    }
    delete item.jaql.sortDetails;
    delete item.jaql.sort;
  });
}

function oppositeSorting(direction: any) {
  return direction === 'asc' ? 'desc' : 'asc';
}

export function prepareSortedJaql(
  jaql: JaqlRequest,
  { type, settings, sortDetails, isSingleRowTree }: SortingSettingsChangePayload,
) {
  if (type === 'simple') {
    return _handleSimpleSortingSettingsChange(jaql, settings, sortDetails, isSingleRowTree);
  } else {
    return _handleComplexSortingSettingsChange(jaql, settings, sortDetails, isSingleRowTree);
  }
}

function _handleSimpleSortingSettingsChange(
  jaql: JaqlRequest,
  settings: any,
  sortDetails: any,
  isSingleRowTree: any,
) {
  const sortDetailsThatShouldBePassedToFnToGetDesiredSorting = {
    ...sortDetails,
    dir: settings[0].direction === 'asc' ? 'desc' : 'asc',
  };

  const jaqlClone = cloneDeep(jaql);
  // process sorting apply
  jaqlProcessor.updatePanelsSortingMetadata(
    sortDetailsThatShouldBePassedToFnToGetDesiredSorting,
    jaqlClone,
    { isSingleRowTree },
  );

  return jaqlClone;
}

function _handleComplexSortingSettingsChange(
  jaql: JaqlRequest,
  settings: any,
  sortDetails: any,
  isSingleRowTree: any,
) {
  const jaqlClone = cloneDeep(jaql);

  jaqlProcessor.handleComplexSortingSettingsUpdate(jaqlClone, settings, sortDetails, {
    // formatter: this.utils.formatter,
    isSingleRowTree,
  });

  jaqlClone.metadata.forEach((item: any, index: number) => {
    const isLastRowItem =
      item.panel === 'rows' &&
      jaqlClone.metadata[index + 1] &&
      jaqlClone.metadata[index + 1].panel !== 'rows';
    if (item.jaql.sortDetails) {
      item.jaql.sortDetails.sortingLastDimension = isSortingLastDimension(isLastRowItem, item);
    }
  });

  return jaqlClone;
}
