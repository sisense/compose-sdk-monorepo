import leaflet, { type FitBoundsOptions } from 'leaflet';

import { CompleteThemeSettings } from '@/index';

const DEFAULT_ANIMATION_DURATION = 250;

type FitBoundsAnimationOptions = Pick<FitBoundsOptions, 'animate' | 'duration'>;

export function prepareFitBoundsAnimationOptions(
  themeSettings: CompleteThemeSettings,
): FitBoundsAnimationOptions {
  const duration =
    themeSettings.chart.animation.init.duration === 'auto'
      ? DEFAULT_ANIMATION_DURATION
      : themeSettings.chart.animation.init.duration;

  return {
    animate: duration !== 0,
    duration: duration / 1000,
  };
}

export function fitMapToBounds(
  map: leaflet.Map,
  markers: leaflet.CircleMarker[],
  options: FitBoundsOptions = {},
) {
  if (!markers.length) return;

  map.fitBounds(
    markers.map((marker) => [marker.getLatLng().lat, marker.getLatLng().lng]),
    {
      maxZoom: 4,
      ...options,
    },
  );
}
