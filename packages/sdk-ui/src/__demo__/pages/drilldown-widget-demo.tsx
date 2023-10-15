/* eslint-disable max-lines-per-function */
import { measures as measureFactory } from '@sisense/sdk-data';
import * as DM from '../sample-ecommerce-autogenerated';
import { DrilldownWidget } from '../../widgets/drilldown-widget';
import { ExecuteQuery } from '../../query-execution/execute-query';
import { DataPoint } from '../../types';
import { Chart } from '../../chart';
import { PlotlyDotChart } from './plotly-dot-chart';

const dataOptions = {
  category: [DM.Category.Category],
  value: [measureFactory.sum(DM.Commerce.Revenue)],
  breakBy: [],
};

export const DrilldownWidgetDemo = () => (
  <div className="csdk-h-fit">
    <div className="csdk-flex csdk-flex-row">
      <div className="csdk-w-1/2 csdk-mr-3" style={{ height: '600px' }}>
        <b>With native charting library (Compose SDK)</b>
        <p>Right click on a bar to see the context menu or rubberband select multiple bars</p>
        <DrilldownWidget
          drilldownDimensions={[DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition]}
          initialDimension={dataOptions.category[0]}
        >
          {({ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }) => {
            const onPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
              onDataPointsSelected(points, nativeEvent);
              onContextMenu({
                left: nativeEvent.clientX,
                top: nativeEvent.clientY,
              });
            };

            const onPointClick = (point: DataPoint, event: MouseEvent) => {
              onDataPointsSelected([point], event);
              onContextMenu({
                left: event.clientX,
                top: event.clientY,
              });
            };

            return (
              <Chart
                chartType={'column'}
                dataOptions={{
                  ...dataOptions,
                  category: [drilldownDimension],
                }}
                filters={drilldownFilters}
                onDataPointsSelected={onPointsSelected}
                onDataPointContextMenu={onPointClick}
              />
            );
          }}
        </DrilldownWidget>
      </div>
      <br />
      <div className="csdk-w-1/2 csdk-max-h-96" style={{ height: '600px' }}>
        <b>With third-party charting library (Plotly)</b>
        <p>Select points with left click, then right click to see the context menu</p>
        <DrilldownWidget
          drilldownDimensions={[DM.Commerce.Gender, DM.Commerce.Condition]}
          initialDimension={DM.Commerce.AgeRange}
        >
          {({ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }) => (
            <ExecuteQuery
              dataSource={DM.DataSource}
              dimensions={[drilldownDimension]}
              measures={dataOptions.value}
              filters={drilldownFilters}
            >
              {(data) => (
                <PlotlyDotChart
                  rawData={data}
                  onContextMenu={onContextMenu}
                  onDataPointsSelected={onDataPointsSelected}
                />
              )}
            </ExecuteQuery>
          )}
        </DrilldownWidget>
      </div>
    </div>
  </div>
);
