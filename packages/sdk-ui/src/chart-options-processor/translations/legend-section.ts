import { Style } from '../chart-options-service';

export type LegendPosition = 'top' | 'left' | 'right' | 'bottom' | null;

export type LegendSettings = {
  enabled: boolean;
  align?: 'center' | 'left' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  layout?: 'horizontal' | 'vertical';
  itemStyle?: Style & { cursor?: string };
  symbolRadius?: number;
  symbolHeight?: number;
  symbolWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  title?: {
    style?: {
      [key: string]: string | number;
    };
  };
  maxHeight?: number;
};

export const legendItemStyleDefault: LegendSettings['itemStyle'] = {
  cursor: 'default',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 'normal',
  color: '#5b6372',
  textOutline: 'none',
  pointerEvents: 'auto',
};

export const getLegendSettings = (position: LegendPosition): LegendSettings => {
  const additionalSettings = {
    symbolRadius: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    itemStyle: legendItemStyleDefault,
  };

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
    default:
      return {
        enabled: false,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      };
  }
};
