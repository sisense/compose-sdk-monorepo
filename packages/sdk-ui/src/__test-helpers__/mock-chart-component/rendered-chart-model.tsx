import { ChartProps } from '@/props';

/** All possible data point types that can be emitted by the chart. */
type AbstractDataPoint = Parameters<NonNullable<ChartProps['onDataPointClick']>>[0];

/** Handler for a single data point. */
type AbstractDataPointHandler = (dataPoint: AbstractDataPoint, event: PointerEvent | null) => void;

/** Handler for multiple data points. */
type AbstractDataPointsHandler = (
  dataPoints: AbstractDataPoint[],
  event: PointerEvent | null,
) => void;

/**
 * Mocked Chart component model.
 * Can be used to simulate user interactions with the chart.
 */
export class RenderedChartModel {
  props: ChartProps;

  name: string;

  constructor(props: ChartProps, name?: string) {
    this.props = props;
    this.name = name ?? `Chart (${props.chartType})`;
  }

  render() {
    return <div data-testid="ChartMock">{this.name}</div>;
  }

  emitDataPointClick(dataPoint: AbstractDataPoint, event: PointerEvent | null = null) {
    const onDataPointClickHandler = this.props.onDataPointClick as
      | AbstractDataPointHandler
      | undefined;
    onDataPointClickHandler?.(dataPoint, event);
  }

  emitDataPointContextMenuOpen(dataPoint: AbstractDataPoint, event: PointerEvent | null = null) {
    const onDataPointContextMenuHandler = this.props.onDataPointContextMenu as
      | AbstractDataPointHandler
      | undefined;
    onDataPointContextMenuHandler?.(dataPoint, event);
  }

  emitDataPointsSelected(dataPoints: AbstractDataPoint[], event: PointerEvent | null = null) {
    const onDataPointsSelectedHandler = this.props.onDataPointsSelected as
      | AbstractDataPointsHandler
      | undefined;
    onDataPointsSelectedHandler?.(dataPoints, event);
  }
}
