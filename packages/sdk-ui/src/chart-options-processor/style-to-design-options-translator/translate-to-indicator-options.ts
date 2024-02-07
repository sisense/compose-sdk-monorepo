import { IndicatorStyleOptions } from '../../types';
import { BaseDesignOptions } from '../translations/base-design-options';
import {
  IndicatorChartDesignOptions,
  GaugeSpecificDesignOptions,
  NumericSpecificDesignOptions,
} from '../translations/design-options';

export function getIndicatorChartDesignOptions(
  styleOptions: IndicatorStyleOptions,
): IndicatorChartDesignOptions {
  let indicatorSpecificMixin: GaugeSpecificDesignOptions | NumericSpecificDesignOptions;
  switch (styleOptions.subtype) {
    case 'indicator/numeric':
      indicatorSpecificMixin = {
        indicatorType: 'numeric',
        numericSubtype: styleOptions.numericSubtype,
        ...(styleOptions.numericSubtype === 'numericSimple' ? { skin: styleOptions.skin } : null),
      } as NumericSpecificDesignOptions<typeof styleOptions.numericSubtype>;
      break;
    case 'indicator/gauge':
      indicatorSpecificMixin = {
        indicatorType: 'gauge',
        skin: styleOptions.skin,
        ...(styleOptions.tickerBarHeight
          ? { tickerBarHeight: styleOptions.tickerBarHeight }
          : null),
      } as GaugeSpecificDesignOptions;
      break;
  }

  return {
    ...(BaseDesignOptions as IndicatorChartDesignOptions),
    ...indicatorSpecificMixin,
    indicatorComponents:
      styleOptions.indicatorComponents ||
      (BaseDesignOptions as IndicatorChartDesignOptions).indicatorComponents,
    forceTickerView: Boolean(styleOptions.forceTickerView),
  };
}
