import { Feature as GeoJsonFeature } from 'geojson';
import { PathOptions } from 'leaflet';
import { AreamapType } from '@/types.js';
import { GeoDataElement } from '../types.js';
import { ALTERNATIVE_COUNTRY_NAMES_DICTIONARY } from './alternative-country-names-dictionary.js';

export type FeatureId = GeoJsonFeature['id'] & string; // all feature ids in geoJson must be strings
export type FeatureInfo = {
  /** Corresponding GeoDataElement from GeoData */
  geoDataElement?: GeoDataElement;
  style: PathOptions;
  displayName: string;
};
export type FeaturesDictionary = Record<FeatureId, FeatureInfo>;

const STROKE_COLOR = '#d6d9dc';
const NO_FILL_COLOR = '#FBFAFA';

/**
 * Creates a dictionary of feature styles for each feature in geoJson
 */
export function createFeatureStylesDictionary(
  geoFeatures: GeoJsonFeature[],
  geoData: GeoDataElement[],
  mapType: AreamapType,
): FeaturesDictionary {
  const featuresDictionary: FeaturesDictionary = geoFeatures.reduce((acc, feature) => {
    const featureId = feature.id! as FeatureId;
    // GeoDataElement from data which corresponds to this JsonFeature
    let featureGeoDataElement: GeoDataElement | undefined;
    if (mapType === 'world') {
      const alternativeCountryNamesInfo = ALTERNATIVE_COUNTRY_NAMES_DICTIONARY.find(
        (countryInfo) => countryInfo.id === featureId,
      );

      if (alternativeCountryNamesInfo) {
        featureGeoDataElement = geoData.find((geoDataElement) =>
          alternativeCountryNamesInfo.allNames.includes(
            geoDataElement.geoName.trim().toLowerCase(),
          ),
        );
      } else {
        featureGeoDataElement = geoData.find(
          (geoDataElement) =>
            geoDataElement.geoName.trim().toLowerCase() ===
            feature.properties!.name.trim().toLowerCase(),
        );
      }
    } else {
      featureGeoDataElement = geoData.find(
        (geoDataElement) =>
          geoDataElement.geoName.trim().toLowerCase() ===
          feature.properties!.name.trim().toLowerCase(),
      );
    }

    acc[featureId] = {
      geoDataElement: featureGeoDataElement,
      style: {
        color: STROKE_COLOR,
        weight: 1,
        opacity: 1,
        fillColor: (featureGeoDataElement && featureGeoDataElement.color) || NO_FILL_COLOR,
        fillOpacity: 1,
      },
      displayName: featureGeoDataElement?.geoName || (feature.properties!.name as string),
    };
    return acc;
  }, {} as FeaturesDictionary);

  return featuresDictionary;
}
