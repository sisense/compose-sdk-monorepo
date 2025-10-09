import { ScattermapMarkers } from '@/types';

type MarkerStyle = {
  color: string;
  size: number;
  fill: Required<ScattermapMarkers>['fill'];
  blur?: boolean;
};

export type MarkerConfig = {
  coordinates: {
    lat: number;
    lng: number;
  };
  style: MarkerStyle;
};
