import { TFunction } from '@sisense/sdk-common/src/i18n/i18next';
import { PanelType, PivotTreeNode, UserType } from '@sisense/sdk-pivot-client';

import type { PivotTableDataOptions } from '@/chart-data-options/types';

export function createHeaderCellTotalsFormatter(
  dataOptions: PivotTableDataOptions,
  translate: TFunction,
) {
  return (cell: PivotTreeNode) => {
    if (cell.userType === UserType.SUB_TOTAL) {
      cell.content = translate('pivotTable.subTotal', { value: cell.content ?? '' });
    }

    if (cell.userType === UserType.GRAND_TOTAL) {
      if (cell.metadataType === PanelType.ROWS) {
        cell.content = translate('pivotTable.grandTotal');
        if (dataOptions.values?.length === 1 && !dataOptions.columns?.length) {
          const [value] = dataOptions.values;
          const column = 'column' in value ? value.column : value;
          cell.content = column.name ?? cell.content;
        }
      }
      if (cell.metadataType === PanelType.COLUMNS && cell.parent) {
        cell.content = translate('pivotTable.grandTotal');
      }
    }
  };
}
