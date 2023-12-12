import { colorWhite } from '../../chart-data-options/coloring/consts';

export type Marker = {
  enabled: boolean;
  size: 'small' | 'large';
  fill: 'full' | 'hollow';
};

export type MarkerSettings = {
  enabled: boolean;
  radius?: number;
  symbol?: string;
  fillColor?: string | null;
  lineColor?: string | null;
  lineWidth?: number;
  fillOpacity?: number;
  states?: {
    hover?: { fillColor: string; radius: number; lineWidth: number };
    select?: { fillOpacity: number; lineWidth: number };
  };
};

export const getMarkerSettings = (marker: Marker): MarkerSettings => {
  const smallRadius = 4;
  const largeRadius = 7;
  return {
    enabled: marker.enabled,
    radius: !marker.enabled || marker.size === 'small' ? smallRadius : largeRadius,
    fillColor: !marker.enabled || marker.fill === 'full' ? null : colorWhite,
    lineColor: null,
    lineWidth: 2,
    symbol: 'circle',
    fillOpacity: 0.3,
    ...(!marker.enabled && { symbol: 'circle' }),
    states: {
      hover: {
        fillColor: colorWhite,
        radius: marker.size === 'small' ? smallRadius + 2 : largeRadius + 2,
        lineWidth: 3,
      },
    },
  };
};
