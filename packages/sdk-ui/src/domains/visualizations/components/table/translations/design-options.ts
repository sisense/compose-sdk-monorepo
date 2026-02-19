import { TableDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { TableStyleOptions } from '@/types';

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
