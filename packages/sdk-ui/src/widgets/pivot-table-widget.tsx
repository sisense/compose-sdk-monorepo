import { useState, type FunctionComponent } from 'react';
import { PivotTableWidgetProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { PivotTable } from '../pivot-table';

/**
 * React component extending `PivotTable` to support widget style options.
 *
 * @example
 * Example of using the `PivotTableWidget` component to
 * plot a pivot table over the `Sample ECommerce` data source hosted in a Sisense instance.
 * ```tsx
 * <PivotTableWidget
 *   dataSource={DM.DataSource}
 *   dataOptions={{
 *     rows: [DM.Category.Category],
 *     values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')]
 *   }}
 * />
 * ```
 * @param props - Pivot Table Widget properties
 * @returns Widget component representing a pivot table
 * @group Dashboarding
 * @beta
 */
export const PivotTableWidget: FunctionComponent<PivotTableWidgetProps> = asSisenseComponent({
  componentName: 'PivotTableWidget',
})((props) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { app } = useSisenseContext();

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions } = props;

  const defaultSize = getWidgetDefaultSize('pivot', {
    hasHeader: !styleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = props.styleOptions || {};

  if (!dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: width,
        height: height,
      }}
      useContentSize={{ height: styleOptions?.isAutoHeight }}
    >
      <WidgetContainer
        {...props}
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <PivotTable
          dataSet={props.dataSource}
          dataOptions={props.dataOptions}
          styleOptions={styleOptionsWithoutSizing}
          filters={props.filters}
          highlights={props.highlights}
          refreshCounter={refreshCounter}
        />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
