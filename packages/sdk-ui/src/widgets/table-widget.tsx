/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
import React, { useState, type FunctionComponent } from 'react';

import { ThemeSettings } from '../types';
import { TableWidgetProps } from '../props';
import { WidgetHeader } from './common/widget-header';
import { ThemeProvider, useThemeContext } from '../theme-provider';
import { WidgetCornerRadius, WidgetSpaceAround, getShadowValue } from './common/widget-style-utils';
import { Table } from '../table';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';

/**
 * The TableWidget component extending the {@link Table} component to support widget style options.
 *
 * @example
 * Example of using the `Widget` component to
 * plot a bar chart of the `Sample ECommerce` data source hosted in a Sisense instance.
 * Drill-down capability is enabled.
 * ```tsx
 * <TableWidget
 *   dataSource={DM.DataSource}
 *   dataOptions={{
 *     columns: [DM.Category.Category]
 *   }}
 * />
 * ```
 * @param props - Table Widget properties
 * @returns Widget component representing a table
 * @internal
 */
export const TableWidget: FunctionComponent<TableWidgetProps> = asSisenseComponent({
  componentName: 'TableWidget',
})((props) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const { topSlot, bottomSlot, title, description, widgetStyleOptions } = props;

  const { themeSettings } = useThemeContext();

  const defaultSize = getWidgetDefaultSize('table', {
    hasHeader: !widgetStyleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = props.styleOptions || {};

  if (!props.dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: width,
        height: height,
      }}
    >
      <div className={'csdk-w-full csdk-h-full csdk-overflow-hidden'}>
        <div
          className={'csdk-h-full'}
          style={{
            padding: WidgetSpaceAround[widgetStyleOptions?.spaceAround || 'None'],
          }}
        >
          <div
            className="csdk-h-full csdk-overflow-hidden"
            style={{
              borderWidth: widgetStyleOptions?.border ? '1px' : 0,
              borderColor: widgetStyleOptions?.borderColor || themeSettings.chart.textColor,
              borderRadius: widgetStyleOptions?.cornerRadius
                ? WidgetCornerRadius[widgetStyleOptions.cornerRadius]
                : 0,
              boxShadow: getShadowValue(widgetStyleOptions),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!widgetStyleOptions?.header?.hidden && (
              <WidgetHeader
                title={title}
                description={description}
                dataSetName={props.dataSource}
                styleOptions={widgetStyleOptions?.header}
                onRefresh={() => setRefreshCounter(refreshCounter + 1)}
              />
            )}
            {topSlot}

            <ThemeProvider
              theme={
                {
                  chart: {
                    backgroundColor:
                      widgetStyleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
                  },
                } as ThemeSettings
              }
            >
              <div style={{ flexGrow: 1 }}>
                <Table
                  dataSet={props.dataSource}
                  dataOptions={props.dataOptions}
                  styleOptions={styleOptionsWithoutSizing}
                  filters={props.filters}
                  refreshCounter={refreshCounter}
                />
              </div>
            </ThemeProvider>

            {bottomSlot}
          </div>
        </div>
      </div>
    </DynamicSizeContainer>
  );
});
