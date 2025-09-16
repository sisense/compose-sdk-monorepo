import {
  LegendPosition,
  LegendSettings,
} from '@/chart-options-processor/translations/legend-section';

const legendItemStyleDefault: LegendSettings['itemStyle'] = {
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 'normal',
  color: '#5b6372',
  textOutline: 'none',
  pointerEvents: 'auto',
};

export const getBasicCategoricalLegend = (position: LegendPosition): LegendSettings => {
  const additionalSettings = {
    symbolRadius: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    itemStyle: legendItemStyleDefault,
  };

  if (!position) {
    return {
      enabled: false,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
    };
  }
  switch (position) {
    case 'bottom':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        ...additionalSettings,
      };
    case 'left':
      return {
        enabled: true,
        align: 'left',
        verticalAlign: 'middle',
        layout: 'vertical',
        ...additionalSettings,
      };
    case 'right':
      return {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        ...additionalSettings,
      };
    case 'top':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        ...additionalSettings,
      };
    // edge case when position is something like bottomright or not selected in fusion.
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    default:
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        ...additionalSettings,
      };
  }
};
