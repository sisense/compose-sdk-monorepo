import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types.js';

export type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

// Render your visualization here. Props include:
//   dataSource, dataOptions, styleOptions, filters, highlights
//   onDataPointClick, onDataPointContextMenu, onDataPointsSelected
//
// To query data, combine useExecuteQuery with extractDimensionsAndMeasures, and apply
// number/date formatting declared on dataOptions columns with formatDataSet:
//
//   import { useMemo } from 'react';
//   import {
//     extractDimensionsAndMeasures,
//     formatDataSet,
//     useExecuteQuery,
//     useTheme,
//   } from '@sisense/sdk-ui';
//
//   const { chart } = useTheme(); // resolved host theme — use for default colors
//   const { dimensions, measures } = useMemo(
//     () => extractDimensionsAndMeasures(props.dataOptions),
//     [props.dataOptions],
//   );
//   const { data: rawData, isLoading, isError } = useExecuteQuery({
//     dataSource: props.dataSource,
//     dimensions,
//     measures,
//     filters: props.filters,
//     highlights: props.highlights,
//     enabled: dimensions.length > 0,
//   });
//   const data = useMemo(
//     () => (rawData ? formatDataSet(rawData, props.dataOptions) : rawData),
//     [rawData, props.dataOptions],
//   );
//
// Render `cell.text ?? String(cell.data)` to display formatted values.
// See /scaffold-chart, /add-conditional-query, and /add-cross-filtering for more.
export const Visualization: CustomVisualization<VisualizationProps> = () => {
  return <div>Visualization goes here</div>;
};
