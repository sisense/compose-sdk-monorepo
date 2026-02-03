import { BaseDesignOptionsType } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { AreamapChartType, AreamapType, Color } from '@/types';

/**
 * Fact final data that will be passed to Areamap-component to render
 *
 * @internal
 */
export type AreamapData = {
  type: AreamapChartType;
  geoData: GeoDataElement[];
};

/**
 * Raw GeoDataElement from data
 */
export type RawGeoDataElement = {
  /** Name of geo-element (country or state) */
  geoName: string;
  /** Original numeric measure value for this geo-element */
  originalValue: number;
  /** Formatted measure value for this geo-element to display*/
  formattedOriginalValue: string;
};

/**
 * GeoDataElement with color property, calculated from `originalValue`
 */
export type GeoDataElement = RawGeoDataElement & {
  /** Calculated color for this geo-element */
  color?: Color;
};

/**
 * Configuration for Areamap design options
 */
export type AreamapChartDesignOptions = BaseDesignOptionsType & {
  mapType: AreamapType;
};
