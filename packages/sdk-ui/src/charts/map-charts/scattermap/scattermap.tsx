/* eslint-disable max-lines-per-function */
import 'leaflet/dist/leaflet.css';
import leaflet from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useLocations } from './hooks/use-locations.js';
import { ScattermapChartData } from '../../../chart-data/types.js';
import { getLocationsMarkerSizes } from './utils/size.js';
import { useGeoSettings } from './hooks/use-settings.js';
import { getLocationsMarkerColors } from './utils/color.js';
import { createMarker, removeMarkers } from './utils/markers.js';
import { addCopyright } from './utils/copyright.js';
import { fitMapToBounds } from './utils/map.js';
import { ScattermapChartDataOptionsInternal } from '../../../chart-data-options/types.js';
import { ScattermapChartDesignOptions } from '../../../chart-options-processor/translations/design-options.js';
import { useTooltipHandler } from './hooks/use-tooltip-handler.js';
import { DataSource, Filter, FilterRelation, getFilterListAndRelations } from '@sisense/sdk-data';

import '../map-charts.scss';
import './scattermap.scss';

export type ScattermapProps = {
  chartData: ScattermapChartData;
  dataOptions: ScattermapChartDataOptionsInternal;
  designOptions: ScattermapChartDesignOptions;
  dataSource: DataSource | null;
  filters?: Filter[] | FilterRelation;
};

export const Scattermap = ({
  chartData,
  dataOptions,
  dataSource,
  filters = [],
  designOptions,
}: ScattermapProps) => {
  const { locations } = chartData;
  const geoSettings = useGeoSettings();

  const locationsWithCoordinates = useLocations(locations, dataOptions.locationLevel);

  const { filters: filterList } = getFilterListAndRelations(filters);
  const tooltipHandler = useTooltipHandler({
    dataOptions,
    dataSource,
    filters: filterList,
  });

  const mapContainer = useRef(null);
  const mapInstance = useRef<leaflet.Map | null>(null);

  const markerSizes = useMemo(
    () =>
      getLocationsMarkerSizes(
        locationsWithCoordinates,
        dataOptions.size
          ? designOptions.markers.size.minSize
          : designOptions.markers.size.defaultSize,
        dataOptions.size
          ? designOptions.markers.size.maxSize
          : designOptions.markers.size.defaultSize,
      ),
    [locationsWithCoordinates, dataOptions, designOptions],
  );
  const markerColors = useMemo(
    () => getLocationsMarkerColors(locationsWithCoordinates, dataOptions.colorBy?.color),
    [locationsWithCoordinates, dataOptions],
  );

  const markersRef = useRef<leaflet.CircleMarker[]>([]);
  const markersLayerRef = useRef(leaflet.layerGroup([]));

  const tileLayer = useRef<leaflet.TileLayer | null>(null);
  const copyrightRef = useRef<leaflet.Control.Attribution | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = leaflet.map(mapContainer.current, {
        attributionControl: false,
        scrollWheelZoom: true,
        minZoom: 1,
        worldCopyJump: true,
      });

      markersLayerRef.current.addTo(mapInstance.current);
      mapInstance.current.fitWorld();
    }
  }, []);

  useEffect(() => {
    if (markersRef.current) {
      removeMarkers(markersRef.current);
      markersRef.current = [];
    }

    if (locationsWithCoordinates) {
      locationsWithCoordinates.forEach((locationWithCoordinates, index) => {
        if (!locationWithCoordinates.coordinates) return;

        const marker = createMarker({
          coordinates: locationWithCoordinates.coordinates,
          style: {
            color: markerColors[index],
            size: markerSizes[index],
            fill: designOptions.markers.fill,
            blur: locationWithCoordinates.blur,
          },
        });

        markersRef.current.push(marker);
        marker.addTo(markersLayerRef.current);

        marker.bindTooltip(() => {
          const { content, postponedContent } = tooltipHandler(locationWithCoordinates);

          postponedContent?.then((updatedContent) => marker.setTooltipContent(updatedContent));

          return content;
        });
      });

      fitMapToBounds(mapInstance.current!, markersRef.current);
    }
  }, [locationsWithCoordinates, markerColors, markerSizes, designOptions, tooltipHandler]);

  useEffect(() => {
    if (!geoSettings) {
      return;
    }
    if (tileLayer.current) {
      tileLayer.current.remove();
    }

    tileLayer.current = leaflet.tileLayer(geoSettings.maps_api_provider, {
      zoomOffset: -1,
      tileSize: 512,
    });

    if (mapInstance.current) {
      tileLayer.current.addTo(mapInstance.current);

      copyrightRef.current?.remove();
      copyrightRef.current = addCopyright(mapInstance.current, geoSettings.maps_api_provider);
    }
  }, [geoSettings]);

  return (
    <div
      className="csdk-map-container"
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};
