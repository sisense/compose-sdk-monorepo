import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, LayerGroup, Tooltip } from 'react-leaflet';
import { useLocations } from './hooks/use-locations.js';
import { ChartData, ScattermapChartData } from '../../../chart-data/types.js';
import { ScattermapDataPointEventHandler } from '../../../props.js';
import { getLocationsMarkerSizes } from './utils/size.js';
import { getScattermapDataPoint } from './utils/location.js';
import { useGeoSettings } from './hooks/use-settings.js';
import { getLocationsMarkerColors } from './utils/color.js';
import { prepareFitBoundsAnimationOptions } from './utils/map.js';
import {
  ChartDataOptionsInternal,
  ScattermapChartDataOptionsInternal,
} from '../../../chart-data-options/types.js';
import { ScattermapChartDesignOptions } from '../../../chart-options-processor/translations/design-options.js';
import { useTooltipHandler } from './hooks/use-tooltip-handler.js';
import {
  DataSource,
  Filter,
  FilterRelations,
  getFilterListAndRelationsJaql,
} from '@sisense/sdk-data';

import '../map-charts.scss';
import './scattermap.scss';
import { DesignOptions } from '@/chart-options-processor/translations/types.js';
import { ChartRendererProps } from '@/chart/types.js';
import { useThemeContext } from '@/theme-provider';

// Import utility functions
function getFillStats(fill: any) {
  return {
    isFilled: ['filled', 'filled-light'].includes(fill),
  };
}

function getAttributionString(mapUrl: string) {
  const mapBoxCopyright = `
      © <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>
      © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>
      <strong>
        <a href='https://www.mapbox.com/map-feedback/' target='_blank' aria-label='Improve this map (opens in a new tab)'>
          Improve this map
        </a>
      </strong>`;
  const openStreetMapCopyright = `© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>`;

  if (mapUrl.indexOf('mapbox') > -1) {
    return mapBoxCopyright;
  } else if (mapUrl.indexOf('openstreetmap') > -1) {
    return openStreetMapCopyright;
  }
  return '';
}

export type ScattermapProps = {
  chartData: ScattermapChartData;
  dataOptions: ScattermapChartDataOptionsInternal;
  designOptions: ScattermapChartDesignOptions;
  dataSource: DataSource | null;
  filters?: Filter[] | FilterRelations;
  onDataPointClick?: ScattermapDataPointEventHandler;
};

export const Scattermap = ({
  chartData,
  dataOptions,
  dataSource,
  filters = [],
  designOptions,
  onDataPointClick,
}: ScattermapProps) => {
  const { locations } = chartData;
  const geoSettings = useGeoSettings();
  const { themeSettings } = useThemeContext();

  const locationsWithCoordinates = useLocations(locations, dataOptions.locationLevel);

  const { filters: filterList } = getFilterListAndRelationsJaql(filters);
  const tooltipHandler = useTooltipHandler({
    dataOptions,
    dataSource,
    filters: filterList,
  });

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

  const MarkersLayer = () => {
    const map = useMap();

    useEffect(() => {
      if (locationsWithCoordinates && locationsWithCoordinates.length > 0) {
        const bounds = locationsWithCoordinates
          .map((loc) =>
            loc.coordinates
              ? ([loc.coordinates.lat, loc.coordinates.lng] as [number, number])
              : undefined,
          )
          .filter((b): b is [number, number] => !!b);
        if (bounds.length > 0) {
          map.fitBounds(bounds, prepareFitBoundsAnimationOptions(themeSettings));
        }
      }
    }, [map, themeSettings]);

    return (
      <LayerGroup>
        {locationsWithCoordinates.map((locationWithCoordinates, index) => {
          if (!locationWithCoordinates.coordinates) return null;

          const { isFilled } = getFillStats(designOptions.markers.fill);
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

          const markerOpacity = locationWithCoordinates.blur
            ? markerBlurOpacityMap[designOptions.markers.fill]
            : markerOpacityMap[designOptions.markers.fill];

          return (
            <CircleMarker
              key={index}
              center={[
                locationWithCoordinates.coordinates.lat,
                locationWithCoordinates.coordinates.lng,
              ]}
              radius={markerSizes[index]}
              pathOptions={{
                fillOpacity: markerOpacity,
                opacity: markerOpacity,
                fillColor: isFilled ? markerColors[index] : 'transparent',
                color: isFilled ? 'transparent' : markerColors[index],
                stroke: !isFilled,
                weight: isFilled ? 0 : 2,
              }}
              eventHandlers={{
                click: (e: any) => {
                  if (onDataPointClick) {
                    onDataPointClick(
                      getScattermapDataPoint(locationWithCoordinates, dataOptions),
                      e.originalEvent,
                    );
                  }
                },
              }}
            >
              <Tooltip>
                {(() => {
                  const { content } = tooltipHandler(locationWithCoordinates);
                  return content;
                })()}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </LayerGroup>
    );
  };

  const TileLayerComponent = () => {
    if (!geoSettings) return null;

    return (
      <TileLayer
        url={geoSettings.maps_api_provider}
        zoomOffset={-1}
        tileSize={512}
        attribution={getAttributionString(geoSettings.maps_api_provider)}
      />
    );
  };

  return (
    <MapContainer
      className="csdk-map-container"
      style={{
        width: '100%',
        height: '100%',
      }}
      center={[0, 0]}
      zoom={1}
      scrollWheelZoom={true}
      minZoom={1}
      worldCopyJump={true}
      attributionControl={false}
    >
      <TileLayerComponent />
      <MarkersLayer />
    </MapContainer>
  );
};

export const isScattermapData = (chartData: ChartData): chartData is ScattermapChartData => {
  return chartData.type === 'scattermap' && 'locations' in chartData;
};
const isScattermapDataOptions = (
  dataOptions: ChartDataOptionsInternal,
): dataOptions is ScattermapChartDataOptionsInternal => {
  return 'locations' in dataOptions;
};
const isScattermapChartDesignOptions = (
  designOptions: DesignOptions,
): designOptions is ScattermapChartDesignOptions => {
  return 'markers' in designOptions;
};

export const isScattermapProps = (props: ChartRendererProps): props is ScattermapProps =>
  !!props.chartData &&
  isScattermapData(props.chartData) &&
  isScattermapDataOptions(props.dataOptions) &&
  isScattermapChartDesignOptions(props.designOptions);
