import { Style } from '../chart-options-service';

export type LegendPosition = 'top' | 'left' | 'right' | 'bottom' | null;

export type LegendSettings = {
  enabled: boolean;
  align: 'center' | 'left' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  layout: 'horizontal' | 'vertical';
  itemStyle?: Style & { cursor?: string };
  symbolRadius?: number;
  symbolHeight?: number;
  symbolWidth?: number;
  borderWidth?: string;
  borderColor?: string;
  backgroundColor?: string;
  title?: {
    style?: {
      [key: string]: string | number;
    };
  };
};

export const getLegendSettings = (position: LegendPosition): LegendSettings => {
  const additionalSettings = {
    symbolRadius: 0,
    itemStyle: {
      fontWeight: 'normal',
    },
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
