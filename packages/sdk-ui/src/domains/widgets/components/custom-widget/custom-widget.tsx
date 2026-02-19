import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getDataSourceName } from '@sisense/sdk-data';

import { AbstractDataPointWithEntries } from '@/domains/dashboarding/common-filters/types';
import { useCustomWidgets } from '@/infra/contexts/custom-widgets-provider';
import { CustomWidgetComponentProps } from '@/infra/contexts/custom-widgets-provider/types';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { withErrorBoundary } from '@/infra/decorators/component-decorators/with-error-boundary';
import ErrorBoundaryBox from '@/infra/error-boundary/error-boundary-box';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { CustomWidgetStyleOptions, GenericDataOptions } from '@/types';

import { WidgetContainer } from '../../shared/widget-container';
import { CustomWidgetProps } from './types';

const withSize = (props: CustomWidgetComponentProps, size: { width: number; height: number }) => {
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
  const { getCustomWidget } = useCustomWidgets();
  const { app } = useSisenseContext();

  const CustomWidgetComponentToRender = getCustomWidget(widgetProps.customWidgetType);

  const CustomWidgetComponentWithErrorBoundary = useMemo(() => {
    if (!CustomWidgetComponentToRender) return null;
    return withErrorBoundary({
      componentName: 'CustomWidget',
    })(CustomWidgetComponentToRender as FunctionComponent<CustomWidgetComponentProps>);
  }, [CustomWidgetComponentToRender]);

  const dataSource = widgetProps.dataSource ?? app?.defaultDataSource;
  const customWidgetProps: CustomWidgetComponentProps<
    GenericDataOptions,
    CustomWidgetStyleOptions,
    AbstractDataPointWithEntries
  > = {
    // TODO - we need to pass dynamically added props, at the same time we wanted to limit amount of the props, so we probably should find a balance here
    ...widgetProps,
    dataSource,
    dataOptions: widgetProps.dataOptions,
    styleOptions: widgetProps.styleOptions,
    filters: widgetProps.filters,
    highlights: widgetProps.highlights,
    description: widgetProps.description,
  };

  const containerSize = useMemo(
    () => ({
      ...(widgetProps.styleOptions?.width ? { width: widgetProps.styleOptions.width } : null),
      ...(widgetProps.styleOptions?.height ? { height: widgetProps.styleOptions.height } : null),
    }),
    [widgetProps.styleOptions?.width, widgetProps.styleOptions?.height],
  );

  const wrapperDefaultSize = useMemo(() => getWidgetDefaultSize('line', { hasHeader: true }), []);
  const chartDefaultSize = useMemo(() => getWidgetDefaultSize('line'), []);

  return (
    <DynamicSizeContainer size={containerSize} defaultSize={wrapperDefaultSize}>
      <WidgetContainer
        title={widgetProps.title}
        description={widgetProps.description}
        styleOptions={widgetProps.styleOptions}
        headerConfig={widgetProps.config?.header}
        dataSetName={dataSource && getDataSourceName(dataSource)}
      >
        {CustomWidgetComponentWithErrorBoundary ? (
          <DynamicSizeContainer defaultSize={chartDefaultSize}>
            {(size) => (
              <CustomWidgetComponentWithErrorBoundary {...withSize(customWidgetProps, size)} />
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
