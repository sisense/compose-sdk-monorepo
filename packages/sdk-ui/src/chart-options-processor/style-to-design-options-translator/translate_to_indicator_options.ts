import { IndicatorStyleOptions } from '../../types';
import { BaseDesignOptions } from '../translations/base_design_options';
import {
  IndicatorChartDesignOptions,
  GaugeSpecificDesignOptions,
  NumericSpecificDesignOptions,
} from '../translations/design_options';

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
      } as GaugeSpecificDesignOptions;
      break;
  }

  return {
    ...(BaseDesignOptions as IndicatorChartDesignOptions),
    ...indicatorSpecificMixin,
    indicatorComponents:
      styleOptions.indicatorComponents ||
      (BaseDesignOptions as IndicatorChartDesignOptions).indicatorComponents,
  };
}
