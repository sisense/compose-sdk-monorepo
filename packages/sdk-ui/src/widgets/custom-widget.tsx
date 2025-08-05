import { FunctionComponent, useMemo } from 'react';
import { DynamicSizeContainer, getWidgetDefaultSize } from '@/dynamic-size-container';
import ErrorBoundaryBox from '@/error-boundary/error-boundary-box';
import { useCustomWidgets } from '@/custom-widgets-provider';
import { CustomWidgetComponentProps } from '@/custom-widgets-provider/types';
import { CustomWidgetProps } from '@/props';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useTranslation } from 'react-i18next';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { withErrorBoundary } from '@/decorators/component-decorators/with-error-boundary';

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

  return (
    <DynamicSizeContainer defaultSize={getWidgetDefaultSize('line', { hasHeader: true })}>
      <WidgetContainer
        title={widgetProps.title}
        description={widgetProps.description}
        styleOptions={widgetProps.styleOptions}
        dataSetName={dataSource && getDataSourceName(dataSource)}
      >
        {renderCustomWidgetWithErrorBoundary ? (
          renderCustomWidgetWithErrorBoundary(customWidgetProps)
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
