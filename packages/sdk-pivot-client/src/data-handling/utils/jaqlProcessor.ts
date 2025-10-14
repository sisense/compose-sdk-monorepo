import isEqual from 'lodash-es/isEqual.js';

import { JaqlPanel, JaqlRequest, SortDetails } from '../../data-load/types.js';
import { treeNode } from '../../tree-structure/utils/index.js';
import {
  JaqlDataType,
  ListOfJaqlDataTypes,
  ListOfSortingDirections,
  PanelType,
  SortingDirection,
} from '../constants.js';
import { PivotTreeNode } from '../types.js';
import createPivotTreeNode from './createPivotTreeNode.js';
import * as jaqlProcessor from './jaqlProcessor.js';

export type DataTypes = {
  [key: string]: string;
};

export type MeasurePath = {
  [key: string]: string;
};

export function getDataTypes(panels: Array<JaqlPanel> = []): DataTypes {
  const dataTypes: DataTypes = {};
  panels.forEach((panel) => {
    const { index = Infinity } = panel.field || {};
    const indexStr = `${index}`;
    dataTypes[indexStr] = panel.jaql.datatype || JaqlDataType.TEXT;
  });
  return dataTypes;
}

function defaultFormatter(value: any, dataType: string): any {
  if (value && dataType === JaqlDataType.DATETIME) {
    try {
      return new Date(value).toISOString();
    } catch (e) {
      return value;
    }
  }
  return value;
}

