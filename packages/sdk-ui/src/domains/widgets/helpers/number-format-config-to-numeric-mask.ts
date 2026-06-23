import { getCompleteNumberFormatConfig } from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import type { NumberFormatConfig } from '@/types';

const CURRENCY_POSITION_PRE = 'pre' as const;
const CURRENCY_POSITION_POST = 'post' as const;

/**
 * Converts Compose {@link NumberFormatConfig} to a Fusion numeric mask for XLSX export metadata.
 */
export function numberFormatConfigToNumericMask(
  config: NumberFormatConfig,
): Record<string, unknown> {
  const complete = getCompleteNumberFormatConfig(config);
  const isPercent = complete.name === 'Percent';

  return {
    type: isPercent ? 'percent' : 'number',
    abbreviations: {
      k: complete.kilo ?? false,
      m: complete.million ?? false,
      b: complete.billion ?? false,
      t: complete.trillion ?? false,
    },
    abbreviateAll: false,
    decimals: complete.decimalScale ?? 'auto',
    isdefault: true,
    ...(complete.thousandSeparator !== undefined && {
      number: { separated: complete.thousandSeparator },
      separated: complete.thousandSeparator,
    }),
    ...(complete.name === 'Currency' && {
      currency: {
        symbol: complete.symbol ?? '',
        position: complete.prefix ? CURRENCY_POSITION_PRE : CURRENCY_POSITION_POST,
      },
    }),
    ...(isPercent && { percent: true }),
  };
}
