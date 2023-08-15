import {
  Dimension,
  Attribute,
  createAttribute,
  createDimension,
  measures,
} from '@sisense/sdk-data';

export const DataSource = 'Semiconductor Data';

interface WaferYieldSummaryDimension extends Dimension {
  LOT: Attribute;
  WAFER: Attribute;
  DEVICE: Attribute;
  OPERATION: Attribute;
  GOOD: Attribute;
  TOTAL: Attribute;
  YIELD: Attribute;
}

export const wafer_sort_yield_summary = createDimension({
  name: 'wafer_sort_yield_summary',
  LOT: createAttribute({
    name: 'LOT',
    type: 'text-attribute',
    expression: '[wafer_sort_yield_summary.LOT]',
  }),
  WAFER: createAttribute({
    name: 'WAFER',
    type: 'text-attribute',
    expression: '[wafer_sort_yield_summary.WAFER]',
  }),
  DEVICE: createAttribute({
    name: 'DEVICE',
    type: 'text-attribute',
    expression: '[wafer_sort_yield_summary.DEVICE]',
  }),
  OPERATION: createAttribute({
    name: 'OPERATION',
    type: 'text-attribute',
    expression: '[wafer_sort_yield_summary.OPERATION]',
  }),
  GOOD: createAttribute({
    name: 'GOOD',
    type: 'numeric-attribute',
    expression: '[wafer_sort_yield_summary.GOOD]',
  }),
  TOTAL: createAttribute({
    name: 'TOTAL',
    type: 'numeric-attribute',
    expression: '[wafer_sort_yield_summary.TOTAL]',
  }),
  YIELD: createAttribute({
    name: 'YIELD',
    type: 'numeric-attribute',
    expression: '[wafer_sort_yield_summary.YIELD]',
  }),
}) as WaferYieldSummaryDimension;

interface WaferSortBinDataDimension extends Dimension {
  LOT: Attribute;
  WAFER: Attribute;
  DEVICE: Attribute;
  OPERATION: Attribute;
  SERIAL: Attribute;
  X_COORD: Attribute;
  Y_COORD: Attribute;
  SITE_NUMBER: Attribute;
  BIN_NUMBER: Attribute;
  PASS_FAIL: Attribute;
}
export const wafer_sort_bin_data = createDimension({
  name: 'wafer_sort_bin_data',
  LOT: createAttribute({
    name: 'LOT',
    type: 'text-attribute',
    expression: '[wafer_sort_bin_data.LOT]',
  }),
  WAFER: createAttribute({
    name: 'WAFER',
    type: 'text-attribute',
    expression: '[wafer_sort_bin_data.WAFER]',
  }),
  DEVICE: createAttribute({
    name: 'DEVICE',
    type: 'text-attribute',
    expression: '[wafer_sort_bin_data.DEVICE]',
  }),
  OPERATION: createAttribute({
    name: 'OPERATION',
    type: 'text-attribute',
    expression: '[wafer_sort_bin_data.OPERATION]',
  }),
  SERIAL: createAttribute({
    name: 'SERIAL',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.SERIAL]',
  }),
  X_COORD: createAttribute({
    name: 'X_COORD',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.X_COORD]',
  }),
  Y_COORD: createAttribute({
    name: 'Y_COORD',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.Y_COORD]',
  }),
  SITE_NUMBER: createAttribute({
    name: 'SITE_NUMBER',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.SITE_NUMBER]',
  }),
  BIN_NUMBER: createAttribute({
    name: 'BIN_NUMBER',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.BIN_NUMBER]',
  }),
  PASS_FAIL: createAttribute({
    name: 'PASS_FAIL',
    type: 'numeric-attribute',
    expression: '[wafer_sort_bin_data.PASS_FAIL]',
  }),
}) as WaferSortBinDataDimension;

interface SortBinsDimensions extends Dimension {
  BIN_NAME: Attribute;
}
export const sort_bins = createDimension({
  name: 'sort_bins',
  BIN_NAME: createAttribute({
    name: 'BIN_NAME',
    type: 'text-attribute',
    expression: '[sort_bins.BIN_NAME]',
  }),
}) as SortBinsDimensions;

/** adding predefined set of measures */
export const Measures = {
  BIN_NUMBER: measures.max(wafer_sort_bin_data.BIN_NUMBER),
};
