import { ValueLabel } from './value_label_section';
import { Axis } from './axis_section';
import { Marker } from './marker_section';
import { LegendPosition } from './legend_section';
import { LineType, StackType } from './translations_to_highcharts';
import { PieType, PieLabels } from './pie_plot_options';
import { FunnelSize, FunnelType, FunnelDirection, FunnelLabels } from './funnel_plot_options';
import { Convolution } from '../../types';
import { ScatterMarkerSize } from './scatter_plot_options';

type DataLimits = {
  seriesCapacity: number;
  categoriesCapacity: number;
};

export type BaseDesignOptionsType = {
  legend: LegendPosition;
  valueLabel: ValueLabel;
  lineType: LineType;
  lineWidth: number;
  marker: Marker;
  xAxis: Axis;
  yAxis: Axis;
  x2Axis?: Axis;
  y2Axis?: Axis;
  autoZoom: boolean;
  dataLimits: DataLimits;
};

export type LineChartDesignOptions = BaseDesignOptionsType;

export type StackableChartDesignOptions = BaseDesignOptionsType & {
  stackType: StackType;
  showTotal?: boolean;
};

export type AreaChartDesignOptions = StackableChartDesignOptions;

export type BarChartDesignOptions = StackableChartDesignOptions;

export type ColumnChartDesignOptions = StackableChartDesignOptions;

export type PieChartDesignOptions = BaseDesignOptionsType & {
  pieType?: PieType;
  pieLabels?: PieLabels;
  convolution?: Convolution;
};

export type FunnelChartDesignOptions = BaseDesignOptionsType & {
  funnelSize?: FunnelSize;
  funnelType?: FunnelType;
  funnelDirection?: FunnelDirection;
  funnelLabels?: FunnelLabels;
};

export type ScatterChartDesignOptions = BaseDesignOptionsType & {
  markerSize?: ScatterMarkerSize;
};

/**
 * Configuration for Table design options
 *
 */
export type TableDesignOptions = {
  /**
   * Boolean flag responsible for header cells background color fill
   *
   */
  headersColor?: boolean;
  /**
   * Boolean flag responsible for alternating rows background color fill
   *
   */
  alternatingRowsColor?: boolean;
  /**
   * Boolean flag responsible for alternating columns background color fill
   *
   */
  alternatingColumnsColor?: boolean;
};

export type IndicatorStyleType = 'numeric' | 'gauge';
export type NumericIndicatorSubType = 'numericSimple' | 'numericBar';
export type IndicatorSkin = 'vertical' | 'horizontal' | 1 | 2;

/** Configuration options that define components of an indicator chart. */
export type IndicatorComponents = {
  /** The main title of the indicator chart */
  title?: {
    /** Whether the title should be shown */
    shouldBeShown: boolean;
    /** The text of the title */
    text?: string;
  };
  /** The secondary title of the indicator chart to be shown when `secondary` is specified in {@link IndicatorDataOptions} */
  secondaryTitle?: {
    /** The text of the secondary title */
    text?: string;
  };
  /** The ticks displayed on the indicator chart */
  ticks?: {
    /** Whether the ticks should be shown */
    shouldBeShown: boolean;
  };
  /** The value labels of the indicator chart */
  labels?: {
    /** Whether the labels should be shown */
    shouldBeShown: boolean;
  };
};

/**
 * Design options for an indicator chart.
 */
export type IndicatorChartDesignOptions<
  IndicatorType extends IndicatorStyleType = IndicatorStyleType,
> = BaseDesignOptionsType & {
  indicatorComponents: IndicatorComponents;
} & (IndicatorType extends 'gauge' ? GaugeSpecificDesignOptions : NumericSpecificDesignOptions);

export type GaugeSpecificDesignOptions = {
  indicatorType: 'gauge';
  skin: 1 | 2;
};

export type NumericSpecificDesignOptions<
  NumericSubtype extends NumericIndicatorSubType = NumericIndicatorSubType,
> = {
  indicatorType: 'numeric';
  numericSubtype: NumericSubtype;
  skin: NumericSubtype extends 'numericSimple' ? 'vertical' | 'horizontal' : never;
};

export type PolarType = 'line' | 'area' | 'column';
export type PolarChartDesignOptions = BaseDesignOptionsType & {
  polarType: PolarType;
};
