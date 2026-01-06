import { type PivotTableDataOptionsInternal } from '@/chart-data-options/types';
import { createFormatter, getDataPointMetadata } from '@/chart-options-processor/data-points';
import { DataPointEntry, PivotTableDataPoint } from '@/types';

import { ColumnDataNode, PivotTableCellPayload, RowDataNode } from './types';
import { getTreeNodeByLevel, isGrandTotalTreeNode, isSubTotalTreeNode, safeModulo } from './utils';

export const getPivotTableDataPoint = (
  cellPayload: PivotTableCellPayload,
  dataOptions: PivotTableDataOptionsInternal,
): PivotTableDataPoint => {
  const isDataValueCell = cellPayload.isDataCell;
  const isDataRowCell =
    cellPayload.dataNode.metadataType === 'rows' &&
    cellPayload.dataNode.userType !== 'corner' &&
    cellPayload.dataNode.userType !== 'subTotal' &&
    cellPayload.dataNode.userType !== 'grandTotal';
  const isDataColumnCell =
    cellPayload.dataNode.metadataType === 'columns' &&
    cellPayload.dataNode.userType !== 'subTotal' &&
    cellPayload.dataNode.userType !== 'grandTotal';
  const isCaptionRowCell =
    cellPayload.dataNode.metadataType === 'rows' &&
    (cellPayload.dataNode.userType === 'corner' ||
      cellPayload.dataNode.userType === 'subTotal' ||
      cellPayload.dataNode.userType === 'grandTotal');
  const isCaptionColumnCell =
    cellPayload.dataNode.metadataType === 'columns' &&
    (cellPayload.dataNode.userType === 'subTotal' ||
      cellPayload.dataNode.userType === 'grandTotal');
  const isCaptionValueCell =
    cellPayload.dataNode.metadataType === 'measures' &&
    (cellPayload.dataNode.userType === 'measureBottom' ||
      cellPayload.dataNode.userType === 'measureTop');
  const isSubTotalRowCell =
    (cellPayload.rowTreeNode && isSubTotalTreeNode(cellPayload.rowTreeNode, 'rows')) ||
    isSubTotalTreeNode(cellPayload.dataNode, 'rows');
  const isGrandTotalRowCell =
    (!!cellPayload.rowTreeNode && isGrandTotalTreeNode(cellPayload.rowTreeNode, 'rows')) ||
    isGrandTotalTreeNode(cellPayload.dataNode, 'rows');
  const isSubTotalColumnCell =
    (!!cellPayload.columnTreeNode && isSubTotalTreeNode(cellPayload.columnTreeNode, 'columns')) ||
    isSubTotalTreeNode(cellPayload.dataNode, 'columns');
  const isGrandTotalColumnCell =
    (!!cellPayload.columnTreeNode && isGrandTotalTreeNode(cellPayload.columnTreeNode, 'columns')) ||
    isGrandTotalTreeNode(cellPayload.dataNode, 'columns');

  let rowsEntries: DataPointEntry[] | undefined;
  let columnsEntries: DataPointEntry[] | undefined;
  let valuesEntries: DataPointEntry[] | undefined;

  if (isDataValueCell) {
    let availableRowsDataOptions = dataOptions.rows;

    if (isSubTotalRowCell) {
      const { rowTreeNode } = cellPayload;

      if (!rowTreeNode) {
        throw new Error('Row tree node is required for subtotal row cell');
      }

      availableRowsDataOptions = dataOptions.rows?.filter(
        (_item, index) => index <= rowTreeNode.level,
      );
    }
    if (isGrandTotalRowCell) {
      availableRowsDataOptions = undefined;
    }

    rowsEntries = availableRowsDataOptions?.map((item, index) => {
      const { rowTreeNode } = cellPayload;

      if (!rowTreeNode) {
        throw new Error('rowTreeNode is unexpectedly undefined');
      }

      const rowNode = getTreeNodeByLevel(rowTreeNode, index);
      const value = rowNode.value;
      const displayValue = rowNode.content ?? createFormatter(item)(value);

      return {
        ...getDataPointMetadata(item, { dataOptionName: 'rows', dataOptionIndex: index }),
        value,
        displayValue,
      } as DataPointEntry;
    });

    let availableColumnDataOptions = dataOptions.columns;

    if (isSubTotalColumnCell) {
      availableColumnDataOptions = dataOptions.columns?.filter(
        (_item, index) => index <= cellPayload.columnTreeNode!.level,
      );
    }
    if (isGrandTotalColumnCell) {
      availableColumnDataOptions = undefined;
    }

    columnsEntries = availableColumnDataOptions?.map((item, index) => {
      const level = dataOptions.values?.length === 1 ? index + 1 : index;
      const columnNode = getTreeNodeByLevel(cellPayload.columnTreeNode!, level);
      const value = columnNode.value;
      const displayValue = columnNode.content;

      return {
        ...getDataPointMetadata(item, { dataOptionName: 'columns', dataOptionIndex: index }),
        value,
        displayValue,
      } as DataPointEntry;
    });

    const valueIndex = isGrandTotalColumnCell
      ? safeModulo(cellPayload.columnTreeNode?.index, dataOptions.values?.length)
      : safeModulo(cellPayload.measureTreeNode?.index, dataOptions.values?.length);
    const valueDataOption = dataOptions.values?.[valueIndex];

    if (valueDataOption) {
      valuesEntries = [
        {
          ...getDataPointMetadata(valueDataOption, {
            dataOptionName: 'values',
            dataOptionIndex: valueIndex,
          }),
          value: cellPayload.dataNode.value,
          displayValue: cellPayload.dataNode.content,
        } as DataPointEntry,
      ];
    }
  }

  if (isDataRowCell) {
    rowsEntries = dataOptions.rows
      ?.filter((_item, index) => index <= cellPayload.dataNode.level)
      .map((item, index) => {
        const rowNode = getTreeNodeByLevel(cellPayload.dataNode, index);
        const value = rowNode.value;
        const displayValue = rowNode.content;

        return {
          ...getDataPointMetadata(item, { dataOptionName: 'rows', dataOptionIndex: index }),
          value,
          displayValue,
        } as DataPointEntry;
      });
  }

  if (isDataColumnCell) {
    const baseLevel =
      dataOptions.values?.length === 1
        ? cellPayload.dataNode.level - 1
        : cellPayload.dataNode.level;
    columnsEntries = dataOptions.columns
      ?.filter((_item, index) => index <= baseLevel)
      .map((item, index) => {
        const level = dataOptions.values?.length === 1 ? index + 1 : index;
        const columnNode = getTreeNodeByLevel(cellPayload.dataNode, level);
        const value = columnNode.value;
        const displayValue = columnNode.content;

        return {
          ...getDataPointMetadata(item, { dataOptionName: 'columns', dataOptionIndex: index }),
          value,
          displayValue,
        } as DataPointEntry;
      });
  }

  if (isCaptionRowCell && !isGrandTotalRowCell) {
    const rowDataNode = cellPayload.dataNode as RowDataNode;
    const dataOptionIndex = isSubTotalRowCell ? rowDataNode.level : rowDataNode.index;
    const rowDataOption = dataOptions.rows?.[dataOptionIndex];
    rowsEntries = [
      {
        ...getDataPointMetadata(rowDataOption!, {
          dataOptionName: 'rows',
          dataOptionIndex: dataOptionIndex,
        }),
        value: rowDataNode.value,
        displayValue: rowDataNode.content,
      } as DataPointEntry,
    ];
  }

  if (isCaptionColumnCell && !isGrandTotalColumnCell) {
    const columnDataNode = cellPayload.dataNode as ColumnDataNode;
    const dataOptionIndex = columnDataNode.level;
    const columnDataOption = dataOptions.columns?.[dataOptionIndex];
    columnsEntries = [
      {
        ...getDataPointMetadata(columnDataOption!, {
          dataOptionName: 'columns',
          dataOptionIndex: dataOptionIndex,
        }),
        value: columnDataNode.value,
        displayValue: columnDataNode.content,
      } as DataPointEntry,
    ];
  }

  if (isCaptionValueCell) {
    const columnDataNode = cellPayload.dataNode as ColumnDataNode;
    const index = safeModulo(columnDataNode.index, dataOptions.values?.length);
    const valueDataOption = dataOptions.values?.[index];
    valuesEntries = [
      {
        ...getDataPointMetadata(valueDataOption!, {
          dataOptionName: 'values',
          dataOptionIndex: index,
        }),
        value: columnDataNode.value,
        displayValue: columnDataNode.content,
      } as DataPointEntry,
    ];

    if (columnDataNode.parent) {
      columnsEntries = dataOptions.columns?.map((item, index) => {
        const columnNode = getTreeNodeByLevel(columnDataNode.parent!, index);
        const value = columnNode.value;
        const displayValue = columnNode.content;

        return {
          ...getDataPointMetadata(item, { dataOptionName: 'columns', dataOptionIndex: index }),
          value,
          displayValue,
        } as DataPointEntry;
      });
    }
  }

  return {
    isDataCell: isDataValueCell || isDataRowCell || isDataColumnCell,
    isCaptionCell: isCaptionRowCell || isCaptionColumnCell || isCaptionValueCell,
    isTotalCell:
      isSubTotalRowCell || isSubTotalColumnCell || isGrandTotalRowCell || isGrandTotalColumnCell,
    entries: {
      rows: rowsEntries ?? [],
      columns: columnsEntries ?? [],
      values: valuesEntries ?? [],
    },
  };
};
