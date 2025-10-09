import type { FeatureCollection as GeoJsonFeatureCollection } from 'geojson';

import { AreamapType } from '@/types.js';

import { GeoDataElement } from '../types.js';

export type AreamapProps = {
  geoJson: GeoJsonFeatureCollection;
  geoData: GeoDataElement[];
  dataOptions: {
    originalValueTitle: string;
    onAreaClick?: (geoDataElement: GeoDataElement, clickEvent: MouseEvent) => void;
  };
  mapType: AreamapType;
};

// eslint-disable-next-line no-unused-vars
export const AreamapMap: React.FC<AreamapProps> = ({ geoJson, geoData, dataOptions, mapType }) => {
  return <></>;
};
