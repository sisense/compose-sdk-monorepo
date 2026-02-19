import { JaqlPanel, JaqlRequest } from '../../../data-load/types.js';
import { PanelType, UserType } from '../../constants.js';
import { PivotTreeNode } from '../../types.js';
import { MeasureMetadata } from './types.js';

const getJaqlItemByIndex = (jaql: JaqlRequest, index: number) =>
  jaql.metadata.find((el) => el.field && el.field.index === index);

/**
 * Collect and return rows or columns group metadata
 *
 * @param {PivotTreeNode} dimensionItem - PivotTreeNode item
 * @param {JaqlRequest} jaql - jaql with metadata
 * @param {Array} dimensionsMeta - array of child dimensions for group
 * @param {Array} type - array of cell types
 * @returns {{ dimensionsMeta: Array<any>, type: Array<string> }} of dimensions metadata
 */
export const getDimensionMetadata = (
  dimensionItem: PivotTreeNode,
  jaql?: JaqlRequest,
  dimensionsMeta: Array<any> = [],
  type: Array<string> = [],
): { dimensionsMeta: Array<any>; type: Array<string> } => {
  if (!jaql || !dimensionItem || typeof dimensionItem.jaqlIndex === 'undefined') {
    return { dimensionsMeta, type };
  }
  const dimension = getJaqlItemByIndex(jaql, dimensionItem.jaqlIndex);
  if (dimension && dimension.jaql && dimensionItem.metadataType !== PanelType.MEASURES) {
    dimensionsMeta.unshift({
      title: dimension.jaql.title,
      name: dimension.jaql.dim,
      member: dimensionItem.value,
      index: dimensionItem.jaqlIndex,
    });
  }

  if (
    dimensionItem &&
    dimensionItem.userType &&
    (dimensionItem.userType === UserType.SUB_TOTAL ||
      dimensionItem.userType === UserType.GRAND_TOTAL)
  ) {
    const itemType: string = dimensionItem.userType.toLowerCase();
    type.push(itemType);
  }
  if (dimensionItem.parent && dimensionItem.parent.metadataType !== PanelType.MEASURES) {
    return getDimensionMetadata(dimensionItem.parent, jaql, dimensionsMeta, type);
  }
  return { dimensionsMeta, type };
};

/**
 * Copy and clean info about measure
 *
 * @param {JaqlPanel} measurePanel - current measure item
 * @returns {MeasureMetadata} measure metadata
 */
export const getMeasureMetadata = (measurePanel?: JaqlPanel) => {
  let measureMetadata: MeasureMetadata = {};
  if (measurePanel) {
    // eslint-disable-next-line no-unused-vars
    const { type, datatype, table, column, ...panelCopy } = measurePanel.jaql;
    measureMetadata = panelCopy;

    if (measurePanel.field) {
      measureMetadata.index = measurePanel.field.index;
    }
  }

  return measureMetadata;
};
