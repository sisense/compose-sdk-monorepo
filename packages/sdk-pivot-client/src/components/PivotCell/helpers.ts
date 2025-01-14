import { TreeNodeMetadata } from '../../tree-structure/types.js';
import { PivotDataNode, PivotTreeNode } from '../../data-handling/types.js';
import { tableType as typeOfTable } from '../PivotTable/constants.js';
import { UserType } from '../../data-handling/constants.js';
import { Position } from '../../tree-structure/constants.js';
import { InputStyles, Styles } from '../../utils/types.js';

/*
  Generates className string according to TreeNodeMetadata object
 */
export function getMetadataClasses(metadata?: TreeNodeMetadata, prefix = '', sufix = ''): string {
  let className = '';
  if (!metadata) {
    return className;
  }
  if (metadata.levels.length) {
    metadata.levels.forEach((position) => {
      className += ` ${prefix}--${sufix ? `${sufix}-` : ''}level-${position}`;
    });
  }
  if (metadata.siblings.length) {
    metadata.siblings.forEach((position) => {
      className += ` ${prefix}--${sufix ? `${sufix}-` : ''}sibling-${position}`;
    });
  }

  // only siblings for root
  if (metadata.root && metadata.root.siblings && metadata.root.siblings.length) {
    metadata.root.siblings.forEach((position) => {
      className += ` ${prefix}--${sufix ? `${sufix}-root-` : 'root-'}sibling-${position}`;
    });
  }

  // only siblings for parent
  if (metadata.parent && metadata.parent.siblings && metadata.parent.siblings.length) {
    metadata.parent.siblings.forEach((position) => {
      className += ` ${prefix}--${sufix ? `${sufix}-parent-` : 'parent-'}sibling-${position}`;
    });
  }
  return className;
}

export function getBorders(
  tableType: string,
  options: {
    metadata?: TreeNodeMetadata;
    rowMetadata?: TreeNodeMetadata;
    columnMetadata?: TreeNodeMetadata;
    treeNode?: PivotTreeNode;
    rowTreeNode?: PivotTreeNode;
    columnTreeNode?: PivotTreeNode;
    merge?: { colSpan?: number; rowSpan?: number };
  },
): { t: boolean; r: boolean; b: boolean; l: boolean } {
  const { metadata, rowMetadata, rowTreeNode, columnTreeNode, merge } = options || {};
  const res = {
    t: true,
    r: true,
    b: true,
    l: true,
  };

  if (tableType === typeOfTable.CORNER || tableType === typeOfTable.COLUMNS) {
    return res;
  }

  if (tableType === typeOfTable.ROWS) {
    const mergedColumns = merge && merge.colSpan;
    const isGrandNext =
      metadata && metadata.nextNode && metadata.nextNode.userType === UserType.GRAND_TOTAL;

    if (
      metadata &&
      metadata.levels.includes(Position.LAST) &&
      !metadata.siblings.includes(Position.LAST) &&
      !mergedColumns &&
      !isGrandNext
    ) {
      res.b = false;
    }

    if (
      metadata &&
      metadata.levels.includes(Position.FIRST) &&
      metadata.levels.includes(Position.LAST) &&
      !metadata.siblings.includes(Position.LAST) &&
      !mergedColumns &&
      !isGrandNext
    ) {
      res.b = false;
    }
  }

  if (tableType === typeOfTable.DATA) {
    const isRowSubTotal = rowTreeNode && rowTreeNode.userType === UserType.SUB_TOTAL;
    const isColSubTotal = columnTreeNode && columnTreeNode.userType === UserType.SUB_TOTAL;
    const isColGrandTotal = columnTreeNode && columnTreeNode.userType === UserType.GRAND_TOTAL;
    const isGrandNext =
      rowMetadata && rowMetadata.nextNode && rowMetadata.nextNode.userType === UserType.GRAND_TOTAL;

    if (
      rowMetadata &&
      rowMetadata.levels.includes(Position.LAST) &&
      !rowMetadata.siblings.includes(Position.LAST) &&
      !isRowSubTotal &&
      !isColSubTotal &&
      !isColGrandTotal &&
      !isGrandNext
    ) {
      res.b = false;
    }
  }

  return res;
}

/*
  Generates className string according to PivotTreeNode.userType property
 */
export function getUserTypeClasses(treeNode?: PivotTreeNode, prefix = '', sufix = ''): string {
  let className = '';
  if (treeNode && treeNode.userType) {
    className = `${prefix}--${sufix ? `${sufix}-` : ''}user-type-${treeNode.userType}`;
  }
  return className;
}

/*
  Generates className string according to merge object
 */
export function getMergeClasses(
  merge?: { colSpan?: number; rowSpan?: number },
  prefix = '',
  sufix = '',
): string {
  let className = '';
  if (merge && merge.colSpan) {
    className = `${prefix}--${sufix ? `${sufix}-` : ''}merged-columns`;
  }
  if (merge && merge.rowSpan) {
    className = ` ${prefix}--${sufix ? `${sufix}-` : ''}merged-rows`;
  }
  return className;
}

/*
 * Returns cell merge
 */
