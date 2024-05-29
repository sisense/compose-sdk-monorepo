import { TableStyleOptions } from '@/types';
import { TableDesignOptions } from '@/chart-options-processor/translations/design-options';
import { checkAndNotifyAboutDeprecatedProp } from '@/utils/check-and-notify-about-deprecated-prop';

export const translateTableStyleOptionsToDesignOptions = (
  styleOptions: TableStyleOptions,
): TableDesignOptions => {
  checkAndNotifyAboutDeprecatedProp(styleOptions, [
    'headersColor',
    'alternatingRowsColor',
    'alternatingColumnsColor',
  ]);

  return {
    paddingVertical: styleOptions.paddingVertical,
    paddingHorizontal: styleOptions.paddingHorizontal,
    header: {
      ...(styleOptions.headersColor ? { color: { enabled: styleOptions.headersColor } } : null),
      ...styleOptions.header,
    },
    rows: {
      ...(styleOptions.alternatingRowsColor
        ? { alternatingColor: { enabled: styleOptions.alternatingRowsColor } }
        : null),
      ...styleOptions.rows,
    },
    columns: {
      ...(styleOptions.alternatingColumnsColor
        ? { alternatingColor: { enabled: styleOptions.alternatingColumnsColor } }
        : null),
      ...styleOptions.columns,
    },
  };
};