function normalizeMeasurePath(path: MeasurePath | undefined | null) {
  if (path === null) {
    return undefined;
  }
  if (isEqual(path, {})) {
    return undefined;
  }
  return path;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function isMeasurePathEqual(
  _measurePathA?: MeasurePath | null,
  _measurePathB?: MeasurePath | null,
  dataTypes: DataTypes = {},
): boolean {
  const measurePathA = normalizeMeasurePath(_measurePathA);
  const measurePathB = normalizeMeasurePath(_measurePathB);

  let result = false;
  if (
    typeof measurePathA === 'object' &&
    measurePathA !== null &&
    typeof measurePathB === 'object' &&
    measurePathB !== null
  ) {
    result = true;
    const measurePathAKeys = Object.keys(measurePathA);
    const measurePathBKeys = Object.keys(measurePathB);
    if (measurePathAKeys.length !== measurePathBKeys.length) {
      result = false;
    } else {
      measurePathAKeys.forEach((key: string) => {
        const dataType = dataTypes[key] || '';
        let valueA = (measurePathA || {})[key];
        let valueB = (measurePathB || {})[key];
        if (typeof valueA === 'undefined' || typeof valueB === 'undefined') {
          result = false;
          return;
        }
        if (dataType === JaqlDataType.DATETIME) {
          valueA = defaultFormatter(valueA, dataType);
          valueB = defaultFormatter(valueB, dataType);
        }
        if (valueA !== valueB) {
          result = false;
        }
      });
    }
  } else {
    result = measurePathA === measurePathB;
  }

  return result;
}

function getCompatibleMeasurePath(
  measurePath: MeasurePath | undefined,
  dataTypes: DataTypes,
  formatter: Function = defaultFormatter,
) {
  if (!measurePath || typeof measurePath !== 'object') {
    return measurePath;
  }
  const result: MeasurePath = {};
  Object.keys(measurePath).forEach((key) => {
    const dataType = dataTypes[key];
    const value = (measurePath || {})[key];
    const formattedValue = formatter(value, dataType);
    result[key] = formattedValue;
  });
  return result;
}

/**
 * Get appropriate metadata panels (rows/columns/measures) from JAQL request object
 *
 * @param {JaqlRequest} jaql - jaql with metadata
 * @param {string} type - panels type to receive
 * @returns {Array<JaqlPanel>} - list of panels
 */
export const getMetadataPanels = (jaql?: JaqlRequest, type?: string): Array<JaqlPanel> => {
  let panels = (jaql && jaql.metadata) || [];
  if (type) {
    panels = panels.filter((item: JaqlPanel) => item.panel === type);
  }
  panels.sort((prev, next) => {
    const defaultField = { index: Infinity };
    const prevField = prev.field || defaultField;
    const nextField = next.field || defaultField;
    return (prevField.index as number) - (nextField.index as number);
  });
  return panels;
};

/**
 * Get appropriate metadata panel (rows/columns/measures) from JAQL request object by panel index
 *
 * @param {JaqlRequest} jaql - jaql with metadata
 * @param {number} index - panel index
 * @param {string} [type] - panels type to receive
 * @returns {JaqlPanel} - jaql panels
 */
export const getMetadataPanelByIndex = (
  jaql?: JaqlRequest,
  index?: number,
  type?: string,
): JaqlPanel | undefined => {
  if (typeof index === 'undefined') {
    return undefined;
  }
  const panels = getMetadataPanels(jaql, type);
  const filteredPanels = panels.filter((panel: JaqlPanel) => {
    const panelField = panel.field || { index: Infinity };
    return panelField.index === index;
  });
  return filteredPanels[0];
};

/**
 * sortingLastDimension jaql's sorting param processing method
 *
 * @param {JaqlPanel} processedPanel - panel to be identified
 * @param {?JaqlRequest} jaql - jaql to be processed
 * @returns {boolean} - sortingLastDimension initialization
 */
const isPanelsLastDimension = (processedPanel: JaqlPanel, jaql?: JaqlRequest): boolean => {
  const processedPanelField = processedPanel.field || { index: Infinity };
  if (processedPanel.panel === PanelType.MEASURES) {
    return true;
  }
  if (processedPanel.panel === PanelType.ROWS) {
    const panels = getMetadataPanels(jaql, PanelType.ROWS);
    const lastPanel = panels[panels.length - 1] || {};
    const lastPanelField = lastPanel.field || { index: Infinity };
    if (panels.length && lastPanelField.index === processedPanelField.index) {
      return true;
    }
    if (!panels.length) {
      // eslint-disable-next-line no-console
      console.error('Missing rows panel in jaql!');
    }
  }
  return false;
};

function checkRowSortedBySubtotal(
  sortDetails: SortDetails | undefined,
  jaqlIndex: number | undefined,
) {
  if (!sortDetails) {
    return false;
  }
  if (typeof sortDetails.field !== 'number') {
    return false;
  }
  return sortDetails.field !== jaqlIndex;
}

/**
 * Get appropriate metadata panels (rows/columns/measures) in TreeNode structure from
 * JAQL request object
 *
 * @param {JaqlRequest} jaql - jaql with metadata
 * @param {string} [type=PanelType.ROWS] - panels type to receive
 * @returns {PivotTreeNode} - metadata panels tree
 */
export const getMetadataTree = (
  jaql?: JaqlRequest,
  type: string = PanelType.ROWS,
): PivotTreeNode => {
  const panels = getMetadataPanels(jaql, type);
  const nodes = panels.map((item: JaqlPanel, index) => {
    const node = treeNode.create(item.jaql.title, undefined, undefined, index);
    const pivotNode = createPivotTreeNode(node, type);
    pivotNode.jaqlIndex = item.field ? item.field.index : undefined;
    switch (type) {
      case PanelType.ROWS: {
        pivotNode.measurePath = undefined;

        const isSortedBySubtotal = checkRowSortedBySubtotal(
          item.jaql.sortDetails,
          pivotNode.jaqlIndex,
        );
        if (item.jaql.sort && !isSortedBySubtotal) {
          pivotNode.dir = item.jaql.sort;
        } else {
          pivotNode.dir = null;
        }
        break;
      }
      case PanelType.MEASURES:
        pivotNode.databars = item.format ? item.format.databars : false;
        pivotNode.measureJaqlIndex = pivotNode.jaqlIndex;
        if (!getMetadataPanels(jaql, PanelType.COLUMNS).length) {
          pivotNode.measurePath = undefined;
          if (item.jaql.sortDetails && item.jaql.sortDetails.measurePath === null) {
            pivotNode.dir = item.jaql.sortDetails.dir;
          } else {
            pivotNode.dir = null;
          }
        }
        break;
      default:
        break;
    }
    return pivotNode;
  });
  return treeNode.wrapInRootNode(nodes) as PivotTreeNode;
};

/**
 * method to clear sorting information in panels with
 * sortingLastDimension === false
 *
 * @param {?JaqlRequest} jaql - jaql to clear
 * @returns {void}
 */
const clearLastDimesionSortDetails = (jaql?: JaqlRequest) => {
  const metadata = jaql && jaql.metadata ? jaql.metadata : [];
  metadata.forEach((panel: JaqlPanel) => {
    if (
      panel &&
      panel.jaql &&
      panel.jaql.sort &&
      panel.jaql.sortDetails &&
      panel.jaql.sortDetails.sortingLastDimension
    ) {
      panel.jaql.sort = null;
      delete panel.jaql.sortDetails;
    }
  });
};

/**
 * Clears panel sort details
 *
 * @param {JaqlPanel} panel - jaql panel
 * @returns {void}
 */
const clearPanelSortDetails = (panel?: JaqlPanel) => {
  if (panel && panel.jaql) {
    panel.jaql.sort = null;
    delete panel.jaql.sortDetails;
  }
};

/**
 * method to clear sorting all information in panels
 *
 * @param {?JaqlRequest} jaql - jaql to clear
 * @returns {void}
 */
const clearAllSortDetails = (jaql?: JaqlRequest) => {
  const metadata = jaql && jaql.metadata ? jaql.metadata : [];
  metadata.forEach((panel: JaqlPanel) => clearPanelSortDetails(panel));
};

/**
 * Getter for last sorted panel
 *
 * @param {JaqlRequest} jaql - jaql request
 * @returns {JaqlPanel|undefined} - panel item
 */
const getLastSortedPanel = (jaql: JaqlRequest) =>
  (jaql.metadata || []).reverse().find((item) => !!item.jaql.sortDetails);

/**
 * Getter for panel item on which sorting was last applied
 *
 * @param {JaqlRequest} jaql - jaql request
 * @returns {JaqlPanel|undefined} - panel item
 */
const getLastAppliedSortedPanel = (jaql: JaqlRequest) =>
  (jaql.metadata || []).find(
    (item) => !!(item.jaql.sortDetails && item.jaql.sortDetails.isLastApplied),
  );

/**
 * Removes redundant sort details for single branch tree
 * (As such pivot can be sorted only by one panel)
 *
 * @param {JaqlRequest} jaql - jaql request
 * @returns {void}
 */
export const normalizeSingleBranchTreeSortDetails = (jaql: JaqlRequest) => {
  const sortedPanel = getLastAppliedSortedPanel(jaql) || getLastSortedPanel(jaql);
  if (!sortedPanel) {
    return;
  }

  const sortedIndex = sortedPanel.field && sortedPanel.field.index;
  (jaql.metadata || []).forEach((panel: JaqlPanel) => {
    const currentIndex = panel.field && panel.field.index;
    if (currentIndex !== sortedIndex) {
      clearPanelSortDetails(panel);
    }
  });
};

/**
 * Updates last applied flag on metadata item sort details
 * (Required for proper apply single branch tree sorting)
 *
 * @param {JaqlRequest} jaql - jaql request
 * @param {SortDetails} sortDetails - last updated sort details
 * @returns {void}
 */
export const updateLastAppliedSortingFlag = (jaql: JaqlRequest, sortDetails: SortDetails) => {
  jaql.metadata.forEach((item: JaqlPanel) => {
    const currentIndex = item.field && item.field.index;
    if (sortDetails.field === currentIndex) {
      item.jaql.sortDetails = item.jaql.sortDetails || sortDetails;
      item.jaql.sortDetails.isLastApplied = true;
      return;
    }
    if (item.jaql.sortDetails && item.jaql.sortDetails) {
      delete item.jaql.sortDetails.isLastApplied;
    }
  });
};

/**
 * method to handle new sorting metadata
 *
 * @param {SortDetails} sortDetails - node with sorting metadata
 * @param {?JaqlRequest} jaql - jaql to process
 * @param {object} [options] - additional options
 * @param {Function} [options.formatter] - fields formatter for measurePath
 * @param {boolean} [options.isSingleRowTree] - defines data structure
 * @returns {JaqlRequest} - reload pivot after jaql formatting
 */
export const updatePanelsSortingMetadata = (
  sortDetails: SortDetails,
  jaql: JaqlRequest,
  options?: { formatter?: Function; isSingleRowTree?: boolean },
): void => {
  const { isSingleRowTree = false, formatter } = options || {};
  if (!jaql) {
    // eslint-disable-next-line no-console
    console.warn('jaql is undefined or null!');
    return;
  }

  const panelToSortBy = getMetadataPanelByIndex(jaql, sortDetails.field);
  if (panelToSortBy && panelToSortBy.panel === PanelType.COLUMNS) {
    // eslint-disable-next-line no-console
    console.warn('Should not be sorted by "COLUMN" type panels!');
    return;
  }
  if (!panelToSortBy) {
    return;
  }
  const sortingLastDimension = isPanelsLastDimension(panelToSortBy, jaql);
  if (isSingleRowTree) {
    clearAllSortDetails(jaql);
  } else if (sortingLastDimension) {
    clearLastDimesionSortDetails(jaql);
  }

  switch (sortDetails.dir) {
    case SortingDirection.DESC:
    case null:
      panelToSortBy.jaql.sort = SortingDirection.ASC;
      break;
    case SortingDirection.ASC:
      panelToSortBy.jaql.sort = SortingDirection.DESC;
      break;
    default:
      panelToSortBy.jaql.sort = undefined;
  }

  const panelToSortByField = panelToSortBy.field || { index: Infinity };

  if (panelToSortBy.jaql.sort) {
    let { measurePath } = sortDetails;
    if (measurePath) {
      const panels = getMetadataPanels(jaql);
      const dataTypes = getDataTypes(panels);
      measurePath = getCompatibleMeasurePath(measurePath, dataTypes, formatter);
    }
    panelToSortBy.jaql.sortDetails = {
      field: panelToSortByField.index,
      dir: panelToSortBy.jaql.sort,
      sortingLastDimension,
      measurePath,
      initialized: true,
    };
  } else {
    panelToSortBy.jaql.sortDetails = undefined;
  }

  if (jaql && jaql.metadata && panelToSortByField.index !== undefined) {
    jaql.metadata[panelToSortByField.index] = panelToSortBy;
  }
  updateLastAppliedSortingFlag(jaql, sortDetails);
};

/**
 * Set width for jaql panel item
 *
 * @param {JaqlRequest} jaql - jaql request object
 * @param {number} jaqlIndex - jaql panel item index
 * @param {number} width - jaql panel item width
 * @returns {void}
 */
export const setResizeWidthToJaql = (
  jaql: JaqlRequest | undefined,
  jaqlIndex: number,
  width: number,
): void => {
  if (!jaql) {
    return;
  }
  const jaqlPanel = getMetadataPanelByIndex(jaql, jaqlIndex);
  if (!jaqlPanel) {
    return;
  }
  jaqlPanel.format = jaqlPanel.format || {};
  jaqlPanel.format.width = width;
};

/**
 * Get pairs 'jaqlIndex: value'  for jaql panel items
 *
 * @param {JaqlRequest} jaql - jaql request object
 * @returns {object} - object, keys - jaqlIndex, value - width
 * appropriate width
 */
export const getResizeWidthFromJaql = (jaql?: JaqlRequest): { [key: number]: number } => {
  const result: { [key: number]: number } = {};
  if (!jaql) {
    return result;
  }

  const panels = getMetadataPanels(jaql);
  panels.forEach((panel) => {
    const panelField = panel.field || { index: Infinity };
    if (
      panel.format &&
      typeof panel.format.width !== 'undefined' &&
      typeof panelField.index !== 'undefined'
    ) {
      result[panelField.index] = panel.format.width;
    }
  });

  return result;
};

export const markSortedNode = (jaql: JaqlRequest | undefined, item: PivotTreeNode): void => {
  if (typeof item.measureJaqlIndex !== 'undefined') {
    const panels = getMetadataPanels(jaql);
    const dataTypes = getDataTypes(panels);

    const rowWhereSortPropIs = panels
      .filter((p: JaqlPanel) => p.panel === PanelType.ROWS)
      .find((rp) => {
        const rowSortDetails = rp.jaql.sortDetails;
        if (!rowSortDetails) {
          return false;
        }

        const isIndexSame = rowSortDetails.field === item.measureJaqlIndex;
        if (!isIndexSame) {
          return false;
        }

        return Boolean(isMeasurePathEqual(item.measurePath, rowSortDetails.measurePath, dataTypes));
      });

    if (rowWhereSortPropIs) {
      item.dir = rowWhereSortPropIs.jaql.sort ? rowWhereSortPropIs.jaql.sort : null;
      return;
    }

    const panel = getMetadataPanelByIndex(jaql, item.measureJaqlIndex);
    if (panel && panel.jaql.sortDetails) {
      const panelMeasurePath = panel.jaql.sortDetails.measurePath;
      const itemMeasurePath = item.measurePath;

      if (isMeasurePathEqual(panelMeasurePath, itemMeasurePath, dataTypes)) {
        item.dir = panel.jaql.sort || null;
        return;
      }
    }
  }

  item.dir = null;
};

function handleComplexSortingSettingsUpdate(
  jaql: JaqlRequest,
  desiredSortingSettings: (SortingSettingsItem & { indexInJaql: number })[],
  possibleSortDetailsOfCurrentMeasure: SortDetails,
  options: { formatter?: Function; isSingleRowTree: boolean },
) {
  const { isSingleRowTree, formatter } = options;

  if (isSingleRowTree) {
    clearAllSortDetails(jaql);
  }

  jaql.metadata.forEach((item) => {
    if (item.jaql.sortDetails) {
      delete item.jaql.sortDetails.isLastApplied;
    }
  });

  desiredSortingSettings.forEach((dss, index) => {
    let indexOfPanelToSortBy;
    if (index === desiredSortingSettings.length - 1) {
      if (dss.selected) {
        clearLastDimesionSortDetails(jaql);
      }

      indexOfPanelToSortBy = possibleSortDetailsOfCurrentMeasure.field;
    } else {
      indexOfPanelToSortBy = dss.indexInJaql;
    }

    const panelToSortBy = getMetadataPanelByIndex(jaql, indexOfPanelToSortBy);

    if (!panelToSortBy) {
      // eslint-disable-next-line no-console
      console.warn(new Error('Panel not found'));
      return;
    }

    if (dss.selected && !dss.direction) {
      // eslint-disable-next-line no-console
      console.warn(new Error("Direction should be defined and equal to 'asc' or 'desc'"));
    }

    const panels = getMetadataPanels(jaql);
    const dataTypes = getDataTypes(panels);

    if (!dss.direction || !dss.selected) {
      const { sortDetails } = panelToSortBy.jaql;
      const shouldDeleteSorting = Boolean(
        sortDetails &&
          possibleSortDetailsOfCurrentMeasure.field === sortDetails.field &&
          isMeasurePathEqual(
            possibleSortDetailsOfCurrentMeasure.measurePath,
            sortDetails.measurePath,
            dataTypes,
          ),
      );

      if (shouldDeleteSorting) {
        delete panelToSortBy.jaql.sort;
        delete panelToSortBy.jaql.sortDetails;
      }
    }

    if (dss.selected && dss.direction) {
      panelToSortBy.jaql.sort = dss.direction;
      let { measurePath } = possibleSortDetailsOfCurrentMeasure;
      if (measurePath) {
        measurePath = getCompatibleMeasurePath(measurePath, dataTypes, formatter);
      }

      if (
        possibleSortDetailsOfCurrentMeasure.measurePath === undefined &&
        panelToSortBy.field && // for type checker
        panelToSortBy.panel === 'rows' &&
        possibleSortDetailsOfCurrentMeasure.field !== panelToSortBy.field.index
      ) {
        measurePath = {};
      }

      panelToSortBy.jaql.sortDetails = {
        field: possibleSortDetailsOfCurrentMeasure.field,
        dir: dss.direction,
        sortingLastDimension: false, // TODO: find out should it be true?
        measurePath,
        isLastApplied: true,
        initialized: true,
      };
    }
  });
}

export type SortingSettingsItem = {
  title: string;
  datatype: ListOfJaqlDataTypes;
  selected: boolean;
  direction: ListOfSortingDirections | null;
  indexInJaql?: number;
};

function checkLastRowSortedByMeasure(
  lastRow: any, // TODO: fix
  possibleSortDetailsOfCurrentMeasure: SortDetails,
  currentSortDetailsOfCurrentMeasure: SortDetails,
  dataTypesOfPanels: any, // TODO: fix to DataTypes
) {
  if (lastRow.jaql.sortDetails) {
    // case 1: last row sorted
    //   then `.dir` and `.sortDetails` will be on row `.jaql`
    //   `direction` should be `undefined`
    //   `selected` should be `false`
    return false;
  }

  if (currentSortDetailsOfCurrentMeasure) {
    // case 2: measure sorted
    //   then `.dir` and `.sortDetails` will be on measure `.jaql`
    //   `direction` should be `currentSortDetailsOfCurrentMeasure.dir`
    //   `selected` should be `true`
    return jaqlProcessor.isMeasurePathEqual(
      possibleSortDetailsOfCurrentMeasure.measurePath,
      currentSortDetailsOfCurrentMeasure.measurePath,
      dataTypesOfPanels,
    );
  }

  // case 3: nothing sorted
  return false;
}

function pickDirectionProperty(sd?: SortDetails): SortingSettingsItem['direction'] {
  const dir = sd && sd.dir;
  switch (dir) {
    case 'asc':
    case 'desc':
      return dir;
    default:
      return null;
  }
}

function mapWidgetJaqlToComplexSortingSettings(
  jaql: JaqlRequest,
  possibleSortDetailsOfCurrentMeasure: SortDetails,
): Array<Omit<SortingSettingsItem, 'indexInJaql'>> {
  const listOfRows = jaql.metadata.filter((meta: any) => meta.panel === 'rows'); // TODO: fix `any`

  const metadataPanelOfCurrentMeasure = jaqlProcessor.getMetadataPanelByIndex(
    jaql,
    possibleSortDetailsOfCurrentMeasure.field,
  ) as JaqlPanel; // TODO: fix `as`

  // TODO: fix `as` type assertion
  const datatype = metadataPanelOfCurrentMeasure.jaql.datatype as ListOfJaqlDataTypes;

  // currentSortDetailsOfCurrentMeasure is not possibleSortDetailsOfCurrentMeasure
  //   (measurePath can be different)
  const currentSortDetailsOfCurrentMeasure = metadataPanelOfCurrentMeasure.jaql // TODO: name it better
    .sortDetails as SortDetails; // TODO: fix `SortDetails`

  const dataTypesOfPanels = jaqlProcessor.getDataTypes(jaqlProcessor.getMetadataPanels(jaql));

  const listOfSettingsEntries: SortingSettingsItem[] = [];
  for (let index = 0; index < listOfRows.length - 1; index += 1) {
    const row = listOfRows[index];

    const isRowSortedBySubtotals = Boolean(
      row.jaql.sortDetails &&
        row.jaql.sortDetails.field === possibleSortDetailsOfCurrentMeasure.field &&
        jaqlProcessor.isMeasurePathEqual(
          possibleSortDetailsOfCurrentMeasure.measurePath,
          row.jaql.sortDetails.measurePath,
          dataTypesOfPanels,
        ),
    );
    const direction = pickDirectionProperty(row.jaql.sortDetails);

    listOfSettingsEntries.push({
      title: row.jaql.title,
      // `datatype` should correspond to datatype of value column on which
      //   sorting settings was called
      datatype,
      selected: isRowSortedBySubtotals,
      direction,
      indexInJaql: row.field?.index,
    });
  }

  const lastRow = listOfRows[listOfRows.length - 1];
  const isLastRowSortedByMeasure = checkLastRowSortedByMeasure(
    lastRow,
    possibleSortDetailsOfCurrentMeasure,
    currentSortDetailsOfCurrentMeasure,
    dataTypesOfPanels,
  );

  const direction = pickDirectionProperty(currentSortDetailsOfCurrentMeasure);

  const lastEntry = {
    title: lastRow.jaql.title,
    // `datatype` should correspond to datatype of value column on which
    //   sorting settings was called
    datatype,
    selected: isLastRowSortedByMeasure,
    direction,
    indexInJaql: metadataPanelOfCurrentMeasure.field?.index,
  };
  listOfSettingsEntries.push(lastEntry);

  return listOfSettingsEntries;
}

function mapWidgetJaqlToSimpleSortingSettings(
  metadataPanels: JaqlPanel[],
  possibleSortDetailsOfCurrentMeasure: SortDetails,
  dataTypes: DataTypes,
): SortingSettingsItem | undefined {
  const result = metadataPanels
    .filter((meta) => {
      // eslint-disable-line arrow-body-style
      return meta.field && possibleSortDetailsOfCurrentMeasure.field === meta.field.index;
    })
    .map((metadataPanel) => {
      const { sortDetails } = metadataPanel.jaql;
      const selected = Boolean(
        sortDetails &&
          jaqlProcessor.isMeasurePathEqual(
            possibleSortDetailsOfCurrentMeasure.measurePath,
            sortDetails.measurePath,
            dataTypes,
          ),
      );
      const direction = selected ? pickDirectionProperty(sortDetails) : null;

      return {
        title: metadataPanel.jaql.title,
        // TODO: remove `as` type assertion
        datatype: metadataPanel.jaql.datatype as ListOfJaqlDataTypes,
        selected,
        direction,
      };
    });

  return result[0];
}

export default {
  isMeasurePathEqual,
  getDataTypes,
  updatePanelsSortingMetadata,
  getMetadataTree,
  getMetadataPanels,
  getMetadataPanelByIndex,
  setResizeWidthToJaql,
  getResizeWidthFromJaql,
  markSortedNode,
  normalizeSingleBranchTreeSortDetails,
  updateLastAppliedSortingFlag,
  handleComplexSortingSettingsUpdate,
  mapWidgetJaqlToSimpleSortingSettings,
  mapWidgetJaqlToComplexSortingSettings,
};