export function getMergedCellOffset(merge?: { colSpan?: number; rowSpan?: number }): number {
  return merge && merge.colSpan ? merge.colSpan - 1 : 0;
}

/*
 * Returns real cell content size (without borders)
 */
export function getCellSize(
  size: string | number | undefined,
  borderWidth: number | undefined,
): number | undefined {
  if (size === undefined) {
    return size;
  }
  let newSize = typeof size === 'number' ? size : parseInt(size, 10);
  newSize -= borderWidth || 1;
  return newSize;
}

type Props = {
  isDataCell: boolean;
  dataNode?: PivotDataNode;
  treeNode?: PivotTreeNode;
};

export function getStyleProp(props: Props): InputStyles {
  const { isDataCell, dataNode, treeNode } = props;
  const node = isDataCell ? dataNode : treeNode;
  return (node && node.style) || {};
}

/**
 * Removes not related styles from cell styles object,
 * borders for example are not configured on cell level
 *
 * @param {object} style - removes border related styles from cell styles
 * @returns {object} - clear styles
 */
export const clearGlobal = (style: InputStyles): InputStyles => {
  const clone: Styles = {};
  Object.keys(style).forEach((key) => {
    // remove specific styles from cell
    if (!key.startsWith('border') || key === 'borderColor') {
      // @ts-ignore
      clone[key] = style[key];
    }
  });
  return clone;
};

/**
 * Removes not related styles from cell level styles object,
 * some styles moves direct to content but not to cell
 *
 * @param {object} style - removes border related styles from cell styles
 * @returns {object} - clear styles
 */
export const clearCellStyles = (style: InputStyles): Styles => {
  const clone: Styles = {};
  Object.keys(style).forEach((key) => {
    // remove specific styles from cell
    if (
      (!key.startsWith('color') &&
        !key.startsWith('padding') &&
        !key.startsWith('border') &&
        !key.startsWith('font') &&
        !key.startsWith('lineHeight') &&
        !key.startsWith('databarColor')) ||
      key === 'borderColor'
    ) {
      // @ts-ignore
      clone[key] = style[key];
    }
  });
  return clone;
};

/**
 * Filter styles related to cell content only
 *
 * @param {object} style - removes border related styles from cell styles
 * @returns {object} - clear styles
 */
export const clearCellContentStyles = (style: InputStyles): Styles => {
  const clone: Styles = {};
  Object.keys(style).forEach((key) => {
    // remove specific styles from cell
    if (
      key.startsWith('color') ||
      key.startsWith('padding') ||
      key.startsWith('font') ||
      key.startsWith('lineHeight')
    ) {
      // @ts-ignore
      clone[key] = style[key];
    }
  });
  return clone;
};

/**
 * Filter styles related to databar only
 *
 * @param {object} style - cell styles
 * @returns {object} - clear styles
 */
export const clearDatabarsStyles = (style: InputStyles): Styles => {
  const clone: Styles = {};
  if (style.databarColor) {
    clone.backgroundColor = style.databarColor;
  }
  return clone;
};

/**
 * get tooltip text for header cell
 *
 * @param {HTMLDivElement | null} contentElement - pivot cell content element
 * @param {HTMLDivElement | null} containerElement - pivot cell container element
 * @returns {string} - tooltip text
 */
export const getTooltip = (
  containerElement?: HTMLDivElement | null,
  contentElement?: HTMLDivElement | null,
  cellPadding: number = 0,
): string => {
  if (
    contentElement &&
    containerElement &&
    contentElement.offsetWidth + cellPadding >= containerElement.offsetWidth
  ) {
    return contentElement.textContent || '';
  }
  return '';
};

export const getRangeColor = (
  rangeMinMax: Array<Array<number>> | undefined,
  node: PivotDataNode | undefined,
  measureNode: PivotTreeNode | undefined,
): string | undefined => {
  if (!rangeMinMax || !node || !measureNode || measureNode.measureJaqlIndex === undefined) {
    return undefined;
  }
  const [min, max] = rangeMinMax[measureNode.measureJaqlIndex] || [];
  if (min === undefined || min === null) {
    return undefined;
  }
  const compileRange = node && node.store && node.store.compileRange;
  const compileRangeContext = node && node.store && node.store.compileRangeContext;
  const compileRangeArgs = node && node.store && node.store.compileRangeArgs;
  if (!compileRange || !compileRangeArgs || !compileRangeContext || !node || !node.value) {
    return undefined;
  }
  const arg = {
    ...compileRangeArgs,
    minvalue: min,
    midvalue: min + (max - min) / 2,
    maxvalue: max,
  };

  let graymin;
  let graymax;

  if (arg.min === undefined) {
    if (arg.maxvalue <= 0) {
      graymax = true;
    }
    arg.min = arg.minDef;
  }

  if (arg.max === undefined) {
    if (arg.minvalue >= 0) {
      graymin = true;
    }
    arg.max = arg.maxDef;
  }

  if (graymax) {
    arg.max = arg.maxGray;
  }

  if (graymin) {
    arg.min = arg.minGray;
  }

  const rangeFn = compileRange.call(compileRangeContext, arg);
  const color = rangeFn(node.value);
  return color;
};
