/* eslint-disable max-lines-per-function */
import 'leaflet/dist/leaflet.css';
import leaflet from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useLocations } from './hooks/use-locations.js';
import { ScattermapChartData } from '../../chart-data/types.js';
import { getLocationsMarkerSizes } from './utils/size.js';
import { useGeoSettings } from './hooks/use-settings.js';
import { getLocationsMarkerColors } from './utils/color.js';
import { createMarker, removeMarkers } from './utils/markers.js';
import { addCopyright } from './utils/copyright.js';
import { fitMapToBounds } from './utils/map.js';
import { ScattermapChartDataOptionsInternal } from '../../chart-data-options/types.js';
import { ScattermapChartDesignOptions } from '../../chart-options-processor/translations/design-options.js';
import { useTooltipHandler } from './hooks/use-tooltip-handler.js';
import { DataSource, Filter, FilterRelation, getFilterListAndRelations } from '@sisense/sdk-data';

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

  const locationsProps = useMemo(() => locations.map((l) => l.name), [locations]);
  const locationsWithCoordinates = useLocations(locationsProps, dataOptions.locationLevel);

  const { filters: filterList } = getFilterListAndRelations(filters);

  const tooltipHandler = useTooltipHandler({
    dataOptions,
    dataSource,
    filters: filterList,
  });

  const mapElement = useRef(null);
  const mapInstance = useRef<leaflet.Map | null>(null);

  const markerSizes = useMemo(
    () =>
      getLocationsMarkerSizes(
        locations,
        dataOptions.size
          ? designOptions.markers.size.minSize
          : designOptions.markers.size.defaultSize,
        dataOptions.size
          ? designOptions.markers.size.maxSize
          : designOptions.markers.size.defaultSize,
      ),
    [locations, dataOptions, designOptions],
  );
  const markerColors = useMemo(
    () => getLocationsMarkerColors(locations, dataOptions.colorBy?.color),
    [locations, dataOptions],
  );

  const markersRef = useRef<leaflet.CircleMarker[]>([]);
  const markersLayerRef = useRef(leaflet.layerGroup([]));

  const tileLayer = useRef<leaflet.TileLayer | null>(null);
  const copyrightRef = useRef<leaflet.Control.Attribution | null>(null);

  useEffect(() => {
    if (mapElement.current && !mapInstance.current) {
      mapInstance.current = leaflet.map(mapElement.current, {
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
        if (!locationWithCoordinates) return;

        const marker = createMarker({
          coordinates: locationWithCoordinates.latLng,
          style: {
            color: markerColors[index],
            size: markerSizes[index],
            fill: designOptions.markers.fill,
            blur: locations[index].blur,
          },
        });

        markersRef.current.push(marker);
        marker.addTo(markersLayerRef.current);

        marker.bindTooltip(() => {
          const { content, postponedContent } = tooltipHandler(locations[index]);

          postponedContent?.then((updatedContent) => marker.setTooltipContent(updatedContent));

          return content;
        });
      });

      fitMapToBounds(mapInstance.current!, markersRef.current);
    }
  }, [
    locationsWithCoordinates,
    locations,
    markerColors,
    markerSizes,
    designOptions,
    tooltipHandler,
  ]);

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
      className="csdk-scattermap-root"
      ref={mapElement}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};
