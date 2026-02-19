export type LegacyIndicatorChartTypes = 'numericSimple' | 'numericBar' | 'gauge' | 'ticker';

export type BaseMeasure = {
  size: keyof FontSizes;
  value: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type FitTitleMeasure = {
  width: number;
  string: string;
  key: string;
};

export type FitValueMeasure = {
  width: number;
  string: string;
  key: string;
};

export type FitSecondaryMeasure = {
  width: number;
  titleString: string;
  valueString: string;
  key: string;
};

type FontSizes = {
  big: number;
  medium: number;
  small: number;
  micro: number;
};

type DataKey = 'title' | 'value' | 'secondaryTitle' | 'secondary';

type CommonOptions = {
  fontFamily: string;
  title: {
    color: string;
    fontSizes?: FontSizes;
  };
  value: {
    color?: string;
    fontSizes?: FontSizes;
    fontWeight?: number;
  };
  secondaryTitle: {
    color: string;
    fontSizes?: FontSizes;
  };
  secondaryValue: {
    fontWeight?: number;
    color: string;
    fontSizes?: FontSizes;
  };
  textKeys: string[];
  backgroundColor: string;
  forceTickerView?: boolean;
};

export type NumericSimpleOptions = CommonOptions & {
  borderColor: string;
  borderWidth: number;
  relativeSizes: {
    key: string;
    value: number;
    decimals: number;
  }[];
  measureKeys: string[];
  sizes: {
    size: keyof FontSizes;
    value: number;
  }[];
  fitMeasures: {
    key: string;
    prop: string;
    dataKey: DataKey;
  }[];
};

export type NumericBarOptions = CommonOptions & {
  bracketColor: string;
  bracketThickness: number;
  relativeSizes: {
    key: string;
    value: number;
    decimals: number;
  }[];
  measureKeys: string[];
  sizes: {
    size: keyof FontSizes;
    value: number;
    maxWidth?: number;
    maxHeight?: number;
  }[];
};

export type GaugeOptions = CommonOptions & {
  label: {
    color: string;
    fontSizes: FontSizes;
  };
  textKeys: string[];
  tickColor: string;
  needleColor: string;
  bracketColor: string;
  defaultDialColor: string;
  gaugeOpacity: number;
  startAngle: number;
  endAngle: number;
  overDegrees: number;
  tickDegreesIncrement: number;
  bracketThickness: number;
  relativeSizes: (
    | {
        key: string;
        value: number;
        decimals: number;
      }
    | {
        key: string;
        dataKey: 'skin';
        values: Record<'1' | '2', number>;
        decimals: number;
      }
  )[];
  gaugeHeights: BaseMeasure[];
  measureKeys: string[];
  tickerBarHeight?: number;
};

export type TickerOptions = CommonOptions & {
  fontSize: number;
  dividerColor: string;
  barHandleColor: string;
  height: number;
  horizontalMargin: number;
  barWidth: number;
  barHeight: number;
  barOpacity: number;
  tickerBarWidth: number;
  tickerBarHeight: number;
  horizontalPadding: number;
  textPadding: number;
  sectionMinWidth: number;
  dividerWidth: number;
  dividerHeight: number;
  valueFont?: string;
  titleFont?: string;
  secondaryValueFont?: string;
  secondaryTitleFont?: string;
  offsetX?: number;
  showTickerBar?: boolean;
  fitValueMeasure?: {
    string: string;
    width: number;
  };
  fitSecValueMeasure?: {
    string: string;
    width: number;
  };
  fitSecTitleMeasure?: {
    string: string;
    width: number;
  };
  fitTitleMeasure?: {
    string: string;
    width: number;
  };
  width?: number;
};

export type LegacyIndicatorChartOptions =
  | NumericBarOptions
  | NumericSimpleOptions
  | GaugeOptions
  | TickerOptions;
