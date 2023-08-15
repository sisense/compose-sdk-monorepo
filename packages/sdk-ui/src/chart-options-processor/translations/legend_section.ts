import { Style } from '../chart_options_service';

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
};

export const getLegendSettings = (position: LegendPosition): LegendSettings => {
  switch (position) {
    case 'bottom':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        symbolRadius: 0,
      };
    case 'left':
      return {
        enabled: true,
        align: 'left',
        verticalAlign: 'middle',
        layout: 'vertical',
        symbolRadius: 0,
      };
    case 'right':
      return {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        symbolRadius: 0,
      };
    case 'top':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        symbolRadius: 0,
      };
    default:
      return {
        enabled: false,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        symbolRadius: 0,
      };
  }
};
