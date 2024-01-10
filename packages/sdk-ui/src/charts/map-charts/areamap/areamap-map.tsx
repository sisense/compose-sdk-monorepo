/* eslint-disable max-lines */
import 'leaflet/dist/leaflet.css';
import { Feature as GeoJsonFeature, FeatureCollection as GeoJsonFeatureCollection } from 'geojson';
import Leaflet from 'leaflet';
import 'proj4leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GeoDataElement } from '../../../chart-data/types.js';
import { scaleBrightness } from '../../../utils/color/index.js';
import { AreamapType } from '../../../types.js';
import { createFeatureStylesDictionary, FeaturesDictionary } from './feature-styles-dictionary.js';
import '../map-charts.scss';

export type AreamapProps = {
  geoJson: GeoJsonFeatureCollection;
  geoData: GeoDataElement[];
  dataOptions: {
    originalValueTitle: string;
  };
  mapType: AreamapType;
};

/**
 * Component that renders a map with areas (countries or states) for using in Areamap chart
 */
export const AreamapMap: React.FC<AreamapProps> = ({ geoJson, geoData, dataOptions, mapType }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Leaflet.Map | null>(null);
  const [mapLayerGroup] = useState<Leaflet.LayerGroup>(Leaflet.layerGroup());
  const featureStylesDictionary = useMemo(
    () => createFeatureStylesDictionary(geoJson.features, geoData, mapType),
    [geoJson, geoData, mapType],
  );

  // create world
  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = createMap(mapContainer.current, mapType);
      mapLayerGroup.addTo(mapInstance.current);
    }
  }, [mapLayerGroup, mapType]);

  // add country shapes and highlighting of country shapes on hover
  useEffect(() => {
    const geoJsonLayer = Leaflet.geoJSON(
      excludeUselessAntarcticaFromGeoJson(geoJson, featureStylesDictionary),
      {
        style: (geoJsonFeature) => featureStylesDictionary[geoJsonFeature!.id!].style,
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            getTooltipContent(feature, featureStylesDictionary, dataOptions.originalValueTitle),
            { sticky: true },
          );
          layer.on({
            mouseover: (e) => {
              const layerPath: Leaflet.Path = e.target;
              highlightArea(layerPath, feature.id!, featureStylesDictionary);
            },
            mouseout: (e) => {
              const layerPath: Leaflet.Path = e.target;
              revertAreaHighlighting(layerPath, feature.id!, featureStylesDictionary);
            },
          });
        },
      },
    );
    if (mapInstance.current) {
      mapLayerGroup.clearLayers();
      geoJsonLayer.addTo(mapLayerGroup);
      mapInstance.current.fitBounds(geoJsonLayer.getBounds());
    }
  }, [dataOptions.originalValueTitle, featureStylesDictionary, geoJson, mapLayerGroup]);

  return (
    <div
      ref={mapContainer}
      className="csdk-map-container"
      style={{
        width: '100%',
        height: '100%',
        minWidth: '300px',
        minHeight: '400px',
        backgroundColor: '#c2dbe9',
      }}
    />
  );
};

function highlightArea(
  areaPath: Leaflet.Path,
  featureId: string | number,
  featureStylesDictionary: FeaturesDictionary,
) {
  const hasColorInfo = featureStylesDictionary[featureId];
  if (hasColorInfo) {
    const basicFillColor = featureStylesDictionary[featureId].style.fillColor!;
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

function revertAreaHighlighting(
  areaPath: Leaflet.Path,
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
  const featureInfo = featureStylesDictionary[feature.id!];
  return `
  <div>
    <span>${featureInfo.displayName}<span>
    ${
      featureInfo.geoDataElement
        ? `<br/>${originalValueTitle}: <span>${featureInfo.geoDataElement.formattedOriginalValue}<span>`
        : ''
    }
  </div>`;
}

function createMap(element: HTMLElement, mapType: AreamapType): Leaflet.Map {
  if (mapType === 'world') {
    return Leaflet.map(element, {
      attributionControl: false,
      scrollWheelZoom: true,
      minZoom: 1,
      zoom: 1,
      center: [0, 0],
    });
  } else {
    // case usa map -> configuring Albers Projection, ref: http://epsg.io/5070
    return Leaflet.map(element, {
      crs: new Leaflet.Proj.CRS(
        'EPSG:5070',
        '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 ' +
          '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        {
          resolutions: [16384, 10240, 8192, 4096],
        },
      ),
      center: [35.96852047262865, -96.96520768859223],
      zoom: 0.4,
      attributionControl: false,
    });
  }
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
