import { TableStyleOptions } from '@/types';
import { TableDesignOptions } from '@/chart-options-processor/translations/design-options';

export const translateTableStyleOptionsToDesignOptions = (
  styleOptions: TableStyleOptions,
): TableDesignOptions => {
  return {
    paddingVertical: styleOptions.paddingVertical,
    paddingHorizontal: styleOptions.paddingHorizontal,
    header: styleOptions.header,
    rows: styleOptions.rows,
    columns: styleOptions.columns,
  };
};
