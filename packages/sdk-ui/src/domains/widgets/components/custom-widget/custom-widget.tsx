import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getDataSourceName } from '@sisense/sdk-data';

import { AbstractDataPointWithEntries } from '@/domains/dashboarding/common-filters/types';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { withErrorBoundary } from '@/infra/decorators/component-decorators/with-error-boundary';
import ErrorBoundaryBox from '@/infra/error-boundary/error-boundary-box';
import { useWidgetPluginRegistry } from '@/infra/plugins/use-widget-plugin-registry';
import type { CustomVisualizationProps } from '@/infra/plugins/widget-plugins/types';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { CustomWidgetStyleOptions, GenericDataOptions } from '@/types';

import { WidgetContainer } from '../../shared/widget-container';
import { CustomWidgetProps } from './types';
import { useCustomWidgetCsvDownload } from './use-custom-widget-csv-download.js';

const withSize = (props: CustomVisualizationProps, size: { width: number; height: number }) => {
  return {
    ...props,
    styleOptions: {
      ...props.styleOptions,
      width: size.width,
      height: size.height,
    },
  };
};

/**
 * Component that renders a custom widget.
 *
 * @internal
 */
export const CustomWidget: FunctionComponent<CustomWidgetProps> = asSisenseComponent({
  componentName: 'CustomWidget',
})((widgetProps: CustomWidgetProps) => {
  const { t } = useTranslation();
  const registry = useWidgetPluginRegistry();
  const { app } = useSisenseContext();

  const CustomVisualizationToRender = registry.getComponent(widgetProps.customWidgetType);

  const CustomVisualizationWithErrorBoundary = useMemo(() => {
    if (!CustomVisualizationToRender) return null;
    return withErrorBoundary({
      componentName: 'CustomVisualization',
    })(CustomVisualizationToRender as FunctionComponent<CustomVisualizationProps>);
  }, [CustomVisualizationToRender]);

  const dataSource = widgetProps.dataSource ?? app?.defaultDataSource;
  const { description, ...widgetPropsForVisualization } = widgetProps;
  const visualizationProps: CustomVisualizationProps<
    GenericDataOptions,
    CustomWidgetStyleOptions,
    AbstractDataPointWithEntries
  > = {
    ...widgetPropsForVisualization,
    dataSource,
    dataOptions: widgetProps.dataOptions,
    styleOptions: widgetProps.styleOptions,
    filters: widgetProps.filters,
    highlights: widgetProps.highlights,
  };

  const containerSize = useMemo(
    () => ({
      ...(widgetProps.styleOptions?.width ? { width: widgetProps.styleOptions.width } : null),
      ...(widgetProps.styleOptions?.height ? { height: widgetProps.styleOptions.height } : null),
    }),
    [widgetProps.styleOptions?.width, widgetProps.styleOptions?.height],
  );

  const { headerConfig } = useCustomWidgetCsvDownload({
    dataSource,
    dataOptions: widgetProps.dataOptions,
    filters: widgetProps.filters,
    highlights: widgetProps.highlights,
    title: widgetProps.title,
    config: widgetProps.config,
  });

  const wrapperDefaultSize = useMemo(() => getWidgetDefaultSize('line', { hasHeader: true }), []);
  const chartDefaultSize = useMemo(() => getWidgetDefaultSize('line'), []);

  return (
    <DynamicSizeContainer size={containerSize} defaultSize={wrapperDefaultSize}>
      <WidgetContainer
        title={widgetProps.title}
        description={description}
        styleOptions={widgetProps.styleOptions}
        headerConfig={headerConfig}
        dataSetName={dataSource && getDataSourceName(dataSource)}
      >
        {CustomVisualizationWithErrorBoundary ? (
          <DynamicSizeContainer defaultSize={chartDefaultSize}>
            {(size) => (
              <CustomVisualizationWithErrorBoundary
                {...({
                  ...withSize(visualizationProps, size),
                  // Add `description` for backward compatibility with legacy custom widgets that might be dependent on it.
                  // This should be removed once we deprecate the legacy custom widgets registration.
                  ...(description ? { description } : {}),
                } as CustomVisualizationProps)}
              />
            )}
          </DynamicSizeContainer>
        ) : (
          <ErrorBoundaryBox
            error={t('customWidgets.registerPrompt', {
              customWidgetType: widgetProps.customWidgetType,
            })}
          />
        )}
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
