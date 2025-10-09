import type {
  Feature as GeoJsonFeature,
  FeatureCollection as GeoJsonFeatureCollection,
} from 'geojson';
import { useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { scaleBrightness } from '@/utils/color/index.js';
import { AreamapType } from '@/types.js';
import { createFeatureStylesDictionary, FeaturesDictionary } from './feature-styles-dictionary.js';
import { useThemeContext } from '@/theme-provider';
import { GeoDataElement } from '../types.js';
// update this imports after moving both map charts (scattermap and areamap) to restructured charts
import '@/charts/map-charts/map-charts.scss';
import { prepareFitBoundsAnimationOptions } from '@/charts/map-charts/scattermap/utils/map.js';

// Import proj4leaflet for CRS
import * as proj4 from 'proj4leaflet';
const Proj4CRS = (proj4 as unknown as { CRS: typeof L.Proj.CRS }).CRS;

export type AreamapProps = {
  geoJson: GeoJsonFeatureCollection;
  geoData: GeoDataElement[];
  dataOptions: {
    originalValueTitle: string;
    onAreaClick?: (geoDataElement: GeoDataElement, clickEvent: MouseEvent) => void;
  };
  mapType: AreamapType;
};

/**
 * Component that renders a map with areas (countries or states) for using in Areamap chart
 */
export const AreamapMap: React.FC<AreamapProps> = ({ geoJson, geoData, dataOptions, mapType }) => {
  const { themeSettings } = useThemeContext();
  const featureStylesDictionary = useMemo(
    () => createFeatureStylesDictionary(geoJson.features, geoData, mapType),
    [geoJson, geoData, mapType],
  );

  const filteredGeoJson = useMemo(
    () => excludeUselessAntarcticaFromGeoJson(geoJson, featureStylesDictionary),
    [geoJson, featureStylesDictionary],
  );

  const mapProps = useMemo(() => {
    if (mapType === 'world') {
      return {
        center: [0, 0] as [number, number],
        zoom: 1,
        maxZoom: 5,
        minZoom: 1,
      };
    } else {
      return {
        crs: new Proj4CRS(
          'EPSG:5070',
          '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 ' +
            '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
          {
            resolutions: [16384, 10240, 8192, 4096],
          },
        ),
        center: [35.96852047262865, -96.96520768859223] as [number, number],
        zoom: 0.4,
        maxZoom: 3,
      };
    }
  }, [mapType]);

  const FitBoundsComponent = () => {
    const map = useMap();

    useEffect(() => {
      const bounds = L.geoJSON(filteredGeoJson).getBounds();
      map.fitBounds(bounds, prepareFitBoundsAnimationOptions(themeSettings));
    }, [map, filteredGeoJson, themeSettings]);

    return null;
  };

  return (
    <MapContainer
      className="csdk-map-container"
      style={{
        width: '100%',
        height: '100%',
        minWidth: '300px',
        minHeight: '400px',
        backgroundColor: '#c2dbe9',
      }}
      scrollWheelZoom={true}
      attributionControl={false}
      {...mapProps}
    >
      <GeoJSON
        data={filteredGeoJson}
        style={(feature) =>
          feature ? featureStylesDictionary[feature.id as string]?.style || {} : {}
        }
        onEachFeature={(feature, layer) => {
          layer.bindTooltip(
            getTooltipContent(feature, featureStylesDictionary, dataOptions.originalValueTitle),
            { sticky: true },
          );
          layer.on({
            mouseover: (e) => {
              const layerPath = e.target;
              highlightArea(layerPath, feature.id as string, featureStylesDictionary);
            },
            mouseout: (e) => {
              const layerPath = e.target;
              revertAreaHighlighting(layerPath, feature.id as string, featureStylesDictionary);
            },
            click: (e) => {
              const geoDataElement = featureStylesDictionary[feature.id as string]?.geoDataElement;
              if (geoDataElement && dataOptions.onAreaClick) {
                dataOptions.onAreaClick(geoDataElement, e.originalEvent);
              }
            },
          });
        }}
      />
      <FitBoundsComponent />
    </MapContainer>
  );
};

function highlightArea(
  areaPath: L.Path,
  featureId: string | number,
  featureStylesDictionary: FeaturesDictionary,
) {
  const hasColorInfo = featureStylesDictionary[featureId];
  if (hasColorInfo) {
    const basicFillColor = featureStylesDictionary[featureId].style.fillColor;
    if (basicFillColor) {
      areaPath.setStyle({
        weight: 2,
        color: scaleBrightness(basicFillColor, -0.2),
        fillColor: scaleBrightness(basicFillColor, 0.05),
        dashArray: '',
        fillOpacity: 1,
        opacity: 1,
      });
      areaPath.bringToFront();
    }
  }
}

function revertAreaHighlighting(
  areaPath: L.Path,
  featureId: string | number,
  featureStylesDictionary: FeaturesDictionary,
) {
  areaPath.setStyle(featureStylesDictionary[featureId].style);
}

function getTooltipContent(
  feature: GeoJsonFeature,
  featureStylesDictionary: FeaturesDictionary,
  originalValueTitle: string,
): string {
  const featureInfo = featureStylesDictionary[feature.id as string];
  const { formattedOriginalValue } = featureInfo.geoDataElement || {};
  return `
  <div>
    <span>${featureInfo.displayName}<span>
    ${
      featureInfo.geoDataElement && formattedOriginalValue !== undefined
        ? `<br/>${originalValueTitle}: <span>${formattedOriginalValue}<span>`
        : ''
    }
  </div>`;
}

/**
 * Remove Antarctica from world map if there is no data for it
 */
function excludeUselessAntarcticaFromGeoJson(
  geoJson: GeoJsonFeatureCollection,
  featureStylesDictionary: FeaturesDictionary,
): GeoJsonFeatureCollection {
  if (featureStylesDictionary.ATA && featureStylesDictionary.ATA.geoDataElement) {
    return geoJson;
  } else {
    const features = geoJson.features.filter((feature) => feature.id !== 'ATA');
    return {
      ...geoJson,
      features,
    };
  }
}
