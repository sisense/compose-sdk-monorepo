import type { WidgetProps } from '../widget/types';

/**
 * Injects the navigator scroller-change callback into the widget's navigator style options.
 * Only activates when the widget has a navigator configuration so the event handler is not
 * registered on charts that never show the navigator.
 *
 * @param onScrollerChange - Invoked with navigator min/max when the scroller moves.
 * @returns Widget props transformer for use in a `flow` pipeline.
 */
export function withNavigatorScrollSave(
  onScrollerChange: (min: number, max: number) => void,
): (widgetProps: WidgetProps) => WidgetProps {
  return (widgetProps: WidgetProps) => {
    if (!('styleOptions' in widgetProps) || !widgetProps.styleOptions) {
      return widgetProps;
    }
    const { styleOptions } = widgetProps as {
      styleOptions: { navigator?: { enabled?: boolean } } & WidgetProps['styleOptions'];
    };
    if (!styleOptions.navigator) {
      return widgetProps;
    }
    return {
      ...widgetProps,
      styleOptions: {
        ...widgetProps.styleOptions,
        navigator: {
          ...styleOptions.navigator,
          onScrollerChange,
        },
      },
    } as WidgetProps;
  };
}
