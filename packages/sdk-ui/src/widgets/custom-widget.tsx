import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getDataSourceName } from '@sisense/sdk-data';

import { useCustomWidgets } from '@/custom-widgets-provider';
import { CustomWidgetComponentProps } from '@/custom-widgets-provider/types';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { withErrorBoundary } from '@/decorators/component-decorators/with-error-boundary';
import { DynamicSizeContainer, getWidgetDefaultSize } from '@/dynamic-size-container';
import ErrorBoundaryBox from '@/error-boundary/error-boundary-box';
import { CustomWidgetProps } from '@/props';
import { useSisenseContext } from '@/sisense-context/sisense-context';

import { WidgetContainer } from './common/widget-container';

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

  const renderCustomWidget = getCustomWidget(widgetProps.customWidgetType);
  const renderCustomWidgetWithErrorBoundary = useMemo(() => {
    if (!renderCustomWidget) return null;
    return withErrorBoundary({ componentName: 'CustomWidget' })((props) => (
      <>{renderCustomWidget(props)}</>
    ));
  }, [renderCustomWidget]);

  const dataSource = widgetProps.dataSource ?? app?.defaultDataSource;
  const customWidgetProps: CustomWidgetComponentProps = {
    // TODO - we need to pass dynamically added props, at the same time we wanted to limit amount of the props, so we probably should find a balance here
    ...widgetProps,
    dataSource,
    dataOptions: widgetProps.dataOptions,
    styleOptions: widgetProps.styleOptions,
    filters: widgetProps.filters,
    highlights: widgetProps.highlights,
    description: widgetProps.description,
  };

  const size = useMemo(
    () => ({
      ...(widgetProps.styleOptions?.width ? { width: widgetProps.styleOptions.width } : null),
      ...(widgetProps.styleOptions?.height ? { height: widgetProps.styleOptions.height } : null),
    }),
    [widgetProps.styleOptions?.width, widgetProps.styleOptions?.height],
  );

  const wrapperDefaultSize = useMemo(() => getWidgetDefaultSize('line', { hasHeader: true }), []);
  const chartDefaultSize = useMemo(() => getWidgetDefaultSize('line'), []);

  return (
    <DynamicSizeContainer size={size} defaultSize={wrapperDefaultSize}>
      <WidgetContainer
        title={widgetProps.title}
        description={widgetProps.description}
        styleOptions={widgetProps.styleOptions}
        dataSetName={dataSource && getDataSourceName(dataSource)}
      >
        {renderCustomWidgetWithErrorBoundary ? (
          <DynamicSizeContainer defaultSize={chartDefaultSize}>
            {(size) => renderCustomWidgetWithErrorBoundary(withSize(customWidgetProps, size))}
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
