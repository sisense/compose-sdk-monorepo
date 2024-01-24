import leaflet from 'leaflet';
import { ScattermapMarkers } from '@/types';

type PrepareMarkerOptionsProps = {
  color: string;
  size: number;
  fill: Required<ScattermapMarkers>['fill'];
  blur: boolean;
};

type CreateMarkerProps = {
  coordinates: {
    lat: number;
    lng: number;
  };
  style: PrepareMarkerOptionsProps;
};

function getFillStats(fill: PrepareMarkerOptionsProps['fill']) {
  return {
    isLight: ['hollow', 'filled-light'].includes(fill),
    isFilled: ['filled', 'filled-light'].includes(fill),
  };
}

export function prepareMarkerOptions(style: PrepareMarkerOptionsProps) {
  const { color, size, fill, blur } = style;
  const { isFilled } = getFillStats(fill);

  const markerOpacityMap = {
    filled: 0.5,
    'filled-light': 0.2,
    hollow: 0.35,
    'hollow-bold': 0.9,
  };
  const markerBlurOpacityMap = {
    filled: 0.1,
    'filled-light': 0.1,
    hollow: 0.2,
    'hollow-bold': 0.25,
  };

  const markerOpacity = blur ? markerBlurOpacityMap[fill] : markerOpacityMap[fill];

  return {
    radius: size,
    fillOpacity: markerOpacity,
    opacity: markerOpacity,
    fillColor: isFilled ? color : 'transparent',
    color: isFilled ? 'transparent' : color,
    stroke: !isFilled,
    weight: isFilled ? 0 : 2,
    customStyle: style,
  };
}

export function createMarker({ coordinates, style }: CreateMarkerProps) {
  const marker = new leaflet.CircleMarker(
    {
      lat: coordinates.lat,
      lng: coordinates.lng,
    },
    prepareMarkerOptions(style),
  );

  marker.on('mouseover', onMouseOver);
  marker.on('mouseout', onMouseOut);

  return marker;
}

function onMouseOver(event: leaflet.LeafletMouseEvent) {
  const marker = event.target as leaflet.CircleMarker & {
    options: { customStyle: PrepareMarkerOptionsProps };
  };
  const style = marker.options.customStyle;
  const { isFilled, isLight } = getFillStats(style.fill);

  marker.setStyle(
    isFilled
      ? {
          stroke: true,
          weight: 2,
          opacity: isLight ? 0.5 : 0.7,
          fillOpacity: isLight ? 0.5 : 0.7,
        }
      : {
          weight: 3,
          opacity: isLight ? 0.6 : 1,
        },
  );

  return marker;
}

function onMouseOut(event: leaflet.LeafletMouseEvent) {
  const marker = event.target as leaflet.CircleMarker & {
    options: { customStyle: PrepareMarkerOptionsProps };
  };
  const style = marker.options.customStyle;
  marker.setStyle(prepareMarkerOptions(style));
}

export function removeMarkers(markers: leaflet.CircleMarker[]) {
  markers.forEach((marker) => marker.remove());
}
